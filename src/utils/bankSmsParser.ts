/**
 * Smart Iranian Bank SMS & Statement Parser
 * Supports all major Iranian banks: Melli, Mellat, Pasargad, Saman, Blu, Tejarat, Sepah, Keshavarzi, Parsian, Sina, Resalat, Ayandeh, etc.
 */

export interface ParsedBankSms {
  bankName: string;
  bankCode?: string;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'transfer' | 'settlement' | 'unknown';
  typeLabelFa: string;
  amount: number; // in Tomans
  amountRaw: number;
  balance: number; // in Tomans
  balanceRaw: number;
  isToman: boolean;
  accountNumber?: string;
  cardNumber?: string;
  date?: string;
  time?: string;
  description?: string;
  rawText: string;
  confidence: number; // 0 to 100
}

export interface BankConfig {
  nameFa: string;
  code: string;
  keywords: string[];
  color: string;
  patternType?: string;
}

export const IRANIAN_BANKS: BankConfig[] = [
  { nameFa: 'بانک سامان', code: 'saman', keywords: ['سامان', 'saman'], color: '#0072CE' },
  { nameFa: 'بانک ملی ایران', code: 'melli', keywords: ['ملی', 'melli', 'bmi'], color: '#005A9C' },
  { nameFa: 'بانک ملت', code: 'mellat', keywords: ['ملت', 'mellat'], color: '#E30613' },
  { nameFa: 'بانک پاسارگاد', code: 'pasargad', keywords: ['پاسارگاد', 'pasargad', 'bpi'], color: '#FFCC00' },
  { nameFa: 'بلوبانک (سامان)', code: 'blu', keywords: ['بلو', 'بلوبانک', 'blubank', 'blu'], color: '#00B2FF' },
  { nameFa: 'بانک صادرات', code: 'saderat', keywords: ['صادرات', 'saderat', 'bsi'], color: '#0B2046' },
  { nameFa: 'بانک تجارت', code: 'tejarat', keywords: ['تجارت', 'tejarat'], color: '#004B87' },
  { nameFa: 'بانک سپه', code: 'sepah', keywords: ['سپه', 'sepah'], color: '#ED1C24' },
  { nameFa: 'بانک کشاورزی', code: 'keshavarzi', keywords: ['کشاورزی', 'keshavarzi', 'bki'], color: '#008752' },
  { nameFa: 'بانک پارسیان', code: 'parsian', keywords: ['پارسیان', 'parsian'], color: '#8A1538' },
  { nameFa: 'بانک قرض‌الحسنه رسالت', code: 'resalat', keywords: ['رسالت', 'resalat'], color: '#1B5E20' },
  { nameFa: 'بانک قرض‌الحسنه مهر ایران', code: 'mehr', keywords: ['مهر ایران', 'qmb', 'mehr'], color: '#00796B' },
  { nameFa: 'بانک آینده', code: 'ayandeh', keywords: ['آینده', 'ayandeh'], color: '#6A1B9A' },
  { nameFa: 'بانک شهر', code: 'shahr', keywords: ['شهر', 'shahr'], color: '#D32F2F' },
  { nameFa: 'بانک سینا', code: 'sina', keywords: ['سینا', 'sina'], color: '#0288D1' },
  { nameFa: 'بانک رفاه کارگران', code: 'refah', keywords: ['رفاه', 'refah'], color: '#388E3C' },
  { nameFa: 'بانک مسکن', code: 'maskan', keywords: ['مسکن', 'maskan'], color: '#F57C00' },
  { nameFa: 'ویپاد (پاسارگاد)', code: 'wepod', keywords: ['ویپاد', 'wepod'], color: '#10B981' },
  { nameFa: 'آبانک (آینده)', code: 'abank', keywords: ['آبانک', 'abank'], color: '#8B5CF6' },
];

/**
 * Normalizes Persian and Arabic numbers to standard English digits
 */
export function normalizeDigits(text: string): string {
  if (!text) return '';
  return text
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[\u200C\u200B]/g, ' ') // Zero-width non-joiner to space
    .trim();
}

