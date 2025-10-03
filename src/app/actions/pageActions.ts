'use server';

import { pages } from '@/lib/pages';
import { forms } from '@/lib/forms';
import type { PageStats } from '@/lib/definitions';

export async function getPageStats(): Promise<PageStats[]> {
    const formMap = new Map(forms.map(f => [f.id, f.name]));
    
    const stats = pages.map(page => {
        const formNames = (page.forms || []).map(formId => formMap.get(formId) || 'Unknown Form');
        
        return {
            id: page.id,
            name: page.name,
            path: page.path,
            formNames: formNames,
        };
    });
    return stats;
}
