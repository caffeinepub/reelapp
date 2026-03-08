import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Include authorization and storage components
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Persistent profile types should be stored in the actor
  public type PersistentUserProfile = {
    displayName : Text;
    bio : Text;
    followerCount : Nat;
    followingCount : Nat;
  };

  // Persistent Video Post record
  type PersistentVideoPost = {
    id : Text;
    title : Text;
    description : Text;
    videoAssetId : Storage.ExternalBlob;
    uploader : Principal;
    timestamp : Time.Time;
    views : Nat;
    likes : Nat;
  };

  // Comment Types
  type PersistentComment = {
    id : Text;
    videoId : Text;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  // Map to track persistent state
  let videoPosts = Map.empty<Text, PersistentVideoPost>();
  let userProfiles = Map.empty<Principal, PersistentUserProfile>();
  let likes = Map.empty<Text, List.List<Principal>>();
  let comments = Map.empty<Text, List.List<PersistentComment>>();
  let followers = Map.empty<Principal, List.List<Principal>>();
  let following = Map.empty<Principal, List.List<Principal>>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?PersistentUserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?PersistentUserProfile {
    // Anyone can view user profiles (including guests)
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : PersistentUserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Video Post Management
  public shared ({ caller }) func createVideoPost(title : Text, description : Text, videoAssetId : Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can post videos");
    };

    let postId = title.concat(Time.now().toText());
    let newPost = {
      id = postId;
      title;
      description;
      videoAssetId;
      uploader = caller;
      timestamp = Time.now();
      views = 0;
      likes = 0;
    };

    videoPosts.add(postId, newPost);
    postId;
  };

  public query ({ caller }) func getVideo(videoId : Text) : async ?PersistentVideoPost {
    // Anyone can view videos (including guests)
    videoPosts.get(videoId);
  };

  public query ({ caller }) func getAllVideos() : async [PersistentVideoPost] {
    // Anyone can view all videos (including guests)
    videoPosts.values().toArray();
  };

  public query ({ caller }) func getVideosByUser(user : Principal) : async [PersistentVideoPost] {
    // Anyone can view videos by user (including guests)
    videoPosts.values().toArray().filter(func(post) { post.uploader == user });
  };

  public shared ({ caller }) func deleteVideoPost(videoId : Text) : async () {
    switch (videoPosts.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?post) {
        // Only the uploader can delete their own video, or admins can delete any video
        if (caller != post.uploader and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the video owner or admins can delete this video");
        };
        videoPosts.remove(videoId);
        // Clean up associated likes and comments
        likes.remove(videoId);
        comments.remove(videoId);
      };
    };
  };

  public shared ({ caller }) func incrementViewCount(videoId : Text) : async () {
    // Anyone can increment view count (including guests)
    switch (videoPosts.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?post) {
        let updatedPost = { post with views = post.views + 1 };
        videoPosts.add(videoId, updatedPost);
      };
    };
  };

  // Like Management
  public shared ({ caller }) func likeVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can like videos");
    };

    switch (videoPosts.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        let currentLikes = switch (likes.get(videoId)) {
          case (null) {
            let newList = List.empty<Principal>();
            newList.add(caller);
            newList;
          };
          case (?likesList) {
            if (likesList.any(func(p) { p == caller })) {
              Runtime.trap("You have already liked this video");
            } else {
              likesList.add(caller);
              likesList;
            };
          };
        };

        likes.add(videoId, currentLikes);
        let updatedPost = switch (videoPosts.get(videoId)) {
          case (null) { Runtime.trap("Video not found") };
          case (?post) { { post with likes = post.likes + 1 } };
        };
        videoPosts.add(videoId, updatedPost);
      };
    };
  };

  public shared ({ caller }) func unlikeVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can unlike videos");
    };

    switch (videoPosts.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        switch (likes.get(videoId)) {
          case (null) { Runtime.trap("You haven't liked this video yet") };
          case (?likesList) {
            if (not likesList.any(func(p) { p == caller })) {
              Runtime.trap("You haven't liked this video yet");
            } else {
              let newLikesList = likesList.filter(func(p) { p != caller });
              likes.add(videoId, newLikesList);
              let updatedPost = switch (videoPosts.get(videoId)) {
                case (null) { Runtime.trap("Video not found") };
                case (?post) { { post with likes = post.likes - 1 } };
              };
              videoPosts.add(videoId, updatedPost);
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func hasUserLikedVideo(videoId : Text, user : Principal) : async Bool {
    // Anyone can check if a user liked a video (including guests)
    switch (likes.get(videoId)) {
      case (null) { false };
      case (?likesList) { likesList.any(func(p) { p == user }) };
    };
  };

  // Comment Management
  public shared ({ caller }) func addComment(videoId : Text, content : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can comment");
    };

    switch (videoPosts.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        let commentId = caller.toText().concat(Time.now().toText());
        let newComment = {
          id = commentId;
          videoId;
          author = caller;
          content;
          timestamp = Time.now();
        };

        let currentComments = switch (comments.get(videoId)) {
          case (null) {
            let newList = List.empty<PersistentComment>();
            newList.add(newComment);
            newList;
          };
          case (?commentsList) {
            commentsList.add(newComment);
            commentsList;
          };
        };
        comments.add(videoId, currentComments);
        commentId;
      };
    };
  };

  public query ({ caller }) func getComments(videoId : Text) : async [PersistentComment] {
    // Anyone can view comments (including guests)
    switch (comments.get(videoId)) {
      case (null) { [] };
      case (?commentsList) { commentsList.toArray() };
    };
  };

  public shared ({ caller }) func deleteComment(videoId : Text, commentId : Text) : async () {
    switch (comments.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?commentsList) {
        let commentOpt = commentsList.find(func(c) { c.id == commentId });
        switch (commentOpt) {
          case (null) { Runtime.trap("Comment not found") };
          case (?comment) {
            // Only the comment author can delete their own comment, or admins can delete any comment
            if (caller != comment.author and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only the comment author or admins can delete this comment");
            };
            let newCommentsList = commentsList.filter(func(c) { c.id != commentId });
            comments.add(videoId, newCommentsList);
          };
        };
      };
    };
  };

  // Follow Management
  public shared ({ caller }) func followUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can follow others");
    };

    if (caller == target) {
      Runtime.trap("You cannot follow yourself");
    };

    let currentFollowers = switch (followers.get(target)) {
      case (null) {
        let newList = List.empty<Principal>();
        newList.add(caller);
        newList;
      };
      case (?followersList) {
        if (followersList.any(func(p) { p == caller })) {
          Runtime.trap("You are already following this user");
        } else {
          followersList.add(caller);
          followersList;
        };
      };
    };
    followers.add(target, currentFollowers);

    let currentFollowing = switch (following.get(caller)) {
      case (null) {
        let newList = List.empty<Principal>();
        newList.add(target);
        newList;
      };
      case (?followingList) {
        if (followingList.any(func(p) { p == target })) {
          Runtime.trap("You are already following this user");
        } else {
          followingList.add(target);
          followingList;
        };
      };
    };
    following.add(caller, currentFollowing);

    // Update follower count for target user
    switch (userProfiles.get(target)) {
      case (null) {
        // Create a default profile if it doesn't exist
        let defaultProfile = {
          displayName = "";
          bio = "";
          followerCount = 1;
          followingCount = 0;
        };
        userProfiles.add(target, defaultProfile);
      };
      case (?profile) {
        let updatedProfile = { profile with followerCount = profile.followerCount + 1 };
        userProfiles.add(target, updatedProfile);
      };
    };

    // Update following count for caller
    switch (userProfiles.get(caller)) {
      case (null) {
        // Create a default profile if it doesn't exist
        let defaultProfile = {
          displayName = "";
          bio = "";
          followerCount = 0;
          followingCount = 1;
        };
        userProfiles.add(caller, defaultProfile);
      };
      case (?profile) {
        let updatedProfile = { profile with followingCount = profile.followingCount + 1 };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func unfollowUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can unfollow others");
    };

    switch (followers.get(target)) {
      case (null) { Runtime.trap("You are not following this user") };
      case (?followersList) {
        if (not followersList.any(func(p) { p == caller })) {
          Runtime.trap("You are not following this user");
        } else {
          let newFollowersList = followersList.filter(func(p) { p != caller });
          followers.add(target, newFollowersList);
        };
      };
    };

    switch (following.get(caller)) {
      case (null) { Runtime.trap("You are not following this user") };
      case (?followingList) {
        if (not followingList.any(func(p) { p == target })) {
          Runtime.trap("You are not following this user");
        } else {
          let newFollowingList = followingList.filter(func(p) { p != target });
          following.add(caller, newFollowingList);
        };
      };
    };

    // Update follower count for target user
    switch (userProfiles.get(target)) {
      case (null) { /* Profile doesn't exist, nothing to update */ };
      case (?profile) {
        let updatedProfile = { profile with followerCount = profile.followerCount - 1 };
        userProfiles.add(target, updatedProfile);
      };
    };

    // Update following count for caller
    switch (userProfiles.get(caller)) {
      case (null) { /* Profile doesn't exist, nothing to update */ };
      case (?profile) {
        let updatedProfile = { profile with followingCount = profile.followingCount - 1 };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getFollowers(user : Principal) : async [Principal] {
    // Anyone can view followers (including guests)
    switch (followers.get(user)) {
      case (null) { [] };
      case (?followersList) { followersList.toArray() };
    };
  };

  public query ({ caller }) func getFollowing(user : Principal) : async [Principal] {
    // Anyone can view following (including guests)
    switch (following.get(user)) {
      case (null) { [] };
      case (?followingList) { followingList.toArray() };
    };
  };

  // Feed and Trending
  module PersistentVideoPost {
    // Implicit comparison by likes (descending order)
    public func compareByLikes(p1 : PersistentVideoPost, p2 : PersistentVideoPost) : Order.Order {
      Nat.compare(p2.likes, p1.likes); // Reversed for descending order
    };
  };

  public query ({ caller }) func getTrendingVideos() : async [PersistentVideoPost] {
    // Anyone can view trending videos (including guests)
    videoPosts.values().toArray().sort(PersistentVideoPost.compareByLikes);
  };
};
