import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Video as VideoIcon,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Play,
  Pause,
  Link as LinkIcon,
  FolderOpen,
  Sparkles,
  Camera,
  Film,
  AlertCircle,
  FileVideo,
} from 'lucide-react';

interface PresetVideo {
  title: string;
  url: string;
  thumbnail?: string;
  duration?: string;
}

interface VideoUploadFieldProps {
  label: string;
  value: string | undefined;
  onChange: (videoUrl: string) => void;
  onThumbnailGenerated?: (thumbnailDataUrl: string) => void;
  onDurationDetected?: (durationStr: string) => void;
  placeholder?: string;
  helperText?: string;
  className?: string;
}

const PRESET_GYM_VIDEOS: PresetVideo[] = [
  {
    title: 'Workout Transformation (YouTube)',
    url: 'https://www.youtube.com/watch?v=eaRQF-7hhmo',
    duration: '1:45',
  },
  {
    title: 'Gym Tour & Experience (YouTube)',
    url: 'https://www.youtube.com/watch?v=Z1BCujX3pw8',
    duration: '2:10',
  },
  {
    title: 'Strength & Deadlift PR (YouTube)',
    url: 'https://www.youtube.com/watch?v=kIXj8_G4bBw',
    duration: '1:20',
  },
];

/**
 * Extracts a thumbnail snapshot from a video file or video element at the 1.0s mark
 */
export const captureVideoFrame = (videoElement: HTMLVideoElement): string | null => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch (err) {
    console.error('Failed to capture frame from video:', err);
    return null;
  }
};

/**
 * Formats duration in seconds to "M:SS"
 */
