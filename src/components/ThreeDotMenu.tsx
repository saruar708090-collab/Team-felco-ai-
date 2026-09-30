import React, { useState, useRef, useEffect } from 'react';
import { 
  User, ShoppingBag, Headphones, 
  LogIn, LogOut, ShieldCheck, ChevronRight, UserPlus, Menu 
} from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { StoreSettings } from '../types';

interface ThreeDotMenuProps {
  onOpenAccount: () => void;
  onOpenOrderHistory: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenOrderTracker?: () => void;
  onOpenCustomerService: () => void;
  onOpenNotifications?: () => void;
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
  settings?: StoreSettings | null;
  navigate?: (route: string) => void;
}

export const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({
  onOpenAccount,
  onOpenOrderHistory,
  onOpenAuth,
  onOpenCustomerService,
  settings,
  navigate
}) => {
  const { customerUser, logout } = useCustomerAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* PROFESSIONAL THREE-DOT TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Menu"
        className={`group relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border shadow-sm active:scale-95 select-none ${
          isOpen
            ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/30'
            : customerUser
            ? 'bg-gradient-to-b from-[#141a2e] to-[#0d1222] hover:from-[#1b233d] hover:to-[#12182d] text-white border-blue-500/40 hover:border-blue-400 shadow-md'
            : 'bg-gradient-to-b from-[#181a20] to-[#101216] hover:from-[#22252e] hover:to-[#16181f] text-neutral-300 hover:text-white border-neutral-700/80 hover:border-neutral-500 shadow-sm'
        }`}
        title="Menu"
      >
        {/* If user logged in, show mini status dot */}
        {customerUser ? (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 border border-black animate-pulse" />
        ) : null}

        <Menu className={`w-5 h-5 transition-colors ${isOpen ? 'text-white' : customerUser ? 'text-blue-400 group-hover:text-white' : 'text-neutral-300 group-hover:text-white'}`} />
      </button>

      {/* THREE-DOT MENU DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-72 sm:w-80 rounded-3xl bg-[#0c101d] border border-slate-800/90 text-white shadow-[0_20px_60px_rgba(0,0,0,0.85)] z-50 overflow-hidden animate-fadeIn backdrop-blur-2xl">
          
          {/* USER HEADER OR LOGIN / REGISTRATION BUTTONS */}
          {customerUser ? (
            <div 
              onClick={() => { setIsOpen(false); onOpenAccount(); }}
              className="p-4 bg-gradient-to-b from-[#151e36] to-[#0c101d] border-b border-slate-800/80 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-lg shadow-blue-600/30 border border-white/20 group-hover:scale-105 transition-transform shrink-0 uppercase">
                  {customerUser.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-white truncate group-hover:text-blue-400 transition-colors">
                      {customerUser.name}
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold block">
                    {customerUser.phone}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gradient-to-b from-[#151e36] to-[#0c101d] border-b border-slate-800/80">
              {/* Login / Registration Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAuth('login');
                  }}
                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>LOGIN</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAuth('register');
                  }}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                  <span>REGISTRATION</span>
                </button>
              </div>
            </div>
          )}

          {/* MENU ITEMS: ONLY MY ACCOUNT, MY ODER HISTORY, LIVE SUPPORT */}
          <div className="p-2.5 space-y-1.5">
            
            {/* 1. MY ACCOUNT */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (customerUser) {
                  onOpenAccount();
                } else {
                  onOpenAuth('login');
                }
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-900 text-left transition-all cursor-pointer group border border-slate-800/50 hover:border-blue-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-white group-hover:text-blue-400 transition-colors block uppercase tracking-wide">
                    MY ACCOUNT
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    আমার একাউন্ট ও প্রোফাইল
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>

            {/* 2. MY ODER HISTORY */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenOrderHistory();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-900 text-left transition-all cursor-pointer group border border-slate-800/50 hover:border-emerald-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors block uppercase tracking-wide">
                      MY ODER HISTORY
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-wider border border-emerald-500/30">
                      VIP
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    আমার সকল অর্ডার ও ভিআইপি কোড
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>

            {/* 3. LIVE SUPPORT */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCustomerService();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-900 text-left transition-all cursor-pointer group border border-slate-800/50 hover:border-purple-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-white group-hover:text-purple-400 transition-colors block uppercase tracking-wide">
                    LIVE SUPPORT
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    ২৪/৭ কাস্টমার সার্ভিস চ্যাট
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>

          </div>

          {/* LOGOUT BUTTON AT THE BOTTOM (লগইন করার পর লইআউট বাটন থ্রি ডট নিচে) */}
          {customerUser && (
            <div className="p-3 bg-slate-950 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition-all font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <LogOut className="w-4 h-4" />
                <span>লগআউট (LOGOUT)</span>
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
