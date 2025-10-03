'use client';

import { getOrSetUserId } from './user-id';

/**
 * A helper function for pushing events to the Google Tag Manager dataLayer.
 * This should be used for tracking events like form submissions, clicks, etc.
 * @param event - The name of the event (e.g., 'generate_lead', 'select_content').
 * @param data - An object containing additional data for the event.
 */
export const pushToDataLayer = (event: string, data: object) => {
  // Ensure dataLayer exists and we are on the client side
  if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
    const userId = getOrSetUserId();
    window.dataLayer.push({ 
      event,
      user_id: userId,
      ...data 
    });
  } else {
    // Log for debugging if GTM isn't set up
    console.log(`GTM dataLayer not found. Event not fired: ${event}`, data);
  }
};

/**
 * Splits a full name into first and last name.
 * @param fullName - The full name string.
 * @returns An object with firstName and lastName.
 */
export const getFirstAndLastName = (fullName: string): { firstName: string; lastName:string } => {
    if (!fullName) return { firstName: '', lastName: '' };
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts.shift() || '';
    const lastName = nameParts.join(' ');
    return { firstName, lastName };
};
