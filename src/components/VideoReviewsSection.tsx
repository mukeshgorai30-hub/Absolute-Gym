import React, { useState, useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { VideoReview } from '../types';
import { themeStyles } from '../utils/theme';
import {
  Play,
  X,
  ExternalLink,
} from 'lucide-react';

// Helper to convert any YouTube URL into an embeddable URL
function getEmbedUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct' | 'other'; src: string } {
  if (!url) {
    return { type: 'other', src: '' };
  }

  // YouTube matchers
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // Vimeo matchers
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  // Direct video file (local upload, base64 data URL, blob, or mp4/webm/ogg/mov/m4v)
  if (
    url.startsWith('data:video/') ||
    url.startsWith('blob:') ||
    url.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i)
  ) {
    return {
      type: 'direct',
      src: url,
    };
  }

  return { type: 'other', src: url };
}

export const VideoReviewsSection: React.FC = () => {
  const { config, themeColor, setIsTrialModalOpen } = useGym();
  const theme = themeStyles[themeColor];

  const [activeTag, setActiveTag] = useState<string>('All');
  const [selectedVideo, setSelectedVideo] = useState<VideoReview | null>(null);

  const videoReviews: VideoReview[] = useMemo(() => {
    return config.videoReviews && config.videoReviews.length > 0
      ? config.videoReviews
      : [];
  }, [config.videoReviews]);

  // Extract unique tags
  const tags = useMemo(() => {
    const set = new Set<string>();
    videoReviews.forEach((v) => {
      if (v.tag) set.add(v.tag);
    });
    return ['All', ...Array.from(set)];
  }, [videoReviews]);

  // Filtered video list
  const filteredVideos = useMemo(() => {
    if (activeTag === 'All') return videoReviews;
    return videoReviews.filter((v) => v.tag === activeTag);
  }, [videoReviews, activeTag]);

  if (videoReviews.length === 0) {
    return null;
  }

  return (
    <section
      id="video-reviews"
      className="w-full max-w-full py-16 sm:py-24 bg-neutral-950 text-white relative border-b border-neutral-800/80 overflow-hidden"
    >
      {/* Background glow & atmospheric texture */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      {config.videoReviewsBgImage && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={config.videoReviewsBgImage}
            alt="Video Reviews Background"
            className="w-full h-full object-cover opacity-10 filter blur-xs scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/90 to-neutral-950" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Reviews from
            <span className="block mt-1 bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Our Members!
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl">
            Real stories, authentic transformations, and unfiltered feedback from people training at {config.name}.
          </p>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex md:hidden items-center justify-between text-xs text-neutral-400 mb-3 px-1">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[11px] tracking-wider">
            <span>← Swipe video stories →</span>
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">
            {filteredVideos.length} videos
          </span>
        </div>

        {/* Video Cards Grid / Mobile Horizontal Swipe - Vertical Portrait Cards matching screenshot */}
        <div className="w-full max-w-full overflow-hidden">
          <div className="flex md:grid md:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 overflow-x-auto md:overflow-visible scroll-smooth snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 md:scroll-px-0 pb-6 md:pb-0 px-4 sm:px-6 md:px-0 scrollbar-none touch-auto justify-start md:justify-center">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                id={`video-review-card-${video.id}`}
                onClick={() => setSelectedVideo(video)}
                className="group flex flex-col items-center cursor-pointer select-none w-[68vw] sm:w-[240px] max-w-[260px] shrink-0 snap-center md:snap-align-none md:w-auto md:max-w-none md:shrink"
              >
                {/* Vertical Portrait Video Frame with Rounded Corners & Centered Translucent Play Icon */}
                <div className="relative aspect-[9/15] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800/80 shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:border-neutral-700 group-hover:shadow-purple-500/10">
                  <img
                    src={video.thumbnail}
                    alt={video.member}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Centered Translucent Glass Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-active:scale-95">
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white translate-x-0.5" />
                    </div>
                  </div>
                </div>

                {/* Name & Role Centered Below the Card */}
                <div className="text-center mt-3.5 sm:mt-4">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                    {video.member}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 font-medium">
                    {video.membership || 'Member'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Video Player Modal */}
      {selectedVideo && (
        <div
          id="video-player-modal"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-neutral-900 rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {selectedVideo.avatar && (
                  <img
                    src={selectedVideo.avatar}
                    alt={selectedVideo.member}
                    className="w-9 h-9 rounded-full object-cover border border-neutral-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                    {selectedVideo.member}
                  </h4>
                  {selectedVideo.membership && (
                    <p className="text-xs text-neutral-400">
                      {selectedVideo.membership}
                    </p>
                  )}
                </div>
              </div>
              <button
                id="close-video-modal-btn"
                onClick={() => setSelectedVideo(null)}
                className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition shrink-0"
                title="Close video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video w-full bg-black">
              {(() => {
                const embed = getEmbedUrl(selectedVideo.videoUrl);

                if (embed.type === 'youtube' || embed.type === 'vimeo') {
                  return (
                    <iframe
                      src={embed.src}
                      title={selectedVideo.title || selectedVideo.member}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                }

                if (embed.type === 'direct') {
                  return (
                    <video
                      src={embed.src}
                      poster={selectedVideo.thumbnail}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  );
                }

                // Fallback for custom or direct links
                return (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <img
                      src={selectedVideo.thumbnail}
                      alt={selectedVideo.title || selectedVideo.member}
                      className="w-full h-full object-cover opacity-60"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center">
                      <Play className="w-12 h-12 text-amber-400 mb-3" />
                      <p className="text-sm font-bold text-white mb-2">
                        Watch on external video platform
                      </p>
                      <a
                        href={selectedVideo.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`py-2 px-5 rounded-xl ${theme.accentBg} text-black font-bold text-xs uppercase flex items-center gap-2`}
                      >
                        <span>Open Video</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
