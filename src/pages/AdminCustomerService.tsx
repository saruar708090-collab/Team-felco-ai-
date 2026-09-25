import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { StoreSettings } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Headphones, CheckCircle2 } from 'lucide-react';

interface AdminCustomerServiceProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const AdminCustomerService: React.FC<AdminCustomerServiceProps> = ({ currentRoute, navigate }) => {
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'general'));
      if (docSnap.exists()) {
        setSettings(docSnap.data() as StoreSettings);
      }
    } catch (err) {
      console.error('Error fetching settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    try {
      await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
      setSuccessMessage('Customer service settings updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/general');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout currentRoute={currentRoute} navigate={navigate}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 block mb-1">Support Management</span>
          <h1 className="text-3xl font-black uppercase tracking-tight">Customer Service Settings</h1>
        </div>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">WhatsApp Support Number</label>
                <input 
                  type="text"
                  value={settings.supportWhatsApp}
                  onChange={e => setSettings({ ...settings, supportWhatsApp: e.target.value })}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">Telegram Username / Channel</label>
                <input 
                  type="text"
                  value={settings.supportTelegram}
                  onChange={e => setSettings({ ...settings, supportTelegram: e.target.value })}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">Facebook Page / Group URL (ফেসবুক লিংক)</label>
                <input 
                  type="url"
                  value={settings.facebookUrl || ''}
                  onChange={e => setSettings({ ...settings, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/yourgroup"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">YouTube Channel / Video URL (ইউটিউব লিংক)</label>
                <input 
                  type="url"
                  value={settings.youtubeUrl || ''}
                  onChange={e => setSettings({ ...settings, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/@yourchannel"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">Support Banner Text</label>
              <textarea 
                value={settings.supportText}
                onChange={e => setSettings({ ...settings, supportText: e.target.value })}
                rows={3}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">Business Hours</label>
              <input 
                type="text"
                value={settings.businessHours}
                onChange={e => setSettings({ ...settings, businessHours: e.target.value })}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-900">
              <button 
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 bg-white text-black font-extrabold uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Customer Service Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};
