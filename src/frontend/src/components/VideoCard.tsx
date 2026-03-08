import { Eye, Heart, MessageCircle, Play, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PersistentVideoPost } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useHasLiked,
  useIncrementView,
  useLikeVideo,
} from "../hooks/useQueries";
import CommentPanel from "./CommentPanel";

interface Props {
  video: PersistentVideoPost;
  index: number;
  isActive: boolean;
}

export default function VideoCard({ video, index, isActive }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);

  const { identity } = useInternetIdentity();
  const { data: hasLiked = false } = useHasLiked(video.id);
  const likeMutation = useLikeVideo();
  const incrementView = useIncrementView();

  // Get video URL from ExternalBlob
  const videoUrl = video.videoAssetId.getDirectURL();

  // Autoplay when active
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      el.play().catch(() => {});
      setIsPlaying(true);
      if (!viewCounted) {
        incrementView.mutate(video.id);
        setViewCounted(true);
      }
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }, [isActive, video.id, viewCounted, incrementView]);

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleLike = useCallback(() => {
    if (!identity) {
      toast.error("Please log in to like videos");
      return;
    }
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 300);
    likeMutation.mutate({ videoId: video.id, liked: hasLiked });
  }, [identity, hasLiked, video.id, likeMutation]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}?video=${video.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Link copied!", { duration: 2000 });
      })
      .catch(() => {
        toast.error("Could not copy link");
      });
  }, [video.id]);

  const likeCount = Number(video.likes);
  const viewCount = Number(video.views);

  const ocidSuffix = index + 1;

  return (
    <div
      className="relative w-full h-dvh snap-start-always flex-shrink-0 overflow-hidden bg-[oklch(0.05_0_0)]"
      data-ocid={`feed.video.item.${ocidSuffix}`}
    >
      {/* Video element - using role and keyboard handler for accessibility */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: video tap-to-pause is a standard media interaction */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        loop
        muted
        playsInline
        onClick={togglePlay}
        preload="metadata"
        aria-label={`Video: ${video.title}`}
      />

      {/* Tap to play/pause indicator */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <Play size={28} className="text-white ml-1" fill="white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom overlay */}
      <div className="absolute inset-0 video-gradient-overlay pointer-events-none" />

      {/* Right action buttons */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
        {/* Like */}
        <button
          type="button"
          data-ocid="feed.like.button"
          onClick={handleLike}
          className="flex flex-col items-center gap-1 group"
        >
          <motion.div
            animate={heartBurst ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              size={28}
              strokeWidth={2}
              className={`transition-colors duration-150 drop-shadow-lg ${
                hasLiked
                  ? "fill-reel-pink text-reel-pink"
                  : "text-white group-hover:text-reel-pink"
              }`}
            />
          </motion.div>
          <span className="text-white text-xs font-semibold drop-shadow">
            {likeCount >= 1000
              ? `${(likeCount / 1000).toFixed(1)}K`
              : likeCount}
          </span>
        </button>

        {/* Comment */}
        <button
          type="button"
          data-ocid="feed.comment.button"
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1 group"
        >
          <MessageCircle
            size={28}
            strokeWidth={2}
            className="text-white drop-shadow-lg group-hover:text-reel-cyan transition-colors duration-150"
          />
          <span className="text-white text-xs font-semibold drop-shadow">
            Comments
          </span>
        </button>

        {/* Share */}
        <button
          type="button"
          data-ocid="feed.share.button"
          onClick={handleShare}
          className="flex flex-col items-center gap-1 group"
        >
          <Share2
            size={26}
            strokeWidth={2}
            className="text-white drop-shadow-lg group-hover:text-reel-cyan transition-colors duration-150"
          />
          <span className="text-white text-xs font-semibold drop-shadow">
            Share
          </span>
        </button>

        {/* View count */}
        <div className="flex flex-col items-center gap-1">
          <Eye size={24} className="text-white/70" />
          <span className="text-white/70 text-xs font-semibold">
            {viewCount >= 1000
              ? `${(viewCount / 1000).toFixed(1)}K`
              : viewCount}
          </span>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-0 right-16 px-4 z-10">
        <p className="text-white font-display font-semibold text-base leading-tight line-clamp-2 mb-1 drop-shadow-md">
          {video.title}
        </p>
        <p className="text-white/60 text-xs font-mono truncate mb-1">
          @{video.uploader.toString().slice(0, 12)}...
        </p>
        <p className="text-white/80 text-sm line-clamp-2 drop-shadow">
          {video.description}
        </p>
      </div>

      {/* Comments panel */}
      <AnimatePresence>
        {showComments && (
          <CommentPanel
            videoId={video.id}
            onClose={() => setShowComments(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
