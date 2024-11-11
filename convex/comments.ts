import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Query: Get comments by podcastId
// Query: Get comments by podcastId
export const getCommentsByPodcastId = query({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_podcastId")
      .filter((q) => q.eq(q.field("podcastId"), args.podcastId))
      .order("desc")
      .collect();

    // Fetch the user info for each comment (including the name)
    const commentsWithUsernames = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          username: user.name,  // Include the user's name
          userClerkId: user.clerkId,  // Ensure you are including the user's Clerk ID
        };
      })
    );

    return commentsWithUsernames;
  },
});


// Mutation: Add a comment to a podcast
export const addComment = mutation({
  args: {
    podcastId: v.id("podcasts"),
    text: v.string(),
    userClerkId: v.string(), // Accept the Clerk user ID
  },
  handler: async (ctx, args) => {
    // Fetch the user from Convex users table based on Clerk user ID
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("clerkId"), args.userClerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User must be logged in to post a comment.");
    }

    const timestamp = Date.now();

    // Insert the comment into the 'comments' table
    return await ctx.db.insert("comments", {
      podcastId: args.podcastId, // Reference to the podcast
      userId: user._id,          // Use the Convex user ID
      text: args.text,           // The actual comment text
      timestamp,                 // Store the timestamp when the comment was posted
    });
  },
});

// Optional: Delete a comment (if required)
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),  // Comment ID to be deleted
    userClerkId: v.string(),      // Clerk user ID of the user attempting to delete
  },
  handler: async (ctx, args) => {
    // Fetch the comment from the database
    const comment = await ctx.db.get(args.commentId);

    // If the comment doesn't exist, throw an error
    if (!comment) {
      throw new ConvexError("Comment not found.");
    }

    // Fetch the user who made the comment
    const user = await ctx.db.get(comment.userId);

    // Ensure that the user attempting to delete the comment is the same as the comment author
    if (user.clerkId !== args.userClerkId) {
      throw new ConvexError("You are not authorized to delete this comment.");
    }

    // Delete the comment if the user is authorized
    await ctx.db.delete(args.commentId);
  },
});
