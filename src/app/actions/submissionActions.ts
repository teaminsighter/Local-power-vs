'use server';

import { adminDb } from '@/lib/firebase-admin';

/**
 * Saves form data to Firestore and triggers configured webhooks.
 * @param formId - A string identifying the form (e.g., 'consultation', 'quote').
 * @param formData - The data collected from the form.
 * @param userId - The unique ID of the user submitting the form.
 */
export async function handleFormSubmission(formId: string, formData: Record<string, any>, userId: string): Promise<{ success: boolean, message?: string }> {
  if (!adminDb) {
    const errorMessage = 'Firebase is not configured. Please add your Firebase credentials to the .env file.';
    console.error(errorMessage);
    return { success: false, message: errorMessage };
  }

  try {
    // 1. Save the submission to Firestore
    await adminDb.collection('submissions').add({
      formId,
      userId,
      ...formData,
      submittedAt: new Date().toISOString(),
    });

    // 2. Fetch active webhooks for this form type
    const webhooksRef = adminDb.collection('webhooks');
    const webhookSnapshot = await webhooksRef.where('formId', '==', formId).where('active', '==', true).get();
    const urls: string[] = webhookSnapshot.docs.map(doc => doc.data().url);

    // 3. Fire all webhooks
    const webhookPromises = urls.map(url => {
      if(url && url.startsWith('http')) {
          return fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ formId, userId, ...formData }),
          }).then(response => {
              if (!response.ok) {
                  console.error(`Webhook to ${url} failed with status: ${response.status}`);
              }
          }).catch(error => {
              console.error(`Error firing webhook to ${url}:`, error);
          });
      }
      return Promise.resolve();
    });

    await Promise.all(webhookPromises);

    return { success: true };
  } catch (error) {
    console.error('Error handling form submission:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'An unknown error occurred while submitting the form.' };
  }
}
