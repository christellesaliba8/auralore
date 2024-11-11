import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  podcasts: defineTable({
    user: v.id('users'),
    podcastTitle: v.string(),
    podcastDescription: v.string(),
    audioUrl: v.optional(v.string()),
    audioStorageId: v.optional(v.id('_storage')),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
    author: v.string(),
    authorId: v.string(),
    authorImageUrl: v.string(),
    voicePrompt: v.string(),
    imagePrompt: v.string(),
    voiceType: v.string(),
    audioDuration: v.number(),
    views: v.number(),
  })
    .searchIndex('search_author', { searchField: 'author' })
    .searchIndex('search_title', { searchField: 'podcastTitle' })
    .searchIndex('search_body', { searchField: 'podcastDescription' }),
    
  users: defineTable({
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    name: v.string(),
  }),

  comments: defineTable({
    podcastId: v.id('podcasts'),  // Reference to the podcast
    userId: v.id('users'),        // Reference to the user who made the comment
    text: v.string(),             // The comment text
    timestamp: v.number(),        // When the comment was posted (timestamp)
  })
  .index("by_podcastId", ["podcastId"]),
  
  playlists: defineTable({
    userId: v.id("users"),
    playlistName: v.string(),
    podcastIds: v.array(v.id("podcasts")),
    coverImageUrl: v.optional(v.string()),  // Ensure this field exists for storing image URL
  })
    .index("by_user", ["userId"]),// Add index for filtering comments by podcastId
});
