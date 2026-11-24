import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Building2, Wifi, Users, MapPin, Download, CheckCircle2, Share2 } from 'lucide-react';

interface CommunityHubProps {
  user: UserProfile;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ user }) => {
  const [connectedHubId, setConnectedHubId] = useState<string | null>('hub-1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [hubs, setHubs] = useState([
    {
      id: 'hub-1',
      name: 'Addis Ababa Central Library Hub',
      location: 'Addis Ababa, Ethiopia',
      type: 'Library Server Node',
      connectedPeers: 34,
      offlineSyncStatus: 'Synced 10 mins ago',
      storageUsed: '1.2 GB',
      status: 'active',
    },
    {
      id: 'hub-2',
      name: 'Adama Youth Community Center',
      location: 'Adama, Oromia Region',
      type: 'NGO Solar-Powered Kiosk',
      connectedPeers: 18,
      offlineSyncStatus: 'Synced 2 hours ago',
      storageUsed: '850 MB',
      status: 'active',
    },
    {
      id: 'hub-3',
      name: 'Hawassa Secondary School Hub',
      location: 'Hawassa, Sidama Region',
      type: 'School Intranet Server',
      connectedPeers: 62,
      offlineSyncStatus: 'Pending Wi-Fi Bridge',
      storageUsed: '2.1 GB',
      status: 'syncing',
    },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full">
            Low-Connectivity Infrastructure
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Community Learning Hubs</h2>
          <p className="text-xs text-slate-600 mt-1">
            Supporting schools, libraries, and NGO centers with shared local storage, peer-to-peer mesh sync, and solar-powered offline servers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <p className="text-[10px] text-emerald-700 font-medium">Active Mesh Nodes</p>
            <p className="text-lg font-bold text-emerald-800">14 Hubs</p>
          </div>
        </div>
      </div>

      {/* Hubs Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {hubs.map((hub) => (
          <div key={hub.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                  {hub.type}
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${hub.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{hub.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {hub.location}
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Active Peers:</span>
                <span className="font-bold text-slate-900">{hub.connectedPeers} learners</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cached Storage:</span>
                <span className="font-bold text-slate-900">{hub.storageUsed}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Sync Status:</span>
                <span className="font-semibold text-emerald-700">{hub.offlineSyncStatus}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setConnectedHubId(hub.id);
                setToastMessage(`Connected to mesh node: ${hub.name}. Lessons and assessments available offline.`);
                setTimeout(() => setToastMessage(null), 4000);
              }}
              className={`w-full mt-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                connectedHubId === hub.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {connectedHubId === hub.id ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" /> Connected Mesh Node
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-teal-600" /> Connect to Mesh Hub
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
