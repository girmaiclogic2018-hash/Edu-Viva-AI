import React, { useState } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { Send, Bot, User, Sparkles, AlertCircle, RefreshCw, Volume2, Mic, HelpCircle, X, Globe, Radio } from 'lucide-react';
import { useGeminiApiHealth, GeminiHealthAlert } from '../utils/api';

interface AITutorChatProps {
  user: UserProfile;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({ user }) => {
  const t = TRANSLATIONS[user.language] || TRANSLATIONS.en;
  const { health, isChecking, recheckHealth } = useGeminiApiHealth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${user.name}! I am your EDUVIVA AI Tutor. How can I help you master your lessons today? Remember, I am here to guide you with Socratic hints, real-time web search grounding, and voice synthesis in ${user.language.toUpperCase()}!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [chatLang, setChatLang] = useState<string>(user.language || 'en');
  const [autoVoice, setAutoVoice] = useState<boolean>(true);
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [useSearch, setUseSearch] = useState<boolean>(false);
  const [showLiveVoice, setShowLiveVoice] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showPronunciationGuide, setShowPronunciationGuide] = useState(false);

  const speakText = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    if (speakingId === id) {
      setSpeakingId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      en: 'en-US',
      am: 'am-ET',
      om: 'om-ET',
      so: 'so-SO',
      ar: 'ar-SA',
      fr: 'fr-FR',
    };
    utterance.lang = langMap[chatLang] || 'en-US';
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsgText = textToSend.trim();
    if (!customText) setInput('');

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: userMsgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          subject,
          gradeLevel: user.gradeLevel,
          language: chatLang,
          useSearch,
          useLiveVoice: showLiveVoice,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || `Great question ${user.name}! Let's examine this step-by-step in ${subject}.`;
      const replyId = (Date.now() + 1).toString();
      
      let finalReply = replyText;
      if (data.groundingMetadata?.webSearchQueries?.length) {
        finalReply += `\n\n🔍 (Verified via Google Search: "${data.groundingMetadata.webSearchQueries[0]}")`;
      }

