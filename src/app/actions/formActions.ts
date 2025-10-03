'use server';

import { adminDb } from '@/lib/firebase-admin';
import { forms } from '@/lib/forms';
import { pages } from '@/lib/pages';
import type { FormStats } from '@/lib/definitions';

async function getSubmissionCount(formId: string): Promise<number> {
    if (!adminDb) return 0;
    try {
        const snapshot = await adminDb.collection('submissions').where('formId', '==', formId).count().get();
        return snapshot.data().count;
    } catch (error) {
        console.error(`Error counting submissions for ${formId}:`, error);
        return 0;
    }
}

async function getActiveWebhookCount(formId: string): Promise<number> {
    if (!adminDb) return 0;
    try {
        const snapshot = await adminDb.collection('webhooks').where('formId', '==', formId).where('active', '==', true).count().get();
        return snapshot.data().count;
    } catch (error) {
        console.error(`Error counting active webhooks for ${formId}:`, error);
        return 0;
    }
}

const formToPageMap = new Map<string, string[]>();
pages.forEach(page => {
    page.forms.forEach(formId => {
        if (!formToPageMap.has(formId)) {
            formToPageMap.set(formId, []);
        }
        formToPageMap.get(formId)!.push(page.name);
    });
});

export async function getFormStats(): Promise<FormStats[]> {
    if (!adminDb) {
        console.error('Firebase is not configured.');
        return [];
    }

    try {
        const statsPromises = forms.map(async (form) => {
            const [leadCount, webhookCount] = await Promise.all([
                getSubmissionCount(form.id),
                getActiveWebhookCount(form.id)
            ]);
            
            const pageNames = formToPageMap.get(form.id) || ['N/A'];

            return {
                id: form.id,
                name: form.name,
                description: form.description,
                pageName: pageNames.join(', '),
                leadCount,
                webhookCount,
            };
        });

        const allStats = await Promise.all(statsPromises);
        return allStats as FormStats[];

    } catch (error) {
        console.error('Error fetching form stats:', error);
        return [];
    }
}
