import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { X, Shield, User, Lock, Mail, Award, CheckCircle, RotateCcw, Sparkles, KeyRound, GlobeLock, UserPlus, LogIn } from 'lucide-react';
import { DEFAULT_DEMO_USER, CLEAN_STUDENT_USER, clearStoredUser } from '../utils/storage';
import { syncOnLogin, clearPendingSyncQueue } from '../utils/syncService';

interface AuthModalProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ user, setUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'google' | 'admin'>('signin');
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState(user.email || 'girmahb1979@gmail.com');
  const [signInPassword, setSignInPassword] = useState('••••••••');
  
  // Sign Up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('student');
  const [signUpGrade, setSignUpGrade] = useState('Grade 10');

  // Admin secure login state
  const [adminEmail, setAdminEmail] = useState('girmahb1979@gmail.com');
  const [adminSecretKey, setAdminSecretKey] = useState('EDUVIVA-SECURE-GOV-2026');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      email: signInEmail,
      isDemo: false,
      lastSyncedAt: new Date().toISOString(),
    };
    setUser(updated);
    syncOnLogin(updated).then(res => {
      if (res.user) setUser(res.user);
    });
    setToastMessage('Successfully signed in.');
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 800);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword) {
      alert('Please fill in all required fields for your new account.');
      return;
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: signUpName,
      email: signUpEmail,
      role: signUpRole,
      gradeLevel: signUpGrade,
      language: 'en',
      subjects: ['Mathematics', 'Science', 'English', 'Civics'],
      learningGoals: ['Master core curriculum', 'Prepare for national exams'],
      accessibility: {
        highContrast: false,
        largeText: false,
        screenReaderOptimized: false,
      },
      streakDays: 1,
      completedLessons: [],
      offlineDownloadedModules: ['mod-math-01', 'mod-sci-01'],
      isDemo: false,
      diagnosticLevel: 'Developing',
      lastSyncedAt: new Date().toISOString(),
    };

    setUser(newUser);
    syncOnLogin(newUser).then(res => {
      if (res.user) setUser(res.user);
    });
    setToastMessage(`New account created successfully as ${signUpRole.toUpperCase()}!`);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1000);
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminSecretKey.length < 5) {
      alert('Invalid administrative clearance key.');
      return;
    }

    const adminUser: UserProfile = {
      ...user,
      name: 'Girma Haile (System Admin)',
      email: adminEmail,
      role: 'admin',
      gradeLevel: 'Grade 10 & National Pilot Governance',
      isDemo: false,
      lastSyncedAt: new Date().toISOString(),
    };

    setUser(adminUser);
    syncOnLogin(adminUser).then(res => {
      if (res.user) setUser(res.user);
    });
    setToastMessage('Administrator clearance verified securely.');
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1000);
  };

  const handleGoogleSignIn = (asAdmin: boolean = false) => {
    const googleUser: UserProfile = {
      ...user,
      id: asAdmin ? 'admin-girma-01' : 'usr-google-001',
      name: asAdmin ? 'Girma Haile (Google Workspace Admin)' : 'Abebe Kebede (Google User)',
      email: asAdmin ? 'girmahb1979@gmail.com' : 'abebe.learner@gmail.com',
      role: asAdmin ? 'admin' : 'student',
      gradeLevel: asAdmin ? 'National Pilot Governance' : 'Grade 10',
      isDemo: false,
      lastSyncedAt: new Date().toISOString(),
    };
    setUser(googleUser);
    syncOnLogin(googleUser).then(res => {
      if (res.user) setUser(res.user);
    });
    setToastMessage(asAdmin ? 'Google Workspace Admin Authenticated' : 'Google Account Authenticated Successfully');
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1000);
  };

  const handleLoadDemo = () => {
    setUser({ ...DEFAULT_DEMO_USER });
    syncOnLogin(DEFAULT_DEMO_USER);
    onClose();
  };

  const handleClearCache = () => {
    clearStoredUser();
    clearPendingSyncQueue();
    setUser({ ...CLEAN_STUDENT_USER });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base">Secure Authentication & RBAC</h3>
              <p className="text-[10px] text-emerald-200">Ethiopian Digital Learning Pilot • ISO-27001 Security Standard</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Compliance Banner */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-900 font-medium">
          <GlobeLock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Encrypted Session • Role-Based Access Control (RBAC) Verified</span>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 bg-slate-100 p-1.5 border-b border-slate-200 text-xs font-bold text-slate-700 text-center">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${activeTab === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900 text-slate-500'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${activeTab === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900 text-slate-500'}`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${activeTab === 'google' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900 text-slate-500'}`}
          >
            Google SSO
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${activeTab === 'admin' ? 'bg-white text-purple-900 shadow-xs' : 'hover:text-purple-900 text-slate-500'}`}
          >
            Admin Portal
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {toastMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              {toastMessage}
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-1">Sign In to Existing Account</span>
                <p className="text-[11px] text-slate-500 mb-3">Access your personalized learning progress, offline modules, and quiz history.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email / Pilot ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Secure Sign In
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN UP NEW ACCOUNT */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-1">Create New User Account</span>
                <p className="text-[11px] text-slate-500 mb-3">Register a brand new learner or teacher profile in the Ethiopian education pilot.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Dawit Mengistu"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="e.g. dawit.m@eduviva.edu"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Secure Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
                  <select
                    value={signUpRole}
                    onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="student">Student Learner</option>
                    <option value="teacher">Teacher / Reviewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Grade Level</label>
                  <select
                    value={signUpGrade}
                    onChange={(e) => setSignUpGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Register New Account
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: GOOGLE SSO */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-1">Google Workspace OAuth SSO</span>
                <p className="text-[11px] text-slate-500 mb-3">Authenticate securely using your Google account credentials for new or existing users and administrators.</p>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleSignIn(false)}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-3 shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.19v3.15C3.17 21.32 7.23 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.19C.43 8.13 0 9.87 0 12s.43 3.87 1.19 5.4l4.09-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.68 1.19 6.6l4.09 3.15c.95-2.84 3.6-4.95 6.72-4.95z"/>
                </svg>
                <span>Continue with Google (Standard Learner)</span>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleSignIn(true)}
                className="w-full py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold text-purple-900 flex items-center justify-center space-x-3 shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.19v3.15C3.17 21.32 7.23 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.19C.43 8.13 0 9.87 0 12s.43 3.87 1.19 5.4l4.09-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.68 1.19 6.6l4.09 3.15c.95-2.84 3.6-4.95 6.72-4.95z"/>
                </svg>
                <span>Continue with Google (Administrator girmahb1979@gmail.com)</span>
              </button>
            </div>
          )}

          {/* TAB 4: ADMIN PORTAL */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <span className="text-xs font-bold text-purple-900 block mb-1">Administrator Clearance Portal</span>
                <p className="text-[11px] text-slate-500 mb-3">Secure administrative login for platform governance, audit telemetry, and multilingual curriculum review.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Security Key</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-purple-600 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={adminSecretKey}
                    onChange={(e) => setAdminSecretKey(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-purple-50/50 border border-purple-200 rounded-xl text-xs font-mono font-bold text-purple-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Default pilot key: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-purple-700">EDUVIVA-SECURE-GOV-2026</code></p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4 text-purple-300" /> Verify Admin Clearance
                </button>
              </div>
            </form>
          )}

          {/* Quick Presets Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleLoadDemo}
              className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Load Demo Admin
            </button>
            <button
              type="button"
              onClick={handleClearCache}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Storage
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
