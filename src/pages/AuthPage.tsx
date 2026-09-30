import React, { useState } from 'react';
import { 
  Lock, Phone, User, Eye, EyeOff, ShieldCheck, 
  ArrowRight, CheckCircle2, AlertCircle, Home, LogIn, UserPlus, Send, HelpCircle, X 
} from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { StoreSettings } from '../types';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  navigate: (route: string) => void;
  theme?: 'dark' | 'light';
  settings?: StoreSettings | null;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  navigate,
  theme = 'dark',
  settings
}) => {
  const { login, register, loading } = useCustomerAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const telegramSupportUrl = settings?.telegramSupportUsername
    ? (settings.telegramSupportUsername.startsWith('http') ? settings.telegramSupportUsername : `https://t.me/${settings.telegramSupportUsername.replace('@', '')}`)
    : (settings?.supportTelegram?.startsWith('http') ? settings.supportTelegram : `https://t.me/${settings?.supportTelegram?.replace('@', '') || 'TeamFelcoAdmin'}`);

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
          navigate('/');
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
          navigate('/');
        }, 1000);
      } else {
        setError(res.error || 'লগইন ব্যর্থ হয়েছে।');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-center items-center p-4 py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div 
            onClick={() => navigate('/')}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow hover:border-neutral-700 transition-all mb-2"
          >
            {settings?.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt="Logo" 
                className="w-6 h-6 rounded-lg object-contain bg-black"
              />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                TF
              </div>
            )}
            <span className="font-black text-xs uppercase tracking-wider text-white">
              {settings?.storeName || 'TEAM FELCO'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            {settings?.authTitle || (mode === 'login' ? 'কাস্টমার লগইন' : 'নতুন অ্যাকাউন্ট তৈরি')}
          </h1>
          {settings?.authNotice && (
            <p className="text-xs text-blue-400 font-bold px-4 mb-2">
              {settings.authNotice}
            </p>
          )}
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {mode === 'login'
              ? 'মোবাইল নাম্বার ও পাসওয়ার্ড দিয়ে আপনার অ্যাকাউন্টে লগইন করুন'
              : 'অর্ডার হিস্ট্রি ও ভিআইপি অ্যাক্টিভেশন কোড সংরক্ষণ করতে একাউন্ট খুলুন'}
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-[#0c101c] border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 backdrop-blur-xl">
          
          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>লগইন (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>রেজিস্ট্রেশন (Register)</span>
            </button>
          </div>

          {/* Feedback Notices */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full bg-black/70 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                className="w-full bg-black/70 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono font-bold"
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
                  className="w-full bg-black/70 border border-slate-800 rounded-xl px-4 py-3 pr-11 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
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
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <span>যাচাই করা হচ্ছে...</span>
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
        </div>

        {/* Back to Home Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>হোম পেজে ফিরে যান</span>
          </button>
        </div>

      </div>

      {/* Forgot Password Telegram Support Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0c101d] text-white border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
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
              <h3 className="text-lg font-black uppercase text-white">{settings?.forgotPasswordTitle || 'পাসওয়ার্ড ভুলে গেছেন?'}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {settings?.forgotPasswordText || 'পাসওয়ার্ড উদ্ধার বা রিসেট করতে আমাদের অফিশিয়াল টেলিগ্রাম সাপোর্টে যোগাযোগ করুন। আপনার রেজিস্টার্ড নাম্বারটি জানালে অ্যাডমিন অবিলম্বে পাসওয়ার্ড সমাধান করে দেবে।'}
              </p>
            </div>

            <a
              href={telegramSupportUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#229ED9] to-[#0088cc] hover:from-[#1e8bc0] hover:to-[#0077b5] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#229ED9]/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>টেলিগ্রাম সাপোর্টে মেসেজ দিন</span>
            </a>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white font-bold cursor-pointer transition-colors"
            >
              লগইনে ফিরে যান
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
