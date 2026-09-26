import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { StoreSettings } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CheckCircle2, Upload, Trash2, Loader2, BellRing } from 'lucide-react';

interface AdminPaymentSettingsProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({ currentRoute, navigate }) => {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'TEAM FELCO STORE',
    supportWhatsApp: '+8801000000000',
    supportTelegram: '@TeamFelcoSupport',
    supportText: '24/7 Professional Support',
    businessHours: '24 Hours Active',
    bkashNumber: '01700000000',
    nagadNumber: '01800000000',
    rocketNumber: '01900000000',
    paymentInstructions: 'Send money to our personal merchant number via Send Money.',
    popupNoticeActive: false,
    popupNoticeText: '',
    popupNoticeImage: ''
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
        setSettings(docSnap.data() as StoreSettings);
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
        const max_size = 800;

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

        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
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
      await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
      try {
        localStorage.setItem('tf_cached_settings', JSON.stringify(settings));
      } catch {
        // Ignore storage write error
      }
      setSuccessMessage('Settings updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
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
          <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 block mb-1">Configuration</span>
          <h1 className="text-3xl font-black uppercase tracking-tight">Payment & Notice Settings</h1>
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
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-neutral-500 text-xs">Loading settings...</div>
        ) : (
          <form onSubmit={handleSave} className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">bKash Number (Optional)</label>
                <input 
                  type="text"
                  value={settings.bkashNumber || ''}
                  onChange={e => setSettings({ ...settings, bkashNumber: e.target.value })}
                  placeholder="e.g. 017..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">Nagad Number (Optional)</label>
                <input 
                  type="text"
                  value={settings.nagadNumber || ''}
                  onChange={e => setSettings({ ...settings, nagadNumber: e.target.value })}
                  placeholder="e.g. 018..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">Rocket Number (Optional)</label>
                <input 
                  type="text"
                  value={settings.rocketNumber || ''}
                  onChange={e => setSettings({ ...settings, rocketNumber: e.target.value })}
                  placeholder="e.g. 019..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">Payment Instructions</label>
              <textarea 
                value={settings.paymentInstructions}
                onChange={e => setSettings({ ...settings, paymentInstructions: e.target.value })}
                rows={3}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white resize-none"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">These instructions will automatically display on the checkout payment page.</span>
            </div>
            
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">Scrolling Notice (হোম পেজের চলমান নোটিশ)</label>
              <textarea 
                value={settings.scrollingNotice || ''}
                onChange={e => setSettings({ ...settings, scrollingNotice: e.target.value })}
                rows={2}
                placeholder="হোম পেজের ওপরে যে লাইনটি আস্তে আস্তে যাবে সেটি এখানে লিখুন..."
                className="w-full bg-neutral-900 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">ফাঁকা রাখলে হোম পেজে চলমান নোটিশ বার দেখাবে না।</span>
            </div>

            {/* Entry Popup Notice Section (Optional Photo + Text) */}
            <div className="pt-6 border-t border-neutral-900 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    settings.popupNoticeActive
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                  }`}>
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                      Entry Popup Notice (সাইটে ঢোকার সাথে সাথে বড় নোটিশ)
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      ইচ্ছা করলে চালু রাখুন, আবার না চাইলে অফ করে রাখুন (ফটো বা টেক্সট যেকোনোটি দিতে পারবেন)।
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, popupNoticeActive: !prev.popupNoticeActive }))}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shrink-0 ${
                    settings.popupNoticeActive
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                  }`}
                >
                  {settings.popupNoticeActive ? '● পপ-আপ চালু আছে (ON)' : '○ পপ-আপ বন্ধ আছে (OFF)'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gallery Image Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Popup Photo (গ্যালারি থেকে ছবি দিন - Optional)
                  </label>
                  <div className="flex flex-col gap-3">
                    <label className="cursor-pointer bg-neutral-900 hover:bg-neutral-800 border border-dashed border-neutral-700 hover:border-emerald-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors text-center">
                      {isUploadingPopupImg ? (
                        <>
                          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                          <span className="text-xs text-neutral-400 font-bold">ছবি আপলোড হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-emerald-400" />
                          <span className="text-xs font-bold text-white">গ্যালারি থেকে ছবি সিলেক্ট করুন</span>
                          <span className="text-[10px] text-neutral-500">শুধু লেখা দিতে চাইলে ছবি দেওয়ার দরকার নেই</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePopupImageUpload}
                        className="hidden"
                      />
                    </label>

                    {settings.popupNoticeImage && (
                      <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 p-2 flex items-center justify-between gap-3">
                        <img
                          src={settings.popupNoticeImage}
                          alt="Popup Preview"
                          className="h-20 w-28 object-cover rounded-lg border border-neutral-800"
                        />
                        <button
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, popupNoticeImage: '' }))}
                          className="px-3 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ছবি মুছুন</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Popup Text */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    Popup Notice Text (নোটিশের লেখা - Optional)
                  </label>
                  <textarea
                    value={settings.popupNoticeText || ''}
                    onChange={e => setSettings({ ...settings, popupNoticeText: e.target.value })}
                    rows={4}
                    placeholder="পপ-আপ নোটিশে কোনো লেখা দিতে চাইলে এখানে লিখুন (অথবা শুধু ছবিও দিতে পারেন)..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                  <span className="text-[10px] text-neutral-500 block">
                    শুধু ছবি দেখাতে চাইলে এই ঘরটি ফাঁকা রাখতে পারেন।
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-900">
              <button 
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 bg-white text-black font-extrabold uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};
