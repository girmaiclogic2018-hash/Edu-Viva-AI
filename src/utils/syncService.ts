import { useState, useEffect, useCallback, useRef } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  FirestoreError,
  Unsubscribe
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../lib/firebase';
import { UserProfile, UserProgress, LearningRescueInfo } from '../types';
import {
  saveStoredUser,
  loadStoredUser,
  sanitizeUserProfile,
  DEFAULT_DEMO_USER,
  STORAGE_KEY_AUTH_USER,
  STORAGE_KEY_GUEST_USER
} from './storage';
import {
  getUserProgress,
  createUserProgress,
  updateUserProgress,
  sanitizeUserProgress,
  createDefaultUserProgress
} from './firebase';

/**
 * Storage Keys for Unified Sync Engine
 */
export const STORAGE_KEY_SYNC_QUEUE = 'eduviva_pending_sync_queue_v2';
export const STORAGE_KEY_LAST_SYNC = 'eduviva_last_cloud_sync_timestamp_v2';

export type SyncStateMode = 'idle' | 'syncing' | 'synced' | 'offline' | 'queued' | 'error';

/**
 * Interface for Offline Pending Sync Queue Items
 */
export interface PendingSyncItem {
  id: string;
  userId: string;
  type: 'profile_update' | 'progress_update' | 'lesson_completed' | 'assessment_recorded' | 'full_sync';
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
}

/**
 * Comprehensive Unified Sync Status Interface
 */
export interface UnifiedSyncState {
  mode: SyncStateMode;
  isOnline: boolean;
  isFirestoreConnected: boolean;
  pendingQueueCount: number;
  lastSyncedTimestamp: string | null;
  errorMessage: string | null;
  activeUserId: string | null;
}

/**
 * Result returned by the Login / Session Synchronization flow
 */
export interface LoginSyncResult {
  user: UserProfile;
  progress: UserProgress | null;
  source: 'cloud_fetched' | 'cloud_merged' | 'local_fallback';
  syncedAt: string;
}

/**
 * Global In-Memory State
 */
let currentUnifiedState: UnifiedSyncState = {
  mode: 'idle',
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isFirestoreConnected: true,
  pendingQueueCount: 0,
  lastSyncedTimestamp: null,
  errorMessage: null,
  activeUserId: null,
};

type SyncListener = (state: UnifiedSyncState) => void;
const syncListeners = new Set<SyncListener>();

function notifySyncListeners(updates: Partial<UnifiedSyncState>) {
  currentUnifiedState = { ...currentUnifiedState, ...updates };
  syncListeners.forEach((listener) => {
    try {
      listener(currentUnifiedState);
    } catch (err) {
      console.warn('[EDUVIVA SyncService] Listener error:', err);
    }
  });
}

/**
 * Subscribe to global sync service status changes
 */
export function subscribeSyncState(listener: SyncListener): () => void {
  syncListeners.add(listener);
  listener(currentUnifiedState);
  return () => {
    syncListeners.delete(listener);
  };
}

export function getUnifiedSyncState(): UnifiedSyncState {
  return currentUnifiedState;
}

/**
 * ============================================================================
 * OFFLINE PENDING QUEUE MANAGEMENT
 * ============================================================================
 */

export function getPendingSyncQueue(): PendingSyncItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SYNC_QUEUE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[EDUVIVA SyncService] Failed to read pending sync queue:', err);
    return [];
  }
}

export function savePendingSyncQueue(queue: PendingSyncItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SYNC_QUEUE, JSON.stringify(queue));
    notifySyncListeners({ pendingQueueCount: queue.length });
  } catch (err) {
    console.warn('[EDUVIVA SyncService] Failed to write pending sync queue:', err);
  }
}

export function enqueuePendingSync(
  userId: string,
  type: PendingSyncItem['type'],
  payload: Record<string, unknown>
): void {
  const queue = getPendingSyncQueue();
  const newItem: PendingSyncItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    type,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  queue.push(newItem);
  savePendingSyncQueue(queue);
  notifySyncListeners({
    mode: 'queued',
    pendingQueueCount: queue.length,
    errorMessage: 'Changes queued locally for automatic cloud push on reconnection.',
  });
}

export function clearPendingSyncQueue(userId?: string): void {
  if (!userId) {
    savePendingSyncQueue([]);
    return;
  }
  const queue = getPendingSyncQueue();
  const filtered = queue.filter((item) => item.userId !== userId);
  savePendingSyncQueue(filtered);
}

