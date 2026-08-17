import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Ensure persistent host data directory structure
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const USERS_INDEX_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(USERS_DIR)) {
  fs.mkdirSync(USERS_DIR, { recursive: true });
}
if (!fs.existsSync(USERS_INDEX_FILE)) {
  fs.writeFileSync(
    USERS_INDEX_FILE,
    JSON.stringify(
      [
        {
          id: 'user-default',
          username: 'manager',
          email: 'manager@workspace.local',
          name: 'مدیر ارشد فضای کاری',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          createdAt: new Date().toISOString(),
          databasePath: 'data/users/user-default/database.json',
        },
      ],
      null,
      2
    )
  );
  // Ensure default user folder exists
  const defaultUserDir = path.join(USERS_DIR, 'user-default');
  const defaultFilesDir = path.join(defaultUserDir, 'files');
  fs.mkdirSync(defaultFilesDir, { recursive: true });
}

// Helper functions for user storage
function getUsersList(): any[] {
  try {
    if (fs.existsSync(USERS_INDEX_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_INDEX_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading users index:', err);
  }
  return [];
}

function saveUsersList(users: any[]) {
  try {
    fs.writeFileSync(USERS_INDEX_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error saving users index:', err);
  }
}

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==========================================
// User Authentication & Tenant Host Provisioning
// ==========================================

// Get list of existing users
app.get('/api/auth/users', (req, res) => {
  const users = getUsersList();
  res.json({ users });
});

// Register new user: Provisions isolated host folder and database file
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, name, avatar } = req.body;
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    const users = getUsersList();
    const existing = users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() ||
        u.email.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      return res.status(409).json({ error: 'User already exists with this username or email' });
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const userFolder = path.join(USERS_DIR, userId);
    const userFilesFolder = path.join(userFolder, 'files');
    const userDbPath = path.join(userFolder, 'database.json');

    // Create physical host directory and files folder
    fs.mkdirSync(userFilesFolder, { recursive: true });

    // Initialize user database file
    const initialDb = {
      user: {
        id: userId,
        username,
        email,
        name: name || username,
        avatar: avatar || '',
        createdAt: new Date().toISOString(),
        databasePath: `data/users/${userId}/database.json`,
      },
      files: [],
      savedAt: new Date().toISOString(),
    };
    fs.writeFileSync(userDbPath, JSON.stringify(initialDb, null, 2));

    const newUser = initialDb.user;
    users.push(newUser);
    saveUsersList(users);

    console.log(`[Host Provisioning] Created isolated folder & database for user: ${userId}`);

    res.json({
      success: true,
      user: newUser,
      message: `حساب کاربری جدید و دیتابیس اختصاصی در مسیر /data/users/${userId}/ با موفقیت ایجاد گردید.`,
    });
  } catch (error: any) {
    console.error('Error during registration & provisioning:', error);
    res.status(500).json({ error: error.message || 'Failed to register and provision tenant database' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { usernameOrEmail } = req.body;
    if (!usernameOrEmail) {
      return res.status(400).json({ error: 'Username or Email is required' });
    }

    const users = getUsersList();
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
        u.email.toLowerCase() === usernameOrEmail.toLowerCase()
    );

    if (!user) {
      return res.status(404).json({ error: 'کاربری با این مشخصات یافت نشد.' });
    }

    // Attempt to load user state from their database
    const userDbPath = path.join(USERS_DIR, user.id, 'database.json');
    let state = null;
    if (fs.existsSync(userDbPath)) {
      try {
        state = JSON.parse(fs.readFileSync(userDbPath, 'utf-8'));
      } catch (e) {
        console.error('Error reading user state:', e);
      }
    }

    res.json({
      success: true,
      user,
      state,
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Save user workspace state to their isolated database
app.post('/api/user/save-state', (req, res) => {
  try {
    const { userId, state } = req.body;
    if (!userId || !state) {
      return res.status(400).json({ error: 'userId and state are required' });
    }

    const userFolder = path.join(USERS_DIR, userId);
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(path.join(userFolder, 'files'), { recursive: true });
    }

    const userDbPath = path.join(userFolder, 'database.json');
    fs.writeFileSync(
      userDbPath,
      JSON.stringify(
        {
          ...state,
          lastSavedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error: any) {
    console.error('Error saving state:', error);
    res.status(500).json({ error: error.message || 'Failed to save user database' });
  }
});

// Load user workspace state
app.get('/api/user/load-state/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userDbPath = path.join(USERS_DIR, userId, 'database.json');

    if (fs.existsSync(userDbPath)) {
      const state = JSON.parse(fs.readFileSync(userDbPath, 'utf-8'));
      return res.json({ success: true, state });
    }

    res.status(404).json({ error: 'User database not found' });
  } catch (error: any) {
    console.error('Error loading user state:', error);
    res.status(500).json({ error: error.message || 'Failed to load user database' });
  }
});

// ==========================================
// File Manager, Upload & Download Endpoints
// ==========================================

// Upload file to user's isolated folder
app.post('/api/files/upload', (req, res) => {
  try {
    const { userId = 'user-default', name, size, type, dataUrl, category = 'other', description = '', uploadedBy = 'کاربر' } = req.body;
    if (!name || !dataUrl) {
      return res.status(400).json({ error: 'File name and content are required' });
    }

    const userFilesFolder = path.join(USERS_DIR, userId, 'files');
    if (!fs.existsSync(userFilesFolder)) {
      fs.mkdirSync(userFilesFolder, { recursive: true });
    }

    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const safeName = name.replace(/[^a-zA-Z0-9._-\u0600-\u06FF]/g, '_');
    const diskPath = path.join(userFilesFolder, `${fileId}_${safeName}`);

    // If dataUrl is base64, save to physical disk
    if (dataUrl.includes(';base64,')) {
      const base64Data = dataUrl.split(';base64,').pop();
      if (base64Data) {
        fs.writeFileSync(diskPath, Buffer.from(base64Data, 'base64'));
      }
    } else {
      fs.writeFileSync(diskPath, dataUrl, 'utf-8');
    }

    const fileMeta = {
      id: fileId,
      name,
      size: size || (fs.existsSync(diskPath) ? fs.statSync(diskPath).size : 0),
      type: type || 'application/octet-stream',
      category,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
      dataUrl, // Keep dataUrl for fast client previews / audio playback
      description,
      diskPath: `data/users/${userId}/files/${fileId}_${safeName}`,
    };

    res.json({
      success: true,
      file: fileMeta,
      message: 'فایل با موفقیت در پوشه اختصاصی هاست بارگذاری شد.',
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error.message || 'File upload failed' });
  }
});

// Delete file from user's isolated folder
app.delete('/api/files/:userId/:fileId', (req, res) => {
  try {
    const { userId, fileId } = req.params;
    const userFilesFolder = path.join(USERS_DIR, userId, 'files');

    if (fs.existsSync(userFilesFolder)) {
      const files = fs.readdirSync(userFilesFolder);
      const target = files.find((f) => f.startsWith(fileId));
      if (target) {
        fs.unlinkSync(path.join(userFilesFolder, target));
      }
    }

    res.json({ success: true, message: 'فایل از هاست حذف شد.' });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error.message || 'Failed to delete file' });
  }
});

// ==========================================
// AI Seasonal Report & Chat Endpoints
// ==========================================

// AI Seasonal Performance Report Generator Endpoint
app.post('/api/ai/season-report', async (req, res) => {
  try {
    const { logs, seasonGoals, tasks, debtsCredits, bankAccounts, language = 'fa', customPrompt } = req.body;
    const ai = getAI();
    const isFa = language === 'fa';

    const systemPrompt = `You are an executive AI Business & Operations Analyst.
Your task is to analyze user and AI agent activity logs, season work goals, 7-day task performance, financial balances, and debt/credit settlements to generate an executive, highly structured, and insightful Seasonal Performance Report (گزارش عملکرد فصلی).

Structure the output in clean Markdown with:
1. Executive Summary (چکیده اجرایی و تحلیل عملکرد کلی فصل)
2. Breakdown of Per-Actor Activity (تفکیک عملکرد کاربر و ایجنت‌های هوش مصنوعی با تحلیل مجوزدهی)
3. Season Goals & Milestones Progress (تحلیل پیشرفت اهداف فصلی)
4. Productivity & Task Matrix Review (تحلیل انجام تسک‌های روزانه و هفتگی)
5. Financial Health & Settlements Status (تحلیل مانده حساب‌ها، وصول مطالبات و تسویه بدهی‌ها)
6. Actionable Strategic Recommendations for Next Season (پیشنهادات و استراتژی‌های بهبود فصل بعد)

Provide specific, constructive analysis based directly on the provided data.
Language of response must be: ${isFa ? 'Persian (Farsi)' : 'English'}.
`;

    const contents = `
Here is the current workspace snapshot:

### Season Goals:
${JSON.stringify(seasonGoals, null, 2)}

### Activity Logs & Operations (including Actors & Authorizers):
${JSON.stringify(logs, null, 2)}

### 7-Day Tasks Matrix:
${JSON.stringify(tasks, null, 2)}

### Treasury & Bank Accounts:
${JSON.stringify(bankAccounts, null, 2)}

### Debts & Receivables:
${JSON.stringify(debtsCredits, null, 2)}

${customPrompt ? `Additional User Instructions: ${customPrompt}` : ''}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [{ text: contents }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      report: response.text,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating season report with Gemini:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate seasonal report',
    });
  }
});

// AI Assistant Chat & Meeting Session Endpoint with Multimodal Attachments & Voice context
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, agentId, agentName, permissions, attachments, workspaceContext, language = 'fa' } = req.body;
    const ai = getAI();
    const isFa = language === 'fa';

    const systemPrompt = `You are "${agentName || 'دستیار هوش مصنوعی مدیریت کار و دارایی'}", an intelligent specialized AI agent inside the user's personal workspace.
You have real-time access to the user's season goals, tasks, financial debts/credits, bank accounts, activity logs, and attached files.
${permissions ? `Your Configured Permissions: ${JSON.stringify(permissions)}` : ''}
Always act responsibly, follow authorization policies, and provide direct, helpful, well-formatted answers in ${isFa ? 'Persian (Farsi)' : 'English'}.

Workspace Context:
${JSON.stringify(workspaceContext, null, 2)}
`;

    const formattedContents = (messages || []).map((m: any) => {
      const parts: any[] = [{ text: m.content || '' }];
      if (m.attachments && m.attachments.length > 0) {
        for (const att of m.attachments) {
          parts.push({
            text: `\n[Attached File: ${att.name} (${att.type || 'file'})]:\n${att.textExcerpt || att.dataUrl?.slice(0, 500) || '(file attached)'}`,
          });
        }
      }
      return {
        role: m.sender === 'agent' || m.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents:
        formattedContents.length > 0
          ? formattedContents
          : [{ role: 'user', parts: [{ text: 'سلام، آماده همکاری در فضای کاری هستم.' }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text,
      agentId,
      agentName,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in AI chat endpoint:', error);
    res.status(500).json({
      error: error.message || 'Failed to process AI chat',
    });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Workspace Server running on http://localhost:${PORT}`);
  });
}

start();
