import React, { useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, 
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, Minus, 
  Image as ImageIcon, Link as LinkIcon, Undo, Redo, X, ExternalLink, Trash2, Check, Upload
} from 'lucide-react';

const lowlight = createLowlight(common);

interface MenuBarProps {
  editor: Editor | null;
  onOpenLinkModal: () => void;
  onOpenImageModal: () => void;
}

const MenuBar = ({ editor, onOpenLinkModal, onOpenImageModal }: MenuBarProps) => {
  if (!editor) return null;

  const btnClass = "p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const activeClass = "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400";

  return (
    <div className="sticky top-[70px] z-20 flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-800 p-2 bg-slate-50/98 dark:bg-slate-900/98 backdrop-blur-md rounded-t-2xl shadow-xs transition-shadow">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`${btnClass} ${editor.isActive('bold') ? activeClass : ''}`} type="button" title="Bold"><Bold size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btnClass} ${editor.isActive('italic') ? activeClass : ''}`} type="button" title="Italic"><Italic size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${btnClass} ${editor.isActive('underline') ? activeClass : ''}`} type="button" title="Underline"><UnderlineIcon size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`${btnClass} ${editor.isActive('strike') ? activeClass : ''}`} type="button" title="Strikethrough"><Strikethrough size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleCode().run()} className={`${btnClass} ${editor.isActive('code') ? activeClass : ''}`} type="button" title="Inline Code"><Code size={16} /></button>
      
      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
      
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${btnClass} ${editor.isActive('heading', { level: 1 }) ? activeClass : ''}`} type="button" title="Heading 1"><Heading1 size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${btnClass} ${editor.isActive('heading', { level: 2 }) ? activeClass : ''}`} type="button" title="Heading 2"><Heading2 size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${btnClass} ${editor.isActive('heading', { level: 3 }) ? activeClass : ''}`} type="button" title="Heading 3"><Heading3 size={16} /></button>
      
      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
      
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${btnClass} ${editor.isActive('bulletList') ? activeClass : ''}`} type="button" title="Bullet List"><List size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${btnClass} ${editor.isActive('orderedList') ? activeClass : ''}`} type="button" title="Ordered List"><ListOrdered size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${btnClass} ${editor.isActive('blockquote') ? activeClass : ''}`} type="button" title="Blockquote"><Quote size={16} /></button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass} type="button" title="Horizontal Rule"><Minus size={16} /></button>
      
      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

      <button 
        onClick={onOpenLinkModal} 
        className={`${btnClass} ${editor.isActive('link') ? activeClass : ''}`} 
        type="button" 
        title="Insert or Edit Link"
      >
        <LinkIcon size={16} />
      </button>

      <button 
        onClick={onOpenImageModal} 
        className={btnClass} 
        type="button" 
        title="Insert Image"
      >
        <ImageIcon size={16} />
      </button>
        
      <div className="flex-1"></div>
      
      <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={btnClass} type="button" title="Undo"><Undo size={16} /></button>
      <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={btnClass} type="button" title="Redo"><Redo size={16} /></button>
    </div>
  );
};

