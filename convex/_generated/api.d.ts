/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as activityRunner from "../activityRunner.js";
import type * as being from "../being.js";
import type * as crons from "../crons.js";
import type * as loop from "../loop.js";
import type * as memory from "../memory.js";
import type * as seed from "../seed.js";
import type * as selector from "../selector.js";
import type * as skills from "../skills.js";
import type * as types from "../types.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  activityRunner: typeof activityRunner;
  being: typeof being;
  crons: typeof crons;
  loop: typeof loop;
  memory: typeof memory;
  seed: typeof seed;
  selector: typeof selector;
  skills: typeof skills;
  types: typeof types;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
