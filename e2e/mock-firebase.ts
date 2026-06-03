// e2e/mock-firebase.ts

// --- Mock Firebase App ---
const mockApp = {
  name: 'mock-app',
  options: {},
  auth: () => mockAuth,
  firestore: () => mockFirestore,
  storage: () => mockStorage,
  functions: () => mockFunctions,
};

export const initializeApp = () => mockApp;
export const getApps = () => [mockApp];
export const getApp = () => mockApp;
export default mockApp; // Default export for the app module

// --- Mock Firebase Auth ---
const mockAuth = {
  currentUser: { uid: 'mock-user-id', email: 'mock@example.com', displayName: 'Mock User', photoURL: 'https://example.com/photo.jpg', emailVerified: true },
  onAuthStateChanged: (callback: (user: any) => void) => {
    callback(mockAuth.currentUser);
    return () => {}; // Unsubscribe function
  },
  signInWithPopup: async () => ({ user: mockAuth.currentUser }),
  signInWithEmailAndPassword: async () => ({ user: mockAuth.currentUser }),
  createUserWithEmailAndPassword: async () => ({ user: mockAuth.currentUser }),
  sendPasswordResetEmail: async () => {},
  sendEmailVerification: async () => {},
  updateProfile: async () => {},
  signOut: async () => {},
  deleteUser: async () => {}, // Mock deleteUser
};

export const getAuth = () => mockAuth;
export class GoogleAuthProvider {
  setCustomParameters() {}
  addScope() {}
}

// Export all individual functions that are imported from 'firebase/auth'
export const onAuthStateChanged = mockAuth.onAuthStateChanged;
export const signInWithPopup = mockAuth.signInWithPopup;
export const signInWithEmailAndPassword = mockAuth.signInWithEmailAndPassword;
export const createUserWithEmailAndPassword = mockAuth.createUserWithEmailAndPassword;
export const sendPasswordResetEmail = mockAuth.sendPasswordResetEmail;
export const sendEmailVerification = mockAuth.sendEmailVerification;
export const updateProfile = mockAuth.updateProfile;
export const signOut = mockAuth.signOut;
export const deleteUser = mockAuth.deleteUser;


// --- Mock Firebase Firestore ---
const mockFirestore = {
  doc: () => ({}),
  getDoc: async () => ({
    exists: () => true,
    data: () => ({
      uid: 'mock-user-id',
      email: 'mock@example.com',
      displayName: 'Mock User',
      onboardingComplete: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      notificationPrefs: { serviceUpdates: true, availabilityReminders: true, announcements: true, system: true, reminderTiming: '24h' },
      id: 'mock-choir-id',
      name: 'Mock Choir',
      inviteCode: 'mock-invite',
      inviteExpiry: new Date(),
      ownerId: 'mock-user-id',
      memberCount: 1,
      licensing: { attested: true },
    }),
  }),
  setDoc: async () => {},
  collection: () => ({}),
  getDocs: async () => ({
    empty: false,
    docs: [
      {
        id: 'mock-member-id',
        data: () => ({
          uid: 'mock-member-id',
          displayName: 'Mock Member',
          email: 'member@example.com',
          role: 'member',
          voicePart: 'soprano',
          joinedAt: new Date(),
        }),
      },
    ],
  }),
  onSnapshot: () => () => {},
  serverTimestamp: () => ({ toDate: () => new Date() }), // Mock serverTimestamp
  deleteDoc: async () => {}, // Mock deleteDoc
  query: () => ({}), // Mock query
  orderBy: () => ({}), // Mock orderBy
  limit: () => ({}), // Mock limit
  updateDoc: async () => {}, // Mock updateDoc
  where: () => ({}), // Mock where
  writeBatch: () => ({ // Mock writeBatch
    set: () => {},
    update: () => {},
    delete: () => {},
    commit: async () => {},
  }),
};

export const getFirestore = () => mockFirestore;

// Export all individual functions that are imported from 'firebase/firestore'
export const doc = mockFirestore.doc;
export const getDoc = mockFirestore.getDoc;
export const setDoc = mockFirestore.setDoc;
export const collection = mockFirestore.collection;
export const getDocs = mockFirestore.getDocs;
export const onSnapshot = mockFirestore.onSnapshot;
export const serverTimestamp = mockFirestore.serverTimestamp;
export const deleteDoc = mockFirestore.deleteDoc;
export const query = mockFirestore.query;
export const orderBy = mockFirestore.orderBy;
export const limit = mockFirestore.limit;
export const updateDoc = mockFirestore.updateDoc;
export const where = mockFirestore.where;
export const writeBatch = mockFirestore.writeBatch;

export type PartialWithFieldValue<T> = Partial<T>; // Dummy type for mocking


// --- Mock Firebase Storage ---
const mockStorage = {
  ref: () => ({}), // Mock ref function
  uploadBytes: async () => ({ ref: {} }), // Mock uploadBytes
  getDownloadURL: async () => 'https://example.com/mock-download-url', // Mock getDownloadURL
};
export const getStorage = () => mockStorage;

// Export all individual functions that are imported from 'firebase/storage'
export const ref = mockStorage.ref;
export const uploadBytes = mockStorage.uploadBytes;
export const getDownloadURL = mockStorage.getDownloadURL;


// --- Mock Firebase Functions ---
const mockFunctions = {
  httpsCallable: () => async () => ({ data: {} }), // Mock httpsCallable
};
export const getFunctions = () => mockFunctions;

// Export all individual functions that are imported from 'firebase/functions'
export const httpsCallable = mockFunctions.httpsCallable;
