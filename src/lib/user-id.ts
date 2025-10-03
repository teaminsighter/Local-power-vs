'use client';

import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'lp_user_id';

/**
 * Gets the unique user ID from localStorage.
 * If it doesn't exist, it creates a new one and stores it.
 * This function should only be called on the client-side.
 * @returns The unique user ID string.
 */
export function getOrSetUserId(): string {
  if (typeof window === 'undefined') {
    // This function should only run on the client, return empty string if on server
    return '';
  }

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}