/**
 * Clean numeric string from separators (commas, spaces)
 */
export function cleanNumber(numStr: string): number {
  if (!numStr) return 0;
  const cleaned = numStr.replace(/[,،\s_]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parses raw bank SMS text into structured transaction data
 */
export function parseBankSms(rawSms: string): ParsedBankSms | null {
  if (!rawSms || typeof rawSms !== 'string' || rawSms.trim().length < 5) {
    return null;
  }

  const normalized = normalizeDigits(rawSms);
  let confidence = 40;

  // 1. Detect Bank
  let detectedBank: BankConfig | undefined = undefined;
  for (const bank of IRANIAN_BANKS) {
    for (const kw of bank.keywords) {
      const regex = new RegExp(`(^|[^a-zA-Z0-9آ-ی])${kw}([^a-zA-Z0-9آ-ی]|$)`, 'i');
      if (regex.test(normalized) || normalized.includes(kw)) {
        detectedBank = bank;
        confidence += 20;
        break;
      }
    }
    if (detectedBank) break;
  }

  const bankName = detectedBank ? detectedBank.nameFa : 'حساب بانکی شتاب';
  const bankCode = detectedBank ? detectedBank.code : undefined;

  // 2. Detect Transaction Type
  let type: ParsedBankSms['type'] = 'unknown';
  let typeLabelFa = 'تراکنش بانکی';

  if (/واریز|انتقال از|پایا واریز|ساتنا واریز|حقوق|واریز سود|\+\s*[0-9]/i.test(normalized)) {
    type = 'deposit';
    typeLabelFa = 'واریز به حساب';
  } else if (/برداشت|خرید|انتقال به|پایا برداشت|ساتنا برداشت|کارت به کارت|برداشت وجه|\-\s*[0-9]/i.test(normalized)) {
    if (/خرید|پوز|pos|درگاه/i.test(normalized)) {
      type = 'purchase';
      typeLabelFa = 'خرید اینترنتی / پوز';
    } else if (/انتقال|کارت به کارت|پایا|ساتنا/i.test(normalized)) {
      type = 'transfer';
      typeLabelFa = 'انتقال وجه';
    } else {
      type = 'withdrawal';
      typeLabelFa = 'برداشت از حساب';
    }
  }

  // 3. Detect Currency Unit (Rial vs Toman)
  // Most Iranian bank SMS are in Rials (ریال), but apps like Blu/Wepod send in Tomans (تومان).
  const mentionsToman = /تومان|toman/i.test(normalized);
  const isToman = mentionsToman;

  // 4. Extract Balance (مانده / موجودی) - CRITICAL
  let balanceRaw = 0;
  let balance = 0;

  // Regex patterns for balance in Persian SMS
  const balancePatterns = [
    /(?:مانده|موجودی|مانده حساب|موجودی جدید|مانده پس از تراکنش|مانده کارت|باقیمانده)(?:\s*(?:حساب|کارت|کل|فعلی)?\s*[:=\-]?\s*)([0-9,،\.\s]+)(?:\s*(?:ریال|تومان|ت|ر)?)/i,
    /موجودی\s*[:=\-]?\s*([0-9,،\.\s]+)/i,
    /مانده\s*[:=\-]?\s*([0-9,،\.\s]+)/i,
    /bal(?:ance)?\s*[:=\-]?\s*([0-9,،\.\s]+)/i,
  ];

  for (const pattern of balancePatterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const parsedVal = cleanNumber(match[1]);
      if (parsedVal > 0) {
        balanceRaw = parsedVal;
        balance = isToman ? parsedVal : Math.round(parsedVal / 10);
        confidence += 25;
        break;
      }
    }
  }

  // 5. Extract Transaction Amount (مبلغ)
  let amountRaw = 0;
  let amount = 0;

  const amountPatterns = [
    /(?:مبلغ|واریز|برداشت|خرید|مبلغ تراکنش)(?:\s*[:=\-]?\s*)([0-9,،\.\s]+)(?:\s*(?:ریال|تومان|ت|ر)?)/i,
    /(?:[\+\-]\s*)([0-9,،\.\s]+)(?:\s*(?:ریال|تومان)?)/i,
    /([0-9,،]+)\s*(?:ریال|تومان)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const parsedVal = cleanNumber(match[1]);
      if (parsedVal > 0 && parsedVal !== balanceRaw) {
        amountRaw = parsedVal;
        amount = isToman ? parsedVal : Math.round(parsedVal / 10);
        confidence += 15;
        break;
      }
    }
  }

  // If amount was not extracted but we have balance, or vice versa
  if (balance === 0 && amount > 0) {
    balance = amount;
    balanceRaw = amountRaw;
  }

  // 6. Extract Card / Account Number
  let cardNumber: string | undefined = undefined;
  let accountNumber: string | undefined = undefined;

  const cardMatch = normalized.match(/(?:کارت|card)\s*(?:شماره)?\s*[:=\-]?\s*([0-9\*\-]{4,19})/i);
  if (cardMatch && cardMatch[1]) {
    cardNumber = cardMatch[1].trim();
  }

  const accMatch = normalized.match(/(?:حساب|acc(?:ount)?)\s*(?:شماره)?\s*[:=\-]?\s*([0-9\-\.]{4,18})/i);
  if (accMatch && accMatch[1]) {
    accountNumber = accMatch[1].trim();
  }

  // 7. Extract Date & Time
  let date: string | undefined = undefined;
  let time: string | undefined = undefined;

  const dateMatch = normalized.match(/([0-9]{2,4}[\/\-][0-9]{1,2}[\/\-][0-9]{1,2})/);
  if (dateMatch) {
    date = dateMatch[1];
  }

  const timeMatch = normalized.match(/([0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?)/);
  if (timeMatch) {
    time = timeMatch[1];
  }

  // 8. Description extraction
  let description = typeLabelFa;
  if (accountNumber) description += ` - حساب ${accountNumber}`;
  if (cardNumber) description += ` - کارت ${cardNumber}`;

  return {
    bankName,
    bankCode,
    type,
    typeLabelFa,
    amount,
    amountRaw,
    balance,
    balanceRaw,
    isToman,
    accountNumber,
    cardNumber,
    date,
    time,
    description,
    rawText: rawSms,
    confidence: Math.min(100, confidence),
  };
}

/**
 * Realistic Sample SMS Templates for Iranian Banks for quick testing & demo
 */
export const SAMPLE_BANK_SMS_LIST = [
  {
    bank: 'بانک سامان',
    sample: 'بانک سامان\nواریز به حساب: 849-810-123456-1\nمبلغ: 50,000,000 ریال\nمانده: 385,420,000 ریال\nتاریخ: 1405/05/20 14:35\nکد پیگیری: 981204',
  },
  {
    bank: 'بلوبانک',
    sample: 'بلوبانک\nواریز به حساب سامان شما\nمبلغ: 8,500,000 تومان\nاز: علی رضایی\nموجودی جدید: 42,300,000 تومان\n1405/05/20 18:22',
  },
  {
    bank: 'بانک ملی ایران',
    sample: 'بانک ملی ایران\nبرداشت از کارت: 603799******4128\nمبلغ: 1,250,000 ریال\nخرید پایانه فروشگاهی\nمانده: 194,500,000 ریال\n1405/05/20-11:10',
  },
  {
    bank: 'بانک پاسارگاد',
    sample: 'بانک پاسارگاد\nانتقال پایا به حساب 201.8000.1234567.1\nمبلغ: 25,000,000 ریال\nموجودی: 620,000,000 ریال\n1405/05/19 16:40:12',
  },
  {
    bank: 'بانک ملت',
    sample: 'بانک ملت\nواریز سود سپرده\nمبلغ: 14,800,000 ریال\nمانده: 184,200,000 ریال\nحساب: 5412896321\n1405/05/01 02:15',
  },
];
