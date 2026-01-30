/* eslint-disable */
/**
 * Generated API types - run `npx convex dev` to regenerate
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

import type * as users from "../users.js";
import type * as projects from "../projects.js";
import type * as moodboards from "../moodboards.js";
import type * as files from "../files.js";

declare const fullApi: ApiFromModules<{
  users: typeof users;
  projects: typeof projects;
  moodboards: typeof moodboards;
  files: typeof files;
}>;

export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
