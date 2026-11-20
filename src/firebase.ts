import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signInAnonymously,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  reload,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  UserProfile,
  FarmRecord,
  CropAdvisoryHistoryRecord,
  AdvisoryLogRecord,
  AdvisoryCategory,
  Language
} from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration: the client is offline.');
    }
  }
}
testConnection();

function clampString(val: unknown, maxLen: number, fallback = ''): string {
  const str = typeof val === 'string' ? val.trim() : fallback;
  return str.slice(0, maxLen);
}

function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function normalizeLanguage(lang: unknown): Language {
  if (lang === 'kn' || lang === 'hi' || lang === 'ta' || lang === 'te' || lang === 'mr') {
    return lang;
  }
  return 'en';
}



// --- Authentication methods ---
export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function registerWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await sendEmailVerification(result.user);
  return result.user;
}

export async function resendVerificationEmail(user: FirebaseUser): Promise<void> {
  await sendEmailVerification(user);
}

export async function refreshCurrentUser(user: FirebaseUser): Promise<FirebaseUser> {
  await reload(user);
  return auth.currentUser ?? user;
}

export async function signInAsGuest(): Promise<FirebaseUser> {
  const result = await signInAnonymously(auth);
  return result.user;
}

export function createPhoneRecaptcha(containerId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => undefined,
    'expired-callback': () => {
      console.warn('Phone verification challenge expired. Please try again.');
    },
  });
}

