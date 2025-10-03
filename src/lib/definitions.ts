// Type for a single lead/submission record
export interface Lead {
    id: string;
    formId: string;
    formName: string;
    submittedAt: string;
    data: Record<string, any>;
}

// Type for webhook data stored in Firestore
export interface WebhookData {
    formId: string;
    url: string;
    active: boolean;
}

// Type for a full webhook object including its ID
export interface Webhook extends WebhookData {
    id: string;
}

// Type for GTM script data stored in Firestore
export interface GtmScriptData {
    pagePath: string;
    name: string;
    content: string;
}

// Type for a full GTM script object including its ID
export interface GtmScript extends GtmScriptData {
    id: string;
}

// Type for the combined form statistics
export interface FormStats {
    id: string;
    name: string;
    description: string;
    pageName: string;
    leadCount: number;
    webhookCount: number;
}

// Type for page statistics
export interface PageStats {
    id: string;
    name: string;
    path: string;
    formNames: string[];
}
