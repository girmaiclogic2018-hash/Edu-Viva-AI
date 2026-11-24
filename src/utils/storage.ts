import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, UserRole, LanguageCode, SyncStatusInfo, SyncState } from '../types';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '../lib/firebase';
import {
  CloudCheck,
  CloudUpload,
  CloudOff,
  CloudAlert,
  RefreshCw,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';

/**
 * Storage Schema Version Control
 */
export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Explicitly Separated Storage Keys
 */
export const STORAGE_KEY_AUTH_USER = 'eduviva_auth_user_v2';
export const STORAGE_KEY_GUEST_USER = 'eduviva_guest_demo_user_v2';
export const STORAGE_KEY_LEGACY_USER = 'eduviva_user';

/**
 * Versioned Storage Envelope Interface
 */
export interface VersionedStorageEnvelope<T> {
  schemaVersion: number;
  profileType: 'authenticated' | 'demo_guest';
  createdAt: string;
  updatedAt: string;
  payload: T;
  checksum?: string;
}

export const DEFAULT_DEMO_USER: UserProfile = {
  id: 'demo-usr-admin-001',
  name: 'Girma Haile (Demo Profile)',
  email: 'girmahb1979@gmail.com',
  role: 'admin',
  gradeLevel: 'Grade 10 & Pilot Admin',
  language: 'en',
  subjects: ['Mathematics', 'Science', 'English Literacy', 'Digital AI'],
  learningGoals: ['Deploy offline AI kiosks across Ethiopia', 'Master advanced Socratic tutoring'],
  accessibility: {
    highContrast: false,
    largeText: false,
    screenReaderOptimized: false,
  },
  streakDays: 30,
  completedLessons: ['les-sci-1', 'les-math-1'],
  offlineDownloadedModules: ['les-sci-1', 'les-math-1'],
  isDemo: true, // Explicitly marks guest/demo profile
  diagnosticLevel: 'Developing',
  lastSyncedAt: new Date().toISOString(),
};

export const CLEAN_STUDENT_USER: UserProfile = {
  id: 'usr-student-001',
  name: 'New Learner',
  email: 'learner@eduviva.org',
  role: 'student',
  gradeLevel: 'Grade 8',
  language: 'en',
  subjects: ['Mathematics', 'Science', 'English Literacy'],
  learningGoals: ['Improve core subject foundations', 'Prepare for diagnostic exams'],
  accessibility: {
    highContrast: false,
    largeText: false,
    screenReaderOptimized: false,
  },
  streakDays: 0,
  completedLessons: [],
  offlineDownloadedModules: [],
  isDemo: false, // Real active student profile
  diagnosticLevel: 'Not Assessed',
  lastSyncedAt: new Date().toISOString(),
};

/**
 * Sanitizes a string to prevent XSS or malformed inputs
 */
function sanitizeString(str: unknown, fallback = ''): string {
  if (typeof str !== 'string') return fallback;
  return str.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Validates whether an email string looks reasonably formed
 */
function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Computes a lightweight checksum to detect corrupted snapshots
 */
function computeChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `chk_${Math.abs(hash).toString(36)}`;
}

/**
 * Validates and sanitizes a raw profile object into a reliable UserProfile
 */
export function sanitizeUserProfile(raw: unknown, defaultFallback: UserProfile = DEFAULT_DEMO_USER): UserProfile {
  if (!raw || typeof raw !== 'object') {
    return { ...defaultFallback };
  }

  const obj = raw as Record<string, unknown>;

  const id = sanitizeString(obj.id, defaultFallback.id);
  const name = sanitizeString(obj.name, defaultFallback.name);
  const email = isValidEmail(obj.email) ? String(obj.email).trim() : defaultFallback.email;

  const validRoles: UserRole[] = ['student', 'teacher', 'admin'];
  const role = validRoles.includes(obj.role as UserRole) ? (obj.role as UserRole) : defaultFallback.role;

  const gradeLevel = sanitizeString(obj.gradeLevel, defaultFallback.gradeLevel);

  const validLanguages: LanguageCode[] = ['en', 'am', 'om', 'so'];
  const language = validLanguages.includes(obj.language as LanguageCode)
    ? (obj.language as LanguageCode)
    : defaultFallback.language;

  const subjects = Array.isArray(obj.subjects)
    ? obj.subjects.map(s => sanitizeString(s)).filter(Boolean)
    : defaultFallback.subjects;

  const learningGoals = Array.isArray(obj.learningGoals)
    ? obj.learningGoals.map(g => sanitizeString(g)).filter(Boolean)
    : defaultFallback.learningGoals;

  const accObj = (typeof obj.accessibility === 'object' && obj.accessibility !== null)
    ? (obj.accessibility as Record<string, unknown>)
    : {};

  const accessibility = {
    highContrast: typeof accObj.highContrast === 'boolean' ? accObj.highContrast : defaultFallback.accessibility.highContrast,
    largeText: typeof accObj.largeText === 'boolean' ? accObj.largeText : defaultFallback.accessibility.largeText,
    screenReaderOptimized: typeof accObj.screenReaderOptimized === 'boolean' ? accObj.screenReaderOptimized : defaultFallback.accessibility.screenReaderOptimized,
  };

  const streakDays = typeof obj.streakDays === 'number' && !isNaN(obj.streakDays) && obj.streakDays >= 0
    ? Math.floor(obj.streakDays)
    : defaultFallback.streakDays;

  const completedLessons = Array.isArray(obj.completedLessons)
    ? obj.completedLessons.map(l => sanitizeString(l)).filter(Boolean)
    : defaultFallback.completedLessons;

  const offlineDownloadedModules = Array.isArray(obj.offlineDownloadedModules)
    ? obj.offlineDownloadedModules.map(m => sanitizeString(m)).filter(Boolean)
    : defaultFallback.offlineDownloadedModules;

  const isDemo = typeof obj.isDemo === 'boolean' ? obj.isDemo : defaultFallback.isDemo;
  const diagnosticLevel = sanitizeString(obj.diagnosticLevel, defaultFallback.diagnosticLevel || 'Not Assessed');

  let assessmentScores: Record<string, number> | undefined = undefined;
  if (obj.assessmentScores && typeof obj.assessmentScores === 'object' && !Array.isArray(obj.assessmentScores)) {
    assessmentScores = {};
    for (const [key, val] of Object.entries(obj.assessmentScores as Record<string, unknown>)) {
      if (typeof val === 'number' && !isNaN(val)) {
        assessmentScores[key] = val;
      }
    }
  }

  const lastSyncedAt = sanitizeString(obj.lastSyncedAt, new Date().toISOString());

  return {
    id,
    name,
    email,
    role,
    gradeLevel,
    language,
    subjects,
    learningGoals,
    accessibility,
    streakDays,
    completedLessons,
    offlineDownloadedModules,
    isDemo,
    diagnosticLevel,
    assessmentScores,
    lastSyncedAt,
  };
}

/**
 * Creates a versioned storage envelope with schema timestamp and checksum
 */
export function createEnvelope<T>(payload: T, profileType: 'authenticated' | 'demo_guest'): VersionedStorageEnvelope<T> {
  const serialized = JSON.stringify(payload);
  const now = new Date().toISOString();
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profileType,
    createdAt: now,
    updatedAt: now,
    payload,
    checksum: computeChecksum(serialized),
  };
}

