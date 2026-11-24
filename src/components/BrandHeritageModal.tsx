import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Sparkles, Globe, BookOpen, Compass, Shield, Award, CheckCircle, ExternalLink, X, Heart, Palette, Layers, Cpu } from 'lucide-react';

interface BrandHeritageModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  currentThemeMode: string;
  setThemeMode: (mode: string) => void;
}

export const BrandHeritageModal: React.FC<BrandHeritageModalProps> = ({
  user,
  isOpen,
  onClose,
  currentThemeMode,
  setThemeMode,
}) => {
  const [activeTab, setActiveTab] = useState<'vision' | 'logo' | 'heritage' | 'specs'>('vision');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white p-6 sm:p-8 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold tracking-widest uppercase border border-emerald-500/30">
                EDUVIVA AI • Global Brand & Heritage Identity
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">BORN IN ETHIOPIA. INSPIRED BY AFRICA. BUILT FOR THE WORLD.</h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Discover the visual language, Ethiopian cultural geometry, and knowledge aura behind EDUVIVA AI.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors relative z-10 shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 sm:px-8 bg-slate-50 gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('vision')}
            className={`py-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'vision' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Brand Vision & Founder
          </button>
          <button
            onClick={() => setActiveTab('logo')}
            className={`py-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'logo' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Logo & Knowledge Aura
          </button>
          <button
            onClick={() => setActiveTab('heritage')}
            className={`py-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'heritage' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4" /> Ethiopian Heritage Modes
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'specs' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" /> Design System Specs
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          
          {activeTab === 'vision' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-md">
                <div className="w-24 h-24 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-extrabold text-3xl shrink-0 shadow-inner">
                  GH
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <span className="text-xs uppercase tracking-widest bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full font-bold">
                    Founder & Product Creator
                  </span>
                  <h3 className="text-2xl font-extrabold">Girma Haile Bunaro</h3>
                  <p className="text-emerald-200 text-xs font-semibold">Visionary Creator, EDUVIVA AI Initiative</p>
                  <p className="text-slate-300 text-xs leading-relaxed max-w-xl mt-2">
                    "Knowledge creates light. Learning creates pathways. Opportunity opens the future." Engineered to empower learners across East Africa with world-class offline resilience and multilingual Socratic AI mentorship.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">Official Contact Channels</h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center gap-2 text-slate-700">
                      <MailIcon className="w-4 h-4 text-emerald-600 shrink-0" /> <span className="font-medium">girmahb1979@gmail.com</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-700">
                      <MailIcon className="w-4 h-4 text-emerald-600 shrink-0" /> <span className="font-medium">girmaiclogic2018@gmail.com</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-700">
                      <PhoneIcon className="w-4 h-4 text-emerald-600 shrink-0" /> <span className="font-medium">Telegram / WhatsApp: +251982422266</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-700">
                      <Globe className="w-4 h-4 text-emerald-600 shrink-0" /> <a href="https://eduviva.ai" target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline flex items-center gap-1 font-medium">https://eduviva.ai <ExternalLink className="w-3 h-3" /></a>
                    </li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">Core Positioning Manifesto</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    EDUVIVA AI bridges indigenous knowledge traditions with modern artificial intelligence. Designed with deep offline resilience for schools, libraries, and youth centers across Ethiopia and the broader African continent.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logo' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-3xl p-6 bg-slate-50 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="text-4xl">📖</span>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-[10px] font-bold text-slate-900 shadow-sm">
                      ✨
                    </div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">The EDUVIVA Knowledge Mark</h4>
                    <p className="text-xs text-slate-500 mt-1">Combining the open book, luminous knowledge spark, and Ethiopian geometric symmetry.</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-3xl p-6 bg-slate-50 flex flex-col justify-center space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm">The Knowledge Aura System</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The EDUVIVA Knowledge Aura creates a subtle, cinematic backdrop of soft luminous gradients and abstract geometric patterns inspired by historic manuscripts and highland topography.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 shadow-xs"></span>
                    <span className="w-6 h-6 rounded-full bg-teal-500 shadow-xs"></span>
                    <span className="w-6 h-6 rounded-full bg-amber-400 shadow-xs"></span>
                    <span className="w-6 h-6 rounded-full bg-slate-900 shadow-xs"></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'heritage' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-900 text-base">Select Ethiopian Heritage Visual Theme</h3>
                <p className="text-xs text-slate-600">
                  Switch between abstract cultural design modes crafted to reflect regional heritage without literal stereotyping.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { id: 'ethiopian-knowledge', name: 'Ethiopian Knowledge & Gold', desc: 'Deep emerald base with luminous gold accents inspired by historic manuscripts.', badge: 'Heritage Gold' },
                  { id: 'ethiopian-highlands', name: 'Ethiopian Highlands Mist', desc: 'Sophisticated slate-teal tones reflecting the majestic mountain ranges and cool plateaus.', badge: 'Highland Teal' },
                  { id: 'ancient-manuscript', name: 'Ancient Manuscript Vellum', desc: 'Warm parchment and deep ink tones honoring centuries of scholarly tradition.', badge: 'Vellum Parchment' },
                  { id: 'african-future', name: 'African Future Neon', desc: 'Vibrant emerald and glowing teal accents symbolizing tech innovation across the continent.', badge: 'Future Emerald' },
                  { id: 'global-learning', name: 'Global Learning Navy', desc: 'Clean executive navy and teal optimized for international academic institutions.', badge: 'Global Navy' },
                ].map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => setThemeMode(mode.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      currentThemeMode === mode.id
                        ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full">{mode.badge}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{mode.name}</h4>
                      <p className="text-[11px] text-slate-500">{mode.desc}</p>
                    </div>
                    {currentThemeMode === mode.id && (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-900 text-base">Design Specification & Quality Standards</h3>
                <p className="text-xs text-slate-600">
                  Built to international accessibility (WCAG AA), performance, and responsive design guidelines.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">Typography</h4>
                  <p className="text-xs text-slate-700">Plus Jakarta Sans & Inter pairing with full Amharic (Ethiopic) script rendering support.</p>
                </div>
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">Accessibility</h4>
                  <p className="text-xs text-slate-700">High contrast ratios, touch targets {'>'} 44px, and global keyboard navigation (`Alt + 1-8`).</p>
                </div>
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">Offline Resilience</h4>
                  <p className="text-xs text-slate-700">Full local module caching, mesh sync queues, and solar-powered kiosk integration.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> Born in Ethiopia. Inspired by Africa. Built for the world.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}
