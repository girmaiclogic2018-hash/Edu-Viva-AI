import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Sparkles, Globe, Mail, Shield, BookOpen, Cpu, WifiOff, Award, CheckCircle, ExternalLink, Settings, X, Heart } from 'lucide-react';

interface AboutFounderModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const AboutFounderModal: React.FC<AboutFounderModalProps> = ({ user, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'founder' | 'adminConfig'>('about');
  
  // Editable Founder & Org Settings (Securely maintained in state / admin config)
  const [orgConfig, setOrgConfig] = useState({
    founderName: 'Girma Haile Bunaro',
    founderTitle: 'Founder & Product Creator, EDUVIVA AI',
    professionalEmail: 'girmahb1979@gmail.com',
    secondaryEmail: 'girmaiclogic2018@gmail.com',
    officialWebsite: 'https://eduviva.ai',
    supportContact: '+251982422266',
    whatsappTelegram: '+251982422266',
    organizationInfo: 'EDUVIVA AI Education Initiative — Empowering underserved youth across East Africa with world-class personalized learning, offline-first resilience, and AI mentorship.',
    socialLinkedin: 'https://linkedin.com/in/girma-haile-bunaro',
    socialTwitter: 'https://twitter.com/eduviva_ai',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white p-6 sm:p-8 flex items-center justify-between relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold tracking-wider uppercase border border-teal-500/30">
                EDUVIVA AI • Core Platform Mission
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">The Light of Learning</h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Learn. Grow. Discover. Connect. Create your future with inclusive, multilingual, and offline-resilient AI education.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors relative z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 sm:px-8 bg-slate-50 gap-6">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'about'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" /> About EDUVIVA AI
          </button>
          <button
            onClick={() => setActiveTab('founder')}
            className={`py-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'founder'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Founder & Vision
          </button>
          {user.role === 'admin' && (
            <button
              onClick={() => setActiveTab('adminConfig')}
              className={`py-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'adminConfig'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" /> Admin Organization Settings
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 text-slate-700 text-sm">
          
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-5 space-y-2">
                  <h3 className="font-bold text-teal-900 text-base flex items-center gap-2">
                    <Globe className="w-5 h-5 text-teal-600" /> What is EDUVIVA AI?
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    EDUVIVA AI is a globally competitive, multilingual, and AI-powered learning platform engineered to democratize access to personalized education for students in underserved regions across East Africa and beyond.
                  </p>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 space-y-2">
                  <h3 className="font-bold text-emerald-900 text-base flex items-center gap-2">
                    <WifiOff className="w-5 h-5 text-emerald-600" /> Low-Connectivity Resilience
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Recognizing real-world infrastructure constraints, EDUVIVA AI features robust offline module caching, local mesh synchronization, and solar-powered community server nodes so learning never stops when the internet drops.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-slate-900 text-base">Core Architectural Pillars</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">1</div>
                    <h4 className="font-bold text-slate-900 text-xs">Responsible Socratic AI</h4>
                    <p className="text-[11px] text-slate-500">AI mentors guide students with Socratic questioning rather than handing out answers, encouraging true mastery.</p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">2</div>
                    <h4 className="font-bold text-slate-900 text-xs">Multilingual Inclusion</h4>
                    <p className="text-[11px] text-slate-500">Full localization across English, Amharic, Afaan Oromo, and Somali ensuring native-language comprehension.</p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">3</div>
                    <h4 className="font-bold text-slate-900 text-xs">Opportunity Engine</h4>
                    <p className="text-[11px] text-slate-500">Connecting academic progress directly to verified scholarships, vocational training, and career fellowships.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'founder' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-md">
                <div className="w-24 h-24 rounded-2xl bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center text-teal-300 font-extrabold text-3xl shrink-0 shadow-inner">
                  GH
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs uppercase tracking-widest bg-teal-500/30 text-teal-300 px-3 py-1 rounded-full font-bold">
                    Visionary Creator
                  </span>
                  <h3 className="text-2xl font-extrabold">{orgConfig.founderName}</h3>
                  <p className="text-teal-200 text-xs font-semibold">{orgConfig.founderTitle}</p>
                  <p className="text-slate-300 text-xs leading-relaxed max-w-lg mt-2">
                    Dedicated to bridging the global educational divide through human-centered artificial intelligence, offline-first engineering, and inclusive pedagogy.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">Official Contact & Channels</h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-4 h-4 text-teal-600 shrink-0" /> <span className="font-medium">{orgConfig.professionalEmail}</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-4 h-4 text-teal-600 shrink-0" /> <span className="font-medium">{orgConfig.secondaryEmail}</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-700">
                      <Shield className="w-4 h-4 text-teal-600 shrink-0" /> <span className="font-medium">Telegram / WhatsApp: {orgConfig.whatsappTelegram}</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-700">
                      <Globe className="w-4 h-4 text-teal-600 shrink-0" /> <a href={orgConfig.officialWebsite} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline flex items-center gap-1 font-medium">{orgConfig.officialWebsite} <ExternalLink className="w-3 h-3" /></a>
                    </li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">Organization & Mission Info</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {orgConfig.organizationInfo}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'adminConfig' && user.role === 'admin' && (
            <form onSubmit={handleSaveConfig} className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Administrative Organization Configuration</h3>
                  <p className="text-xs text-slate-500">Securely update official contact details, founder credentials, and support channels.</p>
                </div>
                {savedMessage && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-in fade-in">
                    <CheckCircle className="w-4 h-4" /> Settings Updated
                  </span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Founder Name</label>
                  <input
                    type="text"
                    value={orgConfig.founderName}
                    onChange={(e) => setOrgConfig({ ...orgConfig, founderName: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Founder Title</label>
                  <input
                    type="text"
                    value={orgConfig.founderTitle}
                    onChange={(e) => setOrgConfig({ ...orgConfig, founderTitle: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Professional Email</label>
                  <input
                    type="email"
                    value={orgConfig.professionalEmail}
                    onChange={(e) => setOrgConfig({ ...orgConfig, professionalEmail: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Official Website</label>
                  <input
                    type="url"
                    value={orgConfig.officialWebsite}
                    onChange={(e) => setOrgConfig({ ...orgConfig, officialWebsite: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Support Contact Phone</label>
                  <input
                    type="text"
                    value={orgConfig.supportContact}
                    onChange={(e) => setOrgConfig({ ...orgConfig, supportContact: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Organization Mission Bio</label>
                <textarea
                  rows={3}
                  value={orgConfig.organizationInfo}
                  onChange={(e) => setOrgConfig({ ...orgConfig, organizationInfo: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Save Administrative Settings
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-teal-600 fill-teal-600" /> Built for inclusive learning and human potential.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