/**
 * Validates a storage envelope's integrity and schema compatibility
 */
export function validateEnvelope(rawEnvelope: unknown, expectedType: 'authenticated' | 'demo_guest'): VersionedStorageEnvelope<UserProfile> | null {
  if (!rawEnvelope || typeof rawEnvelope !== 'object') {
    return null;
  }

  const env = rawEnvelope as Record<string, unknown>;

  if (env.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    return null;
  }

  if (env.profileType !== expectedType) {
    return null;
  }

  if (!env.payload || typeof env.payload !== 'object') {
    return null;
  }

  const payloadStr = JSON.stringify(env.payload);
  const computed = computeChecksum(payloadStr);

  if (env.checksum && env.checksum !== computed) {
    console.warn(`[EDUVIVA Storage] Checksum mismatch in ${expectedType} envelope. Expected: ${env.checksum}, Computed: ${computed}`);
  }

  const sanitized = sanitizeUserProfile(env.payload);

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profileType: expectedType,
    createdAt: sanitizeString(env.createdAt, new Date().toISOString()),
    updatedAt: sanitizeString(env.updatedAt, new Date().toISOString()),
    payload: sanitized,
    checksum: computed,
  };
}

/**
 * Migrates legacy unversioned storage key into versioned partition
 */
export function migrateLegacyStorage(): UserProfile | null {
  try {
    const legacyRaw = localStorage.getItem(STORAGE_KEY_LEGACY_USER);
    if (!legacyRaw) return null;

    const parsed = JSON.parse(legacyRaw);
    if (!parsed || typeof parsed !== 'object') {
      localStorage.removeItem(STORAGE_KEY_LEGACY_USER);
      return null;
    }

    const sanitized = sanitizeUserProfile(parsed);
    const isDemo = Boolean(sanitized.isDemo);

    if (isDemo) {
      const envelope = createEnvelope(sanitized, 'demo_guest');
      localStorage.setItem(STORAGE_KEY_GUEST_USER, JSON.stringify(envelope));
    } else {
      const envelope = createEnvelope(sanitized, 'authenticated');
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(envelope));
    }

    localStorage.removeItem(STORAGE_KEY_LEGACY_USER);
    console.info(`[EDUVIVA Storage] Successfully migrated legacy profile to ${isDemo ? 'guest' : 'auth'} partition.`);
    return sanitized;
  } catch (err) {
    console.warn('[EDUVIVA Storage] Failed to migrate legacy storage:', err);
    try {
      localStorage.removeItem(STORAGE_KEY_LEGACY_USER);
    } catch {
      // Ignore
    }
    return null;
  }
}

