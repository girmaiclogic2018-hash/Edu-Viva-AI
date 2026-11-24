import React from 'react';

interface EduvivaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  theme?: 'dark' | 'light' | 'emerald';
}

export const EduvivaLogo: React.FC<EduvivaLogoProps> = ({
  size = 'md',
  showWordmark = true,
  theme = 'emerald',
}) => {
  const dimensions = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-3xl',
  }[size];

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  return (
    <div className="flex items-center gap-3 group cursor-pointer select-none">
      {/* Geometric Symbol: Open Book + Light Spark + Human Growth Pathway */}
      <div className={`relative ${dimensions} rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 flex items-center justify-center text-white shadow-lg ring-2 ring-emerald-500/30 overflow-hidden transform group-hover:scale-105 transition-transform duration-300`}>
        {/* Abstract Knowledge Aura background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(52,211,153,0.4),transparent_70%)]"></div>
        
        {/* Geometric SVG Symbol */}
        <svg className="w-2/3 h-2/3 relative z-10" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Open Book Pages */}
          <path d="M16 8C13.5 6.5 9 6 4 8V24C9 22 13.5 22.5 16 24V8Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 8C18.5 6.5 23 6 28 8V24C23 22 18.5 22.5 16 24V8Z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          
          {/* Central Knowledge Spark / Light Ray */}
          <path d="M16 4V16M13 7L19 13M19 7L13 13" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Human Growth Orbit */}
          <circle cx="16" cy="18" r="3" fill="#34D399" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight ${textSizes} ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              EDUVIVA<span className="text-emerald-600 font-bold ml-1 text-xs px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">AI</span>
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Born in Ethiopia • Built for the World
          </span>
        </div>
      )}
    </div>
  );
};
