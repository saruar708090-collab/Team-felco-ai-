import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { StoreSettings, CustomPaymentMethod } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CheckCircle2, Upload, Trash2, Loader2, BellRing, SendHorizontal, Smartphone, Sparkles, Plus, Power, Edit3 } from 'lucide-react';

interface AdminPaymentSettingsProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({ currentRoute, navigate }) => {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'TEAM FELCO STORE',
    supportWhatsApp: '',
    supportTelegram: 'https://t.me/+NRQwX88nKUQxYWY1',
    telegramChannelUrl: 'https://t.me/+NRQwX88nKUQxYWY1',
    telegramSupportUsername: 'TeamFelcoAdmin',
    supportText: '24/7 Professional Support',
    businessHours: '24 Hours Active',
    bkashNumber: '01613562615',
    bkashActive: true,
    bkashOfflineNotice: 'বিকাশ সার্ভার সাময়িক সময়ের জন্য বন্ধ রয়েছে। অনুগ্রহ করে নগদ অথবা রকেটে পেমেন্ট করুন।',
    nagadNumber: '01613562615',
    nagadActive: true,
    nagadOfflineNotice: 'নগদ সার্ভার সাময়িক সময়ের জন্য বন্ধ রয়েছে। অনুগ্রহ করে বিকাশ অথবা রকেটে পেমেন্ট করুন।',
    rocketNumber: '01613562615',
    rocketActive: true,
    rocketOfflineNotice: 'রকেট সার্ভার সাময়িক সময়ের জন্য বন্ধ রয়েছে। অনুগ্রহ করে বিকাশ অথবা নগদে পেমেন্ট করুন।',
    customPaymentMethods: [],
    paymentInstructions: 'Send money to our personal number via Send Money.',
    scrollingNotice: '🔥 TEAM FELCO OFFICIAL STORE এ আপনাকে স্বাগতম!',
    popupNoticeActive: false,
    popupNoticeTitle: '🔥 SPECIAL VIP OFFER',
    popupNoticeText: 'আমাদের অফিসিয়াল টেলিগ্রাম চ্যানেলে জয়েন হয়ে প্রতিদিনের ফ্রি প্রিডিকশন ও লাইভ প্রুফ দেখুন!',
    popupNoticeImage: '',
    popupNoticeButtonText: 'Join Telegram VIP Channel',
    popupNoticeButtonLink: 'https://t.me/+NRQwX88nKUQxYWY1',
    youtubeUrl: 'https://youtube.com/@teamfelco_78?si=y8LNiJ9C1MUsNA9Z'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploadingPopupImg, setIsUploadingPopupImg] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Custom Payment Modal states
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [editingCustomMethod, setEditingCustomMethod] = useState<CustomPaymentMethod | null>(null);
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [customAccountType, setCustomAccountType] = useState('Personal');
  const [customInstructions, setCustomInstructions] = useState('');
  const [customActive, setCustomActive] = useState(true);
  const [customOfflineNotice, setCustomOfflineNotice] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const docSnap = await getDoc(doc(db, 'settings', 'general'));
      if (docSnap.exists()) {
        const data = docSnap.data() as StoreSettings;
        setSettings(prev => ({
          ...prev,
          ...data,
          bkashActive: data.bkashActive !== false,
          nagadActive: data.nagadActive !== false,
          rocketActive: data.rocketActive !== false,
          customPaymentMethods: data.customPaymentMethods || [],
          telegramChannelUrl: data.telegramChannelUrl || data.supportTelegram || 'https://t.me/+NRQwX88nKUQxYWY1',
          telegramSupportUsername: data.telegramSupportUsername || 'TeamFelcoAdmin'
        }));
      }
    } catch (err: any) {
      console.error('Error fetching settings', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePopupImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('ছবির সাইজ ৫ এমবি (5MB)-এর নিচে হতে হবে।');
      return;
    }

    setIsUploadingPopupImg(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 900;

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setSettings(prev => ({
          ...prev,
          popupNoticeImage: dataUrl,
          popupNoticeActive: true
        }));
        setIsUploadingPopupImg(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setError(null);
    try {
      const payload: StoreSettings = {
        ...settings,
        supportTelegram: settings.telegramChannelUrl || settings.supportTelegram
      };

      await setDoc(doc(db, 'settings', 'general'), payload, { merge: true });
      try {
        localStorage.setItem('tf_cached_settings', JSON.stringify(payload));
      } catch {
        // Ignore storage write error
      }
      setSuccessMessage('সব সেটিংস সফলভাবে সেভ করা হয়েছে!');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err: any) {
      setError(err.message || String(err));
      handleFirestoreError(err, OperationType.WRITE, 'settings/general');
    } finally {
      setSaving(false);
    }
  };

  // Custom Payment Method Handlers
  const handleOpenAddCustom = () => {
    setEditingCustomMethod(null);
    setCustomName('');
    setCustomNumber('');
    setCustomAccountType('Personal');
    setCustomInstructions('Send Money to this account/wallet.');
    setCustomActive(true);
    setCustomOfflineNotice('');
    setCustomModalOpen(true);
  };

  const handleOpenEditCustom = (method: CustomPaymentMethod) => {
    setEditingCustomMethod(method);
    setCustomName(method.name);
    setCustomNumber(method.number);
    setCustomAccountType(method.accountType || 'Personal');
    setCustomInstructions(method.instructions || '');
    setCustomActive(method.active !== false);
    setCustomOfflineNotice(method.offlineNotice || '');
    setCustomModalOpen(true);
  };

  const handleSaveCustomMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customNumber.trim()) return;

    const methodId = editingCustomMethod 
      ? editingCustomMethod.id 
      : customName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const newMethod: CustomPaymentMethod = {
      id: methodId,
      name: customName.trim(),
      number: customNumber.trim(),
      accountType: customAccountType,
      instructions: customInstructions.trim(),
      active: customActive,
      offlineNotice: customOfflineNotice.trim()
    };

    setSettings(prev => {
      const currentList = prev.customPaymentMethods || [];
      if (editingCustomMethod) {
        return {
          ...prev,
          customPaymentMethods: currentList.map(m => m.id === editingCustomMethod.id ? newMethod : m)
        };
      } else {
        return {
          ...prev,
          customPaymentMethods: [...currentList, newMethod]
        };
      }
    });

    setCustomModalOpen(false);
    setSuccessMessage('পেমেন্ট মেথড তালিকা আপডেট করা হয়েছে। পরিবর্তন স্থায়ী করতে নিচে "Save All Settings" বাটনে ক্লিক করুন।');
  };

  const handleDeleteCustomMethod = (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই পেমেন্ট মেথডটি ডিলিট করতে চান?')) return;
    setSettings(prev => ({
      ...prev,
      customPaymentMethods: (prev.customPaymentMethods || []).filter(m => m.id !== id)
    }));
    setSuccessMessage('পেমেন্ট মেথডটি মুছে ফেলা হয়েছে। পরিবর্তন স্থায়ী করতে নিচে "Save All Settings" বাটনে ক্লিক করুন।');
  };

  const handleToggleCustomActive = (id: string) => {
    setSettings(prev => ({
      ...prev,
      customPaymentMethods: (prev.customPaymentMethods || []).map(m => {
        if (m.id === id) {
          return { ...m, active: !m.active };
        }
        return m;
      })
    }));
  };

  return (
    <AdminLayout currentRoute={currentRoute} navigate={navigate}>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 block mb-1">Store Control Panel</span>
          <h1 className="text-3xl font-black uppercase tracking-tight">Website & Payment Settings</h1>
          <p className="text-xs text-neutral-400 mt-1">পেমেন্ট মেথড চালু/বন্ধ (সাময়িক অফ), নতুন মেথড যোগ/ডিলিট এবং নোটিশ পরিচালনা করুন।</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-xs mb-6 flex items-center justify-between">
            <div>
              <p className="font-bold uppercase tracking-tight mb-1">Error</p>
              <p className="opacity-80">{error}</p>
            </div>
            <button 
              onClick={fetchSettings}
              className="px-4 py-2 bg-red-500 text-white font-black uppercase tracking-widest rounded-lg hover:bg-red-400 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-neutral-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">

            {/* SECTION 1: PAYMENT METHOD TOGGLES & NUMBERS (BKASH, NAGAD, ROCKET + CUSTOM) */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-wide text-white">Payment Methods Control & Numbers</h2>
                    <p className="text-xs text-neutral-400">যে কোনো পেমেন্ট মেথড এক ক্লিকেই চালু (LIVE) বা সাময়িক বন্ধ (OFFLINE) করুন</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddCustom}
                  className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Method</span>
                </button>
              </div>

              {/* Standard Payment Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* bKash */}
                <div className={`border rounded-2xl p-4.5 space-y-3.5 transition-all ${
                  settings.bkashActive !== false
                    ? 'bg-neutral-900/90 border-[#DF146E]/40 shadow-lg shadow-[#DF146E]/5'
                    : 'bg-neutral-950 border-red-900/40 opacity-75'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#DF146E] text-base tracking-wide flex items-center gap-1.5">
                      <span>bKash</span>
                      <span className="text-[10px] text-neutral-400 font-normal">(Personal)</span>
                    </span>

                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, bkashActive: !(prev.bkashActive !== false) }))}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                        settings.bkashActive !== false
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                          : 'bg-red-500/15 text-red-400 border border-red-500/40'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{settings.bkashActive !== false ? '🟢 চালু (LIVE)' : '🔴 সাময়িক বন্ধ'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      বিকাশ নাম্বার (Account Number)
                    </label>
                    <input
                      type="text"
                      value={settings.bkashNumber || ''}
                      onChange={e => setSettings(prev => ({ ...prev, bkashNumber: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#DF146E]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      বন্ধ থাকলে কাস্টমারকে যে নোটিশ দেখাবে:
                    </label>
                    <input
                      type="text"
                      value={settings.bkashOfflineNotice || ''}
                      onChange={e => setSettings(prev => ({ ...prev, bkashOfflineNotice: e.target.value }))}
                      placeholder="যেমন: বিকাশ সাময়িক সময়ের জন্য বন্ধ..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[11px] text-neutral-300 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Nagad */}
                <div className={`border rounded-2xl p-4.5 space-y-3.5 transition-all ${
                  settings.nagadActive !== false
                    ? 'bg-neutral-900/90 border-[#F97316]/40 shadow-lg shadow-[#F97316]/5'
                    : 'bg-neutral-950 border-red-900/40 opacity-75'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#F97316] text-base tracking-wide flex items-center gap-1.5">
                      <span>Nagad</span>
                      <span className="text-[10px] text-neutral-400 font-normal">(Personal)</span>
                    </span>

                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, nagadActive: !(prev.nagadActive !== false) }))}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                        settings.nagadActive !== false
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                          : 'bg-red-500/15 text-red-400 border border-red-500/40'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{settings.nagadActive !== false ? '🟢 চালু (LIVE)' : '🔴 সাময়িক বন্ধ'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      নগদ নাম্বার (Account Number)
                    </label>
                    <input
                      type="text"
                      value={settings.nagadNumber || ''}
                      onChange={e => setSettings(prev => ({ ...prev, nagadNumber: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#F97316]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      বন্ধ থাকলে কাস্টমারকে যে নোটিশ দেখাবে:
                    </label>
                    <input
                      type="text"
                      value={settings.nagadOfflineNotice || ''}
                      onChange={e => setSettings(prev => ({ ...prev, nagadOfflineNotice: e.target.value }))}
                      placeholder="যেমন: নগদ সাময়িক সময়ের জন্য বন্ধ..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[11px] text-neutral-300 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Rocket */}
                <div className={`border rounded-2xl p-4.5 space-y-3.5 transition-all ${
                  settings.rocketActive !== false
                    ? 'bg-neutral-900/90 border-[#A855F7]/40 shadow-lg shadow-[#A855F7]/5'
                    : 'bg-neutral-950 border-red-900/40 opacity-75'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#A855F7] text-base tracking-wide flex items-center gap-1.5">
                      <span>Rocket</span>
                      <span className="text-[10px] text-neutral-400 font-normal">(Personal)</span>
                    </span>

                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, rocketActive: !(prev.rocketActive !== false) }))}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                        settings.rocketActive !== false
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                          : 'bg-red-500/15 text-red-400 border border-red-500/40'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{settings.rocketActive !== false ? '🟢 চালু (LIVE)' : '🔴 সাময়িক বন্ধ'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      রকেট নাম্বার (Account Number)
                    </label>
                    <input
                      type="text"
                      value={settings.rocketNumber || ''}
                      onChange={e => setSettings(prev => ({ ...prev, rocketNumber: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#A855F7]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      বন্ধ থাকলে কাস্টমারকে যে নোটিশ দেখাবে:
                    </label>
                    <input
                      type="text"
                      value={settings.rocketOfflineNotice || ''}
                      onChange={e => setSettings(prev => ({ ...prev, rocketOfflineNotice: e.target.value }))}
                      placeholder="যেমন: রকেট সাময়িক সময়ের জন্য বন্ধ..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[11px] text-neutral-300 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Added Payment Methods List */}
              {(settings.customPaymentMethods && settings.customPaymentMethods.length > 0) && (
                <div className="pt-4 border-t border-neutral-900 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Custom Payment Methods (কাস্টম যোগ করা মেথডসমূহ)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {settings.customPaymentMethods.map(m => (
                      <div
                        key={m.id}
                        className={`bg-neutral-900 border rounded-2xl p-4 flex flex-col justify-between gap-3 ${
                          m.active ? 'border-neutral-800' : 'border-red-900/40 opacity-70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-white">{m.name}</span>
                              <span className="text-[9px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-mono">
                                {m.accountType || 'Personal'}
                              </span>
                            </div>
                            <span className="text-xs font-mono text-emerald-400 font-bold block mt-1">
                              {m.number}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleCustomActive(m.id)}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase cursor-pointer ${
                              m.active
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {m.active ? '🟢 LIVE' : '🔴 OFFLINE'}
                          </button>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCustom(m)}
                            className="flex-1 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-1 cursor-pointer border border-neutral-800"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCustomMethod(m.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] cursor-pointer border border-red-500/20"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Payment Instructions */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                  General Payment Instructions (পেমেন্ট পেজের সাধারণ নির্দেশিকা)
                </label>
                <input
                  type="text"
                  value={settings.paymentInstructions || ''}
                  onChange={e => setSettings(prev => ({ ...prev, paymentInstructions: e.target.value }))}
                  placeholder="Send money to our personal number via Send Money..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* SECTION 2: ENTRY POPUP NOTICE MANAGER */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-black">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-wide text-white">Entry Notice Popup Modal</h2>
                    <p className="text-xs text-neutral-400">ওয়েবসাইটে ঢোকার সময় কাস্টমারকে যে নোটিশ বা অফার পপআপ দেখাবে</p>
                  </div>
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold uppercase text-neutral-400">
                    {settings.popupNoticeActive ? '🟢 Active (চালু)' : '⚪ Off (বন্ধ)'}
                  </span>
                  <input
                    type="checkbox"
                    checked={!!settings.popupNoticeActive}
                    onChange={e => setSettings(prev => ({ ...prev, popupNoticeActive: e.target.checked }))}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Popup Title (পপআপের শিরোনাম)
                  </label>
                  <input
                    type="text"
                    value={settings.popupNoticeTitle || ''}
                    onChange={e => setSettings(prev => ({ ...prev, popupNoticeTitle: e.target.value }))}
                    placeholder="যেমন: 🔥 SPECIAL VIP OFFER বা নতুন নোটিশ"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Popup Notice Text (পপআপের মূল মেসেজ / বিবরণ)
                  </label>
                  <textarea
                    value={settings.popupNoticeText || ''}
                    onChange={e => setSettings(prev => ({ ...prev, popupNoticeText: e.target.value }))}
                    rows={3}
                    placeholder="কাস্টমারদের জন্য বিস্তারিত অফার বা নোটিশ মেসেজ লিখুন..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 resize-none transition-colors"
                  />
                </div>

                {/* Popup Banner Photo Upload */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Popup Banner Image (পপআপের ছবি)
                  </label>

                  <div className="space-y-3">
                    {settings.popupNoticeImage && (
                      <div className="relative rounded-2xl overflow-hidden border border-neutral-700 max-h-60 bg-black flex items-center justify-center">
                        <img
                          src={settings.popupNoticeImage}
                          alt="Popup Banner Preview"
                          className="max-h-60 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, popupNoticeImage: '' }))}
                          className="absolute top-2 right-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Photo</span>
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-black uppercase text-[10px] tracking-widest transition-all ${
                        isUploadingPopupImg ? 'bg-neutral-800 border-neutral-700 text-neutral-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
                      }`}>
                        {isUploadingPopupImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>{isUploadingPopupImg ? 'Uploading Photo...' : 'Upload Photo from Gallery'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePopupImageUpload}
                          disabled={isUploadingPopupImg}
                        />
                      </label>

                      <input
                        type="url"
                        value={settings.popupNoticeImage || ''}
                        onChange={e => setSettings(prev => ({ ...prev, popupNoticeImage: e.target.value }))}
                        placeholder="Or paste Direct Image URL..."
                        className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Popup Action Button & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                      Button Text (বাটনের লেখা)
                    </label>
                    <input
                      type="text"
                      value={settings.popupNoticeButtonText || ''}
                      onChange={e => setSettings(prev => ({ ...prev, popupNoticeButtonText: e.target.value }))}
                      placeholder="e.g. Join Telegram VIP Channel"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                      Button Link URL (বাটনে চাপলে যে লিংকে যাবে)
                    </label>
                    <input
                      type="url"
                      value={settings.popupNoticeButtonLink || ''}
                      onChange={e => setSettings(prev => ({ ...prev, popupNoticeButtonLink: e.target.value }))}
                      placeholder="e.g. https://t.me/+NRQwX88nKUQxYWY1"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs font-mono text-blue-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: TELEGRAM & OFFICIAL SOCIAL CHANNELS */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-black">
                  <SendHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wide text-white">Telegram & Social Channels</h2>
                  <p className="text-xs text-neutral-400">টেলিগ্রাম চ্যানেল, টেলিগ্রাম অ্যাডমিন আইডি ও সোশ্যাল লিংক কনফিগারেশন</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                    Official Telegram Channel Link (টেলিগ্রাম চ্যানেল লিংক) *
                  </label>
                  <input
                    type="url"
                    value={settings.telegramChannelUrl || ''}
                    onChange={e => setSettings(prev => ({ ...prev, telegramChannelUrl: e.target.value }))}
                    placeholder="https://t.me/+NRQwX88nKUQxYWY1"
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">কাস্টমাররা এই লিংকে ক্লিক করে আপনার টেলিগ্রাম চ্যানেলে জয়েন হবে।</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                    Telegram Support Admin ID / Link (টেলিগ্রাম অ্যাডমিন আইডি) *
                  </label>
                  <input
                    type="text"
                    value={settings.telegramSupportUsername || ''}
                    onChange={e => setSettings(prev => ({ ...prev, telegramSupportUsername: e.target.value }))}
                    placeholder="TeamFelcoAdmin অথবা https://t.me/TeamFelcoAdmin"
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">লাইভ সাপোর্টে কাস্টমাররা সরাসরি এই আইডিতে মেসেজ দিতে পারবে।</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    YouTube Channel Link (ইউটিউব লিংক)
                  </label>
                  <input
                    type="url"
                    value={settings.youtubeUrl || ''}
                    onChange={e => setSettings(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder="https://youtube.com/@teamfelco_78"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Facebook Page Link (ফেসবুক লিংক - Optional)
                  </label>
                  <input
                    type="url"
                    value={settings.facebookUrl || ''}
                    onChange={e => setSettings(prev => ({ ...prev, facebookUrl: e.target.value }))}
                    placeholder="https://facebook.com/teamfelco"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: SCROLLING MARQUEE NOTICE */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
                <BellRing className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-black uppercase tracking-wide text-white">Top Scrolling Notice (স্ক্রলিং নোটিশ)</h2>
              </div>
              <input
                type="text"
                value={settings.scrollingNotice || ''}
                onChange={e => setSettings(prev => ({ ...prev, scrollingNotice: e.target.value }))}
                placeholder="হোমপেজের ওপরে যে নোটিশ স্ক্রল করে চলবে..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs sm:text-sm tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{saving ? 'Saving Settings...' : 'Save All Settings'}</span>
              </button>
            </div>
          </form>
        )}

        {/* CUSTOM PAYMENT METHOD MODAL */}
        {customModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#0d0d10] border border-neutral-800 text-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="text-base font-black uppercase tracking-wide flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span>{editingCustomMethod ? 'Edit Payment Method' : 'Add Custom Payment Method'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveCustomMethod} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Method Name (মেথডের নাম) *
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="e.g. Binance USDT (TRC20), Upay, Cellfin"
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Account / Number / Wallet Address *
                  </label>
                  <input
                    type="text"
                    value={customNumber}
                    onChange={e => setCustomNumber(e.target.value)}
                    placeholder="01XXXXXXXXX অথবা Wallet Address..."
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Account Type (অ্যাকাউন্ট টাইপ)
                  </label>
                  <input
                    type="text"
                    value={customAccountType}
                    onChange={e => setCustomAccountType(e.target.value)}
                    placeholder="e.g. Personal, Agent, TRC20, BEP20"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Payment Instructions (পেমেন্ট নির্দেশিকা)
                  </label>
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={e => setCustomInstructions(e.target.value)}
                    placeholder="এই নাম্বারে/ঠিকানায় পেমেন্ট পাঠিয়ে TrxID দিন..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Offline Notice (বন্ধ থাকলে যে নোটিশ দেখাবে)
                  </label>
                  <input
                    type="text"
                    value={customOfflineNotice}
                    onChange={e => setCustomOfflineNotice(e.target.value)}
                    placeholder="সাময়িক সময়ের জন্য বন্ধ রয়েছে..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="customActive"
                    checked={customActive}
                    onChange={e => setCustomActive(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <label htmlFor="customActive" className="text-xs font-bold text-neutral-300 cursor-pointer">
                    Active (চালু রাখুন)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setCustomModalOpen(false)}
                    className="px-4 py-2 bg-neutral-900 text-neutral-400 font-bold text-xs uppercase rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    {editingCustomMethod ? 'Update' : 'Add Method'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
