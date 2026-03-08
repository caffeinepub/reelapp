import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Film, Loader2, LogIn, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateVideo } from "../hooks/useQueries";

interface Props {
  onSuccess: () => void;
}

export default function UploadPage({ onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { identity, login, isLoggingIn } = useInternetIdentity();
  const createVideo = useCreateVideo();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video must be under 100MB");
      return;
    }
    setVideoFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("video/")) {
      toast.error("Please drop a video file");
      return;
    }
    setVideoFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error("Please select a video");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const arrayBuffer = await videoFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;

    createVideo.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        videoBlob: bytes,
        onProgress: (pct) => setUploadProgress(pct),
      },
      {
        onSuccess: () => {
          setUploadSuccess(true);
          toast.success("Video uploaded successfully!");
          setTimeout(() => {
            setTitle("");
            setDescription("");
            setVideoFile(null);
            setUploadProgress(0);
            setUploadSuccess(false);
            onSuccess();
          }, 1500);
        },
        onError: () => {
          toast.error("Upload failed. Please try again.");
          setUploadProgress(0);
        },
      },
    );
  };

  // Not logged in
  if (!identity) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center px-6 text-center gap-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="w-20 h-20 rounded-2xl bg-reel-pink/10 border border-reel-pink/30 flex items-center justify-center">
            <Film size={32} className="text-reel-pink" />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Create a Video
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Log in to share your videos with the world
            </p>
          </div>
          <Button
            data-ocid="auth.login_button"
            onClick={login}
            disabled={isLoggingIn}
            className="bg-reel-pink hover:bg-reel-pink/90 text-white font-semibold px-8 py-5 rounded-xl h-auto btn-glow-pink transition-all"
          >
            {isLoggingIn ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <LogIn size={16} className="mr-2" />
            )}
            {isLoggingIn ? "Logging in..." : "Log In"}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 border-b border-[oklch(0.18_0_0)] flex-shrink-0">
        <h1 className="font-display font-bold text-xl text-foreground">
          Upload Video
        </h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Share your story with the world
        </p>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
          {/* Dropzone */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: dropzone handles file picker via button inside */}
          <div
            data-ocid="upload.dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !videoFile && fileInputRef.current?.click()}
            className={`
              relative rounded-xl border-2 border-dashed transition-colors duration-200 cursor-pointer
              ${
                videoFile
                  ? "border-reel-pink/50 bg-reel-pink/5"
                  : "border-[oklch(0.28_0_0)] hover:border-reel-pink/40 bg-[oklch(0.11_0_0)]"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {videoFile ? (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-lg bg-reel-pink/10 flex items-center justify-center flex-shrink-0">
                    <Film size={22} className="text-reel-pink" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-semibold truncate">
                      {videoFile.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoFile(null);
                      setUploadProgress(0);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-10 px-4 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[oklch(0.16_0_0)] flex items-center justify-center mb-3">
                    <Upload size={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-foreground text-sm font-semibold mb-1">
                    Tap to select a video
                  </p>
                  <p className="text-muted-foreground text-xs">
                    MP4, MOV, AVI · max 100MB
                  </p>
                  <Button
                    type="button"
                    data-ocid="upload.upload_button"
                    variant="outline"
                    size="sm"
                    className="mt-3 border-[oklch(0.28_0_0)] text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Browse files
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-foreground/80">
              Title *
            </Label>
            <Input
              data-ocid="upload.title.input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your video a catchy title"
              maxLength={100}
              required
              className="bg-[oklch(0.13_0_0)] border-[oklch(0.22_0_0)] text-sm placeholder:text-muted-foreground/50 focus-visible:ring-reel-pink/50"
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/100
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-foreground/80">
              Description
            </Label>
            <Textarea
              data-ocid="upload.description.textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video... Add hashtags!"
              maxLength={500}
              rows={3}
              className="bg-[oklch(0.13_0_0)] border-[oklch(0.22_0_0)] text-sm placeholder:text-muted-foreground/50 resize-none focus-visible:ring-reel-pink/50"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>

          {/* Progress */}
          <AnimatePresence>
            {createVideo.isPending && (
              <motion.div
                data-ocid="upload.loading_state"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress
                  value={uploadProgress}
                  className="h-1.5 bg-[oklch(0.18_0_0)]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <Button
            data-ocid="upload.submit_button"
            type="submit"
            disabled={
              !title.trim() ||
              !videoFile ||
              createVideo.isPending ||
              uploadSuccess
            }
            className="w-full h-11 bg-reel-pink hover:bg-reel-pink/90 text-white font-bold text-sm rounded-xl btn-glow-pink transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadSuccess ? (
              <>
                <CheckCircle size={16} className="mr-2" />
                Uploaded!
              </>
            ) : createVideo.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Post Video
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
