import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, RefreshCw, CheckCircle2, Sparkles, Link as LinkIcon, FolderOpen } from 'lucide-react';

interface PresetItem {
  title?: string;
  name?: string;
  url: string;
}

interface ImageUploadFieldProps {
  label: string;
  value: string | undefined;
  onChange: (dataUrlOrUrl: string) => void;
  placeholder?: string;
  helperText?: string;
  presets?: PresetItem[];
  aspectRatio?: 'video' | 'square' | 'banner' | 'avatar' | 'auto';
  className?: string;
  allowManualUrl?: boolean;
}

/**
 * Optimizes and resizes an uploaded image file into a fast, compressed base64 data URL.
 */
export const optimizeImageFile = (
  file: File,
  maxWidth = 1600,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If SVG, read as direct data URL
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const image = new window.Image();
      image.onload = () => {
        let { width, height } = image;

        // Calculate aspect-ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(image, 0, 0, width, height);

        // Export as webp or jpeg
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputType, quality);
        resolve(dataUrl);
      };
      image.onerror = () => {
        // Fallback to raw data url
        resolve(readerEvent.target?.result as string);
      };
      image.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'No photo selected',
  helperText,
  presets,
  aspectRatio = 'auto',
  className = '',
  allowManualUrl = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const isBase64 = value?.startsWith('data:image/');

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please choose a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    try {
      setIsProcessing(true);
      const optimizedDataUrl = await optimizeImageFile(file);
      onChange(optimizedDataUrl);
    } catch (err) {
      console.error('Error optimizing image:', err);
      // Fallback
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'avatar':
        return 'h-24 w-24 rounded-full';
      case 'video':
        return 'h-40 w-full rounded-2xl';
      case 'banner':
        return 'h-32 w-full rounded-xl';
      case 'square':
        return 'h-36 w-36 rounded-2xl';
      default:
        return 'h-36 w-full rounded-2xl';
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Label and Actions */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>{label}</span>
        </label>
        
        <div className="flex items-center gap-2">
          {allowManualUrl && (
            <button
              type="button"
              onClick={() => {
                setShowUrlInput(!showUrlInput);
                setUrlDraft(value || '');
              }}
              className="text-[11px] text-neutral-400 hover:text-amber-400 font-medium flex items-center gap-1 transition"
            >
              <LinkIcon className="w-3 h-3" />
              <span>{showUrlInput ? 'Hide URL' : 'Use Web URL'}</span>
            </button>
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[11px] text-red-400 hover:text-red-300 font-medium flex items-center gap-1 transition"
              title="Remove photo"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      {helperText && <p className="text-[11px] text-neutral-400 leading-tight">{helperText}</p>}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, image/gif"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Primary Local Upload / Preview Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative overflow-hidden border-2 transition-all rounded-2xl ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
            : value
            ? 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
            : 'border-dashed border-neutral-800 hover:border-amber-500/60 bg-neutral-950/60'
        }`}
      >
        {value ? (
          /* Preview Mode with Action Overlays */
          <div className="relative group p-3">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Image Preview Container */}
              <div
                className={`relative overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0 ${getAspectClass()}`}
              >
                <img
                  src={value}
                  alt={label}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Image Info & Upload New Button */}
              <div className="flex-1 w-full space-y-2 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {isBase64 ? 'Local Upload Active' : 'Image Active'}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 truncate max-w-md font-mono">
                  {isBase64 ? 'Local Photo File (Stored securely in Gym CMS)' : value}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-neutral-700 shadow-sm"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Different Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-red-950/60 text-neutral-400 hover:text-red-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-neutral-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Upload Prompt Mode */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 text-center cursor-pointer hover:bg-neutral-900/40 transition flex flex-col items-center justify-center gap-2.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              {isProcessing ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="text-xs sm:text-sm font-black uppercase text-white flex items-center justify-center gap-1.5">
                <span>Click to Upload Local Photo</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                or drag and drop your image file here (PNG, JPG, WEBP, SVG)
              </p>
            </div>

            <button
              type="button"
              className="mt-1 px-4 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Browse Computer / Phone</span>
            </button>
          </div>
        )}
      </div>

      {/* Manual URL Input Accordion (Optional / Fallback) */}
      {showUrlInput && (
        <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2 animate-in fade-in duration-150">
          <label className="block text-[10px] font-bold uppercase text-neutral-400">
            Paste Direct Image URL:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://images.unsplash.com/... or https://..."
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => {
                if (urlDraft.trim()) {
                  onChange(urlDraft.trim());
                  setShowUrlInput(false);
                }
              }}
              className="px-3 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-lg hover:bg-amber-400 transition"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Presets Grid (if provided) */}
      {presets && presets.length > 0 && (
        <div className="pt-2 space-y-1.5">
          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-neutral-400">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Or select from curated gym backdrops:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((preset, idx) => {
              const title = preset.title || preset.name || `Preset ${idx + 1}`;
              const isSelected = value === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(preset.url)}
                  className={`group relative h-14 rounded-xl overflow-hidden border text-left transition ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/50'
                      : 'border-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/30 transition flex items-end p-1.5">
                    <span className="text-[10px] font-extrabold text-white leading-tight truncate">
                      {title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
