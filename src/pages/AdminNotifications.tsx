import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { NotificationItem } from '../types';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, orderBy, query } from 'firebase/firestore';
import { 
  Bell, Plus, Trash2, Megaphone, Sparkles, Package, ShoppingBag, 
  ExternalLink, Check, RefreshCw, X, ShieldAlert, AlertCircle, Eye, EyeOff
} from 'lucide-react';

interface AdminNotificationsProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({ currentRoute, navigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationItem['type']>('notice');
  const [badge, setBadge] = useState('NOTICE');
  const [link, setLink] = useState('');
  const [targetPhone, setTargetPhone] = useState('');

  useEffect(() => {
    fetchNotifications();
    
    // Check for target user in URL params
    const params = new URLSearchParams(window.location.search);
    const target = params.get('target');
    if (target) {
      setTargetPhone(target);
      setModalOpen(true);
      // Clean up URL without refreshing
      window.history.replaceState({}, '', '/admin/notifications');
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: NotificationItem[] = [];
      snap.forEach(d => list.push({ ...d.data(), id: d.id } as NotificationItem));
      setNotifications(list);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      // Fallback without orderBy index if needed
      try {
        const snap = await getDocs(collection(db, 'notifications'));
        const list: NotificationItem[] = [];
        snap.forEach(d => list.push({ ...d.data(), id: d.id } as NotificationItem));
        list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        setNotifications(list);
      } catch (e: any) {
        setError(e.message || 'নোটিফিকেশন লোড করতে সমস্যা হয়েছে।');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setTitle('');
    setMessage('');
    setType('notice');
    setBadge('NOTICE');
    setLink('');
    setTargetPhone('');
    setModalOpen(true);
  };

  const applyPreset = (presetType: NotificationItem['type'], pTitle: string, pMessage: string, pBadge: string, pLink: string = '') => {
    setType(presetType);
    setTitle(pTitle);
    setMessage(pMessage);
    setBadge(pBadge);
    setLink(pLink);
  };

  const handleSaveNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('অনুগ্রহ করে শিরোনাম ও বিস্তারিত বার্তা লিখুন।');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const notifId = `notif-${Date.now()}`;
      const payload: NotificationItem = {
        id: notifId,
        title: title.trim(),
        message: message.trim(),
        type,
        badge: badge.trim().toUpperCase(),
        link: link.trim() || '',
        targetPhone: targetPhone.trim() || '',
        active: true,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'notifications', notifId), payload);
      setSuccessMsg('নোটিফিকেশন সফলভাবে ওয়েবসাইটে প্রকাশ করা হয়েছে!');
      setTimeout(() => setSuccessMsg(null), 4000);
      setModalOpen(false);
      fetchNotifications();
    } catch (err: any) {
      console.error('Error saving notification:', err);
      setError(err.message || 'নোটিফিকেশন সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: NotificationItem) => {
    try {
      const newActive = item.active === false ? true : false;
      await updateDoc(doc(db, 'notifications', item.id), { active: newActive });
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, active: newActive } : n));
    } catch (err: any) {
      console.error('Error toggling active', err);
    }
  };

  const handleDelete = async (id: string, nTitle: string) => {
    if (!window.confirm(`আপনি কি "${nTitle}" নোটিফিকেশনটি মুছে ফেলতে চান?`)) return;
    try {
      await deleteDoc(doc(db, 'notifications', id));
      setNotifications(prev => prev.filter(n => n.id !== id));
      setSuccessMsg('নোটিফিকেশন মুছে ফেলা হয়েছে।');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Error deleting notification', err);
      alert('মুছে ফেলতে সমস্যা হয়েছে।');
    }
  };

  const getTypeIcon = (t: NotificationItem['type']) => {
    switch (t) {
      case 'offer':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'product':
        return <Package className="w-4 h-4 text-emerald-400" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-blue-400" />;
      case 'notice':
        return <Megaphone className="w-4 h-4 text-rose-400" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-300" />;
    }
  };

  return (
    <AdminLayout currentRoute={currentRoute} navigate={navigate}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 block mb-1">
              Store Communication
            </span>
            <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-2">
              <Bell className="w-7 h-7 text-blue-400" />
              <span>ওয়েবসাইট নোটিফিকেশন সেন্টার</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              নতুন প্রোডাক্ট, অফার, জরুরি নোটিশ ও অর্ডার আপডেট এখানে সরাসরি ব্রডকাস্ট করুন।
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন নোটিফিকেশন পাঠান</span>
          </button>
        </div>

        {/* Success & Error Banners */}
        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">মোট নোটিফিকেশন</span>
            <span className="text-2xl font-black text-white mt-1 block font-mono">{notifications.length}</span>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">🎁 অফার ও ছাড়</span>
            <span className="text-2xl font-black text-amber-400 mt-1 block font-mono">
              {notifications.filter(n => n.type === 'offer').length}
            </span>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">🚀 প্রোডাক্ট ঘোষণা</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">
              {notifications.filter(n => n.type === 'product').length}
            </span>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">📢 জরুরি নোটিশ</span>
            <span className="text-2xl font-black text-rose-400 mt-1 block font-mono">
              {notifications.filter(n => n.type === 'notice').length}
            </span>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-500 font-bold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span>নোটিফিকেশন লোড হচ্ছে...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-12 text-center space-y-3">
            <Bell className="w-12 h-12 text-neutral-600 mx-auto" />
            <p className="text-neutral-400 text-sm font-bold">বর্তমানে কোনো নোটিফিকেশন যুক্ত নেই।</p>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              প্রথম নোটিফিকেশন যুক্ত করুন
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(item => (
              <div
                key={item.id}
                className={`bg-neutral-950 border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  item.active !== false ? 'border-neutral-800 hover:border-blue-500/40' : 'border-red-900/30 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-0.5 shadow">
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-500 uppercase font-mono font-bold">
                        {item.type}
                      </span>
                      <span className="text-[10px] text-neutral-600 font-mono">
                        {new Date(item.createdAt || '').toLocaleString('bn-BD')}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-white tracking-wide">
                      {item.title}
                    </h3>

                    <p className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed">
                      {item.message}
                    </p>

                    {item.link && (
                      <div className="pt-1 flex items-center gap-1 text-[11px] text-blue-400 font-mono">
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-xs">{item.link}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-900 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      item.active !== false
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {item.active !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{item.active !== false ? 'দৃশ্যমান (Live)' : 'লুকানো (Hidden)'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20 cursor-pointer"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Notification Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-neutral-900 border border-neutral-800 text-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase">নতুন নোটিফিকেশন ব্রডকাস্ট</h3>
                    <p className="text-[11px] text-neutral-400">ওয়েবসাইটের সব ভিজিটরের নোটিফিকেশন বারে যাবে</p>
                  </div>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  কুইক টেমপ্লেট নির্বাচন করুন:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset(
                      'offer', 
                      '🔥 বিশেষ ডিসকাউন্ট অফার চালু হয়েছে!', 
                      'সীমিত সময়ের জন্য আমাদের সকল ভিআইপি হ্যাক টুলে বিশেষ ছাড় চলছে। দ্রুত অর্ডার সম্পন্ন করে কোড সংগ্রহ করুন।',
                      'OFFER 40%'
                    )}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded-xl text-[10px] font-bold text-left"
                  >
                    🎁 বিশেষ ডিসকাউন্ট অফার
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset(
                      'product', 
                      '🚀 নতুন AI কালার ট্রেডিং হ্যাক যুক্ত হয়েছে!', 
                      'উন্নত অ্যালগরিদম ও ৯৯% অ্যাকুরেসি সহ নতুন ভার্সন এখন এভেইলেবল। এখনই চেক করুন।',
                      'NEW PRODUCT'
                    )}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-emerald-300 rounded-xl text-[10px] font-bold text-left"
                  >
                    🚀 নতুন প্রোডাক্ট ঘোষণা
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset(
                      'notice', 
                      '⚠️ পেমেন্ট করার পর সঠিক TrxID সাবমিট করার অনুরোধ', 
                      'বিকাশ বা নগদে Send Money করার পর সঠিক TrxID ও স্ক্রিনশট দিয়ে অর্ডার সাবমিট করুন, যাতে দ্রুত ভেরিফাই করা যায়।',
                      'IMPORTANT'
                    )}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-rose-300 rounded-xl text-[10px] font-bold text-left"
                  >
                    📢 জরুরি পেমেন্ট সতর্কতা
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset(
                      'notice', 
                      '⚡ সার্ভার আপডেট ও সার্ভিস সচল রয়েছে', 
                      'আমাদের সার্ভার ১০০% ফাস্ট ও অ্যাক্টিভ রয়েছে। যেকোনো সহায়তার জন্য টেলিগ্রাম বা হোয়াটসঅ্যাপ সাপোর্টে যোগাযোগ করুন।',
                      'ACTIVE'
                    )}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-blue-300 rounded-xl text-[10px] font-bold text-left"
                  >
                    ⚡ সার্ভার আপডেট নোটিশ
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveNotification} className="space-y-3.5 pt-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    ক্যাটাগরি টাইপ (Type) *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'notice', label: '📢 নোটিশ' },
                      { id: 'offer', label: '🎁 অফার' },
                      { id: 'product', label: '🚀 প্রোডাক্ট' },
                      { id: 'update', label: '⚡ আপডেট' }
                    ].map(t => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setType(t.id as any)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                          type === t.id 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                            : 'bg-black border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    শিরোনাম (Notification Title) *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="যেমন: বিশেষ অফার বা জরুরি নোটিশ"
                    required
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-2xl">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 block mb-1">
                    🎯 নির্দিষ্ট ইউজার টার্গেট (Target User Phone - Optional)
                  </label>
                  <input
                    type="tel"
                    value={targetPhone}
                    onChange={e => setTargetPhone(e.target.value)}
                    placeholder="যেমন: 017XXXXXXXX (খালি রাখলে সবাই দেখবে)"
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <p className="text-[9px] text-neutral-500 mt-1 italic">নির্দিষ্ট কোনো কাস্টমারকে স্পেশাল মেসেজ পাঠাতে তার মোবাইল নাম্বারটি দিন।</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    ব্যাজ লেবেল (Badge Text)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={e => setBadge(e.target.value.toUpperCase())}
                    placeholder="যেমন: OFFER 50%, NEW, NOTICE, URGENT"
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    বিস্তারিত বার্তা (Notification Message) *
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="কাস্টমারদের জন্য বিস্তারিত বার্তা লিখুন..."
                    rows={3}
                    required
                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    অ্যাকশন লিংক (Optional Link)
                  </label>
                  <input
                    type="text"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    placeholder="যেমন: /product/xyz অথবা টেলিগ্রাম লিংক"
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{saving ? 'পাঠানো হচ্ছে...' : 'নোটিফিকেশন প্রকাশ করুন'}</span>
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
