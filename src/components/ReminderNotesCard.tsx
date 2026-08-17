import React, { useState } from 'react';
import {
  StickyNote,
  Plus,
  Pin,
  Trash2,
  Edit2,
  Star,
  Search,
  ArrowUpDown,
  Check,
  Copy,
} from 'lucide-react';
import { ReminderNote, Language } from '../types';
import { toPersianDigits } from '../utils/jalali';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface ReminderNotesCardProps {
  notes: ReminderNote[];
  onUpdateNotes: (notes: ReminderNote[]) => void;
  language: Language;
}

type SortOption = 'pinned' | 'stars-desc' | 'stars-asc' | 'date-desc' | 'date-asc';

export const ReminderNotesCard: React.FC<ReminderNotesCardProps> = ({
  notes,
  onUpdateNotes,
  language,
}) => {
  const theme = useWidgetTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState<number>(3); // 1-5 stars
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('pinned');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isFa = language === 'fa';

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newNote: ReminderNote = {
      id: `note-${Date.now()}`,
      content: newContent.trim(),
      priority: newPriority,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateNotes([newNote, ...notes]);
    setNewContent('');
    setNewPriority(3);
    setIsAdding(false);
  };

  const handleTogglePin = (id: string) => {
    onUpdateNotes(
      notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleSetPriority = (id: string, stars: number) => {
    onUpdateNotes(
      notes.map((n) => (n.id === id ? { ...n, priority: stars } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    onUpdateNotes(notes.filter((n) => n.id !== id));
  };

  const handleStartEdit = (note: ReminderNote) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingContent.trim()) return;
    onUpdateNotes(
      notes.map((n) => (n.id === id ? { ...n, content: editingContent.trim() } : n))
    );
    setEditingNoteId(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & Sort
  const filtered = notes.filter((n) =>
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.category && n.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedNotes = [...filtered].sort((a, b) => {
    if (sortBy === 'pinned') {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.priority - a.priority;
    }
    if (sortBy === 'stars-desc') return b.priority - a.priority;
    if (sortBy === 'stars-asc') return a.priority - b.priority;
    if (sortBy === 'date-desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'date-asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return 0;
  });

  return (
    <div
      id="reminder-notes-card"
      className="h-full flex flex-col justify-between relative overflow-hidden transition-all select-text"
    >
      {/* Background Accent */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-current/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${theme.borderClass} pb-2 mb-2 shrink-0`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <StickyNote className={`w-4 h-4 ${theme.isDark ? 'text-purple-300' : 'text-purple-600'} shrink-0`} />
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold tracking-tight truncate">
                {isFa ? 'نوت‌های یادآوری موقت' : 'Temporary Reminder Notes'}
              </h2>
              <span className={`text-[9px] sm:text-[10px] ${theme.subtleTextClass} block truncate`}>
                {isFa
                  ? '<قابل ویرایش / مرتب‌سازی / اولویت‌دهی ۰-۵ ستاره>'
                  : '<Editable / Sortable / 0-5 Stars Priority>'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`p-1.5 ${theme.buttonBgClass} rounded-lg transition cursor-pointer text-xs flex items-center gap-1 font-medium shrink-0`}
            title={isFa ? 'افزودن نوت' : 'Add Note'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{isFa ? 'افزودن' : 'Add'}</span>
          </button>
        </div>

        {/* Search & Sort Controls Bar */}
        <div className="grid grid-cols-2 gap-1.5 mb-2 text-xs shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className={`w-3 h-3 absolute top-2 start-2 ${theme.subtleTextClass}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFa ? 'جستجوی نوت...' : 'Search notes...'}
              className={`w-full ps-6 pe-2 py-1 rounded text-[11px] focus:outline-none border ${theme.borderClass} ${theme.inputClass}`}
            />
          </div>

          {/* Sort Dropdown */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded border ${theme.borderClass} ${theme.isDark ? 'bg-black/20' : 'bg-slate-100'}`}>
            <ArrowUpDown className={`w-3 h-3 ${theme.subtleTextClass} shrink-0`} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={`bg-transparent ${theme.textColor} text-[11px] w-full focus:outline-none cursor-pointer`}
            >
              <option value="pinned" className="bg-slate-900 text-white">
                {isFa ? 'سنجاق شده / اولویت' : 'Pinned First'}
              </option>
              <option value="stars-desc" className="bg-slate-900 text-white">
                {isFa ? 'بیشترین ستاره (۵ به ۰)' : 'Stars (High to Low)'}
              </option>
              <option value="stars-asc" className="bg-slate-900 text-white">
                {isFa ? 'کمترین ستاره (۰ به ۵)' : 'Stars (Low to High)'}
              </option>
              <option value="date-desc" className="bg-slate-900 text-white">
                {isFa ? 'جدیدترین' : 'Newest First'}
              </option>
              <option value="date-asc" className="bg-slate-900 text-white">
                {isFa ? 'قدیمی‌ترین' : 'Oldest First'}
              </option>
            </select>
          </div>
        </div>

        {/* Add Note Form */}
        {isAdding && (
          <form
            onSubmit={handleAddNote}
            className={`p-2.5 rounded-lg border ${theme.cardBgClass} mb-2 space-y-1.5 text-xs shrink-0 animate-in fade-in`}
          >
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={isFa ? 'متن یادآوری را وارد کنید...' : 'Write your reminder note...'}
              className={`w-full p-1.5 rounded focus:outline-none min-h-[46px] text-[11px] ${theme.inputClass}`}
              autoFocus
            />

            <div className="flex items-center justify-between pt-0.5">
              {/* Star Priority Selector */}
              <div className="flex items-center gap-1">
                <span className={`text-[10px] ${theme.subtleTextClass}`}>{isFa ? 'اولویت:' : 'Priority:'}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewPriority(star)}
                      className="text-amber-400 hover:scale-110 transition cursor-pointer p-0.5"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          star <= newPriority ? 'fill-amber-400' : 'opacity-30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className={`px-2 py-0.5 ${theme.buttonBgClass} rounded cursor-pointer transition text-[11px]`}
                >
                  {isFa ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-semibold cursor-pointer transition text-[11px]"
                >
                  {isFa ? 'ثبت نوت' : 'Add'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Notes List */}
        <div className="space-y-1.5 flex-1 overflow-y-auto pe-1 custom-scrollbar min-h-0">
          {sortedNotes.length === 0 ? (
            <div className={`text-center py-4 ${theme.subtleTextClass} text-xs italic rounded-lg border ${theme.borderClass} ${theme.cardBgClass}`}>
              {isFa ? 'هیچ یادآوری موقتی یافت نشد.' : 'No reminder notes found.'}
            </div>
          ) : (
            sortedNotes.map((note) => {
              const isEditing = editingNoteId === note.id;

              return (
                <div
                  key={note.id}
                  className={`border rounded-lg p-2 transition-all relative ${theme.borderClass} ${theme.cardBgClass} ${theme.cardHoverClass} ${
                    note.pinned ? 'border-amber-400/50 bg-amber-500/10' : ''
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className={`w-full p-1.5 rounded text-[11px] focus:outline-none min-h-[46px] ${theme.inputClass}`}
                        autoFocus
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className={`px-2 py-0.5 ${theme.buttonBgClass} rounded text-[10px] cursor-pointer`}
                        >
                          {isFa ? 'انصراف' : 'Cancel'}
                        </button>
                        <button
                          onClick={() => handleSaveEdit(note.id)}
                          className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          {isFa ? 'ذخیره' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <p className="text-[11px] sm:text-xs leading-relaxed flex-1 break-words">
                          {note.content}
                        </p>

                        <button
                          onClick={() => handleTogglePin(note.id)}
                          className={`p-1 rounded ${theme.buttonBgClass} transition cursor-pointer shrink-0 ${
                            note.pinned ? 'text-amber-400' : theme.subtleTextClass
                          }`}
                          title={note.pinned ? (isFa ? 'برداشتن سنجاق' : 'Unpin') : (isFa ? 'سنجاق نوت' : 'Pin')}
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Footer info: 0-5 Stars & Actions */}
                      <div className={`flex items-center justify-between mt-1.5 pt-1 border-t ${theme.borderClass} text-[10px]`}>
                        {/* 0 to 5 Star Rating */}
                        <div className="flex items-center gap-0.5" title={`${note.priority} Stars`}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleSetPriority(note.id, star === note.priority ? 0 : star)}
                              className="cursor-pointer hover:scale-110 transition p-0.5"
                            >
                              <Star
                                className={`w-3 h-3 ${
                                  star <= note.priority
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'opacity-25'
                                }`}
                              />
                            </button>
                          ))}
                          <span className={`text-[9px] ${theme.subtleTextClass} ms-1 font-mono`}>
                            ({isFa ? toPersianDigits(note.priority) : note.priority})
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => handleCopy(note.id, note.content)}
                            className={`p-1 ${theme.buttonBgClass} rounded cursor-pointer transition`}
                            title={copiedId === note.id ? (isFa ? 'کپی شد!' : 'Copied!') : (isFa ? 'کپی متن' : 'Copy')}
                          >
                            {copiedId === note.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => handleStartEdit(note)}
                            className={`p-1 ${theme.buttonBgClass} rounded cursor-pointer transition`}
                            title={isFa ? 'ویرایش نوت' : 'Edit Note'}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className={`p-1 ${theme.buttonBgClass} hover:text-red-400 rounded cursor-pointer transition`}
                            title={isFa ? 'حذف نوت' : 'Delete Note'}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className={`mt-2 pt-1.5 border-t ${theme.borderClass} flex items-center justify-between text-[10px] ${theme.subtleTextClass} shrink-0`}>
        <span>
          {isFa
            ? `${toPersianDigits(notes.length)} نوت ثبت شده`
            : `${notes.length} total notes`}
        </span>
        <span className="opacity-80">
          {isFa ? 'مرتب‌سازی هوشمند فعال' : 'Smart Sorting Active'}
        </span>
      </div>
    </div>
  );
};
