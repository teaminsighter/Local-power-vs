'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import type { Webhook, WebhookData } from '@/lib/definitions';

const WEBHOOK_COLLECTION = 'webhooks';

/**
 * Saves a webhook to Firestore. Can be used for creating or updating.
 * @param webhookData - The data for the webhook.
 * @param id - Optional ID of the webhook to update. If not provided, a new webhook is created.
 */
export async function saveWebhook(webhookData: WebhookData, id?: string): Promise<{ success: boolean; message?: string }> {
    if (!adminDb) {
        return { success: false, message: 'Firebase is not configured.' };
    }
    try {
        if (id) {
            const docRef = adminDb.collection(WEBHOOK_COLLECTION).doc(id);
            await docRef.update(webhookData);
        } else {
            await adminDb.collection(WEBHOOK_COLLECTION).add(webhookData);
        }
        revalidatePath('/admin/webhooks');
        return { success: true };
    } catch (error: any) {
        console.error('Error saving webhook:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Fetches all webhooks from Firestore.
 */
export async function getWebhooks(): Promise<Webhook[]> {
    if (!adminDb) return [];
    try {
        const querySnapshot = await adminDb.collection(WEBHOOK_COLLECTION).get();
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as WebhookData,
        }));
    } catch (error) {
        console.error('Error fetching webhooks:', error);
        return [];
    }
}

/**
 * Deletes a webhook from Firestore.
 * @param id - The ID of the webhook to delete.
 */
export async function deleteWebhook(id: string): Promise<{ success: boolean; message?: string }> {
    if (!adminDb) {
        return { success: false, message: 'Firebase is not configured.' };
    }
    try {
        await adminDb.collection(WEBHOOK_COLLECTION).doc(id).delete();
        revalidatePath('/admin/webhooks');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting webhook:', error);
        return { success: false, message: error.message };
    }
}
