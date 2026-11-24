import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Mail, Phone, Globe, Send, CheckCircle, Shield, Heart, HelpCircle, MessageSquare } from 'lucide-react';

interface ContactViewProps {
  user: UserProfile;
}

export const ContactView: React.FC<ContactViewProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    subject: 'General Inquiry / Support',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await fetch('/api/gateway/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+251982422266',
          channel: 'inquiry_portal',
          message: `[EDUVIVA Inquiry from ${formData.name} <${formData.email}>] Subject: ${formData.subject}\n\n${formData.message}`,
        }),
      });
    } catch (err) {
      console.warn('[ContactView] Server routing notice:', err);
    } finally {
      setIsSending(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-3 relative z-10">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-emerald-500/30">
            EDUVIVA AI • Official Support & Inquiry
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Get in Touch with Our Team</h2>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Whether you are an educator, student, school administrator, or partner, we are here to support your journey with EDUVIVA AI across Ethiopia and beyond.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Contact Info Cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Direct Contact Channels</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Email</span>
                  <p className="text-sm font-semibold text-slate-800">girmahb1979@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Secondary Email</span>
                  <p className="text-sm font-semibold text-slate-800">girmaiclogic2018@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Telegram & WhatsApp</span>
                  <p className="text-sm font-semibold text-slate-800">+251982422266</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Website</span>
                  <p className="text-sm font-semibold text-indigo-600">https://eduviva.ai</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700">Founder & Creator</span>
              <p className="text-xs text-slate-600 font-medium">Girma Haile Bunaro</p>
              <p className="text-[11px] text-slate-400">EDUVIVA AI Initiative, Addis Ababa, Ethiopia</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Message Received Successfully!</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Thank you for reaching out to EDUVIVA AI. Our team will review your message and get back to you promptly at <strong className="text-slate-900">{formData.email}</strong>.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ ...formData, message: '' });
                }}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">Send a Secure Inquiry</h3>
                <p className="text-xs text-slate-500">Fill out the form below to connect directly with the EDUVIVA AI team.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Subject Category</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option>General Inquiry / Support</option>
                  <option>School & Teacher Partnership</option>
                  <option>Offline Kiosk Deployment</option>
                  <option>Scholarship & Opportunity Integration</option>
                  <option>Technical Feedback</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Your Message</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="How can we assist your educational journey or institution?"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" /> Secure & Confidential
                </span>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSending ? 'Sending Message...' : <>Send Inquiry <Send className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
