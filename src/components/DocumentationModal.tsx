import React, { useState } from 'react';
import { X, BookOpen, Server, Database, Shield, Cpu, CheckSquare, Compass, BarChart2, Globe, FileText, Award } from 'lucide-react';

interface DocumentationModalProps {
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<'prd' | 'architecture' | 'database' | 'aiSafety' | 'pilot' | 'grant'>('prd');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-800 rounded-lg">
              <BookOpen className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">EDUVIVA AI — Complete System Documentation & PRD</h2>
              <p className="text-xs text-emerald-200">Global Inclusive AI Education & Opportunity Platform (Ethiopia Pilot)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-nav tabs */}
        <div className="flex bg-slate-100 border-b border-slate-200 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveSection('prd')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'prd' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Product Requirements (PRD)
          </button>
          <button
            onClick={() => setActiveSection('architecture')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'architecture' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            2. System Architecture & API
          </button>
          <button
            onClick={() => setActiveSection('database')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'database' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Database Schema & Models
          </button>
          <button
            onClick={() => setActiveSection('aiSafety')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'aiSafety' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            4. AI Tutor Safety & Ethics
          </button>
          <button
            onClick={() => setActiveSection('pilot')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'pilot' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            5. Pilot & Impact Framework
          </button>
          <button
            onClick={() => setActiveSection('grant')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'grant' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            6. Grant-Readiness Checklist
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 text-slate-700 text-sm leading-relaxed">
          
          {activeSection === 'prd' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Product Requirements Document (PRD)</h3>
              <p>
                <strong>EDUVIVA AI</strong> is an inclusive, multilingual, low-connectivity educational platform engineered to bridge educational disparities in Ethiopia and across Africa.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-emerald-800 mb-2">Core Mission & Problem</h4>
                  <p className="text-xs text-slate-600">
                    Students falling behind due to overcrowded classrooms, high tutoring costs, language barriers, and limited connectivity. EDUVIVA AI provides personalized diagnostics, adaptive learning pathways, and a Socratic AI tutor.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-emerald-800 mb-2">Core Product Principle</h4>
                  <p className="text-xs text-slate-600">
                    Learn anywhere, at your own level, with personalized support, limited connectivity, in your language (English, Amharic, Afaan Oromo, Somali), connecting learning to future career/scholarship opportunities.
                  </p>
                </div>
              </div>
              <h4 className="font-semibold text-slate-900 mt-4">Key MVP Features</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li>Secure Role-Based Onboarding (Student, Teacher, Administrator).</li>
                <li>Adaptive Diagnostic Assessment & Knowledge Gap Identification.</li>
                <li>Personalized Learning Pathway with modular lessons and quizzes.</li>
                <li>EDUVIVA AI Tutor with strict Socratic safety guardrails (never solves answers directly).</li>
                <li>Learning Rescue System for students struggling with repeated errors.</li>
                <li>Offline-First Architecture with downloadable modules and background sync.</li>
                <li>Teacher Dashboard with aggregated insights and human review oversight.</li>
              </ul>
            </div>
          )}

          {activeSection === 'architecture' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">System Architecture & API Specification</h3>
              <p>
                Built on a full-stack Node.js/Express + React 18 + Vite architecture with secure server-side Gemini AI proxying.
              </p>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 font-mono text-xs text-emerald-900 space-y-2">
                <p><strong>[Client Browser / Offline PWA]</strong></p>
                <p> ↕ HTTPS / Encrypted Local Storage (IndexedDB / LocalStorage)</p>
                <p><strong>[Node.js / Express Server (Port 3000)]</strong></p>
                <p> ├── POST /api/ai-tutor (Google GenAI SDK `@google/genai` with system guardrails)</p>
                <p> ├── POST /api/assess (Diagnostic Gap Evaluation Engine)</p>
                <p> ├── POST /api/sync (Offline Progress Synchronization Queue)</p>
                <p> └── GET /api/health (Uptime & System Health)</p>
              </div>
            </div>
          )}

          {activeSection === 'database' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Data Model & Schema Structure</h3>
              <p>Designed with data minimization and privacy-by-design principles in mind.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs">
                  <h4 className="font-bold text-slate-800 mb-2">Users Table</h4>
                  <p>id: UUID (PK)</p>
                  <p>name: VARCHAR</p>
                  <p>role: ENUM(student, teacher, admin)</p>
                  <p>grade_level: VARCHAR</p>
                  <p>language_pref: VARCHAR(en, am, om, so)</p>
                  <p>streak_days: INT</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs">
                  <h4 className="font-bold text-slate-800 mb-2">Lessons Table</h4>
                  <p>id: VARCHAR (PK)</p>
                  <p>subject: VARCHAR</p>
                  <p>grade_level: VARCHAR</p>
                  <p>title_json: JSON (Multilingual)</p>
                  <p>verified_content_json: JSON</p>
                  <p>quiz_json: JSON</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'aiSafety' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">AI Tutor Safety Rules & Ethical Guidelines</h3>
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                  <strong>1. Socratic Principle:</strong> The AI tutor must never solve homework or examination questions directly. It must guide students using hints and questions.
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                  <strong>2. Content Distinction:</strong> Verified educational content is strictly separated from AI-generated explanations with clear visual badges.
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                  <strong>3. Child Safety:</strong> No manipulative patterns, no collection of unnecessary personal data, age-appropriate interactions only.
                </div>
              </div>
            </div>
          )}

          {activeSection === 'pilot' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Ethiopia Pilot & Impact Measurement Framework</h3>
              <p>Preparing for 100 to 500 learners across selected partner schools and community hubs in Ethiopia.</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li>Baseline diagnostic assessment prior to platform onboarding.</li>
                <li>Teacher training workshops on human review oversight of AI suggestions.</li>
                <li>Offline sync tracking for low-connectivity environments.</li>
                <li>Pre- and post-pilot learning gain measurement and qualitative feedback.</li>
              </ul>
            </div>
          )}

          {activeSection === 'grant' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Grant-Readiness Evidence Checklist</h3>
              <div className="grid md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border rounded-lg flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Clear Problem Definition: Addressing learning gaps in overcrowded classrooms.</span>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Multilingual Inclusion: Native support for Amharic, Afaan Oromo, Somali, and English.</span>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Offline-First Architecture: Usable in areas with intermittent connectivity.</span>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Responsible AI & Child Safety: Socratic guardrails and teacher oversight.</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            Close Documentation
          </button>
        </div>

      </div>
    </div>
  );
};
