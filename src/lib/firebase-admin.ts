// Mock Firebase Admin SDK for development
// This allows the landing page to work without requiring Firebase setup

// Mock interfaces to match Firebase Admin SDK
interface MockAuth {
  verifyIdToken: (token: string) => Promise<any>;
}

interface MockFirestore {
  collection: (name: string) => MockCollection;
}

interface MockCollection {
  add: (data: any) => Promise<MockDocRef>;
  doc: (id: string) => MockDocRef;
}

interface MockDocRef {
  set: (data: any) => Promise<void>;
  get: () => Promise<MockDocSnap>;
}

interface MockDocSnap {
  exists: boolean;
  data: () => any;
}

// Mock implementations
const mockAuth: MockAuth = {
  verifyIdToken: async (_token: string) => {
    console.log('[Mock] Firebase Auth - verifyIdToken called');
    return { uid: 'mock-user-id', email: 'mock@example.com' };
  }
};

const mockFirestore: MockFirestore = {
  collection: (name: string) => ({
    add: async (data: any) => {
      console.log(`[Mock] Firestore - Adding to collection '${name}':`, data);
      return {
        id: 'mock-doc-id',
        set: async () => {},
        get: async () => ({ exists: true, data: () => ({}) })
      } as MockDocRef;
    },
    doc: (id: string) => ({
      set: async (data: any) => {
        console.log(`[Mock] Firestore - Setting document '${id}':`, data);
      },
      get: async () => ({
        exists: true,
        data: () => ({ mockData: true })
      } as MockDocSnap)
    } as MockDocRef)
  } as MockCollection)
};

// Export mock instances
export const auth = mockAuth;
export const adminDb = mockFirestore;

// Log that we're using mock implementations
console.log('[Mock] Using Firebase Admin SDK mock implementations');