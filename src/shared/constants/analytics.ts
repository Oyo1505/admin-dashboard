/**
 * Analytics Constants
 * Centralized constants for analytics operations
 */

// Limits for data fetching
export const MAX_RECENT_FAVORITES = 5;
export const MAX_CONNECTION_HISTORY = 5;
export const MAX_TOP_MOVIES = 5;
export const MAX_TOP_USERS = 5;
export const MAX_TOP_GENRES = 5;
export const MAX_RECENT_ACTIVITY = 10;

// Time periods (in days)
export const ACTIVE_USERS_PERIOD = 7; // 1 week
export const RECENT_ACTIVITY_PERIOD = 7; // 1 week

// Cache time (in milliseconds)
export const ANALYTICS_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
export const USER_STATS_CACHE_TIME = 10 * 60 * 1000; // 10 minutes
export const ADMIN_STATS_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

// Validation limits
export const MIN_LIMIT = 1;
export const MAX_LIMIT = 100;
export const MIN_DAYS = 1;
export const MAX_DAYS = 365;
