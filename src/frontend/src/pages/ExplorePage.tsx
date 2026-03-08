import { Input } from "@/components/ui/input";
import { Eye, Heart, Loader2, Play, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Tab } from "../App";
import type { PersistentVideoPost } from "../backend.d";
import { useAllVideos } from "../hooks/useQueries";

interface Props {
  onNavigate: (tab: Tab) => void;
}

function VideoThumbnail({
  video,
  index,
}: { video: PersistentVideoPost; index: number }) {
  const videoUrl = video.videoAssetId.getDirectURL();
  const likeCount = Number(video.likes);
  const viewCount = Number(video.views);

  return (
    <motion.div
      data-ocid={index === 0 ? "explore.video.item.1" : undefined}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="relative aspect-[9/16] rounded-lg overflow-hidden bg-[oklch(0.11_0_0)] cursor-pointer group"
    >
      {/* Video thumbnail */}
      <video
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        preload="metadata"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />

      {/* Play icon on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Play size={18} className="text-white ml-0.5" fill="white" />
        </div>
      </div>

      {/* Bottom info overlay */}
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white text-xs font-semibold line-clamp-1 leading-tight">
          {video.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-0.5 text-white/70 text-[10px]">
            <Heart size={9} fill="currentColor" />
            {likeCount >= 1000
              ? `${(likeCount / 1000).toFixed(1)}K`
              : likeCount}
          </span>
          <span className="flex items-center gap-0.5 text-white/70 text-[10px]">
            <Eye size={9} />
            {viewCount >= 1000
              ? `${(viewCount / 1000).toFixed(1)}K`
              : viewCount}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ExplorePage({ onNavigate }: Props) {
  const [query, setQuery] = useState("");
  const { data: videos = [], isLoading } = useAllVideos();

  const filtered = useMemo(() => {
    if (!query.trim()) return videos;
    const q = query.toLowerCase();
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q),
    );
  }, [videos, query]);

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 border-b border-[oklch(0.18_0_0)]">
        <h1 className="font-display font-bold text-xl text-foreground mb-3">
          Explore
        </h1>
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            data-ocid="explore.search_input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos..."
            className="pl-9 bg-[oklch(0.14_0_0)] border-[oklch(0.22_0_0)] text-sm h-9 placeholder:text-muted-foreground/50"
          />
        </div>
      </header>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3">
        {isLoading ? (
          <div
            data-ocid="explore.loading_state"
            className="flex items-center justify-center py-20"
          >
            <Loader2 size={28} className="animate-spin text-reel-pink" />
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="explore.empty_state"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[oklch(0.14_0_0)] border border-[oklch(0.22_0_0)] flex items-center justify-center mb-3">
              <Search size={24} className="text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold mb-1">
              {query ? "No results found" : "No videos yet"}
            </p>
            <p className="text-muted-foreground text-sm">
              {query
                ? "Try a different search term"
                : "Upload the first video!"}
            </p>
            {!query && (
              <button
                type="button"
                onClick={() => onNavigate("upload")}
                className="mt-4 text-reel-pink text-sm font-semibold hover:underline"
              >
                Upload now →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {filtered.map((video, index) => (
              <VideoThumbnail key={video.id} video={video} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
