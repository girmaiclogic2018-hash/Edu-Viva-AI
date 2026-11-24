import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Download, Cloud, CheckCircle, RefreshCw, HardDrive, Trash2, WifiOff, Wifi, ShieldCheck, Database, Server } from 'lucide-react';
import { drainPendingSyncQueue, getPendingSyncQueue, syncOnLogin, subscribeSyncState } from '../utils/syncService';

interface OfflineManagerProps {
  user: UserProfile;
}

export const OfflineManager: React.FC<OfflineManagerProps> = ({ user }) => {
  const [cachedItems, setCachedItems] = useState([
    { id: '1', title: 'Grade 9 Mathematics - Algebra Fundamentals', size: '145 MB', downloadedAt: 'Aug 25, 2026', status: 'ready' },
    { id: '2', title: 'Grade 10 Physics - Newton Laws & Motion', size: '210 MB', downloadedAt: 'Aug 24, 2026', status: 'ready' },
    { id: '3', title: 'Civics & Ethical Education - Module 1-4', size: '85 MB', downloadedAt: 'Aug 20, 2026', status: 'ready' },
    { id: '4', title: 'AI Socratic Tutor Offline Knowledge Base', size: '320 MB', downloadedAt: 'Aug 18, 2026', status: 'ready' },
  ]);

  const [syncQueue, setSyncQueue] = useState([
    { id: 'q1', action: 'Quiz Submission: Algebra Diagnostic', timestamp: 'Today, 11:20 AM', status: 'pending_sync' },
    { id: 'q2', action: 'Lesson Progress: Physics Chapter 3', timestamp: 'Yesterday, 4:15 PM', status: 'pending_sync' },
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [firestoreStatus, setFirestoreStatus] = useState<'connected' | 'syncing' | 'offline_queued'>('connected');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(new Date().toLocaleTimeString());

  // Monitor connectivity changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setFirestoreStatus('connected');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setFirestoreStatus('offline_queued');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic background polling effect (every 30 seconds) to reconcile local progress with Firestore cloud database
  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (navigator.onLine && autoSyncEnabled && syncQueue.length > 0 && !isSyncing) {
        console.log('[EDUVIVA Firestore Sync] Periodic background polling: reconciling local progress with Firestore...');
        performCloudSync();
      }
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [autoSyncEnabled, syncQueue.length, isSyncing]);

  // Auto-sync effect when connectivity is restored and queue has pending items
  useEffect(() => {
    if (isOnline && autoSyncEnabled && syncQueue.length > 0 && !isSyncing) {
      const timer = setTimeout(() => {
        performCloudSync();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, autoSyncEnabled, syncQueue.length]);

  const performCloudSync = async () => {
    setIsSyncing(true);
    setFirestoreStatus('syncing');
    try {
      // Drain unified offline pending queue to Firestore
      await drainPendingSyncQueue();
      // Reconcile user profile and progress bidirectional flow
      await syncOnLogin(user);
      
      setSyncQueue([]);
      setFirestoreStatus('connected');
      setLastSyncedTime(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Firestore cloud sync reconciliation error:', error);
      setFirestoreStatus('offline_queued');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAll = () => {
    performCloudSync();
  };

  const handleClearCache = (id: string) => {
    setCachedItems(cachedItems.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Firebase Firestore Sync Active
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${isOnline ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'}`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? 'Online (Auto-Syncing)' : 'Offline (Queued Locally)'}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Offline Storage & Cloud Firestore Reconciliation</h2>
          <p className="text-xs text-slate-600 mt-1">
            EDUVIVA AI maintains zero-latency offline continuity. Local learning progress is reconciled with the Firestore cloud database automatically in the background whenever connectivity is detected.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncAll}
            disabled={isSyncing || syncQueue.length === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Reconciling with Firestore...' : 'Sync with Firestore'}
          </button>
        </div>
      </div>

      {/* Storage & Cloud Status Overview */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Local Cache</p>
            <p className="text-xl font-extrabold text-slate-900">760 MB</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Cached Modules</p>
            <p className="text-xl font-extrabold text-slate-900">{cachedItems.length} Modules</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Firestore Status</p>
            <p className="text-sm font-bold text-teal-700 capitalize">{firestoreStatus.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Last Reconciled</p>
            <p className="text-xs font-bold text-slate-800">{lastSyncedTime}</p>
          </div>
        </div>
      </div>

      {/* Pending Sync Queue */}
      {syncQueue.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-700 animate-spin" /> Pending Firestore Sync Queue ({syncQueue.length})
          </h3>
          <p className="text-xs text-amber-800">
            Progress items recorded while offline. Will be automatically reconciled with Firestore cloud database upon active connection.
          </p>
          <div className="space-y-2">
            {syncQueue.map((q) => (
              <div key={q.id} className="bg-white border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{q.action}</p>
                  <p className="text-[10px] text-slate-500">{q.timestamp}</p>
                </div>
                <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md font-medium text-[10px]">
                  Pending Cloud Reconciliation
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Downloaded Modules List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Downloaded Modules on Device</h3>
        <div className="space-y-3">
          {cachedItems.map((item) => (
            <div key={item.id} className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Size: {item.size}</span>
                  <span>•</span>
                  <span>Downloaded: {item.downloadedAt}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Ready Offline & Firestore Backed
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleClearCache(item.id)}
                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors self-end sm:self-center cursor-pointer"
                title="Remove from device"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {cachedItems.length === 0 && (
            <p className="text-center py-8 text-xs text-slate-500">No downloaded modules found.</p>
          )}
        </div>
      </div>

    </div>
  );
};

