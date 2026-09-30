import React, { useState, useEffect } from 'react';
import { 
  Bell, X, CheckCheck, Tag, Package, Megaphone, ShoppingBag, 
  ExternalLink, ArrowRight, Clock, Sparkles, AlertCircle, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { NotificationItem } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (route: string) => void;
  onOpenOrderTracker?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  navigate,
  onOpenOrderTracker
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('felco_read_notifs') || '[]');
    } catch {
      return [];
    }
  });

  const { customerUser } = useCustomerAuth();

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list: NotificationItem[] = [];
      snap.forEach((d) => {
        const data = d.data() as NotificationItem;
        const isPublic = !data.targetPhone && !data.targetUserId;
        const isForMe = data.targetPhone === customerUser?.phone || data.targetUserId === customerUser?.phone;

        if (data.active !== false && (isPublic || isForMe)) {
          list.push({ ...data, id: d.id });
        }
      });
      setNotifications(list);
    }, (err) => {
      console.error('Error fetching notifications:', err);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen && notifications.length > 0) {
      markAllAsRead();
    }
  }, [isOpen, notifications.length]);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    localStorage.setItem('felco_read_notifs', JSON.stringify(allIds));
  };

  const markSingleAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem('felco_read_notifs', JSON.stringify(updated));
    }
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'এইমাত্র';
      if (diffMins < 60) return `${diffMins} মি. আগে`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} দিন আগে`;
      return date.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0c101d] text-white border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-[#0e1424]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0e1424] animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide flex items-center gap-2">
                <span>নোটিফিকেশন সেন্টার</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-medium block">
                নতুন প্রোডাক্ট, অফার, নোটিশ ও অর্ডার আপডেট
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                title="সব পঠিত করুন"
              >
                <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>সব পঠিত</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification List (No Filter) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-800/40">
          {notifications.length === 0 ? (
            <div className="text-center py-14 space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Bell className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                বর্তমানে কোনো নোটিফিকেশন নেই।
              </p>
              {onOpenOrderTracker && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenOrderTracker();
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>অর্ডার স্ট্যাটাস চেক করুন</span>
                </button>
              )}
            </div>
          ) : (
            notifications.map(notif => {
              const isRead = readIds.includes(notif.id);
              return (
                <div
                  key={notif.id}
                  onClick={() => markSingleAsRead(notif.id)}
                  className={`pt-3 first:pt-0 transition-all rounded-2xl p-3.5 ${
                    isRead 
                      ? 'bg-slate-900/20 hover:bg-slate-900/40 opacity-80' 
                      : 'bg-blue-950/20 border border-blue-500/20 shadow-sm hover:border-blue-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5 shadow">
                      {getTypeIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {notif.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              {notif.badge}
                            </span>
                          )}
                          <h3 className={`text-xs font-black tracking-tight leading-snug line-clamp-1 ${
                            isRead ? 'text-slate-200' : 'text-white'
                          }`}>
                            {notif.title}
                          </h3>
                        </div>

                        <span className="text-[10px] text-slate-500 whitespace-nowrap font-medium flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(notif.createdAt)}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                        {notif.message}
                      </p>

                      {/* Action Links or Quick buttons */}
                      {(notif.link || notif.targetOrderId) && (
                        <div className="pt-2 flex items-center gap-2">
                          {notif.link && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markSingleAsRead(notif.id);
                                onClose();
                                if (notif.link?.startsWith('http')) {
                                  window.open(notif.link, '_blank');
                                } else {
                                  navigate(notif.link || '/');
                                }
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              <span>দেখুন</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {notif.targetOrderId && onOpenOrderTracker && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markSingleAsRead(notif.id);
                                onClose();
                                onOpenOrderTracker();
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border border-slate-700"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>অর্ডার ট্র্যাক #{notif.targetOrderId}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#0a0e1a] border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-slate-500">
            টিম ফেলকো অফিসিয়াল নোটিফিকেশন সিস্টেম
          </span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] font-bold text-blue-400 hover:underline cursor-pointer sm:hidden"
            >
              সব পঠিত করুন
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