/**
 * ============================================================================
 * BIDIRECTIONAL DATA MERGING & RECONCILIATION
 * ============================================================================
 */

/**
 * Reconciles local and remote UserProfile instances with conflict resolution:
 * - Completed lessons & offline modules: Mathematical set union (prevents data loss)
 * - Streak days: Max value (never regress user's hard-earned streak)
 * - Assessment scores: Union with highest scores preserved
 * - Metadata & Preferences: Prefers newest timestamp or non-empty records
 */
export function reconcileUserProfile(local: UserProfile, remote: UserProfile | null): UserProfile {
  if (!remote) return { ...local };

  // 1. Merge completed lessons (Union of unique IDs)
  const completedSet = new Set([...(local.completedLessons || []), ...(remote.completedLessons || [])]);
  const mergedCompletedLessons = Array.from(completedSet);

  // 2. Merge offline downloaded modules (Union)
  const offlineSet = new Set([
    ...(local.offlineDownloadedModules || []),
    ...(remote.offlineDownloadedModules || []),
  ]);
  const mergedOfflineModules = Array.from(offlineSet);

  // 3. Merge streak (Max)
  const mergedStreak = Math.max(local.streakDays || 0, remote.streakDays || 0);

  // 4. Merge assessment scores (Keep higher score per subject)
  const mergedScores: Record<string, number> = { ...(remote.assessmentScores || {}) };
  if (local.assessmentScores) {
    for (const [subj, score] of Object.entries(local.assessmentScores)) {
      mergedScores[subj] = Math.max(score, mergedScores[subj] || 0);
    }
  }

  // 5. Merge subjects & learning goals
  const subjectsSet = new Set([...(local.subjects || []), ...(remote.subjects || [])]);
  const goalsSet = new Set([...(local.learningGoals || []), ...(remote.learningGoals || [])]);

  // 6. Timestamps & Last Synced
  const now = new Date().toISOString();

  return {
    id: local.id || remote.id,
    name: remote.name && remote.name !== 'New Learner' ? remote.name : local.name,
    email: remote.email || local.email,
    role: remote.role || local.role,
    gradeLevel: remote.gradeLevel || local.gradeLevel,
    language: local.language || remote.language || 'en',
    subjects: Array.from(subjectsSet),
    learningGoals: Array.from(goalsSet),
    accessibility: {
      highContrast: Boolean(local.accessibility?.highContrast ?? remote.accessibility?.highContrast),
      largeText: Boolean(local.accessibility?.largeText ?? remote.accessibility?.largeText),
      screenReaderOptimized: Boolean(
        local.accessibility?.screenReaderOptimized ?? remote.accessibility?.screenReaderOptimized
      ),
    },
    streakDays: mergedStreak,
    completedLessons: mergedCompletedLessons,
    offlineDownloadedModules: mergedOfflineModules,
    isDemo: Boolean(remote.isDemo !== undefined ? remote.isDemo : local.isDemo),
    diagnosticLevel:
      remote.diagnosticLevel && remote.diagnosticLevel !== 'Not Assessed'
        ? remote.diagnosticLevel
        : local.diagnosticLevel || 'Not Assessed',
    assessmentScores: mergedScores,
    lastSyncedAt: now,
  };
}

/**
 * Reconciles local and remote UserProgress tracking records
 */
