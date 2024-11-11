/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as chat from "../chat.js";
import type * as comments from "../comments.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as openai from "../openai.js";
import type * as playlists from "../playlists.js";
import type * as podcasts from "../podcasts.js";
import type * as progress from "../progress.js";
import type * as queue from "../queue.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  chat: typeof chat;
  comments: typeof comments;
  files: typeof files;
  http: typeof http;
  openai: typeof openai;
  playlists: typeof playlists;
  podcasts: typeof podcasts;
  progress: typeof progress;
  queue: typeof queue;
  tasks: typeof tasks;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */
