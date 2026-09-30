import React, { useState } from 'react';
import { 
  X, Lock, Phone, User, Eye, EyeOff, ShieldCheck, 
  ArrowRight, CheckCircle2, AlertCircle, Sparkles, LogIn, UserPlus, Send, HelpCircle 
} from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { StoreSettings } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
  settings?: StoreSettings | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess,
  settings
}) => {
  const { login, register, loading } = useCustomerAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const telegramSupportUrl = settings?.telegramSupportUsername
    ? (settings.telegramSupportUsername.startsWith('http') ? settings.telegramSupportUsername : `https://t.me/${settings.telegramSupportUsername.replace('@', '')}`)
    : (settings?.supportTelegram?.startsWith('http') ? settings.supportTelegram : `https://t.me/${settings?.supportTelegram?.replace('@', '') || 'TeamFelcoAdmin'}`);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setError('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
        return;
      }
      if (!phone.trim()) {
        setError('অনুগ্রহ করে আপনার মোবাইল নাম্বার লিখুন।');
        return;
      }
      if (!password || password.length < 4) {
        setError('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
        return;
      }

      const res = await register(name, phone, password);
      if (res.success) {
        setSuccess('🎉 অভিনন্দন! অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1200);
      } else {
        setError(res.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
      }
    } else {
      if (!phone.trim()) {
        setError('অনুগ্রহ করে মোবাইল নাম্বার লিখুন।');
        return;
      }
      if (!password) {
        setError('অনুগ্রহ করে পাসওয়ার্ড লিখুন।');
        return;
      }

      const res = await login(phone, password);
      if (res.success) {
        setSuccess('✅ সফলভাবে লগইন হয়েছে!');
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1000);
      } else {
        setError(res.error || 'লগইন ব্যর্থ হয়েছে।');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0e17] text-white border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Card */}
        <div className="p-6 pb-4 text-center bg-gradient-to-b from-[#11182c] to-[#0b0e17] border-b border-slate-800/80 relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
            {mode === 'login' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">
            {settings?.authTitle || (mode === 'login' ? 'কাস্টমার লগইন' : 'নতুন অ্যাকাউন্ট তৈরি করুন')}
          </h2>
          {settings?.authNotice && (
            <p className="text-[10px] text-blue-400 font-bold px-4 mb-1">
              {settings.authNotice}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' 
              ? 'আপনার মোবাইল নাম্বার ও পাসওয়ার্ড দিয়ে লগইন করুন' 
              : 'অর্ডার হিস্ট্রি ও ভিআইপি কোড সুরক্ষিত রাখতে রেজিস্টার করুন'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 mt-4 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                mode === 'login' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              লগইন (Login)
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                mode === 'register' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              রেজিস্ট্রেশন (Register)
            </button>
          </div>
        </div>

        {/* Feedback Notices */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>পুরো নাম (Name) *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                required
                className="w-full bg-black/60 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>মোবাইল নাম্বার (Phone) *</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="মোবাইল নাম্বার লিখুন"
              required
              className="w-full bg-black/60 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>পাসওয়ার্ড (Password) *</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন"
                required
                className="w-full bg-black/60 border border-slate-800 rounded-xl px-4 py-3 pr-11 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'login' && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>পাসওয়ার্ড ভুলে গেছেন?</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span>অপেক্ষা করুন...</span>
            ) : mode === 'login' ? (
              <>
                <span>{settings?.loginBtnText || 'লগইন করুন'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>{settings?.registerBtnText || 'রেজিস্ট্রেশন করুন'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              অ্যাকাউন্ট নেই?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className="text-blue-400 font-bold hover:underline cursor-pointer"
              >
                এখানে ক্লিক করে রেজিস্ট্রেশন করুন
              </button>
            </p>
          ) : (
            <p>
              ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-blue-400 font-bold hover:underline cursor-pointer"
              >
                লগইন করুন
              </button>
            </p>
          )}
        </div>

        {/* Forgot Password Telegram Support Modal */}
        {showForgotPassword && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="bg-[#0c101d] text-white border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative max-w-xs w-full">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-[#229ED9]/15 border border-[#229ED9]/30 text-[#229ED9] flex items-center justify-center mx-auto shadow-lg shadow-[#229ED9]/20">
                <Send className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-black uppercase text-white">পাসওয়ার্ড ভুলে গেছেন?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  পাসওয়ার্ড উদ্ধার বা রিসেট করতে আমাদের অফিশিয়াল টেলিগ্রাম সাপোর্টে যোগাযোগ করুন। আপনার রেজিস্টার্ড নাম্বার জানালে অবিলম্বে পাসওয়ার্ড সমাধান হবে।
                </p>
              </div>

              <a
                href={telegramSupportUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-3 bg-gradient-to-r from-[#229ED9] to-[#0088cc] hover:from-[#1e8bc0] hover:to-[#0077b5] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#229ED9]/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>টেলিগ্রাম সাপোর্টে যোগাযোগ</span>
              </a>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full py-1.5 text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                লগইনে ফিরে যান
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