export function reconcileUserProgress(
  localProfile: UserProfile,
  remoteProgress: UserProgress | null
): UserProgress {
  const defaultProg = createDefaultUserProgress(localProfile);
  if (!remoteProgress) return defaultProg;

  const completedSet = new Set([
    ...(localProfile.completedLessons || []),
    ...(remoteProgress.completedLessonIds || []),
  ]);
  const mergedCompletedIds = Array.from(completedSet);

  const mergedStreak = Math.max(localProfile.streakDays || 0, remoteProgress.streakDays || 0);
  const mergedWeeklyMinutes = Math.max(
    (localProfile.completedLessons?.length || 0) * 25,
    remoteProgress.weeklyLearningMinutes || 0
  );

  const mergedScores: Record<string, number> = { ...(remoteProgress.assessmentScores || {}) };
  if (localProfile.assessmentScores) {
    for (const [subj, score] of Object.entries(localProfile.assessmentScores)) {
      mergedScores[subj] = Math.max(score, mergedScores[subj] || 0);
    }
  }

  const avgScore =
    Object.values(mergedScores).length > 0
      ? Object.values(mergedScores).reduce((a, b) => a + b, 0) / Object.values(mergedScores).length
      : remoteProgress.masteryScore;

  const resolvedMastery = Math.min(100, Math.max(0, Math.round(avgScore || (mergedCompletedIds.length * 20))));

  return {
    userId: localProfile.id,
    studentName: remoteProgress.studentName || localProfile.name,
    email: remoteProgress.email || localProfile.email,
    gradeLevel: remoteProgress.gradeLevel || localProfile.gradeLevel,
    streakDays: mergedStreak,
    completedLessonsCount: mergedCompletedIds.length,
    completedLessonIds: mergedCompletedIds,
    diagnosticLevel: remoteProgress.diagnosticLevel || localProfile.diagnosticLevel || 'Not Assessed',
    offlineModulesCount: Math.max(
      localProfile.offlineDownloadedModules?.length || 0,
      remoteProgress.offlineModulesCount || 0
    ),
    weeklyLearningMinutes: mergedWeeklyMinutes,
    masteryScore: resolvedMastery,
    learningRescue: remoteProgress.learningRescue || null,
    assessmentScores: mergedScores,
    status: resolvedMastery >= 70 ? 'thriving' : resolvedMastery >= 45 ? 'needs_support' : 'at_risk',
    lastActive: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
    isDemo: Boolean(localProfile.isDemo),
  };
}

/**
 * ============================================================================
 * CORE SYNCHRONIZATION OPERATIONS
 * ============================================================================
 */

/**
 * PULL: Fetches remote profile and progress documents from Firestore
 */
export async function pullRemoteUserData(userId: string): Promise<{
  profile: UserProfile | null;
  progress: UserProgress | null;
}> {
  if (!userId) return { profile: null, progress: null };

  try {
    const db = getFirebaseFirestore();
    const userDocRef = doc(db, 'users', userId);
    const progressDocRef = doc(db, 'user_progress', userId);

    const [userSnap, progSnap] = await Promise.all([getDoc(userDocRef), getDoc(progressDocRef)]);

    const profile = userSnap.exists() ? sanitizeUserProfile(userSnap.data()) : null;
    const progress = progSnap.exists() ? sanitizeUserProgress(progSnap.data(), { userId }) : null;

    return { profile, progress };
  } catch (err) {
    console.warn(`[EDUVIVA SyncService] Pull error for user ${userId}:`, err);
    throw err;
  }
}

/**
 * PUSH: Saves user profile and progress directly to Firestore
 */
export async function pushUserDataToFirestore(
  user: UserProfile,
  progress?: Partial<UserProgress>
): Promise<boolean> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!isOnline) {
    enqueuePendingSync(user.id, 'full_sync', { user, progress });
    return false;
  }

  try {
    notifySyncListeners({ mode: 'syncing', activeUserId: user.id });

    const db = getFirebaseFirestore();
    const userDocRef = doc(db, 'users', user.id);
    const progressDocRef = doc(db, 'user_progress', user.id);

    const now = new Date().toISOString();

    const userPayload = {
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
      lastSyncedAt: now,
      updatedAt: serverTimestamp(),
    };

    const progressObj = reconcileUserProgress(user, progress as UserProgress || null);
    const progressPayload = {
      ...progressObj,
      lastSyncedAt: now,
      lastActive: now,
      updatedAt: serverTimestamp(),
    };

    await Promise.all([
      setDoc(userDocRef, userPayload, { merge: true }),
      setDoc(progressDocRef, progressPayload, { merge: true }),
    ]);

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    try {
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, now);
    } catch {
      // Ignore
    }

    notifySyncListeners({
      mode: 'synced',
      isFirestoreConnected: true,
      lastSyncedTimestamp: formattedTime,
      errorMessage: null,
    });

    return true;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[EDUVIVA SyncService] Push error:', errorMsg);

    // Enqueue for offline retry
    enqueuePendingSync(user.id, 'full_sync', { user, progress });

    notifySyncListeners({
      mode: 'error',
      errorMessage: errorMsg,
      isFirestoreConnected: false,
    });
    return false;
  }
}

/**
 * DRAINS the offline pending sync queue by pushing items up to Firestore
 */
