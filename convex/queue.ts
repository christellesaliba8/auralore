// convex/functions/queue.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a podcast to the user's queue
export const addToQueue = mutation({
    args: {
      userId: v.string(),
      podcastId: v.id("podcasts"),
    },
    handler: async (ctx, { userId, podcastId }) => {
      try {
        // Check if the podcast is already in the user's queue
        const existing = await ctx.db
          .query("queue")
          .filter(q => q.eq(q.field("userId"), userId))
          .filter(q => q.eq(q.field("podcastId"), podcastId))
          .collect();
  
        if (existing.length > 0) {
          // If podcast is already in the queue, throw a specific error
          throw new Error("Podcast is already in the queue");
        }
  
        // Insert the podcast into the user's queue
        await ctx.db.insert("queue", {
          userId,
          podcastId,
          addedAt: new Date(),
        });
  
        return { success: true };
      } catch (error) {
        console.error("Error adding podcast to queue:", error); // Log error to see what went wrong
        throw new Error("Failed to add podcast to queue");
      }
    },
  });

// Get the user's podcast queue
export const getQueue = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const queueItems = await ctx.db
      .query("queue")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const podcasts = [];
    for (const item of queueItems) {
      const podcast = await ctx.db.get(item.podcastId);
      if (podcast) {
        podcasts.push(podcast);
      }
    }

    return podcasts;
  },
});
