import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit2,
  Eye,
  Film,
  Heart,
  Loader2,
  LogIn,
  LogOut,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PersistentVideoPost } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerProfile,
  useSaveProfile,
  useVideosByUser,
} from "../hooks/useQueries";

function VideoGrid({ videos }: { videos: PersistentVideoPost[] }) {
  if (videos.length === 0) {
    return (
      <div
        data-ocid="profile.video.empty_state"
        className="flex flex-col items-center justify-center py-16 text-center px-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-[oklch(0.14_0_0)] border border-[oklch(0.22_0_0)] flex items-center justify-center mb-3">
          <Film size={22} className="text-muted-foreground" />
        </div>
        <p className="text-foreground font-semibold text-sm mb-1">
          No videos yet
        </p>
        <p className="text-muted-foreground text-xs">
          Your uploaded videos appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 px-0.5">
      {videos.map((video, index) => {
        const videoUrl = video.videoAssetId.getDirectURL();
        return (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative aspect-[9/16] rounded-md overflow-hidden bg-[oklch(0.11_0_0)]"
          >
            <video
              src={videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              preload="metadata"
            />
            <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-0.5 text-white/70 text-[9px]">
                  <Heart size={8} fill="currentColor" />
                  {Number(video.likes) >= 1000
                    ? `${(Number(video.likes) / 1000).toFixed(1)}K`
                    : Number(video.likes)}
                </span>
                <span className="flex items-center gap-0.5 text-white/70 text-[9px]">
                  <Eye size={8} />
                  {Number(video.views) >= 1000
                    ? `${(Number(video.views) / 1000).toFixed(1)}K`
                    : Number(video.views)}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function ProfilePage() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString() ?? null;

  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: videos = [], isLoading: videosLoading } =
    useVideosByUser(principalStr);
  const saveProfile = useSaveProfile();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  const openEdit = () => {
    setEditName(profile?.displayName ?? "");
    setEditBio(profile?.bio ?? "");
    setEditOpen(true);
  };

  const handleSave = () => {
    const updatedProfile = {
      displayName: editName.trim(),
      bio: editBio.trim(),
      followerCount: profile?.followerCount ?? BigInt(0),
      followingCount: profile?.followingCount ?? BigInt(0),
    };
    saveProfile.mutate(updatedProfile, {
      onSuccess: () => {
        toast.success("Profile updated!");
        setEditOpen(false);
      },
      onError: () => toast.error("Failed to update profile"),
    });
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
          <div className="w-20 h-20 rounded-full bg-[oklch(0.16_0_0)] border-2 border-[oklch(0.28_0_0)] flex items-center justify-center">
            <Users size={32} className="text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Your Profile
            </h2>
            <p className="text-muted-foreground text-sm">
              Log in to view your profile and upload videos
            </p>
          </div>
          <Button
            data-ocid="auth.login_button"
            onClick={login}
            disabled={isLoggingIn}
            className="bg-reel-pink hover:bg-reel-pink/90 text-white font-semibold px-8 py-5 rounded-xl h-auto btn-glow-pink"
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
      <header className="px-4 pt-4 pb-0 border-b border-[oklch(0.18_0_0)] flex-shrink-0">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display font-bold text-lg text-foreground">
            Profile
          </h1>
          <button
            type="button"
            data-ocid="auth.logout_button"
            onClick={() => {
              clear();
              toast.success("Logged out");
            }}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        {/* Profile info */}
        {profileLoading ? (
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-reel-pink to-[oklch(0.65_0.22_280)] flex items-center justify-center flex-shrink-0 text-white font-display font-bold text-xl">
              {profile?.displayName
                ? profile.displayName.charAt(0).toUpperCase()
                : (principalStr?.charAt(0).toUpperCase() ?? "?")}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="font-display font-bold text-base text-foreground truncate">
                  {profile?.displayName || "Anonymous"}
                </h2>
                <button
                  type="button"
                  data-ocid="profile.edit_button"
                  onClick={openEdit}
                  className="flex-shrink-0 text-muted-foreground hover:text-reel-pink transition-colors p-1"
                >
                  <Edit2 size={13} />
                </button>
              </div>
              <p className="text-muted-foreground text-xs font-mono truncate mb-1.5">
                @{principalStr?.slice(0, 16)}...
              </p>
              {profile?.bio && (
                <p className="text-foreground/70 text-xs line-clamp-2">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-0 border-t border-[oklch(0.18_0_0)] -mx-4">
          {[
            { label: "Videos", value: videos.length },
            {
              label: "Followers",
              value: Number(profile?.followerCount ?? 0),
            },
            {
              label: "Following",
              value: Number(profile?.followingCount ?? 0),
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`flex-1 flex flex-col items-center py-3 ${
                i < 2 ? "border-r border-[oklch(0.18_0_0)]" : ""
              }`}
            >
              <span className="font-display font-bold text-base text-foreground">
                {stat.value >= 1000
                  ? `${(stat.value / 1000).toFixed(1)}K`
                  : stat.value}
              </span>
              <span className="text-muted-foreground text-[10px] font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </header>

      {/* Videos grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
        {videosLoading ? (
          <div
            data-ocid="profile.loading_state"
            className="flex items-center justify-center py-16"
          >
            <Loader2 size={24} className="animate-spin text-reel-pink" />
          </div>
        ) : (
          <VideoGrid videos={videos} />
        )}

        {/* Footer */}
        <footer className="py-4 text-center">
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            © {new Date().getFullYear()} Built with ♥ using caffeine.ai
          </a>
        </footer>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="bg-[oklch(0.12_0_0)] border-[oklch(0.22_0_0)] text-foreground mx-4 rounded-2xl"
          data-ocid="profile.modal"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-foreground">
              Edit Profile
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground/80">
                Display Name
              </Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your display name"
                maxLength={50}
                className="bg-[oklch(0.16_0_0)] border-[oklch(0.26_0_0)] text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground/80">
                Bio
              </Label>
              <Textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell people about yourself"
                maxLength={200}
                rows={3}
                className="bg-[oklch(0.16_0_0)] border-[oklch(0.26_0_0)] text-sm resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {editBio.length}/200
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-row">
            <Button
              data-ocid="profile.cancel_button"
              variant="ghost"
              onClick={() => setEditOpen(false)}
              className="flex-1 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              data-ocid="profile.save_button"
              onClick={handleSave}
              disabled={saveProfile.isPending}
              className="flex-1 bg-reel-pink hover:bg-reel-pink/90 text-white font-semibold"
            >
              {saveProfile.isPending ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
