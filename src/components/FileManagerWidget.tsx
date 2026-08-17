import React, { useState, useRef } from 'react';
import {
  FolderOpen,
  Upload,
  Download,
  Trash2,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCode,
  FileArchive,
  File,
  Search,
  HardDrive,
  Sparkles,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { WorkspaceFile, Language } from '../types';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface FileManagerWidgetProps {
  files: WorkspaceFile[];
  onUploadFile: (file: WorkspaceFile) => void;
  onDeleteFile: (fileId: string) => void;
  onSendFileToChat?: (file: WorkspaceFile) => void;
  language: Language;
  userId?: string;
}

export const FileManagerWidget: React.FC<FileManagerWidgetProps> = ({
  files,
  onUploadFile,
  onDeleteFile,
  onSendFileToChat,
  language,
  userId = 'user-default',
}) => {
  const theme = useWidgetTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewFile, setPreviewFile] = useState<WorkspaceFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFa = language === 'fa';

  // Calculate total storage size
  const totalSizeBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
  const maxStorageMB = 50; // 50MB quota display
  const storagePercentage = Math.min(100, Math.round((parseFloat(totalSizeMB) / maxStorageMB) * 100));

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: WorkspaceFile) => {
    const type = file.type?.toLowerCase() || '';
    const name = file.name?.toLowerCase() || '';

    if (type.includes('image') || name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
      return <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (type.includes('pdf') || name.endsWith('.pdf')) {
      return <FileText className="w-4 h-4 text-rose-400 shrink-0" />;
    }
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('csv') || name.match(/\.(xlsx|xls|csv)$/)) {
      return <FileSpreadsheet className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    if (type.includes('zip') || type.includes('tar') || name.match(/\.(zip|rar|7z|tar\.gz)$/)) {
      return <FileArchive className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (type.includes('json') || type.includes('javascript') || type.includes('typescript') || name.match(/\.(js|ts|tsx|json|html|css)$/)) {
      return <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
    return <File className="w-4 h-4 text-current opacity-60 shrink-0" />;
  };

  const determineCategory = (file: File): 'document' | 'image' | 'data' | 'audio' | 'archive' | 'other' => {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    if (type.includes('image') || name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'image';
    if (type.includes('pdf') || name.match(/\.(pdf|doc|docx|txt|rtf|md)$/)) return 'document';
    if (type.includes('sheet') || type.includes('csv') || name.match(/\.(xlsx|xls|csv|json)$/)) return 'data';
    if (type.includes('audio') || name.match(/\.(mp3|wav|ogg|m4a)$/)) return 'audio';
    if (type.includes('zip') || name.match(/\.(zip|rar|7z|tar)$/)) return 'archive';
    return 'other';
  };

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const category = determineCategory(file);

        try {
          const res = await fetch('/api/files/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              name: file.name,
              size: file.size,
              type: file.type || 'application/octet-stream',
              dataUrl,
              category,
              description: isFa ? 'فایل بارگذاری شده توسط کاربر' : 'User uploaded workspace file',
              uploadedBy: isFa ? 'کاربر فضا' : 'Workspace User',
            }),
          });

          if (res.ok) {
            const data = await res.json();
            onUploadFile(data.file);
          } else {
            const localFile: WorkspaceFile = {
              id: `file-${Date.now()}`,
              name: file.name,
              size: file.size,
              type: file.type || 'application/octet-stream',
              dataUrl,
              category,
              uploadedAt: new Date().toISOString(),
              uploadedBy: isFa ? 'کاربر فضا' : 'Workspace User',
            };
            onUploadFile(localFile);
          }
        } catch {
          const localFile: WorkspaceFile = {
            id: `file-${Date.now()}`,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            dataUrl,
            category,
            uploadedAt: new Date().toISOString(),
            uploadedBy: isFa ? 'کاربر فضا' : 'Workspace User',
          };
          onUploadFile(localFile);
        }

        setUploadSuccessMessage(isFa ? `فایل "${file.name}" با موفقیت ذخیره شد.` : `File "${file.name}" uploaded successfully.`);
        setTimeout(() => setUploadSuccessMessage(null), 4000);
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File upload error:', err);
      setIsUploading(false);
    }
  };

  const handleDownload = (file: WorkspaceFile) => {
    if (file.dataUrl) {
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const blob = new Blob([file.description || file.name], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.tags && f.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col h-full space-y-3 text-xs">
      {/* Top Banner: Storage Info & Upload Action */}
      <div className={`flex items-center justify-between border-b ${theme.borderClass} pb-2.5 flex-wrap gap-2`}>
        <div className="flex items-center gap-2 font-bold">
          <div className="p-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold">{isFa ? 'مخزن و مدیریت اسناد' : 'Document & File Vault'}</span>
            <span className={`block text-[10px] font-normal ${theme.subtleTextClass}`}>
              {files.length} {isFa ? 'فایل ثبت شده' : 'stored files'}
            </span>
          </div>
        </div>

        {/* Storage Bar & Actions */}
        <div className="flex items-center gap-2">
          <div className={`hidden sm:flex items-center gap-1.5 ${theme.cardBgClass} px-2.5 py-1 rounded-xl border ${theme.borderClass} text-[11px]`}>
            <HardDrive className="w-3.5 h-3.5 text-sky-400" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] leading-tight">
                {totalSizeMB} MB / {maxStorageMB} MB
              </span>
              <div className="w-16 h-1 bg-black/30 dark:bg-white/20 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-90 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 border border-white/20"
            title={isFa ? 'آپلود فایل جدید' : 'Upload File'}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? (isFa ? 'در حال بارگذاری...' : 'Uploading...') : (isFa ? 'آپلود فایل' : 'Upload')}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Upload Success Alert */}
      {uploadSuccessMessage && (
        <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 dark:text-emerald-200 px-3 py-2 rounded-xl text-[11px] shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadSuccessMessage}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
          dragOver
            ? 'border-sky-400 bg-sky-500/20 shadow-lg'
            : `${theme.borderClass} ${theme.cardBgClass} hover:border-sky-400/60`
        }`}
      >
        <Upload className="w-4 h-4 text-sky-400 opacity-90" />
        <p className="text-[11px] font-bold">
          {isFa ? 'فایل‌ها را به اینجا بکشید یا برای انتخاب کلیک کنید' : 'Drag & drop files here, or click to browse'}
        </p>
        <span className={`text-[10px] ${theme.subtleTextClass}`}>
          {isFa ? 'پشتیبانی از PDF, Excel, تصاویر, کدها, صوت و اسناد' : 'Supports PDF, Excel, Images, Code, Audio & Docs'}
        </span>
      </div>

      {/* Search & Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[140px] relative">
          <Search className={`w-3.5 h-3.5 absolute right-2.5 top-2.5 ${theme.mutedTextClass}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isFa ? 'جستجو در نام و تگ فایل‌ها...' : 'Search files...'}
            className={`w-full ${theme.inputClass} rounded-xl pr-8 pl-3 py-1.5 text-[11px] transition`}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar">
          {[
            { key: 'all', labelFa: 'همه', labelEn: 'All' },
            { key: 'document', labelFa: 'اسناد PDF/Doc', labelEn: 'Docs' },
            { key: 'data', labelFa: 'اکسل و داده‌ها', labelEn: 'Data' },
            { key: 'image', labelFa: 'تصاویر', labelEn: 'Images' },
            { key: 'audio', labelFa: 'صوت', labelEn: 'Audio' },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === cat.key
                  ? 'bg-sky-600 text-white border-sky-400 shadow-sm'
                  : `${theme.cardBgClass} ${theme.borderClass} hover:opacity-80`
              }`}
            >
              {isFa ? cat.labelFa : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto max-h-[240px] custom-scrollbar space-y-1.5 p-0.5">
        {filteredFiles.length === 0 ? (
          <div className={`text-center py-8 ${theme.subtleTextClass} text-xs`}>
            {isFa ? 'فایلی در این دسته‌بندی یافت نشد.' : 'No files found in this category.'}
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`flex items-center justify-between gap-2.5 p-2.5 ${theme.cardBgClass} ${theme.cardHoverClass} rounded-xl border ${theme.borderClass} transition group shadow-xs`}
            >
              {/* File Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={`p-2 ${theme.buttonBgClass} rounded-lg shrink-0 border ${theme.borderClass}`}>
                  {getFileIcon(file)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-[11px] truncate tracking-tight" title={file.name}>
                      {file.name}
                    </h4>
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] ${theme.subtleTextClass} mt-0.5`}>
                    <span className="font-mono">{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.uploadedBy}</span>
                    {file.tags && file.tags.length > 0 && (
                      <span className="hidden sm:inline-block bg-sky-500/15 text-sky-400 border border-sky-500/30 px-1.5 py-0.2 rounded-md text-[9px] font-medium">
                        #{file.tags[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Send to AI Agent */}
                {onSendFileToChat && (
                  <button
                    onClick={() => onSendFileToChat(file)}
                    className="p-1.5 text-sky-400 hover:text-white hover:bg-sky-600 rounded-lg transition cursor-pointer"
                    title={isFa ? 'ارسال به چت هوش مصنوعی جهت تحلیل' : 'Send to AI Chat'}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Preview */}
                {file.dataUrl && (
                  <button
                    onClick={() => setPreviewFile(file)}
                    className={`p-1.5 ${theme.buttonBgClass} rounded-lg transition cursor-pointer`}
                    title={isFa ? 'پیش‌نمایش' : 'Preview'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Download */}
                <button
                  onClick={() => handleDownload(file)}
                  className={`p-1.5 ${theme.buttonBgClass} rounded-lg transition cursor-pointer`}
                  title={isFa ? 'دانلود فایل' : 'Download'}
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => onDeleteFile(file.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                  title={isFa ? 'حذف فایل' : 'Delete'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 text-white rounded-2xl border border-white/20 max-w-lg w-full p-4 space-y-3 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 className="font-bold text-sm truncate">{previewFile.name}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-white cursor-pointer text-xs p-1 hover:bg-white/10 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[300px] overflow-auto flex items-center justify-center bg-black/60 p-3 rounded-xl border border-white/10">
              {previewFile.type.includes('image') && previewFile.dataUrl ? (
                <img
                  src={previewFile.dataUrl}
                  alt={previewFile.name}
                  className="max-h-[280px] object-contain rounded-lg"
                />
              ) : previewFile.type.includes('audio') && previewFile.dataUrl ? (
                <audio controls src={previewFile.dataUrl} className="w-full" />
              ) : (
                <div className="p-4 text-center text-xs text-slate-300 leading-relaxed">
                  <p className="font-semibold mb-1">{previewFile.name}</p>
                  <p className="text-slate-400">{previewFile.description || (isFa ? 'پیش‌نمایش متنی فایل در دسترس نیست.' : 'No preview available.')}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleDownload(previewFile)}
                className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isFa ? 'دانلود' : 'Download'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