export async function drainPendingSyncQueue(): Promise<{ syncedCount: number; errorsCount: number }> {
  const queue = getPendingSyncQueue();
  if (queue.length === 0) {
    notifySyncListeners({ pendingQueueCount: 0 });
    return { syncedCount: 0, errorsCount: 0 };
  }

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline) {
    notifySyncListeners({ mode: 'offline', pendingQueueCount: queue.length });
    return { syncedCount: 0, errorsCount: queue.length };
  }

  notifySyncListeners({ mode: 'syncing', pendingQueueCount: queue.length });

  let syncedCount = 0;
  let errorsCount = 0;
  const remainingQueue: PendingSyncItem[] = [];

  for (const item of queue) {
    try {
      if (item.type === 'full_sync' || item.type === 'profile_update') {
        const userObj = item.payload.user as UserProfile;
        const progObj = item.payload.progress as Partial<UserProgress> | undefined;
        if (userObj && userObj.id) {
          const db = getFirebaseFirestore();
          const userDocRef = doc(db, 'users', userObj.id);
          const userPayload = {
            ...userObj,
            lastSyncedAt: new Date().toISOString(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userDocRef, userPayload, { merge: true });

          if (progObj) {
            const progRef = doc(db, 'user_progress', userObj.id);
            await setDoc(progRef, { ...progObj, updatedAt: serverTimestamp() }, { merge: true });
          }
        }
      } else if (item.type === 'lesson_completed') {
        const lessonId = String(item.payload.lessonId);
        const minutes = Number(item.payload.minutes || 25);
        await updateUserProgress(item.userId, {
          weeklyLearningMinutes: minutes,
          lastActive: new Date().toISOString(),
        });
      } else if (item.type === 'assessment_recorded') {
        const subject = String(item.payload.subject);
        const score = Number(item.payload.score);
        await updateUserProgress(item.userId, {
          assessmentScores: { [subject]: score },
          lastActive: new Date().toISOString(),
        });
      }
      syncedCount++;
    } catch (err) {
      console.warn(`[EDUVIVA SyncService] Queue item ${item.id} sync failed:`, err);
      errorsCount++;
      item.retryCount += 1;
      // Keep in queue if failed fewer than 5 times
      if (item.retryCount < 5) {
        remainingQueue.push(item);
      }
    }
  }

  savePendingSyncQueue(remainingQueue);

  const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  notifySyncListeners({
    mode: remainingQueue.length > 0 ? 'queued' : 'synced',
    pendingQueueCount: remainingQueue.length,
    lastSyncedTimestamp: formattedTime,
    errorMessage: remainingQueue.length > 0 ? `${errorsCount} items pending retry` : null,
  });

  return { syncedCount, errorsCount };
}

/**
 * ============================================================================
 * ON LOGIN / SESSION STARTUP BIDIRECTIONAL SYNCHRONIZATION
 * ============================================================================
 * 
 * Automatically called when user signs in, switches accounts, or boots the app.
 * - Retrieves remote Firestore profile & progress
 * - Merges with local storage data
 * - Persists authoritative merge to local storage
 * - Pushes authoritative merge back to Firestore so both ends match perfectly
 */
export async function syncOnLogin(targetUser?: UserProfile): Promise<LoginSyncResult> {
  const localUser = targetUser || loadStoredUser();
  const now = new Date().toISOString();

  notifySyncListeners({
    mode: 'syncing',
    activeUserId: localUser.id,
  });

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!isOnline) {
    saveStoredUser(localUser, false);
    notifySyncListeners({
      mode: 'offline',
      lastSyncedTimestamp: localUser.lastSyncedAt || null,
      errorMessage: 'Offline mode active: loaded local storage snapshot.',
    });
    return {
      user: localUser,
      progress: createDefaultUserProgress(localUser),
      source: 'local_fallback',
      syncedAt: now,
    };
  }

  try {
    // 1. Pull remote data from Firestore
    const { profile: remoteProfile, progress: remoteProgress } = await pullRemoteUserData(localUser.id);

    // 2. Bidirectionally reconcile profile & progress
    const reconciledUser = reconcileUserProfile(localUser, remoteProfile);
    const reconciledProgress = reconcileUserProgress(reconciledUser, remoteProgress);

    // 3. Save merged authoritative state to localStorage
    saveStoredUser(reconciledUser, false);

    // 4. Push authoritative merge back to Firestore in background
    pushUserDataToFirestore(reconciledUser, reconciledProgress).catch((pushErr) => {
      console.warn('[EDUVIVA SyncService] Post-login push reconciliation warning:', pushErr);
    });

    // 5. Drain any backlog of pending sync queue items
    drainPendingSyncQueue().catch((drainErr) => {
      console.warn('[EDUVIVA SyncService] Post-login queue drain warning:', drainErr);
    });

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    notifySyncListeners({
      mode: 'synced',
      lastSyncedTimestamp: formattedTime,
      isFirestoreConnected: true,
      errorMessage: null,
      activeUserId: reconciledUser.id,
    });

    return {
      user: reconciledUser,
      progress: reconciledProgress,
      source: remoteProfile ? 'cloud_merged' : 'cloud_fetched',
      syncedAt: now,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[EDUVIVA SyncService] Cloud sync on login error, operating on local data:', errorMsg);

    saveStoredUser(localUser, false);
    notifySyncListeners({
      mode: 'error',
      errorMessage: errorMsg,
      isFirestoreConnected: false,
    });

    return {
      user: localUser,
      progress: createDefaultUserProgress(localUser),
      source: 'local_fallback',
      syncedAt: now,
    };
  }
}

