import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface PersistentVideoPost {
    id: string;
    title: string;
    views: bigint;
    videoAssetId: ExternalBlob;
    description: string;
    likes: bigint;
    timestamp: Time;
    uploader: Principal;
}
export interface PersistentUserProfile {
    bio: string;
    displayName: string;
    followerCount: bigint;
    followingCount: bigint;
}
export interface PersistentComment {
    id: string;
    content: string;
    author: Principal;
    timestamp: Time;
    videoId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(videoId: string, content: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createVideoPost(title: string, description: string, videoAssetId: ExternalBlob): Promise<string>;
    deleteComment(videoId: string, commentId: string): Promise<void>;
    deleteVideoPost(videoId: string): Promise<void>;
    followUser(target: Principal): Promise<void>;
    getAllVideos(): Promise<Array<PersistentVideoPost>>;
    getCallerUserProfile(): Promise<PersistentUserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(videoId: string): Promise<Array<PersistentComment>>;
    getFollowers(user: Principal): Promise<Array<Principal>>;
    getFollowing(user: Principal): Promise<Array<Principal>>;
    getTrendingVideos(): Promise<Array<PersistentVideoPost>>;
    getUserProfile(user: Principal): Promise<PersistentUserProfile | null>;
    getVideo(videoId: string): Promise<PersistentVideoPost | null>;
    getVideosByUser(user: Principal): Promise<Array<PersistentVideoPost>>;
    hasUserLikedVideo(videoId: string, user: Principal): Promise<boolean>;
    incrementViewCount(videoId: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    likeVideo(videoId: string): Promise<void>;
    saveCallerUserProfile(profile: PersistentUserProfile): Promise<void>;
    unfollowUser(target: Principal): Promise<void>;
    unlikeVideo(videoId: string): Promise<void>;
}
