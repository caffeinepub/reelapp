import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddComment,
  useComments,
  useDeleteComment,
} from "../hooks/useQueries";

interface Props {
  videoId: string;
  onClose: () => void;
}

function formatTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export default function CommentPanel({ videoId, onClose }: Props) {
  const [content, setContent] = useState("");
  const { identity } = useInternetIdentity();
  const { data: comments = [], isLoading } = useComments(videoId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!identity) {
      toast.error("Please log in to comment");
      return;
    }
    addComment.mutate(
      { videoId, content: content.trim() },
      {
        onSuccess: () => {
          setContent("");
          toast.success("Comment posted");
        },
        onError: () => toast.error("Failed to post comment"),
      },
    );
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute inset-x-0 bottom-0 z-50 rounded-t-2xl overflow-hidden"
      style={{ height: "70%" }}
    >
      <div className="h-full bg-[oklch(0.11_0_0)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[oklch(0.22_0_0)]">
          <h3 className="font-display font-semibold text-sm text-foreground">
            {comments.length} Comments
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Comments list */}
        <ScrollArea className="flex-1 px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2
                size={20}
                className="animate-spin text-muted-foreground"
              />
            </div>
          ) : comments.length === 0 ? (
            <div
              data-ocid="comment.empty_state"
              className="flex flex-col items-center justify-center py-12 text-muted-foreground"
            >
              <MessageCircleOff size={36} className="mb-2 opacity-40" />
              <p className="text-sm">No comments yet</p>
              <p className="text-xs opacity-60">Be the first to comment!</p>
            </div>
          ) : (
            <div className="py-2 space-y-3">
              {comments.map((comment) => {
                const isOwn =
                  identity?.getPrincipal().toString() ===
                  comment.author.toString();
                return (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[oklch(0.22_0_0)] flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground">
                      {comment.author.toString().slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-foreground/80 truncate">
                          @{comment.author.toString().slice(0, 10)}...
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 break-words">
                        {comment.content}
                      </p>
                    </div>
                    {isOwn && (
                      <button
                        type="button"
                        onClick={() =>
                          deleteComment.mutate(
                            { videoId, commentId: comment.id },
                            { onError: () => toast.error("Failed to delete") },
                          )
                        }
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-4 py-3 border-t border-[oklch(0.22_0_0)]"
        >
          <Input
            data-ocid="comment.input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={identity ? "Add a comment..." : "Log in to comment"}
            disabled={!identity}
            className="flex-1 bg-[oklch(0.16_0_0)] border-[oklch(0.26_0_0)] text-sm h-9 placeholder:text-muted-foreground/60"
            maxLength={500}
          />
          <Button
            data-ocid="comment.submit_button"
            type="submit"
            size="icon"
            disabled={!content.trim() || addComment.isPending || !identity}
            className="w-9 h-9 bg-reel-pink hover:bg-reel-pink/90 transition-all flex-shrink-0"
          >
            {addComment.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}

// Local fallback icon — aria-hidden since it's decorative
function MessageCircleOff({
  size = 24,
  className = "",
}: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <title>No comments</title>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
