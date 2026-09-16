import React, { useState, useEffect, useRef } from 'react';
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
  Image as ImageIcon, Link as LinkIcon, Undo, Redo, X, ExternalLink, 
  Trash2, Check, Upload, Folder, ArrowLeft, Search, Layers, RefreshCw, Plus
} from 'lucide-react';

const lowlight = createLowlight(common);

interface MenuBarProps {
  editor: Editor | null;
  onOpenLinkModal: () => void;
  onOpenImageModal: () => void;
}

const MenuBar = ({ editor, onOpenLinkModal, onOpenImageModal }: MenuBarProps) => {
  if (!editor) return null;

  const btnClass = "p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none";
  const activeClass = "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-semibold";

  return (
    <div className="sticky top-[70px] z-20 flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-800 p-2 bg-slate-50/98 dark:bg-slate-900/98 backdrop-blur-md rounded-t-2xl shadow-xs transition-shadow">
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()} className={`${btnClass} ${editor.isActive('bold') ? activeClass : ''}`} type="button" title="Bold"><Bold size={16} /></button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btnClass} ${editor.isActive('italic') ? activeClass : ''}`} type="button" title="Italic"><Italic size={16} /></button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${btnClass} ${editor.isActive('underline') ? activeClass : ''}`} type="button" title="Underline"><UnderlineIcon size={16} /></button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleStrike().run()} className={`${btnClass} ${editor.isActive('strike') ? activeClass : ''}`} type="button" title="Strikethrough"><Strikethrough size={16} /></button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleCode().run()} className={`${btnClass} ${editor.isActive('code') ? activeClass : ''}`} type="button" title="Inline Code"><Code size={16} /></button>
      
      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
      
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${btnClass} ${editor.isActive('heading', { level: 1 }) ? activeClass : ''}`} type="button" title="Heading 1"><Heading1 size={16} /></button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${btnClass} ${editor.isActive('heading', { level: 2 }) ? activeClass : ''}`} type="button" title="Heading 2"><Heading2 size={16} /></button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${btnClass} ${editor.isActive('heading', { level: 3 }) ? activeClass : ''}`} type="button" title="Heading 3"><Heading3 size={16} /></button>
      
      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
      
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${btnClass} ${editor.isActive('bulletList') ? activeClass : ''}`} type="button" title="Bullet List"><List size={16} /></button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${btnClass} ${editor.isActive('orderedList') ? activeClass : ''}`} type="button" title="Ordered List"><ListOrdered size={16} /></button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${btnClass} ${editor.isActive('blockquote') ? activeClass : ''}`} type="button" title="Blockquote"><Quote size={16} /></button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass} type="button" title="Horizontal Rule"><Minus size={16} /></button>
      
      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={onOpenLinkModal} 
        className={`${btnClass} ${editor.isActive('link') ? activeClass : ''}`} 
        type="button" 
        title="Insert or Edit Link"
      >
        <LinkIcon size={16} />
      </button>

      <button 
        onMouseDown={(e) => e.preventDefault()}
        onClick={onOpenImageModal} 
        className={`${btnClass} bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20`} 
        type="button" 
        title="Insert Image into Section"
      >
        <ImageIcon size={16} />
      </button>
        
      <div className="flex-1"></div>
      
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={btnClass} type="button" title="Undo"><Undo size={16} /></button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={btnClass} type="button" title="Redo"><Redo size={16} /></button>
    </div>
  );
};

/**
 * Client-side Canvas Image Compression
 * Downscales images exceeding 1920px and converts to WebP (0.85 quality),
 * reducing a 10MB photo down to ~150-300KB before transmission.
 */
export const compressImageFile = async (file: File): Promise<Blob | File> => {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 1920;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
};

/**
 * Upload an image file or blob directly to the server, returning the public static WebP URL.
 */
