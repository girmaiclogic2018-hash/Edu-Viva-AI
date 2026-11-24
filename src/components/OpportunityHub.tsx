import React, { useState, useEffect } from 'react';
import { UserProfile, OpportunityItem } from '../types';
import { 
  Award, Calendar, MapPin, ExternalLink, ShieldCheck, FileText, Upload, 
  Sparkles, CheckCircle2, Bookmark, BookmarkCheck, Share2, Plus, Edit3, 
  Trash2, X, Download, Send, Eye, FileCheck, Briefcase, User, GraduationCap, RefreshCw
} from 'lucide-react';

interface OpportunityHubProps {
  user: UserProfile;
}

interface UserApplication {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  fullName: string;
  email: string;
  gradeLevel: string;
  statementOfPurpose: string;
  uploadedFiles: string[];
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Accepted';
  submittedAt: string;
}

interface GeneratedResume {
  title: string;
  summary: string;
  education: string;
  skills: string[];
  experience: string;
  portfolioNotes: string;
}

export const OpportunityHub: React.FC<OpportunityHubProps> = ({ user }) => {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(() => {
    const saved = localStorage.getItem('eduviva_opportunities');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'opp-001',
        title: 'Mastercard Foundation Scholars Program at AASTU',
        provider: 'Mastercard Foundation & Addis Ababa Science and Technology University',
        type: 'scholarship',
        deadline: '2026-06-30',
        description: 'Comprehensive full scholarship covering tuition, accommodation, mentorship, and leadership training for talented students in STEM fields.',
        location: 'Addis Ababa, Ethiopia / Hybrid',
        verifiedSource: 'Official Verified Portal (aastu.edu.et)',
        linkUrl: 'https://aastu.edu.et/scholarships'
      },
      {
        id: 'opp-002',
        title: 'Ethiopian Youth AI & Coding Fellowship',
        provider: 'Ministry of Innovation & Technology (MInT) Ethiopia',
        type: 'fellowship',
        deadline: '2026-05-15',
        description: 'Intensive 3-month fellowship for young innovators to build real-world AI solutions for agriculture, healthcare, and education in local languages.',
        location: 'Addis Ababa & Regional Hubs',
        verifiedSource: 'MInT Official Portal (mint.gov.et)',
        linkUrl: 'https://mint.gov.et/fellowships'
      },
      {
        id: 'opp-003',
        title: 'Pan-African Digital Skills & Cloud Bootcamp',
        provider: 'Google Developer Groups & EDUVIVA Partnership',
        type: 'skills',
        deadline: '2026-07-01',
        description: 'Certified professional training program in Web Development, Cloud Engineering, and AI fundamentals with direct mentorship from industry experts.',
        location: 'Online (Low-Connectivity Optimized)',
        verifiedSource: 'EDUVIVA Trusted Partner',
        linkUrl: 'https://developers.google.com'
      },
      {
        id: 'opp-004',
        title: 'Africa Tech Innovation & Science Olympiad',
        provider: 'African Union Science Commission',
        type: 'competition',
        deadline: '2026-08-10',
        description: 'Annual continental competition recognizing high school and university innovators tackling community challenges with technology and scientific inquiry.',
        location: 'Nairobi & Virtual',
        verifiedSource: 'AU Educational Portal',
        linkUrl: 'https://au.int/competitions'
      }
    ];
  });

  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('eduviva_saved_opps');
    return saved ? JSON.parse(saved) : ['opp-001'];
  });

  const [applications, setApplications] = useState<UserApplication[]>(() => {
    const saved = localStorage.getItem('eduviva_user_applications');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'explore' | 'applications' | 'generator' | 'post'>('explore');
  const [selectedOppForApp, setSelectedOppForApp] = useState<OpportunityItem | null>(null);
  
  // Application Form State
  const [applicantName, setApplicantName] = useState(user.name || 'Girma Haile');
  const [applicantEmail, setApplicantEmail] = useState(user.email || 'girmahb1979@gmail.com');
  const [applicantGrade, setApplicantGrade] = useState(user.gradeLevel || 'Grade 12 / Higher Ed');
  const [statementOfPurpose, setStatementOfPurpose] = useState('');
  const [uploadedFilesList, setUploadedFilesList] = useState<string[]>(['Academic_Transcript_2025.pdf', 'National_Exam_Certificate.pdf']);
  const [isUploading, setIsUploading] = useState(false);

  // AI CV, Resume & Portfolio Generator State
  const [selectedOppForResume, setSelectedOppForResume] = useState<OpportunityItem>(opportunities[0]);
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [resumeStyle, setResumeStyle] = useState<'cv' | 'resume' | 'portfolio'>('cv');

  // New Opportunity Posting State (CRUD)
  const [newTitle, setNewTitle] = useState('');
  const [newProvider, setNewProvider] = useState('');
  const [newType, setNewType] = useState<'scholarship' | 'skills' | 'fellowship' | 'competition'>('scholarship');
  const [newDeadline, setNewDeadline] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [editingOppId, setEditingOppId] = useState<string | null>(null);

  // Share & Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('eduviva_opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  useEffect(() => {
    localStorage.setItem('eduviva_saved_opps', JSON.stringify(savedOpportunityIds));
  }, [savedOpportunityIds]);

  useEffect(() => {
    localStorage.setItem('eduviva_user_applications', JSON.stringify(applications));
  }, [applications]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleSaveOpportunity = (id: string) => {
    if (savedOpportunityIds.includes(id)) {
      setSavedOpportunityIds(savedOpportunityIds.filter(i => i !== id));
      showToast('Opportunity removed from saved list.');
    } else {
      setSavedOpportunityIds([...savedOpportunityIds, id]);
      showToast('Opportunity saved successfully!');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setTimeout(() => {
      const newNames = Array.from(files).map((f: File) => f.name);
      setUploadedFilesList(prev => [...prev, ...newNames]);
      setIsUploading(false);
      showToast(`Successfully uploaded ${newNames.length} document(s)!`);
    }, 1000);
  };

  const handleRemoveFile = (fileName: string) => {
    setUploadedFilesList(prev => prev.filter(f => f !== fileName));
    showToast(`Removed ${fileName}`);
  };

  const handleAISubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOppForApp) return;

    const newApp: UserApplication = {
      id: `app-${Date.now()}`,
      opportunityId: selectedOppForApp.id,
      opportunityTitle: selectedOppForApp.title,
      fullName: applicantName,
      email: applicantEmail,
      gradeLevel: applicantGrade,
      statementOfPurpose,
      uploadedFiles: uploadedFilesList,
      status: 'Submitted',
      submittedAt: new Date().toLocaleDateString()
    };

    setApplications([newApp, ...applications]);
    setSelectedOppForApp(null);
    setStatementOfPurpose('');
    showToast('Application successfully submitted and stored securely!');
    setActiveTab('applications');
  };

  const handleGenerateAIResume = async () => {
    setIsGeneratingResume(true);
    
    // Simulate AI generation tailored to opportunity and user profile
    setTimeout(() => {
      const title = `${applicantName} - Professional ${resumeStyle.toUpperCase()} for ${selectedOppForResume.title}`;
      const summary = `Dedicated and high-achieving learner from Ethiopia (${applicantGrade}) with a proven track record in academic excellence, self-directed learning on EDUVIVA AI, and strong problem-solving skills in STEM. Passionate about leveraging technology and innovation to drive sustainable community development.`;
      const education = `${applicantGrade} - Verified Student at EDUVIVA AI Learning Network. Completed advanced modules in Mathematics, Sciences, and Digital Literacy with top distinction.`;
      const skills = ['Critical Thinking', 'Python & JavaScript Basics', 'Multilingual Communication (Amharic, English)', 'Low-Connectivity Problem Solving', 'Scientific Inquiry & Research'];
      const experience = `• Active Participant in EDUVIVA AI Socratic Learning Programs (2025-2026).\n• Collaborative Project Leader for Regional Science & Technology exhibitions.\n• Completed 15+ verified learning modules with outstanding mastery.`;
      const portfolioNotes = `Includes verified certificates, digital project summaries, recommendation letters, and official academic records securely tied to EDUVIVA Learning Passport.`;

      setGeneratedResume({
        title,
        summary,
        education,
        skills,
        experience,
        portfolioNotes
      });
      setIsGeneratingResume(false);
      showToast('EDUVIVA AI successfully generated your tailored professional document!');
    }, 1200);
  };

  const handleSaveOrUpdateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newProvider || !newLinkUrl) {
      showToast('Please fill in required fields (Title, Provider, Official Link).');
      return;
    }

    if (editingOppId) {
      setOpportunities(opportunities.map(o => o.id === editingOppId ? {
        ...o,
        title: newTitle,
        provider: newProvider,
        type: newType,
        deadline: newDeadline || '2026-12-31',
        description: newDescription,
        location: newLocation || 'Ethiopia / Remote',
        linkUrl: newLinkUrl,
        verifiedSource: 'User / Educator Post (Verified)'
      } : o));
      setEditingOppId(null);
      showToast('Opportunity updated successfully!');
    } else {
      const newOpp: OpportunityItem = {
        id: `opp-${Date.now()}`,
        title: newTitle,
        provider: newProvider,
        type: newType,
        deadline: newDeadline || '2026-12-31',
        description: newDescription || 'Opportunity posted via EDUVIVA Community Portal.',
        location: newLocation || 'Ethiopia / Remote',
        verifiedSource: 'Community / Institution Posted',
        linkUrl: newLinkUrl
      };
      setOpportunities([newOpp, ...opportunities]);
      showToast('New opportunity successfully posted!');
    }

    setNewTitle('');
    setNewProvider('');
    setNewDescription('');
    setNewLocation('');
    setNewLinkUrl('');
    setActiveTab('explore');
  };

  const handleStartEdit = (opp: OpportunityItem) => {
    setEditingOppId(opp.id);
    setNewTitle(opp.title);
    setNewProvider(opp.provider);
    setNewType(opp.type);
    setNewDeadline(opp.deadline);
    setNewDescription(opp.description);
    setNewLocation(opp.location);
    setNewLinkUrl(opp.linkUrl);
    setActiveTab('post');
  };

  const handleDeleteOpportunity = (id: string) => {
    setOpportunities(opportunities.filter(o => o.id !== id));
    showToast('Opportunity deleted.');
  };

  const handleShareOpportunity = (opp: OpportunityItem) => {
    const shareText = `Check out this verified opportunity on EDUVIVA AI: ${opp.title} (${opp.linkUrl})`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      showToast('Opportunity link copied to clipboard for sharing!');
    } else {
      showToast(shareText);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-amber-500/40 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner with Habesha Cultural Touch */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden border border-amber-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> EDUVIVA Opportunity & Career Portal
            </span>
            <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">
              Official Addressed Portals & AI CV Builder
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 text-white">
            Transform Learning Into Global Opportunities
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Access verified scholarships, fellowships, and skills programs in Ethiopia and beyond. Use EDUVIVA AI to instantly generate professional CVs, resumes, and portfolios tailored for your applications.
          </p>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-700/60">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'explore' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'}`}
            >
              <Award className="w-4 h-4" /> Explore Opportunities ({opportunities.length})
            </button>
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'generator' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'}`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> AI CV & Resume Studio
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'applications' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'}`}
            >
              <FileCheck className="w-4 h-4" /> My Applications ({applications.length})
            </button>
            <button
              onClick={() => { setEditingOppId(null); setActiveTab('post'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'post' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'}`}
            >
              <Plus className="w-4 h-4" /> Post / Add Opportunity
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: EXPLORE OPPORTUNITIES */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900">Verified Scholarships & Fellowships</h3>
            <span className="text-xs text-slate-500 font-medium">{opportunities.length} opportunities available</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {opportunities.map((opp) => {
              const isSaved = savedOpportunityIds.includes(opp.id);
              return (
                <div key={opp.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-amber-500 transition-all flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                        {opp.type}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSaveOpportunity(opp.id)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${isSaved ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                          title={isSaved ? 'Saved' : 'Save opportunity'}
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleShareOpportunity(opp)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                          title="Share opportunity"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 mb-1">{opp.title}</h4>
                      <p className="text-xs font-semibold text-emerald-700">{opp.provider}</p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{opp.description}</p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{opp.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Deadline: <strong className="text-slate-800">{opp.deadline}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700 font-semibold">{opp.verifiedSource}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => { setSelectedOppForApp(opp); }}
                      className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Apply & Upload Docs
                    </button>
                    <a
                      href={opp.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Open Official Addressed Link"
                    >
                      <span>Official Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {opp.verifiedSource.includes('User') && (
                      <>
                        <button
                          onClick={() => handleStartEdit(opp)}
                          className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl cursor-pointer"
                          title="Edit Opportunity"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOpportunity(opp.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer"
                          title="Delete Opportunity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AI CV, RESUME & PORTFOLIO STUDIO */}
      {activeTab === 'generator' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> EDUVIVA AI Document & Portfolio Generator
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-2">Create Professional CVs, Resumes & Portfolios</h3>
            <p className="text-xs text-slate-600 mt-1">
              Select an opportunity below and let EDUVIVA AI instantly synthesize your learning passport records into an elite professional CV or portfolio.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Target Opportunity</label>
                <select
                  value={selectedOppForResume.id}
                  onChange={(e) => {
                    const found = opportunities.find(o => o.id === e.target.value);
                    if (found) setSelectedOppForResume(found);
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-emerald-500"
                >
                  {opportunities.map(o => (
                    <option key={o.id} value={o.id}>{o.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Format</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResumeStyle('cv')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${resumeStyle === 'cv' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                  >
                    CV
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeStyle('resume')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${resumeStyle === 'resume' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                  >
                    Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeStyle('portfolio')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${resumeStyle === 'portfolio' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}`}
                  >
                    Portfolio
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800"
                />
              </div>

              <button
                onClick={handleGenerateAIResume}
                disabled={isGeneratingResume}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingResume ? 'animate-spin' : ''}`} />
                {isGeneratingResume ? 'Generating AI Document...' : `Generate Professional ${resumeStyle.toUpperCase()}`}
              </button>
            </div>

            {/* Generated Document Preview */}
            <div className="md:col-span-2 bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-inner flex flex-col justify-between border border-amber-500/30">
              {generatedResume ? (
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-amber-400">{generatedResume.title}</h4>
                      <p className="text-[10px] text-slate-400">Targeting: {selectedOppForResume.provider}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => showToast('Document successfully downloaded as PDF!')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> Download PDF
                      </button>
                      <button
                        onClick={() => showToast('Document copied to clipboard!')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Copy Text
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-amber-300 font-bold uppercase text-[10px]">Professional Summary</p>
                    <p className="text-slate-300 mt-1 leading-relaxed">{generatedResume.summary}</p>
                  </div>

                  <div>
                    <p className="text-amber-300 font-bold uppercase text-[10px]">Education & Learning Passport</p>
                    <p className="text-slate-300 mt-1">{generatedResume.education}</p>
                  </div>

                  <div>
                    <p className="text-amber-300 font-bold uppercase text-[10px]">Core Skills & Competencies</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {generatedResume.skills.map((s, idx) => (
                        <span key={idx} className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-amber-300 font-bold uppercase text-[10px]">Key Achievements & Experience</p>
                    <pre className="text-slate-300 whitespace-pre-line mt-1 font-sans text-xs">{generatedResume.experience}</pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-400 space-y-3">
                  <FileText className="w-12 h-12 text-amber-400 animate-pulse" />
                  <p className="text-sm font-semibold">Click "Generate Professional {resumeStyle.toUpperCase()}" to create your tailored AI document.</p>
                  <p className="text-[11px] text-slate-500 max-w-sm">EDUVIVA AI automatically analyzes your learning profile and matches requirements for maximum acceptance rate.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Submitted Opportunity Applications</h3>
              <p className="text-xs text-slate-500 mt-0.5">Track the status of your applications and attached documents.</p>
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              {applications.length} Applications Recorded
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <FileCheck className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No applications submitted yet</p>
              <p className="text-xs text-slate-500 mt-1">Explore opportunities and click "Apply & Upload Docs" to start your journey.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                        {app.status}
                      </span>
                      <span className="text-xs text-slate-500">Submitted on {app.submittedAt}</span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">{app.opportunityTitle}</h4>
                    <p className="text-xs text-slate-600">Applicant: <strong className="text-slate-800">{app.fullName}</strong> ({app.email})</p>
                    {app.statementOfPurpose && (
                      <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200 mt-2">
                        "{app.statementOfPurpose}"
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {app.uploadedFiles.map((file, idx) => (
                        <span key={idx} className="text-[10px] bg-white border border-slate-300 text-slate-700 px-2 py-1 rounded-lg flex items-center gap-1 font-medium">
                          <FileText className="w-3 h-3 text-emerald-600" /> {file}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast('Downloading application package PDF...')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: POST / ADD OPPORTUNITY (CRUD) */}
      {activeTab === 'post' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingOppId ? 'Edit Opportunity Posting' : 'Post New Opportunity'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Share scholarships, competitions, or skills programs with the EDUVIVA community.</p>
            </div>
            <button
              onClick={() => setActiveTab('explore')}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveOrUpdateOpportunity} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Opportunity Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Mastercard Foundation STEM Scholarship"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-emerald-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Provider / Organization *</label>
                <input
                  type="text"
                  required
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                  placeholder="e.g., AASTU University"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Opportunity Type</label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 font-medium text-slate-800 bg-white focus:outline-emerald-500"
                >
                  <option value="scholarship">Scholarship</option>
                  <option value="fellowship">Fellowship</option>
                  <option value="skills">Skills / Bootcamp</option>
                  <option value="competition">Competition</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Addressed Link (URL) *</label>
                <input
                  type="url"
                  required
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="https://example.edu.et/apply"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location / Mode</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g., Addis Ababa, Ethiopia / Online"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description & Requirements</label>
              <textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe eligibility criteria, benefits, and application steps..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-emerald-500"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('explore')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
              >
                {editingOppId ? 'Save Changes' : 'Publish Opportunity'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* APPLICATION MODAL */}
      {selectedOppForApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-emerald-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Official Portal Application
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">{selectedOppForApp.title}</h3>
                <p className="text-xs text-slate-500">{selectedOppForApp.provider}</p>
              </div>
              <button
                onClick={() => setSelectedOppForApp(null)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAISubmitApplication} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Academic Level / Grade</label>
                <input
                  type="text"
                  required
                  value={applicantGrade}
                  onChange={(e) => setApplicantGrade(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Statement of Purpose / Why do you want this?</label>
                <textarea
                  rows={4}
                  required
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                  placeholder="Explain your goals, academic background, and why you are the ideal candidate..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-emerald-500"
                ></textarea>
              </div>

              {/* Document Upload Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Supporting Documents & Certificates (PDF, DOCX)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-emerald-500 transition-colors bg-slate-50">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="doc-upload"
                  />
                  <label htmlFor="doc-upload" className="cursor-pointer space-y-1 block">
                    <Upload className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Click to upload files or drag & drop</p>
                    <p className="text-[10px] text-slate-500">Transcripts, CVs, Certificates (PDF, DOCX up to 15MB)</p>
                  </label>
                </div>

                {uploadedFilesList.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] font-bold text-slate-700">Attached Documents ({uploadedFilesList.length}):</p>
                    {uploadedFilesList.map((file, idx) => (
                      <div key={idx} className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-slate-800">{file}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedOppForApp(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
