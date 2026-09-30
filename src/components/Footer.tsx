import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  navigate: (route: string) => void;
  settings: StoreSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ navigate, settings }) => {
  return (
    <footer className="bg-[#060608] text-white border-t border-neutral-900/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white text-black flex items-center justify-center font-black text-lg rounded-xl shadow-lg shadow-white/5">
                TF
              </div>
              <span className="font-black tracking-widest text-lg bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">TEAM FELCO</span>
            </div>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              Official supplier of premium digital trading and analysis tools. Secure verification & instant support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-xs text-neutral-300 mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home Store</button>
              </li>
              <li>
                <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Our Tools</button>
              </li>
            </ul>
          </div>

          {/* Official Contacts (Dynamic links based on admin settings) */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-xs text-neutral-300 mb-4">Official Channels</h4>
            <div className="flex flex-col space-y-3">
              {/* Telegram */}
              <a 
                href={settings?.supportTelegram || "https://t.me/+NRQwX88nKUQxYWY1"} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-600 rounded-xl p-3 transition-all group shadow"
              >
                <div className="w-8 h-8 rounded-lg bg-[#229ED9] text-white flex items-center justify-center font-black text-xs shadow-md shadow-[#229ED9]/20 group-hover:scale-105 transition-transform shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.05-.78 4.11-1.79 6.85-2.97 8.23-3.54 3.91-1.63 4.72-1.91 5.25-1.92.12 0 .38.03.55.17.14.12.18.28.2.4-.02.07-.02.24-.04.38z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs uppercase tracking-wide text-white">Telegram Channel</div>
                  <div className="text-[10px] text-neutral-400">Click to join</div>
                </div>
              </a>

              {/* Telegram Direct Admin */}
              <a 
                href={settings?.telegramSupportUsername?.startsWith('http') ? settings.telegramSupportUsername : `https://t.me/${settings?.telegramSupportUsername?.replace('@', '') || settings?.supportTelegram?.replace('@', '') || 'TeamFelcoAdmin'}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-600 rounded-xl p-3 transition-all group shadow"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0088cc] to-[#29b6f6] text-white flex items-center justify-center font-black text-xs shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.05-.78 4.11-1.79 6.85-2.97 8.23-3.54 3.91-1.63 4.72-1.91 5.25-1.92.12 0 .38.03.55.17.14.12.18.28.2.4-.02.07-.02.24-.04.38z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs uppercase tracking-wide text-white">Telegram Admin ID</div>
                  <div className="text-[10px] text-neutral-400">Click to chat 24/7</div>
                </div>
              </a>

              {/* YouTube */}
              <a 
                href={settings?.youtubeUrl || "https://youtube.com/@teamfelco_78?si=y8LNiJ9C1MUsNA9Z"} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-600 rounded-xl p-3 transition-all group shadow"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FF0000] text-white flex items-center justify-center font-black text-xs shadow-md shadow-[#FF0000]/20 group-hover:scale-105 transition-transform shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs uppercase tracking-wide text-white">YouTube Channel</div>
                  <div className="text-[10px] text-neutral-400">Watch tutorials</div>
                </div>
              </a>

              {/* Facebook Page (Conditional based on admin configuration) */}
              {settings?.facebookUrl && (
                <a 
                  href={settings.facebookUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-600 rounded-xl p-3 transition-all group shadow"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-black text-xs shadow-md shadow-[#1877F2]/20 group-hover:scale-105 transition-transform shrink-0">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs uppercase tracking-wide text-white">Facebook Page</div>
                    <div className="text-[10px] text-neutral-400">Join our community</div>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* Trust guarantees */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-xs text-neutral-300 mb-4">Guarantees</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Secure Verification</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant Order Processing</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-900/80 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} TEAM FELCO STORE. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
