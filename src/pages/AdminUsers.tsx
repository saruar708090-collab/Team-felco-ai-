import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { CustomerUser } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { 
  Users, Search, ShieldAlert, ShieldCheck, Edit3, Trash2, 
  UserPlus, Lock, Phone, User, Eye, EyeOff, Check, X, AlertTriangle, RefreshCw, Bell 
} from 'lucide-react';

interface AdminUsersProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ currentRoute, navigate }) => {
  const [users, setUsers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');

  // Edit / Create Modal state
  const [editUserModal, setEditUserModal] = useState<{
    isOpen: boolean;
    user: CustomerUser | null;
    name: string;
    phone: string;
    password: string;
    isBlocked: boolean;
  }>({
    isOpen: false,
    user: null,
    name: '',
    phone: '',
    password: '',
    isBlocked: false,
  });

  const [visiblePasswords, setVisiblePasswords] = useState<{ [phone: string]: boolean }>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snap) => {
      const list: CustomerUser[] = [];
      snap.forEach(d => {
        const data = d.data() as CustomerUser;
        list.push({ ...data, id: d.id, phone: data.phone || d.id });
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      setUsers(list);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching users:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const togglePasswordVisibility = (phone: string) => {
    setVisiblePasswords(prev => ({ ...prev, [phone]: !prev[phone] }));
  };

  // Toggle Block / Unblock status
  const handleToggleBlock = async (user: CustomerUser) => {
    const newStatus = !user.isBlocked;
    const confirmMsg = newStatus 
      ? `আপনি কি নিশ্চিত যে "${user.name}" (${user.phone}) অ্যাকাউন্টটি ব্লক করতে চান?` 
      : `আপনি কি "${user.name}" (${user.phone}) অ্যাকাউন্টটি আনব্লক করতে চান?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(user.phone);
      const userRef = doc(db, 'users', user.phone);
      await updateDoc(userRef, { isBlocked: newStatus });
      showNotification(newStatus ? '🚫 অ্যাকাউন্ট ব্লক করা হয়েছে।' : '✅ অ্যাকাউন্ট আনব্লক করা হয়েছে।');
    } catch (err: any) {
      console.error('Error updating block status:', err);
      showNotification('❌ স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete User
  const handleDeleteUser = async (user: CustomerUser) => {
    if (!window.confirm(`⚠️ সতর্কতা: "${user.name}" (${user.phone}) অ্যাকাউন্টটি স্থায়ীভাবে ডিলিট করতে চান? এই কাজ পূর্বাবস্থায় ফিরিয়ে আনা যাবে না!`)) {
      return;
    }

    try {
      setActionLoading(user.phone);
      await deleteDoc(doc(db, 'users', user.phone));
      showNotification('🗑️ অ্যাকাউন্ট সফলভাবে ডিলিট করা হয়েছে।');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      showNotification('❌ ডিলিট করতে সমস্যা হয়েছে।');
    } finally {
      setActionLoading(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (user: CustomerUser | null = null) => {
    if (user) {
      setEditUserModal({
        isOpen: true,
        user,
        name: user.name || '',
        phone: user.phone || user.id,
        password: user.password || '',
        isBlocked: !!user.isBlocked,
      });
    } else {
      setEditUserModal({
        isOpen: true,
        user: null,
        name: '',
        phone: '',
        password: '',
        isBlocked: false,
      });
    }
  };

  // Save Edit / Create User
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user, name, phone, password, isBlocked } = editUserModal;

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      alert('সঠিক ১১ ডিজিটের মোবাইল নাম্বার লিখুন (যেমন: 017XXXXXXXX)');
      return;
    }
    if (!name.trim()) {
      alert('নাম লিখুন');
      return;
    }
    if (!password.trim()) {
      alert('পাসওয়ার্ড লিখুন');
      return;
    }

    try {
      setActionLoading('saving');
      const userRef = doc(db, 'users', cleanPhone);

      const payload: CustomerUser = {
        id: cleanPhone,
        name: name.trim(),
        phone: cleanPhone,
        password: password.trim(),
        isBlocked: !!isBlocked,
        createdAt: user?.createdAt || new Date().toISOString(),
        lastLoginAt: user?.lastLoginAt || new Date().toISOString(),
      };

      await setDoc(userRef, payload, { merge: true });
      showNotification(user ? '✅ অ্যাকাউন্ট সফলভাবে এডিট করা হয়েছে।' : '🎉 নতুন অ্যাকাউন্ট সফলভাবে যুক্ত হয়েছে।');
      setEditUserModal({ ...editUserModal, isOpen: false });
    } catch (err: any) {
      console.error('Error saving user:', err);
      showNotification('❌ সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search);
    
    if (filterStatus === 'active') return matchesSearch && !u.isBlocked;
    if (filterStatus === 'blocked') return matchesSearch && !!u.isBlocked;
    return matchesSearch;
  });

  const totalCount = users.length;
  const activeCount = users.filter(u => !u.isBlocked).length;
  const blockedCount = users.filter(u => !!u.isBlocked).length;

  return (
    <AdminLayout currentRoute={currentRoute} navigate={navigate}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider flex items-center gap-2.5">
              <Users className="w-6 h-6 text-blue-400" />
              <span>কাস্টমার একাউন্টস (Customer Accounts)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              সকল কাস্টমারদের নাম, নাম্বার, পাসওয়ার্ড দেখুন, এডিট করুন, ব্লক অথবা ডিলিট করুন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal(null)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>নতুন একাউন্ট যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-blue-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Counters / Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow">
            <div>
              <span className="text-xs font-bold text-neutral-400 block uppercase">মোট কাস্টমার</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-white mt-0.5 block">{totalCount}</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow">
            <div>
              <span className="text-xs font-bold text-neutral-400 block uppercase">সক্রিয় একাউন্ট</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-0.5 block">{activeCount}</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow">
            <div>
              <span className="text-xs font-bold text-neutral-400 block uppercase">ব্লকড একাউন্ট</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-rose-400 mt-0.5 block">{blockedCount}</span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="নাম অথবা মোবাইল নাম্বার দিয়ে খুঁজুন..."
              className="w-full bg-black border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800 shrink-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${filterStatus === 'all' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
            >
              সকল ({totalCount})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${filterStatus === 'active' ? 'bg-emerald-500 text-black' : 'text-neutral-400 hover:text-white'}`}
            >
              সক্রিয় ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('blocked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${filterStatus === 'blocked' ? 'bg-rose-500 text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              ব্লকড ({blockedCount})
            </button>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2 font-bold">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
              <span>কাস্টমার একাউন্ট তালিকা লোড হচ্ছে...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
              <Users className="w-8 h-8 mx-auto text-neutral-600" />
              <p className="font-bold uppercase tracking-wider">কোনো একাউন্ট পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-extrabold text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">কাস্টমার নাম</th>
                    <th className="py-3.5 px-4">মোবাইল নাম্বার</th>
                    <th className="py-3.5 px-4">পাসওয়ার্ড</th>
                    <th className="py-3.5 px-4">রেজিস্ট্রেশন</th>
                    <th className="py-3.5 px-4">স্ট্যাটাস</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {filteredUsers.map(user => {
                    const isVisible = !!visiblePasswords[user.phone];
                    const isBlocked = !!user.isBlocked;
                    const isUserActionLoading = actionLoading === user.phone;

                    return (
                      <tr 
                        key={user.phone} 
                        className={`transition-colors ${isBlocked ? 'bg-rose-950/15 hover:bg-rose-950/25' : 'hover:bg-neutral-900/40'}`}
                      >
                        {/* Name */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black uppercase shrink-0">
                              {user.name ? user.name.charAt(0) : 'U'}
                            </div>
                            <div>
                              <span className="font-black text-white text-xs block">{user.name}</span>
                              <span className="text-[10px] text-neutral-500 block">UID: {user.phone}</span>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-4 font-mono font-bold text-white">
                          {user.phone}
                        </td>

                        {/* Password with Show/Hide toggle */}
                        <td className="py-4 px-4">
                          <div className="inline-flex items-center gap-2 bg-black px-2.5 py-1 rounded-lg border border-neutral-800">
                            <span className="font-mono text-xs text-amber-300 font-bold select-all">
                              {isVisible ? user.password : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(user.phone)}
                              className="text-neutral-500 hover:text-white cursor-pointer"
                              title={isVisible ? 'Hide Password' : 'Show Password'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-neutral-400 text-[11px] font-mono">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          {isBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              <ShieldAlert className="w-3 h-3" />
                              <span>Blocked (ব্লকড)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Active (সক্রিয়)</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Send Message */}
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/notifications?target=${user.phone}`)}
                              className="p-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:text-white hover:bg-blue-600/20 transition-all cursor-pointer"
                              title="Send direct notification message"
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </button>

                            {/* Block / Unblock Toggle */}
                            <button
                              type="button"
                              disabled={isUserActionLoading}
                              onClick={() => handleToggleBlock(user)}
                              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                isBlocked 
                                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30' 
                                  : 'bg-rose-600/20 text-rose-400 border border-rose-500/40 hover:bg-rose-600/30'
                              }`}
                              title={isBlocked ? 'Unblock user' : 'Block user'}
                            >
                              {isBlocked ? (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">আনব্লক</span>
                                </>
                              ) : (
                                <>
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">ব্লক</span>
                                </>
                              )}
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => openEditModal(user)}
                              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                              title="Edit user details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              disabled={isUserActionLoading}
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                              title="Delete account permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit / Create User Modal */}
        {editUserModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="bg-[#0e111a] border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h3 className="text-base font-black uppercase text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  <span>{editUserModal.user ? 'কাস্টমার একাউন্ট এডিট' : 'নতুন একাউন্ট যোগ করুন'}</span>
                </h3>
                <button
                  onClick={() => setEditUserModal({ ...editUserModal, isOpen: false })}
                  className="w-8 h-8 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase block">কাস্টমার নাম *</label>
                  <input
                    type="text"
                    value={editUserModal.name}
                    onChange={e => setEditUserModal({ ...editUserModal, name: e.target.value })}
                    placeholder="পুরো নাম লিখুন"
                    required
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase block">মোবাইল নাম্বার *</label>
                  <input
                    type="tel"
                    value={editUserModal.phone}
                    onChange={e => setEditUserModal({ ...editUserModal, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    required
                    disabled={!!editUserModal.user}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-blue-500 disabled:opacity-60"
                  />
                  {editUserModal.user && (
                    <span className="text-[10px] text-neutral-500 block">মোবাইল নাম্বার হলো ইউনিক অ্যাকাউন্ট আইডি।</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase block">পাসওয়ার্ড *</label>
                  <input
                    type="text"
                    value={editUserModal.password}
                    onChange={e => setEditUserModal({ ...editUserModal, password: e.target.value })}
                    placeholder="পাসওয়ার্ড লিখুন"
                    required
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div>
                    <span className="text-xs font-bold text-white block">অ্যাকাউন্ট ব্লক স্ট্যাটাস</span>
                    <span className="text-[10px] text-neutral-400 block">ব্লক করা থাকলে ইউজার লগইন করতে পারবে না</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editUserModal.isBlocked}
                      onChange={e => setEditUserModal({ ...editUserModal, isBlocked: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditUserModal({ ...editUserModal, isOpen: false })}
                    className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === 'saving'}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>সেভ করুন</span>
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
