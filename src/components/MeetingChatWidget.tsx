import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Users,
  Mic,
  MicOff,
  Paperclip,
  Volume2,
  VolumeX,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  File,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { AIAgentConfig, ChatMessage, ChatAttachment, Language } from '../types';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface MeetingChatWidgetProps {
  messages: ChatMessage[];
  agents: AIAgentConfig[];
  workspaceContext: any;
  onSendMessage: (msg: ChatMessage) => void;
  language: Language;
  presetAttachment?: ChatAttachment | null;
  onClearPresetAttachment?: () => void;
}

export const MeetingChatWidget: React.FC<MeetingChatWidgetProps> = ({
  messages,
  agents,
  workspaceContext,
  onSendMessage,
  language,
  presetAttachment,
  onClearPresetAttachment,
}) => {
  const theme = useWidgetTheme();
  const [inputText, setInputText] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [showAgentDetails, setShowAgentDetails] = useState<boolean>(false);

  const isFa = language === 'fa';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    if (presetAttachment) {
      setAttachments((prev) => {
        if (prev.some((a) => a.id === presetAttachment.id)) return prev;
        return [...prev, presetAttachment];
      });
      if (onClearPresetAttachment) {
        onClearPresetAttachment();
      }
    }
  }, [presetAttachment, onClearPresetAttachment]);

  const handleSpeakText = (messageId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (playingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setPlayingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isFa ? 'fa-IR' : 'en-US';
    utterance.onend = () => setPlayingMessageId(null);
    utterance.onerror = () => setPlayingMessageId(null);

    setPlayingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(isFa ? 'مرورگر شما از ورودی صوتی پشتیبانی نمی‌کند.' : 'Speech recognition not supported in browser.');
      return;
    }

    if (isRecordingVoice) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecordingVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isFa ? 'fa-IR' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecordingVoice(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecordingVoice(false);
      };

      recognition.onerror = () => {
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecordingVoice(false);
    }
  };

  const handleFileAttach = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newAttachment: ChatAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl,
      };
      setAttachments((prev) => [...prev, newAttachment]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || isSending) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    const currentAttachments = [...attachments];
    setInputText('');
    setAttachments([]);
    onSendMessage(userMessage);
    setIsSending(true);

    try {
      const activeAgents = agents.filter((a) => a.enabled !== false);
      const targetAgent =
        selectedAgentId === 'all'
          ? activeAgents[0] || agents[0]
          : agents.find((a) => a.id === selectedAgentId) || agents[0];

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          agentId: targetAgent.id,
          agentName: targetAgent.name,
          permissions: targetAgent.permissions,
          workspaceContext,
          attachments: currentAttachments,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat API error');
      }

      const data = await response.json();
      const aiReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        agentId: data.agentId || targetAgent.id,
        agentName: data.agentName || targetAgent.name,
        content: data.reply,
        timestamp: data.timestamp || new Date().toISOString(),
      };
      onSendMessage(aiReply);
    } catch (err) {
      console.error('Failed to get AI reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getAttachmentIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="w-3 h-3 text-emerald-400" />;
    if (type.includes('pdf')) return <FileText className="w-3 h-3 text-rose-400" />;
    if (type.includes('sheet') || type.includes('csv')) return <FileSpreadsheet className="w-3 h-3 text-green-400" />;
    if (type.includes('code') || type.includes('json')) return <FileCode className="w-3 h-3 text-blue-400" />;
    return <File className="w-3 h-3 text-current opacity-60" />;
  };

  const currentSelectedAgent = agents.find((a) => a.id === selectedAgentId);

  return (
    <div className="flex flex-col h-full space-y-2.5 text-xs">
      {/* Agent Selector Header & Status */}
      <div className={`flex items-center justify-between border-b ${theme.borderClass} pb-2 flex-wrap gap-2`}>
        <div className="flex items-center gap-1.5 font-bold">
          <Users className="w-4 h-4 text-sky-400" />
          <span>{isFa ? 'اتاق جلسات و ارتباط صوتی ایجنت‌ها' : 'AI Agent Voice & File Meeting'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className={`${theme.inputClass} rounded px-2 py-0.5 text-[11px] focus:outline-none`}
          >
            <option value="all">{isFa ? 'گفتگو با همه ایجنت‌ها' : 'All Agents'}</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id} className="text-slate-900 bg-white">
                {a.name} ({a.role.slice(0, 18)}...)
              </option>
            ))}
          </select>

          {currentSelectedAgent && currentSelectedAgent.permissions && (
            <button
              onClick={() => setShowAgentDetails(!showAgentDetails)}
              className={`p-1 ${theme.buttonBgClass} rounded transition cursor-pointer`}
              title={isFa ? 'مشاهده سطوح دسترسی ایجنت' : 'View Agent Permissions'}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Permissions Quick Banner */}
      {showAgentDetails && currentSelectedAgent && currentSelectedAgent.permissions && (
        <div className={`${theme.cardBgClass} border ${theme.borderClass} rounded-lg p-2 text-[10px] space-y-1 animate-in fade-in`}>
          <div className="font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{isFa ? `سطوح دسترسی ${currentSelectedAgent.name}:` : `Permissions for ${currentSelectedAgent.name}:`}</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[9px] pt-1">
            <span className={currentSelectedAgent.permissions.canViewFinances ? 'text-emerald-400 font-medium' : `${theme.mutedTextClass} line-through`}>
              • {isFa ? 'امور مالی و حساب‌ها' : 'Finances'}
            </span>
            <span className={currentSelectedAgent.permissions.canManageTasks ? 'text-emerald-400 font-medium' : `${theme.mutedTextClass} line-through`}>
              • {isFa ? 'تسک‌ها و تقویم' : 'Tasks'}
            </span>
            <span className={currentSelectedAgent.permissions.canAccessFiles ? 'text-emerald-400 font-medium' : `${theme.mutedTextClass} line-through`}>
              • {isFa ? 'مدیریت و خواندن فایل‌ها' : 'Files Access'}
            </span>
            <span className={currentSelectedAgent.permissions.canAccessSocial ? 'text-emerald-400 font-medium' : `${theme.mutedTextClass} line-through`}>
              • {isFa ? 'تحلیل شبکه‌های اجتماعی' : 'Social Channels'}
            </span>
          </div>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 p-1 min-h-[120px]">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs"
                  style={{
                    backgroundColor:
                      agents.find((a) => a.id === m.agentId)?.avatarColor || '#4f46e5',
                  }}
                >
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-2.5 relative group ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-br-none shadow-xs'
                    : `${theme.cardBgClass} border ${theme.borderClass} rounded-bl-none shadow-xs`
                }`}
              >
                {!isUser && (
                  <div className={`flex items-center justify-between gap-2 border-b ${theme.borderClass} pb-1 mb-1.5`}>
                    <span className="text-[10px] font-bold text-sky-400 truncate">
                      {m.agentName || (isFa ? 'ایجنت هوش مصنوعی' : 'AI Agent')}
                    </span>
                    <button
                      onClick={() => handleSpeakText(m.id, m.content)}
                      className={`p-1 rounded hover:opacity-80 transition cursor-pointer ${
                        playingMessageId === m.id ? 'text-amber-400' : theme.subtleTextClass
                      }`}
                      title={playingMessageId === m.id ? (isFa ? 'توقف خواندن صوتی' : 'Stop Voice') : (isFa ? 'پخش صوتی پیام (TTS)' : 'Read Aloud')}
                    >
                      {playingMessageId === m.id ? (
                        <VolumeX className="w-3 h-3 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {/* Attached files inside message */}
                {m.attachments && m.attachments.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {m.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 ${theme.buttonBgClass} px-2 py-1 rounded border ${theme.borderClass} text-[10px]`}
                      >
                        {getAttachmentIcon(att.type)}
                        <span className="truncate flex-1">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="leading-relaxed whitespace-pre-wrap">{m.content}</div>

                <div className={`text-[9px] ${theme.mutedTextClass} mt-1 text-end`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-full bg-sky-700 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex gap-2 justify-start items-center text-sky-400 animate-pulse text-[11px]">
            <Bot className="w-4 h-4 text-sky-400" />
            <span>{isFa ? 'ایجنت در حال تحلیل فایل و داده‌ها و پاسخگویی...' : 'Agent analyzing data & files...'}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Previews before sending */}
      {attachments.length > 0 && (
        <div className={`flex items-center gap-1.5 flex-wrap ${theme.cardBgClass} p-1.5 rounded-lg border ${theme.borderClass} shrink-0`}>
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1 ${theme.badgeBgClass} border ${theme.borderClass} px-2 py-0.5 rounded-md text-[10px]`}
            >
              {getAttachmentIcon(att.type)}
              <span className="max-w-[120px] truncate">{att.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(idx)}
                className="hover:text-rose-400 cursor-pointer ml-1"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Voice Recording Indicator */}
      {isRecordingVoice && (
        <div className="flex items-center justify-between bg-rose-500/20 border border-rose-400/40 text-rose-300 px-2.5 py-1.5 rounded-lg text-[11px] animate-pulse shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>{isFa ? 'در حال ضبط و تبدیل گفتار به متن (صحبت کنید)...' : 'Listening & transcribing voice...'}</span>
          </div>
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className="text-[10px] bg-rose-600 hover:bg-rose-500 text-white px-2 py-0.5 rounded cursor-pointer"
          >
            {isFa ? 'توقف' : 'Stop'}
          </button>
        </div>
      )}

      {/* Message Input Form with Multi-line Dynamic Textarea Pinned to Bottom */}
      <form onSubmit={handleSend} className="flex items-end gap-1.5 mt-auto pt-1.5 shrink-0">
        {/* File Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 h-[38px] ${theme.buttonBgClass} border ${theme.borderClass} rounded-lg transition cursor-pointer shrink-0 flex items-center justify-center`}
          title={isFa ? 'پیوست فایل (تصویر، سند، اکسل، کد)' : 'Attach File'}
        >
          <Paperclip className="w-3.5 h-3.5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileAttach(e.target.files)}
        />

        {/* Voice Input Button */}
        <button
          type="button"
          onClick={toggleVoiceRecording}
          className={`p-2 h-[38px] rounded-lg border transition cursor-pointer shrink-0 flex items-center justify-center ${
            isRecordingVoice
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
              : `${theme.buttonBgClass} border ${theme.borderClass}`
          }`}
          title={isRecordingVoice ? (isFa ? 'توقف ضبط' : 'Stop recording') : (isFa ? 'ورودی صوتی (گفتگو با ایجنت)' : 'Voice Input')}
        >
          {isRecordingVoice ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>

        {/* Dynamic Multi-line Textarea Field (1 to 5 lines) */}
        <div className="flex-1 min-w-0 relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder={
              isRecordingVoice
                ? (isFa ? 'در حال شنیدن...' : 'Listening...')
                : isFa
                ? 'پیام به ایجنت‌ها... (Enter ارسال، Shift+Enter خط جدید)'
                : 'Message agents... (Enter to send, Shift+Enter for newline)'
            }
            className={`w-full ${theme.inputClass} rounded-lg px-3 py-2 text-xs resize-none min-h-[38px] max-h-[125px] leading-relaxed custom-scrollbar overflow-y-auto block`}
            style={{
              height: `${Math.min(125, Math.max(38, 20 + Math.min(5, Math.max(1, (inputText.match(/\n/g) || []).length + 1)) * 19))}px`,
            }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!inputText.trim() && attachments.length === 0) || isSending}
          className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 h-[38px] rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
          title={isFa ? 'ارسال پیام' : 'Send'}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