export default function TiptapEditor({ 
  content = '', 
  onChangeRaw, 
  onChangeHtml 
}: { 
  content?: any; 
  onChangeRaw: (json: string) => void;
  onChangeHtml: (html: string) => void;
}) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [isEditingLink, setIsEditingLink] = useState(false);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const safeContent = React.useMemo(() => {
    if (!content) return '';
    if (typeof content === 'string') {
      const trimmed = content.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === 'object') return parsed;
        } catch {
          return content;
        }
      }
      return content;
    }
    return content;
  }, [content]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 shadow-sm border border-slate-200 dark:border-slate-800',
        },
      }),
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-red-600 dark:text-red-400 underline underline-offset-2 hover:text-red-700',
        },
      }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: safeContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[420px] p-5 text-slate-800 dark:text-slate-100',
      },
    },
    onUpdate: ({ editor }) => {
      onChangeRaw(JSON.stringify(editor.getJSON()));
      onChangeHtml(editor.getHTML());
    },
  });

  const handleOpenLinkModal = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    const previousTarget = editor.getAttributes('link').target;
    setLinkUrl(previousUrl);
    setLinkNewTab(previousTarget === '_blank' || !previousUrl);
    setIsEditingLink(Boolean(previousUrl));
    setLinkModalOpen(true);
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      editor.chain().focus().unsetLink().run();
    } else {
      let finalUrl = trimmed;
      if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith('/') && !finalUrl.startsWith('#') && !finalUrl.startsWith('mailto:')) {
        finalUrl = 'https://' + finalUrl;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: finalUrl, target: linkNewTab ? '_blank' : null })
        .run();
    }
    setLinkModalOpen(false);
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setLinkModalOpen(false);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleOpenImageModal = () => {
    setImageUrl('');
    setImageAlt('');
    setImagePreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setImageModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        if (!imageAlt) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setImageAlt(cleanName);
        }
        setImagePreviewError(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInsertImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor || !imageUrl.trim()) return;
    editor
      .chain()
      .focus()
      .setImage({ 
        src: imageUrl.trim(), 
        alt: imageAlt.trim() || undefined 
      })
      .run();
    setImageModalOpen(false);
  };

  return (
    <div className="relative border border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 shadow-sm focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all">
      <MenuBar 
        editor={editor} 
        onOpenLinkModal={handleOpenLinkModal} 
        onOpenImageModal={handleOpenImageModal} 
      />
      <EditorContent editor={editor} className="bg-white dark:bg-slate-900 rounded-b-2xl" />

      {/* Custom Link Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                  <LinkIcon size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base font-display">
                    {isEditingLink ? 'Edit Link' : 'Insert Link'}
                  </h3>
                  <p className="text-xs text-slate-500">Attach a web URL to the highlighted text</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setLinkModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyLink} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Destination URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com or /article/..."
                    autoFocus
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 h-4 w-4"
                />
                <span className="flex items-center gap-1.5">
                  Open link in new tab <ExternalLink size={12} className="text-slate-400" />
                </span>
              </label>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                {isEditingLink ? (
                  <button
                    type="button"
                    onClick={handleRemoveLink}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                  >
                    <Trash2 size={14} /> Remove Link
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLinkModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl shadow-sm transition-all"
                  >
                    <Check size={14} /> Apply Link
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Image Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base font-display">Insert Image</h3>
                  <p className="text-xs text-slate-500">Insert an image into your editorial article</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setImageModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInsertImage} className="mt-4 space-y-4">
              {/* Option 1: File Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Upload from Computer / Phone
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2.5 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 bg-slate-50/80 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all text-xs font-semibold group cursor-pointer"
                >
                  <Upload size={18} className="group-hover:scale-110 transition-transform text-red-500" />
                  <span>Click to choose an image file from your device</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800" />
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">OR</span>
                <div className="flex-1 h-px bg-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Option 2: Image URL / Media Library */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    2. Or Paste Image URL
                  </label>
                  <a
                    href="/medialibrary/index.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                  >
                    Open Media Library <ExternalLink size={11} />
                  </a>
                </div>
                <input
                  type="text"
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreviewError(false);
                  }}
                  placeholder="https://... or /medialibrary/blog/photo.webp"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white placeholder:text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alt Description <span className="text-slate-400 font-normal">(Optional for SEO & Accessibility)</span>
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Describe what's in the image..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              {/* Live Preview Card */}
              {imageUrl.trim() && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 px-1">
                    Live Preview:
                  </div>
                  {!imagePreviewError ? (
                    <img 
                      src={imageUrl} 
                      alt={imageAlt || 'Preview'} 
                      className="max-h-48 w-full object-contain rounded-lg bg-slate-100 dark:bg-slate-900"
                      onError={() => setImagePreviewError(true)}
                    />
                  ) : (
                    <div className="p-4 text-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                      Unable to preview image. Check URL format.
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={() => setImageModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!imageUrl.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 active:scale-95 rounded-xl shadow-sm transition-all"
                >
                  <Check size={14} /> Insert Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