/**
 * ============================================================================
 * GLOBAL LIFECYCLE LISTENERS (Online/Offline Auto-Sync)
 * ============================================================================
 */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.info('[EDUVIVA SyncService] Connectivity restored. Triggering cloud reconciliation & queue drain...');
    notifySyncListeners({ isOnline: true });
    drainPendingSyncQueue();
    const currentUser = loadStoredUser();
    if (currentUser) {
      syncOnLogin(currentUser);
    }
  });

  window.addEventListener('offline', () => {
    console.info('[EDUVIVA SyncService] Network offline. Sync engine operating in local caching mode.');
    notifySyncListeners({
      isOnline: false,
      mode: 'offline',
      isFirestoreConnected: false,
    });
  });
}

/**
 * ============================================================================
 * REACT HOOK: useUnifiedSync
 * ============================================================================
 */
export interface UseUnifiedSyncOptions {
  autoSyncOnMount?: boolean;
  pollIntervalMs?: number;
}

export function useUnifiedSync(
  user: UserProfile,
  setUser?: React.Dispatch<React.SetStateAction<UserProfile>>,
  options: UseUnifiedSyncOptions = { autoSyncOnMount: true, pollIntervalMs: 45000 }
) {
  const [syncState, setSyncState] = useState<UnifiedSyncState>(getUnifiedSyncState);
  const userRef = useRef<UserProfile>(user);
  userRef.current = user;

  // Subscribe to sync service status broadcasts
  useEffect(() => {
    const unsubscribe = subscribeSyncState((state) => {
      setSyncState(state);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize on mount if enabled
  useEffect(() => {
    if (options.autoSyncOnMount && user.id) {
      syncOnLogin(user).then((result) => {
        if (setUser && result.user) {
          // If remote had updates, update the React state
          setUser((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(result.user)) {
              return result.user;
            }
            return prev;
          });
        }
      });
    }
  }, [user.id, options.autoSyncOnMount, setUser]);

  // Periodic queue drain and light poll
  useEffect(() => {
    if (!options.pollIntervalMs || options.pollIntervalMs <= 0) return;

    const interval = setInterval(() => {
      if (navigator.onLine && userRef.current) {
        drainPendingSyncQueue();
      }
    }, options.pollIntervalMs);

    return () => clearInterval(interval);
  }, [options.pollIntervalMs]);

  // Manual Trigger: Synchronize current state to cloud
  const syncNow = useCallback(async () => {
    if (!userRef.current) return;
    const result = await syncOnLogin(userRef.current);
    if (setUser && result.user) {
      setUser(result.user);
    }
  }, [setUser]);

  // Push immediate update
  const pushUpdate = useCallback(
    async (updatedUser: UserProfile, progressUpdates?: Partial<UserProgress>) => {
      saveStoredUser(updatedUser, false);
      if (setUser) {
        setUser(updatedUser);
      }
      await pushUserDataToFirestore(updatedUser, progressUpdates);
    },
    [setUser]
  );

  return {
    syncState,
    isSyncing: syncState.mode === 'syncing',
    isSynced: syncState.mode === 'synced',
    isOffline: !syncState.isOnline || syncState.mode === 'offline',
    isQueued: syncState.mode === 'queued',
    pendingCount: syncState.pendingQueueCount,
    lastSyncedTime: syncState.lastSyncedTimestamp,
    syncNow,
    pushUpdate,
    drainQueue: drainPendingSyncQueue,
  };
}
