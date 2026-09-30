import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, Clock, CheckCircle2, AlertCircle, 
  RefreshCw, Copy, Check, ExternalLink, Search, Phone, LogIn 
} from 'lucide-react';
import { useCustomerAuth, cleanPhoneNumber } from '../context/CustomerAuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { Order } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth
}) => {
  const { customerUser } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Manual search fallback if user is not logged in
  const [phoneSearch, setPhoneSearch] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (customerUser?.phone) {
      fetchOrdersForPhone(customerUser.phone);
    } else {
      // Check if user has saved orders in localStorage
      try {
        const localOrderIds: string[] = JSON.parse(localStorage.getItem('felco_saved_orders') || '[]');
        if (localOrderIds.length > 0) {
          fetchOrdersByIds(localOrderIds);
        }
      } catch {}
    }
  }, [isOpen, customerUser]);

  const fetchOrdersForPhone = async (phone: string) => {
    try {
      setLoading(true);
      const clean = cleanPhoneNumber(phone);
      const ordersRef = collection(db, 'orders');

      // Query orders where whatsappNumber matches
      const q = query(ordersRef, where('whatsappNumber', '==', clean));
      const snap = await getDocs(q);

      let list: Order[] = [];
      snap.forEach(d => {
        list.push({ ...d.data(), id: d.id } as Order);
      });

      // Also try with raw phone if different
      if (clean !== phone) {
        const q2 = query(ordersRef, where('whatsappNumber', '==', phone));
        const snap2 = await getDocs(q2);
        snap2.forEach(d => {
          if (!list.some(item => item.orderId === d.data().orderId)) {
            list.push({ ...d.data(), id: d.id } as Order);
          }
        });
      }

      list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      setOrders(list);
    } catch (err) {
      console.error('Error fetching order history', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersByIds = async (ids: string[]) => {
    try {
      setLoading(true);
      const ordersRef = collection(db, 'orders');
      const list: Order[] = [];

      for (const id of ids.slice(0, 10)) {
        const q = query(ordersRef, where('orderId', '==', id));
        const snap = await getDocs(q);
        snap.forEach(d => list.push({ ...d.data(), id: d.id } as Order));
      }

      list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      setOrders(list);
    } catch (err) {
      console.error('Error fetching orders by IDs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneSearch.trim()) return;
    setSearched(true);
    fetchOrdersForPhone(phoneSearch.trim());
  };

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            <RefreshCw className="w-3 h-3 animate-spin" /> Processing
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            <AlertCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0e17] text-white border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-b from-[#11182c] to-[#0b0e17] border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
                অর্ডার হিস্ট্রি (Order History)
              </h2>
              <span className="text-[11px] text-slate-400 block">
                {customerUser 
                  ? `${customerUser.name} (${customerUser.phone})-এর অর্ডারসমূহ` 
                  : 'আপনার সকল পূর্ববর্তী অর্ডার ও ভিআইপি কোড'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Not Logged In Banner & Quick Lookup */}
        {!customerUser && (
          <div className="p-4 bg-slate-950 border-b border-slate-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-slate-400">
                লগইন করলে আপনার সব অর্ডার স্বয়ংক্রিয়ভাবে এখানে সংরক্ষিত থাকবে।
              </span>
              {onOpenAuth && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>লগইন / সাইন আপ</span>
                </button>
              )}
            </div>

            <form onSubmit={handleManualSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={phoneSearch}
                  onChange={e => setPhoneSearch(e.target.value)}
                  placeholder="আপনার অর্ডার করা মোবাইল নাম্বার লিখুন (যেমন: 017XXXXXXXX)"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-black border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>খুঁজুন</span>
              </button>
            </form>
          </div>
        )}

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {loading ? (
            <div className="text-center py-16 text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
              <span>অর্ডার হিস্ট্রি লোড হচ্ছে...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-14 space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {searched 
                  ? 'এই নাম্বারে কোনো অর্ডার পাওয়া যায়নি।' 
                  : 'বর্তমানে কোনো পূর্ববর্তী অর্ডার নেই।'}
              </p>
              <p className="text-[11px] text-slate-500">
                ওয়েবসাইট থেকে কোনো টুল বা প্যাকেজ অর্ডার করার পর তা এখানে জমা হবে।
              </p>
            </div>
          ) : (
            orders.map(order => {
              const isApproved = order.orderStatus === 'COMPLETED';
              const isRejected = order.orderStatus === 'CANCELLED';

              return (
                <div
                  key={order.orderId}
                  className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md hover:border-slate-700 transition-all"
                >
                  {/* Top Bar: Order ID, Status, Date */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-white">
                          #{order.orderId}
                        </span>
                        <button
                          onClick={() => copyText(order.orderId, `id-${order.orderId}`)}
                          className="text-slate-400 hover:text-white"
                          title="Copy Order ID"
                        >
                          {copiedId === `id-${order.orderId}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('bn-BD') : ''}
                      </span>
                    </div>

                    <div>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Product</span>
                      <span className="font-extrabold text-white line-clamp-1">{order.productName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Server / Game</span>
                      <span className="font-extrabold text-emerald-400 line-clamp-1">{order.selectedGame}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Amount Paid</span>
                      <span className="font-mono font-black text-white">৳{order.finalAmount || 0}.00</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Payment Method</span>
                      <span className="font-bold text-slate-300 uppercase">{order.paymentMethod}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-2">
                      <span className="text-[10px] text-slate-400 block uppercase">TrxID</span>
                      <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                        {order.paymentTrxId}
                      </span>
                    </div>
                  </div>

                  {/* ADMIN MESSAGE / VIP CODE DISPLAY */}
                  {order.adminMessage ? (
                    <div className={`p-3 rounded-xl space-y-1.5 border text-left ${
                      isApproved 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : isRejected 
                        ? 'bg-rose-500/10 border-rose-500/30' 
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-black uppercase tracking-wider block ${
                          isApproved ? 'text-emerald-400' : isRejected ? 'text-rose-400' : 'text-blue-400'
                        }`}>
                          {isApproved 
                            ? '💬 অ্যাডমিনের মেসেজ / অ্যাক্টিভেশন কোড:' 
                            : isRejected 
                            ? '⚠️ অর্ডার বাতিলের কারণ / মেসেজ:' 
                            : '💬 অ্যাডমিনের বার্তা:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(order.adminMessage || '', `msg-${order.orderId}`)}
                          className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 rounded text-[10px] font-bold text-white uppercase cursor-pointer"
                        >
                          {copiedId === `msg-${order.orderId}` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="text-white font-mono text-xs whitespace-pre-line leading-relaxed bg-black/60 p-2.5 rounded-lg border border-white/10 selection:bg-emerald-500 selection:text-black">
                        {order.adminMessage}
                      </div>
                    </div>
                  ) : isApproved ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-300">
                      ✅ আপনার অর্ডার অনুমোদিত হয়েছে! ভিআইপি কোড বা ফাইল বুঝে নিতে টেলিগ্রাম বা হোয়াটসঅ্যাপ সাপোর্টে যোগাযোগ করুন।
                    </div>
                  ) : null}

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800/80 text-center text-xs text-slate-400">
          টিম ফেলকো অফিসিয়াল অর্ডার ভেরিফিকেশন সিস্টেম
        </div>

      </div>
    </div>
  );
};
