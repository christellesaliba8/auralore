import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save or update the current progress of a user for a specific podcast
export const saveListeningProgress = mutation({
  args: {
    podcastId: v.id("podcasts"),
    currentTimestamp: v.number(),  // This can be in seconds or percentage
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("User not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .collect();

    if (user.length === 0) {
      throw new ConvexError("User not found");
    }

    const existingProgress = await ctx.db
      .query("listeningProgress")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user[0]._id),
          q.eq(q.field("podcastId"), args.podcastId)
        )
      )
      .first();

    const currentTime = Math.floor(Date.now() / 1000);  // Timestamp in seconds

    if (existingProgress) {
      // Update existing progress
      await ctx.db.patch(existingProgress._id, {
        currentTimestamp: args.currentTimestamp,
        lastUpdated: currentTime,
      });
      console.log("Progress updated:", {
        userId: user[0]._id,
        podcastId: args.podcastId,
        currentTimestamp: args.currentTimestamp,
      });
    } else {
      // Insert new progress
      await ctx.db.insert("listeningProgress", {
        userId: user[0]._id,
        podcastId: args.podcastId,
        currentTimestamp: args.currentTimestamp,
        lastUpdated: currentTime,
      });
      console.log("Progress saved for new entry:", {
        userId: user[0]._id,
        podcastId: args.podcastId,
        currentTimestamp: args.currentTimestamp,
      });
    }
  },
});

// Query to get all the podcasts a user has started but not finished
export const getContinueListening = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("User not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .collect();

    if (user.length === 0) {
      throw new ConvexError("User not found");
    }

    // Get all listening progress records for this user
    const progressRecords = await ctx.db
      .query("listeningProgress")
      .filter((q) => q.eq(q.field("userId"), user[0]._id))
      .limit(10)
      .collect();

    console.log("Progress records found for user:", progressRecords);

    if (progressRecords.length === 0) {
      return [];
    }

    // Fetch all podcasts that match the progress records
    const podcasts = await Promise.all(
      progressRecords.map((progress) =>
        ctx.db.get(progress.podcastId)
      )
    );

    console.log("Podcasts found for user:", podcasts);

    // Filter out completed podcasts (90% threshold to mark as completed)
    const inProgressPodcasts = podcasts.filter(
      (podcast, index) => podcast && progressRecords[index].currentTimestamp < podcast.audioDuration * 0.9
    );

    return inProgressPodcasts;
  },
});
