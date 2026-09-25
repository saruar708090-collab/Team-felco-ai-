import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { StoreSettings } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CreditCard, CheckCircle2 } from 'lucide-react';

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
    paymentInstructions: 'Send money to our personal merchant number via Send Money.'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setError(null);
    try {
      await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
      setSuccessMessage('Payment settings updated successfully.');
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
          <h1 className="text-3xl font-black uppercase tracking-tight">Payment Settings</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-xs mb-6 flex items-center justify-between">
            <div>
              <p className="font-bold uppercase tracking-tight mb-1">Error Accessing Settings</p>
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
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">bKash Number</label>
                <input 
                  type="text"
                  value={settings.bkashNumber}
                  onChange={e => setSettings({ ...settings, bkashNumber: e.target.value })}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">Nagad Number</label>
                <input 
                  type="text"
                  value={settings.nagadNumber}
                  onChange={e => setSettings({ ...settings, nagadNumber: e.target.value })}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">Rocket Number</label>
                <input 
                  type="text"
                  value={settings.rocketNumber}
                  onChange={e => setSettings({ ...settings, rocketNumber: e.target.value })}
                  required
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
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">Scrolling Notice (Home Page)</label>
              <textarea 
                value={settings.scrollingNotice || ''}
                onChange={e => setSettings({ ...settings, scrollingNotice: e.target.value })}
                rows={2}
                placeholder="Enter important news or updates to display at the top of the home page..."
                className="w-full bg-neutral-900 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">This text will scroll horizontally at the top of your website home page.</span>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-900">
              <button 
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 bg-white text-black font-extrabold uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Payment Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};