/**
 * Loads the user profile following the strict hierarchy:
 * 1. Authenticated User Profile (STORAGE_KEY_AUTH_USER)
 * 2. Legacy Migration Check (STORAGE_KEY_LEGACY_USER)
 * 3. Guest / Demo User Profile (STORAGE_KEY_GUEST_USER)
 * 4. Fallback Default Demo Profile
 */
export function loadStoredUser(): UserProfile {
  // Step 1: Check Authenticated User partition
  try {
    const authRaw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      const validEnvelope = validateEnvelope(parsed, 'authenticated');
      if (validEnvelope && validEnvelope.payload) {
        return validEnvelope.payload;
      }
      console.warn('[EDUVIVA Storage] Corrupt authenticated snapshot discarded.');
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    }
  } catch (err) {
    console.warn('[EDUVIVA Storage] Error reading authenticated user partition:', err);
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    } catch {
      // Ignore
    }
  }

  // Step 2: Check for Legacy unversioned storage to migrate
  const migrated = migrateLegacyStorage();
  if (migrated) {
    return migrated;
  }

  // Step 3: Check Guest / Demo partition
  try {
    const guestRaw = localStorage.getItem(STORAGE_KEY_GUEST_USER);
    if (guestRaw) {
      const parsed = JSON.parse(guestRaw);
      const validEnvelope = validateEnvelope(parsed, 'demo_guest');
      if (validEnvelope && validEnvelope.payload) {
        return validEnvelope.payload;
      }
      console.warn('[EDUVIVA Storage] Corrupt guest demo snapshot discarded.');
      localStorage.removeItem(STORAGE_KEY_GUEST_USER);
    }
  } catch (err) {
    console.warn('[EDUVIVA Storage] Error reading guest user partition:', err);
    try {
      localStorage.removeItem(STORAGE_KEY_GUEST_USER);
    } catch {
      // Ignore
    }
  }

  // Step 4: Fallback to default demo user
  return { ...DEFAULT_DEMO_USER };
}

/**
 * Global Listeners for Reactive Sync Status Broadcasting
 */
type SyncListener = (status: SyncStatusInfo) => void;
const syncListeners = new Set<SyncListener>();

let currentSyncStatus: SyncStatusInfo = {
  state: 'idle',
  lastSyncedAt: null,
  message: 'Initialized',
  isFirestoreLive: true,
};

function notifySyncListeners(status: SyncStatusInfo) {
  currentSyncStatus = status;
  syncListeners.forEach(listener => {
    try {
      listener(status);
    } catch (err) {
      console.error('[EDUVIVA Sync] Listener error:', err);
    }
  });
}

export function subscribeToSyncStatus(listener: SyncListener): () => void {
  syncListeners.add(listener);
  listener(currentSyncStatus);
  return () => {
    syncListeners.delete(listener);
  };
}

