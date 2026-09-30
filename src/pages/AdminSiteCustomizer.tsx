import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { StoreSettings } from '../types';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Palette, 
  Save, 
  Check, 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Megaphone, 
  Headphones, 
  ShieldCheck, 
  FileText, 
  Link as LinkIcon, 
  Globe, 
  Eye, 
  RotateCcw,
  Sliders,
  Type,
  LogIn,
  ShieldAlert
} from 'lucide-react';

interface AdminSiteCustomizerProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const AdminSiteCustomizer: React.FC<AdminSiteCustomizerProps> = ({ currentRoute, navigate }) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'popup' | 'homepage' | 'support' | 'features' | 'footer' | 'auth' | 'maintenance'>('branding');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Comprehensive Settings State
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'TEAM FELCO',
    logoUrl: '',
    siteTagline: 'Official VIP Hack & Analysis Tools Store',
    
    // Scrolling Notice & Hero
    scrollingNotice: '🔥 TEAM FELCO অফিশিয়াল স্টোরে স্বাগতম! সকল কালার ট্রেডিং গেম হ্যাক ও এভিয়েটর সিগন্যাল টুল ১০০% নিরাপদ ও ইনস্ট্যান্ট অ্যাক্টিভেশনসহ উপলব্ধ!',
    heroBannerTitle: 'PREMIUM COLOUR TRADING & AVIATOR PREDICTORS',
    heroBannerSubtitle: '১০৯+ গেমের ১০০% একুরেট এআই সিগন্যাল ও ভিআইপি প্রিডিকশন বট সরাসরি সংগ্রহ করুন',
    heroBannerImage: '',

    // Official Entry Pop-up Notice
    popupNoticeActive: true,
    popupNoticeTitle: '⚠️ গুরুত্বপূর্ণ অফিশিয়াল নোটিশ ও সতর্কতা',
    popupNoticeText: 'Team Felco-র সকল ভিআইপি কালার ট্রেডিং ও এভিয়েটর হ্যাক শুধুমাত্র আমাদের এই অফিশিয়াল ওয়েবসাইট থেকে অর্ডার করুন। বিকাশ বা নগদ পেমেন্ট সম্পন্ন করার পর TrxID সাবমিট করুন।',
    popupNoticeImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    popupNoticeButtonText: 'Join Official Telegram',
    popupNoticeButtonLink: 'https://t.me/+NRQwX88nKUQxYWY1',

    // Support & Social Links
    supportWhatsApp: '01613562615',
    supportTelegram: 'https://t.me/+NRQwX88nKUQxYWY1',
    telegramChannelUrl: 'https://t.me/+NRQwX88nKUQxYWY1',
    telegramSupportUsername: 'TeamFelcoAdmin',
    youtubeUrl: 'https://youtube.com/@teamfelco_78?si=y8LNiJ9C1MUsNA9Z',
    facebookUrl: '',
    supportText: 'আমাদের কালার ট্রেডিং বা এভিয়েটর টুল সংক্রান্ত যেকোনো সহায়তায় সরাসরি হোয়াটসঅ্যাপ অথবা টেলিগ্রাম অ্যাডমিনের সাথে যোগাযোগ করুন।',
    businessHours: '২৪ ঘণ্টা লাইভ সাপোর্ট (24/7 Available)',
    supportBannerImage: '',

    // Track Order & Features
    trackOrderBannerTitle: 'TRACK YOUR ORDER INSTANTLY',
    trackOrderBannerSubtitle: 'TrxID বা অর্ডার আইডি দিয়ে মুহূর্তেই আপনার অর্ডারের লাইভ স্ট্যাটাস চেক করুন।',
    feature1Title: 'ইনস্ট্যান্ট অটো ডেলিভারি',
    feature1Desc: 'পেমেন্ট ভেরিফাই হওয়ার পর স্বয়ংক্রিয়ভাবে কোড ও ফাইল অ্যাক্টিভেশন।',
    feature2Title: '১০০% সেইফ ও অ্যান্টি-ব্যান',
    feature2Desc: 'সর্বাধুনিক সিকিউর বাইপাস সিস্টেমযুক্ত টুল।',
    feature3Title: '২৪/৭ ডেডিকেটেড সাপোর্ট',
    feature3Desc: 'যেকোনো সমস্যায় টেলিগ্রাম ও হোয়াটসঅ্যাপে সার্বক্ষণিক সহায়তা।',

    // Footer & About
    footerAboutText: 'অফিশিয়াল প্রোভাইডার অফ প্রিমিয়াম ডিজিটাল ট্রেডিং ও গেম অ্যানালাইসিস টুলস। সিকিউর ভেরিফিকেশন ও ইনস্ট্যান্ট ডেলিভারি।',
    footerCopyrightText: '© 2026 TEAM FELCO. All rights reserved. Official Verified Store.',

    // Auth Settings
    authTitle: 'Welcome to Team Felco',
    loginBtnText: 'লগইন করুন',
    registerBtnText: 'রেজিস্ট্রেশন করুন',
    authNotice: '',
    gameFilterLabel: 'Game Filter:',
    buyNowBtnText: 'BUY NOW ➔',
    maintenanceMode: false,
    maintenanceMessage: 'We are currently updating our systems for better accuracy. We will be back online shortly!',

    // Payment Defaults (maintained)
    bkashNumber: '01613562615',
    bkashActive: true,
    nagadNumber: '01613562615',
    nagadActive: true,
    rocketNumber: '01613562615',
    rocketActive: true,
    paymentInstructions: '১. আপনার বিকাশ/নগদ/রকেট অ্যাপ থেকে উপরের নাম্বারে "Send Money" করুন।\n২. ট্রানজ্যাকশন সম্পন্ন হলে প্রাপ্ত TrxID টি কপি করুন।\n৩. নিচে TrxID এবং রিসিটের স্ক্রিনশট আপলোড করে অর্ডার কনফার্ম করুন।'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) {
        const data = snap.data() as StoreSettings;
        setSettings(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError('সেটিংস লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (field: keyof StoreSettings, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_dim = 1000;

        if (width > height) {
          if (width > max_dim) {
            height *= max_dim / width;
            width = max_dim;
          }
        } else {
          if (height > max_dim) {
            width *= max_dim / height;
            height = max_dim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        setSettings(prev => ({
          ...prev,
          [field]: compressed
        }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save settings error:', err);
      setError(err.message || 'সেটিংস সেভ করতে ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'branding', label: 'লোগো ও ব্র্যান্ডিং', icon: Palette, desc: 'দোকানের নাম, লোগো ও ট্যাগলাইন' },
    { id: 'popup', label: 'পপআপ নোটিশ ও ব্যানার', icon: Megaphone, desc: 'এন্ট্রি পপআপ ও ব্যানার ফটো' },
    { id: 'homepage', label: 'স্ক্রোলিং নোটিশ ও হেডার', icon: Type, desc: 'টিককার টেক্সট ও হোমপেজ হেডার' },
    { id: 'support', label: 'হোয়াটসঅ্যাপ ও সাপোর্ট', icon: Headphones, desc: 'সোশ্যাল লিংক, নাম্বার ও সময়' },
    { id: 'features', label: 'ট্র্যাকিং ও ফিচার বক্স', icon: ShieldCheck, desc: 'অর্ডার ট্র্যাকার ও গ্যারান্টি টেক্সট' },
    { id: 'footer', label: 'ফুটার ও কপিরাইট', icon: FileText, desc: 'দোকান বিবরণ ও ফুটার টেক্সট' },
    { id: 'auth', label: 'লগইন ও রেজিস্ট্রেশন', icon: Sliders, desc: 'লগইন পেজ টেক্সট ও বাটন' },
    { id: 'maintenance', label: 'মেইনটেন্যান্স মোড', icon: ShieldAlert, desc: 'সাইট সাময়িক বন্ধ রাখা' },
  ];

  return (
    <AdminLayout currentRoute={currentRoute} navigate={navigate}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Title & Save Button Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-6 rounded-3xl border border-neutral-800 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs uppercase font-black tracking-widest text-emerald-400">Site Content & Visual Manager</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
              <span>সাইট কাস্টমাইজেশন ও টেক্সট/ফটো এডিটর</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              ওয়েবসাইটের প্রতিটি টেক্সট, ব্যানার ফটো, লোগো, নোটিশ এবং সোশ্যাল মিডিয়া লিংক এখান থেকে লাইভ এডিট করুন।
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={fetchSettings}
              disabled={loading || saving}
              className="px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors border border-neutral-800 flex items-center gap-1.5 cursor-pointer"
              title="রিলোড করুন"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black uppercase text-xs sm:text-sm tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Saved Live! (সেভ হয়েছে)</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Changes (সব সেভ করুন)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {savedSuccess && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 shrink-0" />
            <span>🎉 দারুণ! আপনার পরিবর্তনগুলো সফলভাবে ওয়েবসাইটে আপডেট করা হয়েছে। হোমপেজ রিফ্রেশ করে দেখতে পারেন।</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/15 border border-red-500/40 rounded-2xl text-red-400 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fadeIn">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Tab Navigation Segmented Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between gap-2 cursor-pointer ${
                  isCurrent
                    ? 'bg-white text-black border-white shadow-xl scale-[1.02]'
                    : 'bg-neutral-950/80 border-neutral-850 text-neutral-400 hover:text-white hover:bg-neutral-900 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-black' : 'text-neutral-400'}`} />
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                </div>
                <div>
                  <div className={`text-xs font-black uppercase tracking-tight ${isCurrent ? 'text-black' : 'text-neutral-200'}`}>
                    {tab.label}
                  </div>
                  <div className={`text-[10px] truncate ${isCurrent ? 'text-neutral-600' : 'text-neutral-500'}`}>
                    {tab.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* TAB 1: BRANDING & LOGO */}
        {activeTab === 'branding' && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fadeIn">
            <div className="border-b border-neutral-900 pb-4">
              <h2 className="text-lg font-black uppercase text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-400" />
                <span>দোকানের ব্র্যান্ডিং ও লোগো (Brand Identity)</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                আপনার স্টোরের নাম, হেডার ট্যাগলাইন এবং কাস্টম লোগো ছবি পরিবর্তন করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Store Name (দোকানের নাম) *
                  </label>
                  <input
                    type="text"
                    value={settings.storeName || ''}
                    onChange={e => setSettings(prev => ({ ...prev, storeName: e.target.value }))}
                    placeholder="যেমন: TEAM FELCO"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white font-bold tracking-wider focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-neutral-500">হেডার ও ফুটার সর্বত্র এই নাম প্রদর্শিত হবে</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Site Subtitle / Tagline (ট্যাগলাইন)
                  </label>
                  <input
                    type="text"
                    value={settings.siteTagline || ''}
                    onChange={e => setSettings(prev => ({ ...prev, siteTagline: e.target.value }))}
                    placeholder="যেমন: Official VIP Hack & Analysis Tools Store"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-neutral-500">লোগোর নিচে ছোট আকারে দেখা যাবে</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Logo Image URL (অথবা নিচে আপলোড করুন)
                  </label>
                  <input
                    type="text"
                    value={settings.logoUrl || ''}
                    onChange={e => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://.../logo.png"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Logo Photo Upload & Live Preview */}
              <div className="space-y-3 bg-neutral-900/50 p-5 rounded-2xl border border-neutral-850">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block flex items-center justify-between">
                  <span>Custom Logo Upload (লোগো ছবি আপলোড)</span>
                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, logoUrl: '' }))}
                      className="text-[10px] text-red-400 hover:underline cursor-pointer"
                    >
                      Remove Logo (মুছে ফেলুন)
                    </button>
                  )}
                </label>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Store Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="w-12 h-12 bg-white text-black font-black text-xl rounded-xl flex items-center justify-center">
                        TF
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="logo-upload"
                      className="hidden"
                      onChange={e => handleImageUpload('logoUrl', e)}
                    />
                    <label
                      htmlFor="logo-upload"
                      className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer border border-neutral-700"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo Photo</span>
                    </label>
                    <p className="text-[10px] text-neutral-500">
                      PNG / SVG / JPEG স্কয়ার ফরম্যাট লোগো সবচেয়ে সুন্দর দেখাবে।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: POPUP NOTICE & BANNER */}
        {activeTab === 'popup' && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fadeIn">
            <div className="border-b border-neutral-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black uppercase text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-blue-400" />
                  <span>এন্ট্রি পপআপ নোটিশ ও ফটো ব্যানার (Entry Modal)</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  কাস্টমার ওয়েবসাইটে ঢোকার সাথে সাথে যে স্প্রিং অ্যানিমেশন নোটিশটি আসে তা এখান থেকে নিয়ন্ত্রণ করুন।
                </p>
              </div>

              {/* Popup Toggle Switch */}
              <div className="flex items-center gap-3 bg-neutral-900 p-2 rounded-2xl border border-neutral-800 shrink-0">
                <span className="text-xs font-bold text-neutral-300">পপআপ অন/অফ:</span>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, popupNoticeActive: !prev.popupNoticeActive }))}
                  className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    settings.popupNoticeActive
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {settings.popupNoticeActive ? '🟢 ACTIVE (চালু)' : '🔴 DISABLED (বন্ধ)'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Popup Title (পপআপের মূল হেডিং)
                  </label>
                  <input
                    type="text"
                    value={settings.popupNoticeTitle || ''}
                    onChange={e => setSettings(prev => ({ ...prev, popupNoticeTitle: e.target.value }))}
                    placeholder="যেমন: OFFICIAL ANNOUNCEMENT"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Notice Text / Announcement Details (নোটিশের বিস্তারিত টেক্সট)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.popupNoticeText || ''}
                    onChange={e => setSettings(prev => ({ ...prev, popupNoticeText: e.target.value }))}
                    placeholder="পপআপে যা যা বার্তা দেখাতে চান তা লিখুন..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                      Button Text (বাটনের লেখা)
                    </label>
                    <input
                      type="text"
                      value={settings.popupNoticeButtonText || ''}
                      onChange={e => setSettings(prev => ({ ...prev, popupNoticeButtonText: e.target.value }))}
                      placeholder="যেমন: Join Official Telegram"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                      Button Link (বাটন লিংক)
                    </label>
                    <input
                      type="text"
                      value={settings.popupNoticeButtonLink || ''}
                      onChange={e => setSettings(prev => ({ ...prev, popupNoticeButtonLink: e.target.value }))}
                      placeholder="https://t.me/..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Popup Banner Photo Upload & Preview */}
              <div className="space-y-3 bg-neutral-900/50 p-5 rounded-2xl border border-neutral-850">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Popup Banner Image (পপআপ ব্যানার ছবি)
                  </label>
                  {settings.popupNoticeImage && (
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, popupNoticeImage: '' }))}
                      className="text-[10px] text-red-400 hover:underline cursor-pointer"
                    >
                      Remove Photo (ছবি মুছুন)
                    </button>
                  )}
                </div>

                <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center shadow-md">
                  {settings.popupNoticeImage ? (
                    <img src={settings.popupNoticeImage} alt="Popup Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4 text-neutral-500 space-y-1">
                      <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                      <span className="text-xs">No banner photo selected</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400">Photo URL (সরাসরি ছবির লিংক):</label>
                    <input
                      type="text"
                      value={settings.popupNoticeImage || ''}
                      onChange={e => setSettings(prev => ({ ...prev, popupNoticeImage: e.target.value }))}
                      placeholder="https://.../banner.jpg"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    id="popup-img-upload"
                    className="hidden"
                    onChange={e => handleImageUpload('popupNoticeImage', e)}
                  />
                  <label
                    htmlFor="popup-img-upload"
                    className="w-full py-2.5 px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer border border-blue-500/30"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Banner from Device (গ্যালারি থেকে দিন)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HOMEPAGE TICKER & HERO */}
        {activeTab === 'homepage' && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fadeIn">
            <div className="border-b border-neutral-900 pb-4">
              <h2 className="text-lg font-black uppercase text-white flex items-center gap-2">
                <Type className="w-5 h-5 text-amber-400" />
                <span>হোমপেজ স্ক্রোলিং নোটিশ ও হেডার ব্যানার</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                হোমপেজের ওপর দিয়ে চলা অ্যানিমেটেড স্ক্রোলিং নোটিশ এবং মূল ব্যানার টেক্সট এডিট করুন।
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Scrolling Marquee Announcement (চলন্ত নোটিশ টেক্সট) *</span>
                </label>
                <textarea
                  rows={2}
                  value={settings.scrollingNotice || ''}
                  onChange={e => setSettings(prev => ({ ...prev, scrollingNotice: e.target.value }))}
                  placeholder="হোমপেজের নোটিশ বারে যা যা লেখা স্ক্রোল হবে তা এখানে লিখুন..."
                  className="w-full bg-neutral-900 border border-emerald-500/40 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 leading-relaxed font-medium"
                />
                <span className="text-[10px] text-neutral-500">খালি রাখলে নোটিশ বারটি স্বয়ংক্রিয়ভাবে হাইড থাকবে।</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                      Hero Banner Heading (ব্যানার হেডিং)
                    </label>
                    <input
                      type="text"
                      value={settings.heroBannerTitle || ''}
                      onChange={e => setSettings(prev => ({ ...prev, heroBannerTitle: e.target.value }))}
                      placeholder="যেমন: PREMIUM COLOUR TRADING & AVIATOR PREDICTORS"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                      Hero Banner Subtitle (ব্যানার সাবটাইটেল)
                    </label>
                    <textarea
                      rows={3}
                      value={settings.heroBannerSubtitle || ''}
                      onChange={e => setSettings(prev => ({ ...prev, heroBannerSubtitle: e.target.value }))}
                      placeholder="হেডিংয়ের নিচের বিবরণ..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-3 bg-neutral-900/50 p-5 rounded-2xl border border-neutral-850">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Hero Custom Background / Photo (ঐচ্ছিক ব্যাকগ্রাউন্ড ছবি)
                  </label>

                  <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                    {settings.heroBannerImage ? (
                      <img src={settings.heroBannerImage} alt="Hero Banner" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-neutral-500">Default Dark Neon Gradient Active</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="hero-img-upload"
                      className="hidden"
                      onChange={e => handleImageUpload('heroBannerImage', e)}
                    />
                    <label
                      htmlFor="hero-img-upload"
                      className="flex-1 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-700"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Banner</span>
                    </label>

                    {settings.heroBannerImage && (
                      <button
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, heroBannerImage: '' }))}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-500/30 transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Labels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-neutral-900 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Game Filter Label (গেম ফিল্টার লেবেল)
                  </label>
                  <input
                    type="text"
                    value={settings.gameFilterLabel || ''}
                    onChange={e => setSettings(prev => ({ ...prev, gameFilterLabel: e.target.value }))}
                    placeholder="Default: Game Filter:"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Default Buy Now Button Text (বাই নাউ বাটন টেক্সট)
                  </label>
                  <input
                    type="text"
                    value={settings.buyNowBtnText || ''}
                    onChange={e => setSettings(prev => ({ ...prev, buyNowBtnText: e.target.value }))}
                    placeholder="Default: BUY NOW ➔"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-neutral-500">প্রোডাক্টের নিজস্ব বাটন টেক্সট না থাকলে এটি ব্যবহৃত হবে।</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WHATSAPP, SUPPORT & SOCIALS */}
        {activeTab === 'support' && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fadeIn">
            <div className="border-b border-neutral-900 pb-4">
              <h2 className="text-lg font-black uppercase text-white flex items-center gap-2">
                <Headphones className="w-5 h-5 text-emerald-400" />
                <span>কাস্টমার সাপোর্ট, হোয়াটসঅ্যাপ ও সোশ্যাল মিডিয়া লিংক</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                কাস্টমার যেসব মাধ্যমে আপনার সাথে যোগাযোগ করবে (WhatsApp, Telegram Admin, Channel, YouTube, Facebook)।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* WhatsApp Support Number */}
                <div className="space-y-1.5 bg-[#25D366]/10 p-4 rounded-2xl border border-[#25D366]/30">
                  <label className="text-xs font-black uppercase tracking-wider text-[#25D366] flex items-center gap-1.5">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>Support WhatsApp Number (অফিশিয়াল হোয়াটসঅ্যাপ নাম্বার) *</span>
                  </label>
                  <input
                    type="text"
                    value={settings.supportWhatsApp || ''}
                    onChange={e => setSettings(prev => ({ ...prev, supportWhatsApp: e.target.value }))}
                    placeholder="যেমন: 01613562615"
                    className="w-full bg-black/80 border border-[#25D366]/40 rounded-xl px-4 py-3 text-sm text-[#25D366] font-mono font-bold focus:outline-none focus:border-[#25D366]"
                  />
                  <span className="text-[10px] text-neutral-400">অর্ডার কনফার্ম করার পর কাস্টমার সরাসরি এই নাম্বারে চ্যাট শুরু করতে পারবে।</span>
                </div>

                {/* Telegram Admin Username */}
                <div className="space-y-1.5 bg-[#0088cc]/10 p-4 rounded-2xl border border-[#0088cc]/30">
                  <label className="text-xs font-black uppercase tracking-wider text-[#0088cc] flex items-center gap-1.5">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.05-.78 4.11-1.79 6.85-2.97 8.23-3.54 3.91-1.63 4.72-1.91 5.25-1.92.12 0 .38.03.55.17.14.12.18.28.2.4-.02.07-.02.24-.04.38z"/>
                    </svg>
                    <span>Telegram Admin Username / ID (টেলিগ্রাম অ্যাডমিন) *</span>
                  </label>
                  <input
                    type="text"
                    value={settings.telegramSupportUsername || ''}
                    onChange={e => setSettings(prev => ({ ...prev, telegramSupportUsername: e.target.value }))}
                    placeholder="যেমন: TeamFelcoAdmin অথবা https://t.me/TeamFelcoAdmin"
                    className="w-full bg-black/80 border border-[#0088cc]/40 rounded-xl px-4 py-3 text-sm text-blue-400 font-mono font-bold focus:outline-none focus:border-blue-400"
                  />
                  <span className="text-[10px] text-neutral-400">@ ছাড়া বা @ সহ ইউজারনেম দিতে পারেন।</span>
                </div>

                {/* Telegram Official Channel */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Official Telegram Channel Link (টেলিগ্রাম চ্যানেল লিংক)
                  </label>
                  <input
                    type="text"
                    value={settings.telegramChannelUrl || ''}
                    onChange={e => setSettings(prev => ({ ...prev, telegramChannelUrl: e.target.value }))}
                    placeholder="https://t.me/+..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {/* YouTube Channel */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block flex items-center gap-1.5">
                    <span className="text-red-500 font-black">▶</span>
                    <span>YouTube Channel Link (ইউটিউব চ্যানেল লিংক)</span>
                  </label>
                  <input
                    type="text"
                    value={settings.youtubeUrl || ''}
                    onChange={e => setSettings(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder="https://youtube.com/@..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Facebook Page */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Facebook Page / Group Link (ফেসবুক পেজ লিংক - ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={settings.facebookUrl || ''}
                    onChange={e => setSettings(prev => ({ ...prev, facebookUrl: e.target.value }))}
                    placeholder="https://facebook.com/..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Working Hours & Support Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Business Hours (সাপোর্টের সময়সূচী)
                  </label>
                  <input
                    type="text"
                    value={settings.businessHours || ''}
                    onChange={e => setSettings(prev => ({ ...prev, businessHours: e.target.value }))}
                    placeholder="যেমন: ২৪ ঘণ্টা লাইভ সাপোর্ট (24/7 Available)"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Support Modal Greeting & Help Text (সাপোর্ট সেন্টারের মূল বার্তা)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.supportText || ''}
                    onChange={e => setSettings(prev => ({ ...prev, supportText: e.target.value }))}
                    placeholder="সাপোর্ট মডালে প্রদর্শিত নির্দেশিকা..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FEATURES & TRUST BADGES */}
        {activeTab === 'features' && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fadeIn">
            <div className="border-b border-neutral-900 pb-4">
              <h2 className="text-lg font-black uppercase text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>অর্ডার ট্র্যাকিং ও ট্রাস্ট ফিচার বক্স টেক্সট</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                হোমপেজের 'Track Order' কার্ড এবং কাস্টমার গ্যারান্টি বক্সের টেক্সট কাস্টমাইজ করুন।
              </p>
            </div>

            <div className="space-y-6">
              {/* Track Order Card Texts */}
              <div className="bg-neutral-900/40 p-5 rounded-2xl border border-neutral-850 space-y-4">
                <span className="text-xs font-black uppercase text-emerald-400 tracking-wider block">
                  Track Order Quick Banner
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-neutral-300">Banner Heading (শিরোনাম)</label>
                    <input
                      type="text"
                      value={settings.trackOrderBannerTitle || ''}
                      onChange={e => setSettings(prev => ({ ...prev, trackOrderBannerTitle: e.target.value }))}
                      placeholder="TRACK YOUR ORDER"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-neutral-300">Subtitle (সাবটাইটেল)</label>
                    <input
                      type="text"
                      value={settings.trackOrderBannerSubtitle || ''}
                      onChange={e => setSettings(prev => ({ ...prev, trackOrderBannerSubtitle: e.target.value }))}
                      placeholder="Check status instantly with TrxID or Order ID."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3 Trust Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Feature 1 */}
                <div className="bg-neutral-900/40 p-4 rounded-2xl border border-neutral-850 space-y-3">
                  <span className="text-xs font-black uppercase text-blue-400 tracking-wider block">
                    Feature #1 (ইনস্ট্যান্ট ডেলিভারি)
                  </span>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-neutral-400 font-bold">Title</label>
                    <input
                      type="text"
                      value={settings.feature1Title || ''}
                      onChange={e => setSettings(prev => ({ ...prev, feature1Title: e.target.value }))}
                      placeholder="ইনস্ট্যান্ট ডেলিভারি"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-neutral-400 font-bold">Description</label>
                    <textarea
                      rows={2}
                      value={settings.feature1Desc || ''}
                      onChange={e => setSettings(prev => ({ ...prev, feature1Desc: e.target.value }))}
                      placeholder="বিবরণ লিখুন..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-neutral-900/40 p-4 rounded-2xl border border-neutral-850 space-y-3">
                  <span className="text-xs font-black uppercase text-emerald-400 tracking-wider block">
                    Feature #2 (সিকিউরিটি গ্যারান্টি)
                  </span>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-neutral-400 font-bold">Title</label>
                    <input
                      type="text"
                      value={settings.feature2Title || ''}
                      onChange={e => setSettings(prev => ({ ...prev, feature2Title: e.target.value }))}
                      placeholder="১০০% সেইফ ও অ্যান্টি-ব্যান"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-neutral-400 font-bold">Description</label>
                    <textarea
                      rows={2}
                      value={settings.feature2Desc || ''}
                      onChange={e => setSettings(prev => ({ ...prev, feature2Desc: e.target.value }))}
                      placeholder="বিবরণ লিখুন..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-neutral-900/40 p-4 rounded-2xl border border-neutral-850 space-y-3">
                  <span className="text-xs font-black uppercase text-amber-400 tracking-wider block">
                    Feature #3 (লাইভ সাপোর্ট)
                  </span>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-neutral-400 font-bold">Title</label>
                    <input
                      type="text"
                      value={settings.feature3Title || ''}
                      onChange={e => setSettings(prev => ({ ...prev, feature3Title: e.target.value }))}
                      placeholder="২৪/৭ ডেডিকেটেড সাপোর্ট"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-neutral-400 font-bold">Description</label>
                    <textarea
                      rows={2}
                      value={settings.feature3Desc || ''}
                      onChange={e => setSettings(prev => ({ ...prev, feature3Desc: e.target.value }))}
                      placeholder="বিবরণ লিখুন..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: FOOTER & COPYRIGHT */}
        {activeTab === 'footer' && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fadeIn">
            <div className="border-b border-neutral-900 pb-4">
              <h2 className="text-lg font-black uppercase text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>ফুটার টেক্সট ও কপিরাইট ইনফরমেশন</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                ওয়েবসাইটের নিচের অংশের বিবরণ ও কপিরাইট টেক্সট পরিবর্তন করুন।
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                  Footer About Store Summary (দোকান পরিচিতি সংক্ষিপ্ত বার্তা)
                </label>
                <textarea
                  rows={3}
                  value={settings.footerAboutText || ''}
                  onChange={e => setSettings(prev => ({ ...prev, footerAboutText: e.target.value }))}
                  placeholder="Official supplier of premium digital trading and analysis tools..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                  Footer Copyright Notice (কপিরাইট লাইন)
                </label>
                <input
                  type="text"
                  value={settings.footerCopyrightText || ''}
                  onChange={e => setSettings(prev => ({ ...prev, footerCopyrightText: e.target.value }))}
                  placeholder="© 2026 TEAM FELCO. All rights reserved. Official Verified Store."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: LOGIN & REGISTRATION */}
        {activeTab === 'auth' && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fadeIn">
            <div className="border-b border-neutral-900 pb-4">
              <h2 className="text-lg font-black uppercase text-white flex items-center gap-2">
                <LogIn className="w-5 h-5 text-indigo-400" />
                <span>লগইন ও রেজিস্ট্রেশন পেজ এডিটর</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                লগইন এবং রেজিস্ট্রেশন পেজের টাইটেল, বাটন টেক্সট এবং স্পেশাল নোটিশ এখান থেকে এডিট করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Auth Page Title (পেইজের টাইটেল)
                  </label>
                  <input
                    type="text"
                    value={settings.authTitle || ''}
                    onChange={e => setSettings(prev => ({ ...prev, authTitle: e.target.value }))}
                    placeholder="যেমন: Welcome to Team Felco"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Auth Special Notice (স্পেশাল নোটিশ - ঐচ্ছিক)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.authNotice || ''}
                    onChange={e => setSettings(prev => ({ ...prev, authNotice: e.target.value }))}
                    placeholder="লগইন/রেজিঃ পেজে কোনো বিশেষ বার্তা দেখাতে চাইলে এখানে লিখুন..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Login Button Text (লগইন বাটনের লেখা)
                  </label>
                  <input
                    type="text"
                    value={settings.loginBtnText || ''}
                    onChange={e => setSettings(prev => ({ ...prev, loginBtnText: e.target.value }))}
                    placeholder="Default: লগইন করুন"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Registration Button Text (রেজিস্ট্রেশন বাটনের লেখা)
                  </label>
                  <input
                    type="text"
                    value={settings.registerBtnText || ''}
                    onChange={e => setSettings(prev => ({ ...prev, registerBtnText: e.target.value }))}
                    placeholder="Default: রেজিস্ট্রেশন করুন"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5 pt-4 border-t border-neutral-900">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-400 block">
                    Forgot Password Modal Title (পাসওয়ার্ড ভুলে গেলে পপআপ টাইটেল)
                  </label>
                  <input
                    type="text"
                    value={settings.forgotPasswordTitle || ''}
                    onChange={e => setSettings(prev => ({ ...prev, forgotPasswordTitle: e.target.value }))}
                    placeholder="Default: পাসওয়ার্ড ভুলে গেছেন?"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-400 block">
                    Forgot Password Modal Message (পাসওয়ার্ড ভুলে গেলে পপআপ মেসেজ)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.forgotPasswordText || ''}
                    onChange={e => setSettings(prev => ({ ...prev, forgotPasswordText: e.target.value }))}
                    placeholder="পাসওয়ার্ড উদ্ধার বা রিসেট করার জন্য কাস্টমারকে কী করতে হবে তা লিখুন..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: MAINTENANCE MODE */}
        {activeTab === 'maintenance' && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fadeIn">
            <div className="border-b border-neutral-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black uppercase text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  <span>মেইনটেন্যান্স মোড (Maintenance Mode)</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  সাইট সাময়িকভাবে বন্ধ করে কাস্টমারদের একটি নোটিশ দেখাতে চাইলে এটি চালু করুন। (অ্যাডমিন প্যানেল সচল থাকবে)
                </p>
              </div>

              {/* Maintenance Toggle */}
              <div className="flex items-center gap-3 bg-neutral-900 p-2 rounded-2xl border border-neutral-800 shrink-0">
                <span className="text-xs font-bold text-neutral-300">মোড অন/অফ:</span>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                  className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    settings.maintenanceMode
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {settings.maintenanceMode ? '🔴 ENABLED (বন্ধ)' : '🟢 DISABLED (চালু)'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                  Maintenance Notice Message (কাস্টমারদের জন্য মেসেজ)
                </label>
                <textarea
                  rows={4}
                  value={settings.maintenanceMessage || ''}
                  onChange={e => setSettings(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                  placeholder="যেমন: বর্তমানে সাইট আপডেট করা হচ্ছে। কিছুক্ষণের মধ্যেই আমরা ফিরছি..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 leading-relaxed"
                />
                <span className="text-[10px] text-neutral-500">মেইনটেন্যান্স মোড অন থাকলে সাধারণ কাস্টমাররা শুধু এই মেসেজটিই দেখতে পাবে।</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
