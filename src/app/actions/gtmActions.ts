'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import type { GtmScript, GtmScriptData } from '@/lib/definitions';

const GTM_COLLECTION = 'gtmScripts';

/**
 * Saves a GTM script to Firestore. Can be used for creating or updating.
 * @param scriptData - The data for the GTM script.
 * @param id - Optional ID of the script to update. If not provided, a new script is created.
 */
export async function saveGtmScript(scriptData: GtmScriptData, id?: string): Promise<{ success: boolean; message?: string }> {
    if (!adminDb) {
        return { success: false, message: 'Firebase is not configured.' };
    }
    try {
        if (id) {
            const docRef = adminDb.collection(GTM_COLLECTION).doc(id);
            await docRef.update(scriptData);
        } else {
            await adminDb.collection(GTM_COLLECTION).add(scriptData);
        }
        revalidatePath('/admin/gtm');
        // Also revalidate the page the script is on
        revalidatePath(scriptData.pagePath, 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Error saving GTM script:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Fetches all GTM scripts from Firestore.
 */
export async function getGtmScripts(): Promise<GtmScript[]> {
    if (!adminDb) return [];
    try {
        const querySnapshot = await adminDb.collection(GTM_COLLECTION).get();
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as GtmScriptData,
        }));
    } catch (error) {
        console.error('Error fetching GTM scripts:', error);
        return [];
    }
}

/**
 * Deletes a GTM script from Firestore.
 * @param id - The ID of the script to delete.
 */
export async function deleteGtmScript(id: string): Promise<{ success: boolean; message?: string }> {
    if (!adminDb) {
        return { success: false, message: 'Firebase is not configured.' };
    }
    try {
        await adminDb.collection(GTM_COLLECTION).doc(id).delete();
        revalidatePath('/admin/gtm');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting GTM script:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Fetches GTM scripts for a specific page path.
 */
export async function getGtmScriptsForPage(pagePath: string): Promise<GtmScript[]> {
    if (!adminDb) return [];
    try {
        const querySnapshot = await adminDb.collection(GTM_COLLECTION).where('pagePath', '==', pagePath).get();
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as GtmScriptData,
        }));
    } catch (error) {
        console.error(`Error fetching GTM scripts for page ${pagePath}:`, error);
        return [];
    }
}
