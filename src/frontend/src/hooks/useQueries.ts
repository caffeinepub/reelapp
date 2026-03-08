import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type {
  PersistentComment,
  PersistentUserProfile,
  PersistentVideoPost,
} from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ─── Videos ──────────────────────────────────────────────────────────────────

export function useAllVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<PersistentVideoPost[]>({
    queryKey: ["videos", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTrendingVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<PersistentVideoPost[]>({
    queryKey: ["videos", "trending"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendingVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVideo(videoId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PersistentVideoPost | null>({
    queryKey: ["video", videoId],
    queryFn: async () => {
      if (!actor || !videoId) return null;
      return actor.getVideo(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

export function useVideosByUser(principal: string | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<PersistentVideoPost[]>({
    queryKey: ["videos", "user", principal],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getVideosByUser(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity && !!principal,
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<PersistentUserProfile | null>({
    queryKey: ["profile", "caller"],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUserProfile(principalStr: string | null) {
  const { actor } = useActor();
  return useQuery<PersistentUserProfile | null>({
    queryKey: ["profile", principalStr],
    queryFn: async () => {
      if (!actor || !principalStr) return null;
      // Caller profile is handled separately
      return null;
    },
    enabled: false,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: PersistentUserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ─── Likes ────────────────────────────────────────────────────────────────────

export function useHasLiked(videoId: string | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<boolean>({
    queryKey: ["liked", videoId, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !videoId || !identity) return false;
      return actor.hasUserLikedVideo(videoId, identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!videoId && !!identity,
  });
}

export function useLikeVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      videoId,
      liked,
    }: { videoId: string; liked: boolean }) => {
      if (!actor) throw new Error("Not connected");
      if (liked) return actor.unlikeVideo(videoId);
      return actor.likeVideo(videoId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["liked", variables.videoId] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export function useComments(videoId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PersistentComment[]>({
    queryKey: ["comments", videoId],
    queryFn: async () => {
      if (!actor || !videoId) return [];
      return actor.getComments(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      videoId,
      content,
    }: { videoId: string; content: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addComment(videoId, content);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.videoId],
      });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      videoId,
      commentId,
    }: { videoId: string; commentId: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteComment(videoId, commentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.videoId],
      });
    },
  });
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export function useCreateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      videoBlob,
      onProgress,
    }: {
      title: string;
      description: string;
      videoBlob: Uint8Array<ArrayBuffer>;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error("Not connected");
      let blob = ExternalBlob.fromBytes(videoBlob);
      if (onProgress) blob = blob.withUploadProgress(onProgress);
      return actor.createVideoPost(title, description, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteVideoPost(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

// ─── Follow ───────────────────────────────────────────────────────────────────

export function useFollowers(principalStr: string | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<string[]>({
    queryKey: ["followers", principalStr],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principals = await actor.getFollowers(identity.getPrincipal());
      return principals.map((p) => p.toString());
    },
    enabled: !!actor && !isFetching && !!identity && !!principalStr,
  });
}

export function useFollowing(principalStr: string | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<string[]>({
    queryKey: ["following", principalStr],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principals = await actor.getFollowing(identity.getPrincipal());
      return principals.map((p) => p.toString());
    },
    enabled: !!actor && !isFetching && !!identity && !!principalStr,
  });
}

// ─── View count ───────────────────────────────────────────────────────────────

export function useIncrementView() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) return;
      return actor.incrementViewCount(videoId);
    },
  });
}