export const uploadImageToServer = async (fileOrBlob: File | Blob, originalName: string = 'image.webp'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', fileOrBlob, originalName);

  const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

  const res = await fetch('/ourcms/media/upload-editor', {
    method: 'POST',
    headers: {
      'X-CSRF-TOKEN': csrfToken,
      'Accept': 'application/json',
    },
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Image upload failed (${res.status})`);
  }

  const json = await res.json();
  if (!json.success || !json.url) {
    throw new Error(json.message || 'Invalid server response');
  }

  return json.url;
};

/**
 * Upload a raw Base64 data URI to the server, returning the public static WebP URL.
 */
export const uploadBase64ImageToServer = async (base64DataUri: string): Promise<string> => {
  const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

  const res = await fetch('/ourcms/media/upload-editor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrfToken,
      'Accept': 'application/json',
    },
    body: JSON.stringify({ image_base64: base64DataUri }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Base64 image upload failed (${res.status})`);
  }

  const json = await res.json();
  if (!json.success || !json.url) {
    throw new Error(json.message || 'Invalid server response');
  }

  return json.url;
};

/**
 * Pre-save scanner: finds all inline Base64 images in HTML/JSON, uploads them to the server,
 * and replaces the multi-megabyte Base64 strings with lightweight static URLs.
 */
