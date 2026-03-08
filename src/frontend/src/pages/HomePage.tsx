import { Loader2, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import VideoCard from "../components/VideoCard";
import { useTrendingVideos } from "../hooks/useQueries";

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: videos = [], isLoading } = useTrendingVideos();

  // Track active video via IntersectionObserver
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-observe when video list changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll("[data-video-item]");
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number.parseInt(
              (entry.target as HTMLElement).dataset.videoIndex ?? "0",
              10,
            );
            setActiveIndex(idx);
          }
        }
      },
      { root: container, threshold: 0.6 },
    );

    for (const item of Array.from(items)) {
      observer.observe(item);
    }
    return () => observer.disconnect();
  }, [videos.length]);

  if (isLoading) {
    return (
      <div
        data-ocid="feed.loading_state"
        className="h-dvh flex flex-col items-center justify-center gap-3 bg-background"
      >
        <Loader2 size={32} className="animate-spin text-reel-pink" />
        <p className="text-muted-foreground text-sm">Loading videos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div
        data-ocid="feed.empty_state"
        className="h-dvh flex flex-col items-center justify-center gap-4 bg-background px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-2xl bg-[oklch(0.14_0_0)] border border-[oklch(0.22_0_0)] flex items-center justify-center">
            <Upload size={32} className="text-reel-pink" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground mb-1">
              No Videos Yet
            </h2>
            <p className="text-muted-foreground text-sm">
              Be the first to upload a video and start the trend!
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-dvh snap-y-mandatory scrollbar-hide"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {videos.map((video, index) => (
        <div
          key={video.id}
          data-video-item
          data-video-index={index}
          style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
          className="h-dvh flex-shrink-0"
        >
          <VideoCard
            video={video}
            index={index}
            isActive={activeIndex === index}
          />
        </div>
      ))}
    </div>
  );
}