export function getCurrentSyncStatus(): SyncStatusInfo {
  return currentSyncStatus;
}

/**
 * Synchronizes user profile to remote Firestore instance
 */
export async function syncUserToFirestore(user: UserProfile): Promise<boolean> {
  const isBrowserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!isBrowserOnline) {
    notifySyncListeners({
      state: 'offline',
      lastSyncedAt: user.lastSyncedAt || null,
      message: 'Offline - Changes saved locally in offline partition',
      isFirestoreLive: false,
    });
    return false;
  }

  notifySyncListeners({
    state: 'syncing',
    lastSyncedAt: currentSyncStatus.lastSyncedAt,
    message: 'Syncing profile to Firestore...',
    isFirestoreLive: true,
  });

  try {
    const db = getFirebaseFirestore();
    const userDocRef = doc(db, 'users', user.id);

    const firestorePayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      gradeLevel: user.gradeLevel,
      language: user.language,
      subjects: user.subjects,
      learningGoals: user.learningGoals,
      accessibility: user.accessibility,
      streakDays: user.streakDays,
      completedLessons: user.completedLessons,
      offlineDownloadedModules: user.offlineDownloadedModules,
      isDemo: Boolean(user.isDemo),
      diagnosticLevel: user.diagnosticLevel || 'Not Assessed',
      assessmentScores: user.assessmentScores || {},
      lastSyncedAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userDocRef, firestorePayload, { merge: true });

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    notifySyncListeners({
      state: 'synced',
      lastSyncedAt: nowTime,
      message: `Synced to cloud at ${nowTime}`,
      isFirestoreLive: true,
    });
    return true;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn('[EDUVIVA Storage] Remote Firestore sync warning:', errorMessage);

    notifySyncListeners({
      state: 'error',
      lastSyncedAt: currentSyncStatus.lastSyncedAt,
      error: errorMessage,
      message: 'Cloud sync pending - local cache intact',
      isFirestoreLive: false,
    });
    return false;
  }
}

/**
 * Debounced Remote Firestore Auto-Save Trigger
 */
let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Safely saves the user profile into the appropriate partitioned storage key
 * and triggers debounced remote synchronization with Firestore.
 */
export function saveStoredUser(user: UserProfile, syncRemote: boolean = true): void {
  try {
    const isDemo = Boolean(user.isDemo);

    if (isDemo) {
      // Guest / Demo Partition
      const envelope = createEnvelope(user, 'demo_guest');
      localStorage.setItem(STORAGE_KEY_GUEST_USER, JSON.stringify(envelope));
    } else {
      // Authenticated User Partition
      const envelope = createEnvelope(user, 'authenticated');
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(envelope));
    }

    if (syncRemote) {
      if (syncDebounceTimer) {
        clearTimeout(syncDebounceTimer);
      }
      syncDebounceTimer = setTimeout(() => {
        syncUserToFirestore(user);
      }, 800); // 800ms debounce to batch rapid UI changes
    }
  } catch (err) {
    console.warn('[EDUVIVA Storage] Failed to save user profile to localStorage:', err);
  }
}

/**
 * Fetches remote profile from Firestore if available
 */
export async function fetchRemoteUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const db = getFirebaseFirestore();
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      return sanitizeUserProfile(data);
    }
    return null;
  } catch (err) {
    console.warn('[EDUVIVA Storage] Failed to fetch remote profile from Firestore:', err);
    return null;
  }
}

/**
 * Clears stored user data from both authenticated and guest storage partitions
 */
export function clearStoredUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    localStorage.removeItem(STORAGE_KEY_GUEST_USER);
    localStorage.removeItem(STORAGE_KEY_LEGACY_USER);
    console.info('[EDUVIVA Storage] All user storage partitions cleared.');
  } catch (err) {
    console.warn('[EDUVIVA Storage] Failed to clear user profiles:', err);
  }
}

/**
 * Clears only the authenticated user session
 */
export function clearAuthUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
  } catch (err) {
    console.warn('[EDUVIVA Storage] Failed to clear auth user:', err);
  }
}

/**
 * Clears only the guest/demo user session
 */
export function clearGuestUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_GUEST_USER);
  } catch (err) {
    console.warn('[EDUVIVA Storage] Failed to clear guest user:', err);
  }
}

/**
 * React Hook for watching and controlling Cloud Sync status
 */
