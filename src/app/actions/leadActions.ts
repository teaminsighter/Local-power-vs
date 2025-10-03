'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Lead } from '@/lib/definitions';
import { forms } from '@/lib/forms';

/**
 * Fetches all leads (form submissions) from Firestore.
 */
export async function getLeads(): Promise<Lead[]> {
    if (!adminDb) {
        console.error('Firebase is not configured.');
        return [];
    }
    try {
        const submissionsRef = adminDb.collection('submissions');
        const querySnapshot = await submissionsRef.orderBy('submittedAt', 'desc').get();

        const formMap = new Map(forms.map(f => [f.id, f.name]));

        const leads = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const { formId, submittedAt, ...formData } = data;
            return {
                id: doc.id,
                formId: formId,
                formName: formMap.get(formId) || 'Unknown Form',
                submittedAt: submittedAt,
                data: formData,
            };
        });
        
        return leads as Lead[];
    } catch (error) {
        console.error('Error fetching leads:', error);
        return [];
    }
}