export async function requestPhoneOtp(
  phoneNumber: string,
  verifier: RecaptchaVerifier
) {
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logoutFarmer(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuth(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// --- Farmer Profile Operations ---

export async function getFarmerProfile(uid: string): Promise<UserProfile | null> {
  const path = `farmers/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'farmers', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeFarmerProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = `farmers/${uid}`;
  return onSnapshot(
    doc(db, 'farmers', uid),
    (snap) => {
      onData(snap.exists() ? (snap.data() as UserProfile) : null);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );
}

export async function createFarmerProfile(
  uid: string,
  input: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const path = `farmers/${uid}`;
  const payload = {
    uid,
    name: clampString(input.name, 100, 'Farmer') || 'Farmer',
    email: clampString(input.email, 150, 'farmer@example.com'),
    mobile: clampString(input.mobile, 20, ''),
    village: clampString(input.village, 120, ''),
    district: clampString(input.district, 80, ''),
    state: clampString(input.state, 80, ''),
    landArea: clampNumber(input.landArea, 0, 100000, 1),
    preferredLanguage: normalizeLanguage(input.preferredLanguage),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'farmers', uid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateFarmerProfile(
  uid: string,
  input: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const path = `farmers/${uid}`;
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (input.name !== undefined) payload.name = clampString(input.name, 100, 'Farmer') || 'Farmer';
  if (input.email !== undefined) payload.email = clampString(input.email, 150, 'farmer@example.com');
  if (input.mobile !== undefined) payload.mobile = clampString(input.mobile, 20, '');
  if (input.village !== undefined) payload.village = clampString(input.village, 120, '');
  if (input.district !== undefined) payload.district = clampString(input.district, 80, '');
  if (input.state !== undefined) payload.state = clampString(input.state, 80, '');
  if (input.landArea !== undefined) payload.landArea = clampNumber(input.landArea, 0, 100000, 1);
  if (input.preferredLanguage !== undefined) {
    payload.preferredLanguage = normalizeLanguage(input.preferredLanguage);
  }

  try {
    await updateDoc(doc(db, 'farmers', uid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// --- Farm Plot Operations ---

export function subscribeFarms(
  uid: string,
  onData: (farms: FarmRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = `farmers/${uid}/farms`;
  const q = query(collection(db, 'farmers', uid, 'farms'), where('ownerId', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: FarmRecord[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FarmRecord, 'id'>),
      }));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );
}

export async function addFarmPlot(
  uid: string,
  input: Omit<FarmRecord, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const path = `farmers/${uid}/farms`;
  const validStatuses: FarmRecord['status'][] = ['Growing', 'Ready for Harvest', 'Planted', 'Fallow'];
  const status = validStatuses.includes(input.status) ? input.status : 'Growing';

  const payload = {
    ownerId: uid,
    farmName: clampString(input.farmName, 100, 'My Farm Plot') || 'My Farm Plot',
    location: clampString(input.location, 120, 'Karnataka') || 'Karnataka',
    landArea: clampNumber(input.landArea, 0.1, 100000, 1),
    soilType: clampString(input.soilType, 80, 'Red Loamy Soil') || 'Red Loamy Soil',
    cropsPlanted: clampString(input.cropsPlanted, 120, 'Finger Millet (Ragi)') || 'Finger Millet (Ragi)',
    plantingDate: clampString(input.plantingDate, 30, '2026-06-15') || '2026-06-15',
    expectedHarvestDate: clampString(input.expectedHarvestDate, 30, '2026-11-20') || '2026-11-20',
    status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const ref = await addDoc(collection(db, 'farmers', uid, 'farms'), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateFarmStatus(
  uid: string,
  farmId: string,
  status: FarmRecord['status']
): Promise<void> {
  const path = `farmers/${uid}/farms/${farmId}`;
  try {
    await updateDoc(doc(db, 'farmers', uid, 'farms', farmId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFarmPlot(uid: string, farmId: string): Promise<void> {
  const path = `farmers/${uid}/farms/${farmId}`;
  try {
    await deleteDoc(doc(db, 'farmers', uid, 'farms', farmId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Crop Advisory History Operations ---

export function subscribeCropHistory(
  uid: string,
  onData: (items: CropAdvisoryHistoryRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = `farmers/${uid}/cropHistory`;
  const q = query(collection(db, 'farmers', uid, 'cropHistory'), where('ownerId', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: CropAdvisoryHistoryRecord[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CropAdvisoryHistoryRecord, 'id'>),
        }))
        .sort((a, b) => {
          const aSec = (a.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
          const bSec = (b.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
          return bSec - aSec;
        });
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );
}

export async function saveCropHistory(
  uid: string,
  input: Omit<CropAdvisoryHistoryRecord, 'id' | 'ownerId' | 'createdAt'>
): Promise<string> {
  const path = `farmers/${uid}/cropHistory`;
  const season = input.season === 'Rabi' || input.season === 'Zaid' ? input.season : 'Kharif';
  const availableWater =
    input.availableWater === 'High' || input.availableWater === 'Low' ? input.availableWater : 'Medium';

  const payload = {
    ownerId: uid,
    nitrogen: clampNumber(input.nitrogen, 0, 1000, 60),
    phosphorus: clampNumber(input.phosphorus, 0, 1000, 45),
    potassium: clampNumber(input.potassium, 0, 1000, 40),
    ph: clampNumber(input.ph, 0, 14, 6.5),
    temperature: clampNumber(input.temperature, -50, 70, 28),
    rainfall: clampNumber(input.rainfall, 0, 20000, 850),
    location: clampString(input.location, 120, 'Mandya') || 'Mandya',
    season,
    availableWater,
    landSize: clampNumber(input.landSize, 0, 100000, 2),
    bestCropName: clampString(input.bestCropName, 120, 'Finger Millet / Ragi') || 'Finger Millet / Ragi',
    suitabilityScore: clampNumber(input.suitabilityScore, 0, 100, 90),
    soilAnalysisNotes: clampString(input.soilAnalysisNotes, 500, ''),
    createdAt: serverTimestamp(),
  };

  try {
    const ref = await addDoc(collection(db, 'farmers', uid, 'cropHistory'), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteCropHistory(uid: string, historyId: string): Promise<void> {
  const path = `farmers/${uid}/cropHistory/${historyId}`;
  try {
    await deleteDoc(doc(db, 'farmers', uid, 'cropHistory', historyId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Unified Farmer Advisory History Operations ---

export function subscribeAdvisoryLogs(
  uid: string,
  onData: (items: AdvisoryLogRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = `farmers/${uid}/advisoryLogs`;
  const q = query(collection(db, 'farmers', uid, 'advisoryLogs'), where('ownerId', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: AdvisoryLogRecord[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AdvisoryLogRecord, 'id'>),
        }))
        .sort((a, b) => {
          const aSec = (a.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
          const bSec = (b.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
          return bSec - aSec;
        });
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );
}

export async function saveAdvisoryLog(
  uid: string,
  input: {
    category: AdvisoryCategory;
    cropName?: string;
    title: string;
    summary: string;
    metricLabel?: string;
    language: Language;
  }
): Promise<string> {
  const path = `farmers/${uid}/advisoryLogs`;
  const validCategories: AdvisoryCategory[] = ['crop', 'disease', 'irrigation', 'fertilizer', 'voice'];
  const category = validCategories.includes(input.category) ? input.category : 'crop';

  const payload = {
    ownerId: uid,
    category,
    cropName: clampString(input.cropName, 120, ''),
    title: clampString(input.title, 140, 'Advisory Record') || 'Advisory Record',
    summary: clampString(input.summary, 600, 'Saved advisory') || 'Saved advisory',
    metricLabel: clampString(input.metricLabel, 80, ''),
    language: normalizeLanguage(input.language),
    createdAt: serverTimestamp(),
  };

  try {
    const ref = await addDoc(collection(db, 'farmers', uid, 'advisoryLogs'), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteAdvisoryLog(uid: string, logId: string): Promise<void> {
  const path = `farmers/${uid}/advisoryLogs/${logId}`;
  try {
    await deleteDoc(doc(db, 'farmers', uid, 'advisoryLogs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
