import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mutation to create a new playlist
export const createPlaylist = mutation({
    args: {
      playlistName: v.string(),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
  
      if (!identity) {
        throw new Error("User not authenticated");
      }
  
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), identity.email))
        .collect();
  
      if (user.length === 0) {
        throw new Error("User not found");
      }
  
      return await ctx.db.insert("playlists", {
        userId: user[0]._id,
        playlistName: args.playlistName,
        podcastIds: [],  // Start with an empty podcast list
      });
    },
  });

// Mutation to add a podcast to a playlist
export const addPodcastToPlaylist = mutation({
    args: {
      playlistId: v.id("playlists"),
      podcastId: v.id("podcasts"),
    },
    handler: async (ctx, args) => {
      const playlist = await ctx.db.get(args.playlistId);
      if (!playlist) throw new Error("Playlist not found");
  
      // Add the podcast ID to the playlist's podcastIds array
      return await ctx.db.patch(args.playlistId, {
        podcastIds: [...playlist.podcastIds, args.podcastId],
      });
    },
  });

// Query to get all playlists by the current user
// Query to get all playlists by the current user
export const getPlaylistsByUser = query({
    handler: async (ctx) => {
      const identity = await ctx.auth.getUserIdentity();
  
      if (!identity) {
        throw new Error("User not authenticated");
      }
  
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), identity.email))
        .collect();
  
      if (user.length === 0) {
        throw new Error("User not found");
      }
  
      // Fetch and return all playlists created by the user
      return await ctx.db
        .query("playlists")
        .filter((q) => q.eq(q.field("userId"), user[0]._id))
        .collect();
    },
  });
  

// Query to get all podcasts within a specific playlist
// Query to get all podcasts within a specific playlist
export const getPodcastsInPlaylist = query({
    args: {
      playlistId: v.id("playlists"),
    },
    handler: async (ctx, { playlistId }) => {
      const playlist = await ctx.db.get(playlistId);
      if (!playlist) throw new Error("Playlist not found");
  
      // Fetch podcasts by IDs in the playlist
      const podcasts = await Promise.all(
        playlist.podcastIds.map(async (podcastId) => {
          return await ctx.db.get(podcastId);  // Fetch each podcast by ID
        })
      );
  
      return podcasts.filter((podcast) => podcast !== null);  // Remove any null values
    },
  });
  


export const getAllPodcasts = query({
    handler: async (ctx) => {
      return await ctx.db.query("podcasts").collect();
    },
  });

  export const deletePlaylist = mutation({
    args: {
      playlistId: v.id("playlists"),  // The ID of the playlist to be deleted
    },
    handler: async (ctx, { playlistId }) => {
      const playlist = await ctx.db.get(playlistId);
      if (!playlist) {
        throw new Error(`Playlist with ID ${playlistId} not found`);
      }
  
      // Delete the playlist
      await ctx.db.delete(playlistId);
      return { message: "Playlist deleted" };
    },
  });

// Mutation to remove a podcast from a playlist
export const removePodcastFromPlaylist = mutation({
  args: {
    playlistId: v.id("playlists"),
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, { playlistId, podcastId }) => {
    const playlist = await ctx.db.get(playlistId);
    if (!playlist) throw new Error("Playlist not found");

    // Filter out the podcastId from the playlist's podcastIds array
    const updatedPodcastIds = playlist.podcastIds.filter(id => id !== podcastId);

    // Update the playlist with the new list of podcast IDs
    await ctx.db.patch(playlistId, { podcastIds: updatedPodcastIds });

    return { message: "Podcast removed from playlist" };
  },
});
