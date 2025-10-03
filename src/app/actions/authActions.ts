'use server';

import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = '__session';

export async function createSession(idToken: string) {
  if (!auth) {
      return { success: false, message: 'Firebase Admin not configured.' };
  }
  try {
      // The session cookie is created by verifying the ID token.
      // We are just passing the token through here.
      cookies().set(SESSION_COOKIE_NAME, idToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 5, // 5 days
          path: '/',
      });
      
      return { success: true };
  } catch (error) {
      console.error('Session creation error:', error);
      return { success: false, message: 'Failed to create session.' };
  }
}

export async function signOut() {
  try {
     // Clear session cookie
    cookies().delete(SESSION_COOKIE_NAME);
    return { success: true };
  } catch (error) {
    console.error('Sign-out error:', error);
    return { success: false, message: 'Failed to sign out.' };
  }
}

export async function getSession() {
  try {
    const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) {
      return null;
    }
    const decodedIdToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedIdToken;
  } catch (error) {
    return null;
  }
}
