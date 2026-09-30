import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { StoreSettings } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CheckCircle2, Upload, Trash2, Loader2, BellRing, SendHorizontal, Smartphone, Sparkles, MessageSquare } from 'lucide-react';

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
    nagadNumber: '01613562615',
    nagadActive: true,
    rocketNumber: '01613562615',
    rocketActive: true,
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

  return (
    <AdminLayout currentRoute={currentRoute} navigate={navigate}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 block mb-1">Store Control Panel</span>
          <h1 className="text-3xl font-black uppercase tracking-tight">Website & Support Settings</h1>
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
          <div className="text-center py-12 text-neutral-500 text-xs">Loading settings...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">

            {/* SECTION 1: ENTRY POPUP NOTICE MANAGER */}
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
                          className="absolute top-2 right-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-lg"
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

            {/* SECTION 2: TELEGRAM & OFFICIAL SOCIAL CHANNELS */}
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

            {/* SECTION 3: PAYMENT NUMBERS (BKASH, NAGAD, ROCKET) */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wide text-white">Payment Methods & Numbers</h2>
                  <p className="text-xs text-neutral-400">বিকাশ, নগদ ও রকেট পার্সোনাল নাম্বার ও স্ট্যাটাস পরিচালনা করুন</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* bKash */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#DF146E] text-sm">bKash Personal</span>
                    <input
                      type="checkbox"
                      checked={settings.bkashActive !== false}
                      onChange={e => setSettings(prev => ({ ...prev, bkashActive: e.target.checked }))}
                      className="w-4 h-4 accent-[#DF146E] rounded cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={settings.bkashNumber || ''}
                    onChange={e => setSettings(prev => ({ ...prev, bkashNumber: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#DF146E]"
                  />
                </div>

                {/* Nagad */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#F97316] text-sm">Nagad Personal</span>
                    <input
                      type="checkbox"
                      checked={settings.nagadActive !== false}
                      onChange={e => setSettings(prev => ({ ...prev, nagadActive: e.target.checked }))}
                      className="w-4 h-4 accent-[#F97316] rounded cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={settings.nagadNumber || ''}
                    onChange={e => setSettings(prev => ({ ...prev, nagadNumber: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                {/* Rocket */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#A855F7] text-sm">Rocket Personal</span>
                    <input
                      type="checkbox"
                      checked={settings.rocketActive !== false}
                      onChange={e => setSettings(prev => ({ ...prev, rocketActive: e.target.checked }))}
                      className="w-4 h-4 accent-[#A855F7] rounded cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={settings.rocketNumber || ''}
                    onChange={e => setSettings(prev => ({ ...prev, rocketNumber: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#A855F7]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                  Payment Instructions (পেমেন্ট নির্দেশিকা)
                </label>
                <input
                  type="text"
                  value={settings.paymentInstructions || ''}
                  onChange={e => setSettings(prev => ({ ...prev, paymentInstructions: e.target.value }))}
                  placeholder="Send money to our personal number via Send Money..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white"
                />
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
      </div>
    </AdminLayout>
  );
};