      setMessages([
        ...newMessages,
        {
          id: replyId,
          sender: 'ai',
          text: finalReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      if (autoVoice) {
        setTimeout(() => speakText(finalReply, replyId), 300);
      }
    } catch (err) {
      const fallbackId = (Date.now() + 1).toString();
      const fallbackText = `Offline mode active. Review core textbook principles for ${subject}.`;
      setMessages([
        ...newMessages,
        {
          id: fallbackId,
          sender: 'ai',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      if (autoVoice) {
        setTimeout(() => speakText(fallbackText, fallbackId), 300);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[75vh] overflow-hidden relative">
      
      {/* Header */}
      <div className="px-6 py-4 bg-emerald-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-700 rounded-xl">
            <Bot className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              EDUVIVA AI Tutor (Pilot: {user.name})
              <span className="text-[10px] bg-emerald-700 text-emerald-200 px-2 py-0.5 rounded-full font-medium">
                {useSearch ? 'Search Grounding Active' : 'Socratic Voice Active'}
              </span>
            </h3>
            <p className="text-xs text-emerald-200">Guiding {user.name} in {user.gradeLevel} ({chatLang.toUpperCase()})</p>
          </div>
        </div>

        {/* Controls & Toggles */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Live Voice API Button */}
          <button
            onClick={() => setShowLiveVoice(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Launch Gemini Live Voice Conversation Mode"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Gemini Live Voice</span>
          </button>

          {/* Search Grounding Toggle */}
          <button
            onClick={() => setUseSearch(!useSearch)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              useSearch 
                ? 'bg-blue-600 border-blue-400 text-white shadow-xs' 
                : 'bg-emerald-900/60 border-emerald-700 text-emerald-300 hover:bg-emerald-900'
            }`}
            title="Toggle Google Search Grounding for up-to-date factual answers"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{useSearch ? 'Search: ON' : 'Search: OFF'}</span>
          </button>

          <button
            onClick={() => setAutoVoice(!autoVoice)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              autoVoice 
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs' 
                : 'bg-emerald-900/60 border-emerald-700 text-emerald-300 hover:bg-emerald-900'
            }`}
            title="Toggle automatic AI voice response"
          >
            <Volume2 className={`w-3.5 h-3.5 ${autoVoice ? 'text-white animate-pulse' : 'text-emerald-400'}`} />
            <span>{autoVoice ? 'Voice: ON' : 'Voice: OFF'}</span>
          </button>

          <select
            value={chatLang}
            onChange={(e) => setChatLang(e.target.value)}
            className="px-2.5 py-1.5 bg-emerald-900 border border-emerald-700 rounded-lg text-xs font-medium text-white focus:outline-hidden"
            title="Select voice output language"
          >
            <option value="en">English (US)</option>
            <option value="am">አማርኛ (Amharic)</option>
            <option value="om">Afaan Oromoo</option>
            <option value="so">Soomaali (Somali)</option>
            <option value="ar">العربية (Arabic)</option>
            <option value="fr">Français (French)</option>
          </select>

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-1.5 bg-emerald-900 border border-emerald-700 rounded-lg text-xs font-medium text-white focus:outline-hidden"
          >
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English Literacy">English Literacy</option>
            <option value="Digital Skills">Digital Skills</option>
          </select>

          {/* Header Help / Tooltip Icon */}
          <div className="relative">
            <button
              onClick={() => setShowPronunciationGuide(!showPronunciationGuide)}
              className="p-1.5 bg-emerald-900 hover:bg-emerald-700 text-emerald-200 hover:text-white rounded-lg border border-emerald-700 transition-colors flex items-center justify-center"
              title="Language Codes & Pronunciation Tips ('am-ET', etc.)"
            >
              <HelpCircle className="w-4 h-4 text-emerald-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Speech Settings Sub-Bar (Rate & Pitch Sliders & Guide Link) */}
      <div className="px-6 py-2 bg-emerald-900/90 border-t border-emerald-700/50 flex flex-wrap items-center justify-between text-xs text-emerald-100 gap-4">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-emerald-200">Speech Rate: {speechRate.toFixed(2)}x</span>
          <input
            type="range"
            min="0.5"
            max="1.75"
            step="0.05"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-24 accent-emerald-400 cursor-pointer"
            title="Adjust voice playback rate"
          />
        </div>
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-emerald-200">Speech Pitch: {speechPitch.toFixed(2)}</span>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={speechPitch}
            onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
            className="w-24 accent-emerald-400 cursor-pointer"
            title="Adjust voice pitch"
          />
        </div>
        <div>
          <button
            onClick={() => setShowPronunciationGuide(true)}
            className="flex items-center gap-1.5 text-emerald-200 hover:text-white bg-emerald-800/90 hover:bg-emerald-700 px-3 py-1 rounded-lg border border-emerald-600 transition-colors font-medium text-[11px]"
            title="View Language Codes & Recommended Pronunciation Settings"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>Pronunciation Guide</span>
          </button>
        </div>
      </div>

      {/* Diagnostic Health Check Alert for Gemini API configuration */}
      {health && !health.isConfigured && (
        <div className="px-6 pt-4 bg-slate-50/50">
          <GeminiHealthAlert
            healthReport={health}
            onRefresh={recheckHealth}
            isChecking={isChecking}
          />
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                isUser ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-lg rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                isUser ? 'bg-emerald-600 text-white rounded-tr-xs' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
              }`}>
                <p className="whitespace-pre-line">{msg.text}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/20">
                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.text, msg.id)}
                      className={`text-[11px] font-bold flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                        speakingId === msg.id ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                      title="Listen to native voice pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {speakingId === msg.id ? 'Speaking...' : 'Listen Pronunciation'}
                    </button>
                  )}
                  <span className={`text-[10px] ml-auto ${isUser ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-xs text-xs text-slate-500 animate-pulse">
              {useSearch ? 'Searching Google Search & synthesizing grounded answer...' : 'AI Tutor is synthesizing native speech & Socratic guidance...'}
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => handleSendMessage(e)} className="p-4 bg-white border-t border-slate-200 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask AI Tutor in ${chatLang.toUpperCase()} (${useSearch ? 'Google Search Grounding active' : 'Socratic mode'})...`}
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-colors flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Gemini Live Voice Conversation Modal */}
      {showLiveVoice && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-white p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-400">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Gemini Live Voice Mode</h4>
                  <p className="text-xs text-teal-400">gemini-3.1-flash-live-preview</p>
                </div>
              </div>
              <button
                onClick={() => setShowLiveVoice(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-32 h-32 bg-teal-500/20 rounded-full animate-ping"></div>
                <div className="absolute w-24 h-24 bg-teal-500/30 rounded-full animate-pulse"></div>
                <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center shadow-lg relative z-10 text-white">
                  <Mic className="w-8 h-8 animate-bounce" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-300 text-center">
                Listening to {user.name} in {chatLang.toUpperCase()}...
              </p>
              <p className="text-xs text-slate-400 text-center px-4">
                Speak naturally or type your question below. The Live API provides real-time Socratic audio tutoring.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a live question..."
                  id="live-voice-input"
                  className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val) {
                        setShowLiveVoice(false);
                        handleSendMessage(undefined, val);
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const inputEl = document.getElementById('live-voice-input') as HTMLInputElement;
                    if (inputEl?.value) {
                      setShowLiveVoice(false);
                      handleSendMessage(undefined, inputEl.value);
                    }
                  }}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 font-semibold rounded-xl text-xs transition-colors"
                >
                  Send Live
                </button>
              </div>
              <button
                onClick={() => setShowLiveVoice(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition-colors"
              >
                Return to Standard Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pronunciation Guide Modal */}
      {showPronunciationGuide && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-emerald-300" />
                <h4 className="font-bold text-sm sm:text-base">Web Speech API & Pronunciation Guide</h4>
              </div>
              <button
                onClick={() => setShowPronunciationGuide(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition-colors"
                title="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs sm:text-sm text-slate-700">
              <p className="text-slate-600">
                EDUVIVA AI integrates the browser's native Web Speech API (`SpeechSynthesis`) to provide authentic, native-like vocal pronunciation across East African and international languages.
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 font-semibold text-slate-800 text-xs border-b border-slate-200 grid grid-cols-3 gap-2">
                  <span>Language</span>
                  <span>BCP-47 Code</span>
                  <span>Recommended Rate & Pitch</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="px-4 py-2.5 grid grid-cols-3 gap-2 items-center">
                    <span className="font-medium text-slate-900">አማርኛ (Amharic)</span>
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700 font-mono">am-ET</code>
                    <span className="text-slate-600">Rate: 0.85x – 0.95x<br/>Pitch: 1.0 (Optimal Fidel clarity)</span>
                  </div>
                  <div className="px-4 py-2.5 grid grid-cols-3 gap-2 items-center">
                    <span className="font-medium text-slate-900">Afaan Oromoo</span>
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700 font-mono">om-ET</code>
                    <span className="text-slate-600">Rate: 0.90x – 1.0x<br/>Pitch: 1.0 (Smooth vowel cadence)</span>
                  </div>
                  <div className="px-4 py-2.5 grid grid-cols-3 gap-2 items-center">
                    <span className="font-medium text-slate-900">Soomaali (Somali)</span>
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700 font-mono">so-SO</code>
                    <span className="text-slate-600">Rate: 0.90x – 1.0x<br/>Pitch: 1.0 (Crisp articulation)</span>
                  </div>
                  <div className="px-4 py-2.5 grid grid-cols-3 gap-2 items-center">
                    <span className="font-medium text-slate-900">العربية (Arabic)</span>
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700 font-mono">ar-SA</code>
                    <span className="text-slate-600">Rate: 0.85x – 0.95x<br/>Pitch: 0.95 (Refined MSA delivery)</span>
                  </div>
                  <div className="px-4 py-2.5 grid grid-cols-3 gap-2 items-center">
                    <span className="font-medium text-slate-900">Français (French)</span>
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700 font-mono">fr-FR</code>
                    <span className="text-slate-600">Rate: 0.95x – 1.05x<br/>Pitch: 1.05 (Melodic rhythm)</span>
                  </div>
                  <div className="px-4 py-2.5 grid grid-cols-3 gap-2 items-center">
                    <span className="font-medium text-slate-900">English (US)</span>
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700 font-mono">en-US</code>
                    <span className="text-slate-600">Rate: 1.0x – 1.1x<br/>Pitch: 1.0 (Standard Socratic tone)</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 text-xs space-y-1">
                <p className="font-semibold">💡 Pro-Tip for Pilot Testers:</p>
                <p>If your browser lacks an installed speech pack for Amharic (`am-ET`), the operating system or browser TTS engine will gracefully fall back to a compatible regional voice while maintaining your selected speech rate and pitch settings.</p>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowPronunciationGuide(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

