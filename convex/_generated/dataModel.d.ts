/* eslint-disable */
/**
 * Generated data model types - run `npx convex dev` to regenerate
 */

import type { GenericId, GenericTableInfo, GenericDatabaseReader, GenericDatabaseWriter } from "convex/server";

export type Id<TableName extends TableNames> = GenericId<TableName>;

export type TableNames = "users" | "projects" | "moodboards" | "subscriptions" | "products" | "comments" | "files" | "aiConversations" | "aiMessages" | "aiUsage";

export interface DataModel {
  users: GenericTableInfo;
  projects: GenericTableInfo;
  moodboards: GenericTableInfo;
  subscriptions: GenericTableInfo;
  products: GenericTableInfo;
  comments: GenericTableInfo;
  files: GenericTableInfo;
  aiConversations: GenericTableInfo;
  aiMessages: GenericTableInfo;
  aiUsage: GenericTableInfo;
}

export type DatabaseReader = GenericDatabaseReader<DataModel>;
export type DatabaseWriter = GenericDatabaseWriter<DataModel>;