export function useFirestoreSync(currentUser?: UserProfile) {
  const [syncStatus, setSyncStatus] = useState<SyncStatusInfo>(getCurrentSyncStatus);
  const userRef = useRef<UserProfile | undefined>(currentUser);
  userRef.current = currentUser;

  useEffect(() => {
    const unsubscribe = subscribeToSyncStatus((status) => {
      setSyncStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const triggerManualSync = useCallback(async () => {
    if (userRef.current) {
      await syncUserToFirestore(userRef.current);
    }
  }, []);

  return {
    syncStatus,
    triggerManualSync,
    isSyncing: syncStatus.state === 'syncing',
    isSynced: syncStatus.state === 'synced',
    isOffline: syncStatus.state === 'offline',
    isError: syncStatus.state === 'error',
  };
}

/**
 * Props for the Visual Sync Indicator Component
 */
export interface SyncStatusIndicatorProps {
  user?: UserProfile;
  className?: string;
  showText?: boolean;
  onManualSync?: () => void;
}

/**
 * Visual Sync Status Indicator Component
 * Displays live auto-save and Firestore sync status badge with animation and retry actions.
 */
export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  user,
  className = '',
  showText = true,
  onManualSync,
}) => {
  const { syncStatus, triggerManualSync } = useFirestoreSync(user);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleSyncClick = () => {
    if (onManualSync) {
      onManualSync();
    } else if (user) {
      triggerManualSync();
    }
  };

  const getStatusDisplay = () => {
    switch (syncStatus.state) {
      case 'syncing':
        return {
          icon: React.createElement(RefreshCw, { className: 'w-3.5 h-3.5 text-blue-600 animate-spin' }),
          bgColor: 'bg-blue-50 border-blue-200 text-blue-800',
          dotColor: 'bg-blue-500 animate-ping',
          label: 'Saving to Cloud...',
          tooltip: 'Synchronizing changes with Firestore database.',
        };
      case 'synced':
        return {
          icon: React.createElement(Check, { className: 'w-3.5 h-3.5 text-emerald-600' }),
          bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dotColor: 'bg-emerald-500',
          label: syncStatus.lastSyncedAt ? `Saved ${syncStatus.lastSyncedAt}` : 'Saved to Cloud',
          tooltip: `All profile updates are securely saved in remote Firestore. (Last sync: ${syncStatus.lastSyncedAt || 'just now'})`,
        };
      case 'offline':
        return {
          icon: React.createElement(CloudOff, { className: 'w-3.5 h-3.5 text-amber-600' }),
          bgColor: 'bg-amber-50 border-amber-200 text-amber-800',
          dotColor: 'bg-amber-500',
          label: 'Offline (Local Save)',
          tooltip: 'Offline mode is active. Changes are safely saved locally and will auto-sync when online.',
        };
      case 'error':
        return {
          icon: React.createElement(AlertCircle, { className: 'w-3.5 h-3.5 text-rose-600' }),
          bgColor: 'bg-rose-50 border-rose-200 text-rose-800',
          dotColor: 'bg-rose-500',
          label: 'Sync Pending (Retry)',
          tooltip: syncStatus.error || 'Failed to sync with Firestore. Data is safe in local storage.',
        };
      case 'idle':
      default:
        return {
          icon: React.createElement(Check, { className: 'w-3.5 h-3.5 text-slate-500' }),
          bgColor: 'bg-slate-50 border-slate-200 text-slate-700',
          dotColor: 'bg-slate-400',
          label: 'Cloud Sync Ready',
          tooltip: 'Firestore auto-save is active for user profile changes.',
        };
    }
  };

  const current = getStatusDisplay();

  return React.createElement(
    'div',
    { className: `relative inline-flex items-center ${className}` },
    React.createElement(
      'button',
      {
        type: 'button',
        onClick: handleSyncClick,
        onMouseEnter: () => setIsTooltipOpen(true),
        onMouseLeave: () => setIsTooltipOpen(false),
        className: `flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 ${current.bgColor}`,
        title: current.tooltip,
      },
      current.icon,
      showText ? React.createElement('span', { className: 'truncate max-w-[130px]' }, current.label) : null,
      React.createElement('span', { className: `w-1.5 h-1.5 rounded-full ${current.dotColor}` })
    )
  );
};