export const formatVideoDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const VideoUploadField: React.FC<VideoUploadFieldProps> = ({
  label,
  value,
  onChange,
  onThumbnailGenerated,
  onDurationDetected,
  helperText,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const [activeMode, setActiveMode] = useState<'upload' | 'url'>(
    value?.startsWith('http') && !value.includes('blob:') ? 'url' : 'upload'
  );
  const [urlDraft, setUrlDraft] = useState(value || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');

  const isLocalDataOrBlob = value?.startsWith('data:video/') || value?.startsWith('blob:');
  const isDirectMp4 = value?.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i) !== null;
  const isYouTube = value?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  const isVimeo = value?.match(/vimeo\.com\/(\d+)/);

  useEffect(() => {
    setUrlDraft(value || '');
  }, [value]);

  const handleLocalVideoFile = (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|ogg|mov|m4v)$/i)) {
      alert('Please upload a valid video file (.mp4, .webm, .mov, .m4v, or .ogg)');
      return;
    }

    setFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSizeStr(`${sizeInMb} MB`);

    setIsProcessing(true);
    setUploadProgressText('Processing local video...');

    // If file is very large (> 50MB), advise and use FileReader
    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadProgressText(`Loading video: ${percent}%`);
      }
    };

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);

        // Auto-extract thumbnail and duration
        const tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata';
        tempVideo.muted = true;
        tempVideo.playsInline = true;
        tempVideo.src = dataUrl;

        tempVideo.onloadedmetadata = () => {
          if (tempVideo.duration && onDurationDetected) {
            onDurationDetected(formatVideoDuration(tempVideo.duration));
          }
          // Seek 1 second in to capture representative thumbnail
          tempVideo.currentTime = Math.min(1.0, tempVideo.duration / 2);
        };

        tempVideo.onseeked = () => {
          const snapshot = captureVideoFrame(tempVideo);
          if (snapshot && onThumbnailGenerated) {
            onThumbnailGenerated(snapshot);
          }
          setIsProcessing(false);
          setUploadProgressText('');
        };

        tempVideo.onerror = () => {
          setIsProcessing(false);
          setUploadProgressText('');
        };
      }
    };

    reader.onerror = () => {
      alert('Failed to read video file. Please try a different video format.');
      setIsProcessing(false);
      setUploadProgressText('');
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLocalVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleCaptureCoverFromCurrentVideo = () => {
    if (videoPreviewRef.current) {
      const snapshot = captureVideoFrame(videoPreviewRef.current);
      if (snapshot && onThumbnailGenerated) {
        onThumbnailGenerated(snapshot);
        alert('Thumbnail snapshot extracted from video frame!');
      }
    }
  };

  const toggleVideoPlay = () => {
    if (videoPreviewRef.current) {
      if (videoPreviewRef.current.paused) {
        videoPreviewRef.current.play();
        setIsPlaying(true);
      } else {
        videoPreviewRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <Film className="w-4 h-4 text-amber-400" />
          <span>{label}</span>
        </label>

        {/* Mode Selector Tabs (Upload Local vs Web URL) */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeMode === 'upload'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Local Video</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeMode === 'url'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>YouTube / Web URL</span>
          </button>
        </div>
      </div>

      {helperText && (
        <p className="text-[11px] text-neutral-400 leading-tight">{helperText}</p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v,video/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleLocalVideoFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* TAB 1: LOCAL VIDEO UPLOAD & PLAYER PREVIEW */}
      {activeMode === 'upload' && (
        <div className="space-y-3">
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
                : value && (isLocalDataOrBlob || isDirectMp4)
                ? 'border-neutral-800 bg-neutral-950'
                : 'border-dashed border-neutral-800 hover:border-amber-500/60 bg-neutral-950/70'
            }`}
          >
            {value && (isLocalDataOrBlob || isDirectMp4) ? (
              /* Active Local Video Player & Controls */
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  {/* Video Player Box */}
                  <div className="relative aspect-video w-full md:w-64 rounded-xl overflow-hidden bg-black border border-neutral-800 shrink-0 group">
                    <video
                      ref={videoPreviewRef}
                      src={value}
                      playsInline
                      className="w-full h-full object-contain"
                      onLoadedMetadata={(e) => {
                        const target = e.currentTarget;
                        if (target.duration && onDurationDetected) {
                          onDurationDetected(formatVideoDuration(target.duration));
                        }
                      }}
                      onEnded={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />

                    {/* Quick Play Overlay Toggle */}
                    <button
                      type="button"
                      onClick={toggleVideoPlay}
                      className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center transition opacity-90 group-hover:opacity-100"
                    >
                      <div className="w-11 h-11 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                        {isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current translate-x-0.5" />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Video Info and Actions */}
                  <div className="flex-1 space-y-2.5 text-left w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Local Video Active</span>
                      </span>

                      {fileSizeStr && (
                        <span className="px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-400 text-[10px] font-mono border border-neutral-800">
                          {fileSizeStr}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-white font-medium break-all flex items-center gap-1.5">
                      <FileVideo className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{fileName || 'Uploaded Member Video'}</span>
                    </p>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Video is ready for instant in-browser playback on both desktop and mobile devices.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-neutral-700 shadow-sm"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>Choose Different Video</span>
                      </button>

                      {onThumbnailGenerated && (
                        <button
                          type="button"
                          onClick={handleCaptureCoverFromCurrentVideo}
                          className="px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-amber-400/30"
                          title="Extract current video frame and use as video thumbnail cover"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Use Video Frame as Cover</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onChange('')}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-red-950/60 text-neutral-400 hover:text-red-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-neutral-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Upload Prompt Box */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 text-center cursor-pointer hover:bg-neutral-900/40 transition flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isProcessing ? (
                    <RefreshCw className="w-7 h-7 animate-spin" />
                  ) : (
                    <Upload className="w-7 h-7" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-black uppercase text-white flex items-center justify-center gap-1.5">
                    <span>Click to Select & Upload Local Video</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Supports MP4, MOV, WEBM, M4V format video files from your computer or smartphone
                  </p>
                </div>

                {uploadProgressText ? (
                  <div className="px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold animate-pulse">
                    {uploadProgressText}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 rounded-xl bg-amber-400 text-black font-black uppercase text-xs flex items-center gap-1.5 transition shadow-lg"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Browse Files</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WEB / YOUTUBE / VIMEO URL INPUT */}
      {activeMode === 'url' && (
        <div className="space-y-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase text-neutral-400 flex items-center gap-1.5">
                <LinkIcon className="w-3 h-3 text-amber-400" />
                <span>Paste YouTube, Vimeo, Shorts, or Direct MP4 URL:</span>
              </label>

              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear URL</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (urlDraft.trim()) {
                    onChange(urlDraft.trim());
                  }
                }}
                className="px-4 py-2.5 bg-amber-400 text-black font-black uppercase text-xs rounded-xl hover:bg-amber-300 transition shadow-md shrink-0"
              >
                Apply URL
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-neutral-500 pt-0.5">
              <span>Supports:</span>
              <span className="text-neutral-400 font-medium">YouTube</span>
              <span>•</span>
              <span className="text-neutral-400 font-medium">YouTube Shorts</span>
              <span>•</span>
              <span className="text-neutral-400 font-medium">Vimeo</span>
              <span>•</span>
              <span className="text-neutral-400 font-medium">Direct MP4/WebM Link</span>
            </div>
          </div>

          {/* Quick Presets for Demo / Testing */}
          <div className="pt-2 border-t border-neutral-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-neutral-400">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Or click to test with demo member video:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_GYM_VIDEOS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(preset.url);
                    setUrlDraft(preset.url);
                    if (preset.duration && onDurationDetected) {
                      onDurationDetected(preset.duration);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                    value === preset.url
                      ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <span className="font-bold line-clamp-1">{preset.title}</span>
                  <span className="text-[10px] text-neutral-500 font-mono mt-1">
                    {preset.duration}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