export const uploadAllBase64ImagesInHtml = async (
  html: string,
  rawJson?: string
): Promise<{ html: string; rawJson?: string }> => {
  if (!html || !html.includes('data:image/')) {
    return { html, rawJson };
  }

  const matches = Array.from(html.matchAll(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+\/=\s]+/g));
  if (matches.length === 0) {
    return { html, rawJson };
  }

  const uniqueUris = Array.from(new Set(matches.map((m) => m[0])));
  let newHtml = html;
  let newRaw = rawJson || '';

  await Promise.all(
    uniqueUris.map(async (uri) => {
      try {
        const cleanUri = uri.replace(/\s+/g, '');
        const uploadedUrl = await uploadBase64ImageToServer(cleanUri);
        newHtml = newHtml.replaceAll(uri, uploadedUrl);
        if (newRaw) {
          newRaw = newRaw.replaceAll(uri, uploadedUrl);
        }
      } catch (err) {
        console.error('Failed to auto-upload inline base64 image:', err);
      }
    })
  );

  return { html: newHtml, rawJson: newRaw };
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

  // Image insertion states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<'library' | 'upload' | 'url'>('library');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // Preserve exact cursor position in editor
  const [savedSelection, setSavedSelection] = useState<{ from: number; to: number } | null>(null);
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null);

  // Multi-upload state
  const [uploadedFilesList, setUploadedFilesList] = useState<Array<{ src: string; name: string; alt: string }>>([]);

  // Uploading state for device files & paste/drop
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const uploadAndInsertFilesRef = useRef<((files: File[]) => Promise<void>) | null>(null);

  // Media library in-modal browser
  const [libPath, setLibPath] = useState('');
  const [libFolders, setLibFolders] = useState<Array<{ name: string; path: string }>>([]);
  const [libImages, setLibImages] = useState<Array<{ name: string; url: string; size: number }>>([]);
  const [libLoading, setLibLoading] = useState(false);
  const [libSearch, setLibSearch] = useState('');
  const [selectedLibImages, setSelectedLibImages] = useState<string[]>([]);

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
          class: 'rounded-2xl max-w-full my-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:ring-2 hover:ring-red-500/30',
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
        class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[440px] p-5 text-slate-800 dark:text-slate-100',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        const imageFiles: File[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) imageFiles.push(file);
          }
        }

        if (imageFiles.length > 0) {
          event.preventDefault();
          uploadAndInsertFilesRef.current?.(imageFiles);
          return true;
        }

        return false;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        const imageFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
          if (files[i].type.startsWith('image/')) {
            imageFiles.push(files[i]);
          }
        }

        if (imageFiles.length > 0) {
          event.preventDefault();
          uploadAndInsertFilesRef.current?.(imageFiles);
          return true;
        }

        return false;
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const sel = { from: editor.state.selection.from, to: editor.state.selection.to };
      setSavedSelection(sel);
      savedSelectionRef.current = sel;
    },
    onUpdate: ({ editor }) => {
      onChangeRaw(JSON.stringify(editor.getJSON()));
      onChangeHtml(editor.getHTML());
    },
  });

  // Load Media Library images when browser tab opens or path changes
  const loadMediaLibrary = async (path: string = '') => {
    setLibLoading(true);
    try {
      const res = await fetch(`/ourcms/media-library/browse?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        setLibFolders(data.folders || []);
        setLibImages(data.images || []);
        setLibPath(data.current_path || '');
      }
    } catch (err) {
      console.error('Failed to load media library:', err);
    } finally {
      setLibLoading(false);
    }
  };

  useEffect(() => {
    if (imageModalOpen && activeImageTab === 'library') {
      loadMediaLibrary(libPath);
    }
  }, [imageModalOpen, activeImageTab]);

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenImageModal = () => {
    // Preserve current editor cursor position
    if (editor) {
      const sel = { from: editor.state.selection.from, to: editor.state.selection.to };
      setSavedSelection(sel);
      savedSelectionRef.current = sel;
    }
    setImageUrl('');
    setImageAlt('');
    setImagePreviewError(false);
    setUploadedFilesList([]);
    setSelectedLibImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setImageModalOpen(true);
  };

  // Multiple File Selection & Direct Fast Server Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imgFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!imgFiles.length) {
      alert('Please select valid image files (PNG, JPG, WebP, GIF, SVG).');
      return;
    }

    setIsUploadingFiles(true);
    setUploadStatusMsg(`Optimizing & uploading ${imgFiles.length} photo(s)...`);

    try {
      const newFiles: Array<{ src: string; name: string; alt: string }> = [];

      for (let i = 0; i < imgFiles.length; i++) {
        const file = imgFiles[i];
        setUploadStatusMsg(`Uploading ${i + 1}/${imgFiles.length}: ${file.name}...`);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const compressed = await compressImageFile(file);
        const url = await uploadImageToServer(compressed, file.name);
        newFiles.push({
          src: url,
          name: file.name,
          alt: cleanName,
        });
      }

      setUploadedFilesList((prev) => [...prev, ...newFiles]);
      if (newFiles.length === 1 && !imageUrl) {
        setImageUrl(newFiles[0].src);
        setImageAlt(newFiles[0].alt);
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message || 'Failed to process images'}`);
    } finally {
      setIsUploadingFiles(false);
      setUploadStatusMsg('');
    }
  };

  const sanitizeImageUrl = (raw?: string) => {
    if (!raw) return '';
    let u = raw.trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u) && !u.startsWith('/') && !u.startsWith('data:')) {
      u = '/' + u;
    }
    return u;
  };

  // Insert a single or multiple images into the EXACT target section
  const executeInsertImages = (imagesToInsert: Array<{ src: string; alt?: string }>) => {
    if (!editor || !imagesToInsert.length) return;

    try {
      const { state, view } = editor;
      const { schema } = state;
      const tr = state.tr;

      const sel = savedSelectionRef.current || savedSelection || { 
        from: state.selection.from, 
        to: state.selection.to 
      };

      let from = Math.min(Math.max(0, sel.from), tr.doc.content.size);
      let to = Math.min(Math.max(0, sel.to), tr.doc.content.size);

      // If text was selected, delete it first
      if (from !== to) {
        tr.delete(from, to);
        from = Math.min(from, tr.doc.content.size);
      }

      // Filter and build valid image nodes
      const imageType = schema.nodes.image;
      if (!imageType) {
        console.error('Image node type not found in schema');
        return;
      }

      const validImages = imagesToInsert
        .map(img => ({
          src: sanitizeImageUrl(img.src),
          alt: img.alt?.trim() || undefined,
        }))
        .filter(img => Boolean(img.src));

      if (!validImages.length) return;

      const imageNodes = validImages.map(img => 
        imageType.create({
          src: img.src,
          alt: img.alt || null,
        })
      );

      const $pos = tr.doc.resolve(from);

      // Determine where to insert based on document structure:
      // If cursor was placed on an existing image or in doc root:
      if ($pos.parent.type.name === 'doc') {
        const insertPos = ($pos.nodeAfter && $pos.nodeAfter.type.name === 'image')
          ? from + $pos.nodeAfter.nodeSize
          : from;
        tr.insert(Math.min(insertPos, tr.doc.content.size), imageNodes);
      } else if ($pos.parent.isTextblock) {
        // Inside a paragraph, heading, or other textblock
        if ($pos.parent.content.size === 0) {
          // Empty paragraph: replace it completely with the image(s)
          tr.replaceWith($pos.before(), $pos.after(), imageNodes);
        } else if ($pos.parentOffset === 0) {
          // At the start of the paragraph: insert immediately before it
          tr.insert($pos.before(), imageNodes);
        } else {
          // Inside or at the end of the paragraph:
          // Insert cleanly immediately after this paragraph
          tr.insert($pos.after(), imageNodes);
        }
      } else {
        // Enclosed in another container
        const depth = Math.min($pos.depth, 1);
        const insertPos = depth > 0 ? $pos.after(depth) : from;
        tr.insert(Math.min(insertPos, tr.doc.content.size), imageNodes);
      }

      // If the document now ends with an image, automatically append an empty paragraph
      // so the author can easily click underneath to continue writing
      const lastChild = tr.doc.lastChild;
      if (lastChild && lastChild.type.name === 'image') {
        const paragraphType = schema.nodes.paragraph;
        if (paragraphType) {
          tr.insert(tr.doc.content.size, paragraphType.create());
        }
      }

      view.dispatch(tr);
      view.focus();

      // Clear saved selection so subsequent actions start fresh
      savedSelectionRef.current = null;
      setSavedSelection(null);
    } catch (err) {
      console.error('Error inserting images into section:', err);
      // Fallback: try standard setImage
      try {
        imagesToInsert.forEach(img => {
          const s = sanitizeImageUrl(img.src);
          if (s) {
            editor.chain().focus().setImage({ src: s, alt: img.alt?.trim() }).run();
          }
        });
      } catch (fallbackErr) {
        console.error('Fallback image insertion error:', fallbackErr);
      }
    }

    setImageModalOpen(false);
  };

  const uploadAndInsertFiles = async (files: File[]) => {
    if (!editor || !files.length) return;
    setIsUploadingFiles(true);
    setUploadStatusMsg(`Uploading & optimizing ${files.length > 1 ? `${files.length} images` : 'image'}...`);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatusMsg(`Optimizing & uploading ${i + 1}/${files.length}: ${file.name}...`);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const compressed = await compressImageFile(file);
        const url = await uploadImageToServer(compressed, file.name);
        executeInsertImages([{ src: url, alt: cleanName }]);
      }
    } catch (err: any) {
      alert(`Image upload error: ${err.message || 'Failed to upload image'}`);
    } finally {
      setIsUploadingFiles(false);
      setUploadStatusMsg('');
    }
  };
  uploadAndInsertFilesRef.current = uploadAndInsertFiles;

  const handleInsertSingleImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    executeInsertImages([{ src: imageUrl.trim(), alt: imageAlt.trim() }]);
  };

  const handleInsertUploadedList = () => {
    if (!uploadedFilesList.length) return;
    executeInsertImages(uploadedFilesList.map(f => ({ src: f.src, alt: f.alt })));
  };

  const handleInsertSelectedLibImages = () => {
    if (!selectedLibImages.length) return;
    const toInsert = selectedLibImages.map(url => {
      const filename = url.split('/').pop() || '';
      const cleanName = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      return { src: url, alt: cleanName };
    });
    executeInsertImages(toInsert);
  };

  const toggleLibImageSelection = (url: string) => {
    setSelectedLibImages(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const filteredLibImages = libImages.filter(img => 
    img.name.toLowerCase().includes(libSearch.toLowerCase())
  );

  return (
    <div className="relative border border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 shadow-sm focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all">
      <MenuBar 
        editor={editor} 
        onOpenLinkModal={handleOpenLinkModal} 
        onOpenImageModal={handleOpenImageModal} 
      />

      {/* Editor Content Area */}
      <div className="relative">
        {isUploadingFiles && (
          <div className="absolute top-2 right-2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs backdrop-blur-md shadow-md border border-slate-700 animate-pulse">
            <RefreshCw size={13} className="animate-spin text-red-400" />
            <span>{uploadStatusMsg || 'Optimizing & uploading photo...'}</span>
          </div>
        )}
        <EditorContent editor={editor} className="bg-white dark:bg-slate-900 rounded-b-2xl" />

        {/* Floating Quick Action: Insert image directly at active cursor section */}
        <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Place cursor anywhere in text, then click:</span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleOpenImageModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 font-semibold transition-colors cursor-pointer"
            >
              <Plus size={13} /> Add Image into this Section
            </button>
          </div>
          <span className="hidden sm:inline text-[11px] text-slate-400">
            Supports Media Library picking, URL pasting & multi-file upload
          </span>
        </div>
      </div>

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

      {/* Comprehensive Image Insertion Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 text-slate-900 dark:text-white max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base font-display">Insert Image into Article</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Inserts cleanly into the section where your cursor was placed
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setImageModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setActiveImageTab('library')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeImageTab === 'library'
                    ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Folder size={14} /> Browse Media Library
              </button>

              <button
                type="button"
                onClick={() => setActiveImageTab('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeImageTab === 'upload'
                    ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Upload size={14} /> Upload Device File(s)
              </button>

              <button
                type="button"
                onClick={() => setActiveImageTab('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeImageTab === 'url'
                    ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <ExternalLink size={14} /> Paste URL
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="mt-4 flex-1 overflow-y-auto pr-1">

              {/* TAB 1: MEDIA LIBRARY BROWSER */}
              {activeImageTab === 'library' && (
                <div className="space-y-3">
                  {/* Path / Breadcrumbs and Search */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1 text-xs font-mono bg-slate-50 dark:bg-slate-800 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400">/blog</span>
                      {libPath ? (
                        <>
                          <span className="text-slate-400">/{libPath}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const parent = libPath.includes('/') ? libPath.split('/').slice(0, -1).join('/') : '';
                              loadMediaLibrary(parent);
                            }}
                            className="ml-2 text-[11px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 font-sans font-semibold cursor-pointer"
                          >
                            <ArrowLeft size={11} /> Up
                          </button>
                        </>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={libSearch}
                          onChange={(e) => setLibSearch(e.target.value)}
                          placeholder="Filter images..."
                          className="pl-7 pr-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500 w-36 sm:w-48"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => loadMediaLibrary(libPath)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Refresh Media"
                      >
                        <RefreshCw size={13} className={libLoading ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>

                  {/* Subfolders list */}
                  {libFolders.length > 0 && !libSearch && (
                    <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                      {libFolders.map((f) => (
                        <button
                          key={f.path}
                          type="button"
                          onClick={() => loadMediaLibrary(f.path)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          <Folder size={12} className="text-amber-500" />
                          <span>{f.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Images Grid */}
                  {libLoading ? (
                    <div className="py-16 text-center text-xs text-slate-400">
                      <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-red-500" />
                      Loading media assets...
                    </div>
                  ) : filteredLibImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {filteredLibImages.map((img) => {
                        const isSelected = selectedLibImages.includes(img.url);
                        return (
                          <div
                            key={img.url}
                            onClick={() => toggleLibImageSelection(img.url)}
                            className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all ${
                              isSelected
                                ? 'border-red-500 ring-2 ring-red-500/30 bg-red-50/20'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-slate-300'
                            }`}
                          >
                            <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                              <img
                                src={img.url}
                                alt={img.name}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="p-1.5 flex items-center justify-between gap-1">
                              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate" title={img.name}>
                                {img.name}
                              </span>
                              <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 ${
                                isSelected ? 'bg-red-600 text-white' : 'border border-slate-300 dark:border-slate-600 text-transparent'
                              }`}>
                                ✓
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      No images found in this folder. Click "Upload Device File(s)" or choose a subfolder above.
                    </div>
                  )}

                  {/* Actions for Media Library */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      {selectedLibImages.length} image(s) selected
                    </span>
                    <button
                      type="button"
                      disabled={selectedLibImages.length === 0}
                      onClick={handleInsertSelectedLibImages}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <Check size={14} /> Insert {selectedLibImages.length > 1 ? `${selectedLibImages.length} Images` : 'Image'} into Section
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: MULTI-FILE UPLOAD FROM DEVICE */}
              {activeImageTab === 'upload' && (
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingFiles}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 bg-slate-50/80 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all text-xs font-semibold group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isUploadingFiles ? (
                      <>
                        <RefreshCw size={24} className="animate-spin text-red-500" />
                        <span className="text-red-600 dark:text-red-400 font-semibold">{uploadStatusMsg}</span>
                        <span className="text-[11px] font-normal text-slate-400">
                          Compressing & uploading to server WebP storage...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="group-hover:scale-110 transition-transform text-red-500" />
                        <span>Choose Image(s) from your computer or phone</span>
                        <span className="text-[11px] font-normal text-slate-400">
                          Files are automatically compressed & uploaded to fast WebP storage
                        </span>
                      </>
                    )}
                  </button>

                  {/* Uploaded items queue */}
                  {uploadedFilesList.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Selected Files ({uploadedFilesList.length}):
                      </div>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {uploadedFilesList.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <img src={item.src} alt={item.name} className="w-12 h-10 object-cover rounded-lg shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</div>
                              <input
                                type="text"
                                value={item.alt}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setUploadedFilesList(prev => prev.map((f, i) => i === idx ? { ...f, alt: val } : f));
                                }}
                                placeholder="Alt description..."
                                className="w-full mt-1 px-2 py-0.5 text-[11px] rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setUploadedFilesList(prev => prev.filter((_, i) => i !== idx))}
                              className="p-1 text-slate-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      disabled={isUploadingFiles || uploadedFilesList.length === 0}
                      onClick={handleInsertUploadedList}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <Check size={14} /> {isUploadingFiles ? 'Uploading...' : `Insert ${uploadedFilesList.length > 1 ? `${uploadedFilesList.length} Images` : 'Image'} into Section`}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: DIRECT IMAGE URL */}
              {activeImageTab === 'url' && (
                <form onSubmit={handleInsertSingleImage} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Image Web URL or Blog Path <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreviewError(false);
                      }}
                      placeholder="https://images.unsplash.com/... or /blog/ai-tools/photo.webp"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white placeholder:text-slate-400 font-mono"
                      autoFocus
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
                      placeholder="Describe what is in this image..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>

                  {/* Live Preview */}
                  {imageUrl.trim() && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 px-1">
                        Live Preview:
                      </div>
                      {!imagePreviewError ? (
                        <img 
                          src={imageUrl} 
                          alt={imageAlt || 'Preview'} 
                          className="max-h-44 w-full object-contain rounded-lg bg-slate-100 dark:bg-slate-900"
                          onError={() => setImagePreviewError(true)}
                        />
                      ) : (
                        <div className="p-3 text-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                          Unable to preview image. Please verify URL format.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="submit"
                      disabled={!imageUrl.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <Check size={14} /> Insert Image into Section
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
