import React, { useEffect, useState } from 'react';
import { Order, StoreSettings } from '../types';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { CheckCircle2, Home, Clock, XCircle, Send, SendHorizontal, Copy, Check, ExternalLink } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface OrderSuccessProps {
  completedOrder: Order | null;
  navigate: (route: string) => void;
  onOpenCustomerService: () => void;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({ completedOrder, navigate, onOpenCustomerService }) => {
  const [liveStatus, setLiveStatus] = useState<Order['orderStatus']>(completedOrder?.orderStatus || 'PENDING');
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [copied, setCopied] = useState(false);

  useSEO({
    title: completedOrder ? `Order Status - #${completedOrder.orderId}` : 'Order Status',
    description: 'Track your VIP order activation and contact team felco support.'
  });

  useEffect(() => {
    if (!completedOrder) {
      navigate('/');
      return;
    }

    setLiveStatus(completedOrder.orderStatus);

    getDoc(doc(db, 'settings', 'general')).then(snap => {
      if (snap.exists()) {
        setSettings(snap.data() as StoreSettings);
      }
    }).catch(() => {});

    const unsubOrder = onSnapshot(doc(db, 'orders', completedOrder.orderId), snap => {
      if (snap.exists()) {
        const data = snap.data() as Order;
        setLiveStatus(data.orderStatus);
      }
    });

    return () => {
      unsubOrder();
    };
  }, [completedOrder]);

  if (!completedOrder) {
    return null;
  }

  const isVerified = liveStatus === 'COMPLETED';
  const isRejected = liveStatus === 'CANCELLED';

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(completedOrder.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const telegramAdminLink = settings?.telegramSupportUsername
    ? (settings.telegramSupportUsername.startsWith('http') ? settings.telegramSupportUsername : `https://t.me/${settings.telegramSupportUsername.replace('@', '')}`)
    : (settings?.supportTelegram?.startsWith('http') ? settings.supportTelegram : `https://t.me/${settings?.supportTelegram?.replace('@', '') || 'TeamFelcoAdmin'}`);

  const telegramChannelLink = settings?.telegramChannelUrl || 'https://t.me/+NRQwX88nKUQxYWY1';

  return (
    <div className="min-h-screen bg-[#06080F] text-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#0d121f] border border-neutral-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
        
        {/* Status Icon Header */}
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl transition-all ${
            isVerified
              ? 'bg-emerald-500 text-black shadow-emerald-500/30'
              : isRejected
              ? 'bg-red-500 text-white shadow-red-500/30'
              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
          }`}>
            {isVerified ? (
              <CheckCircle2 className="w-10 h-10" />
            ) : isRejected ? (
              <XCircle className="w-10 h-10" />
            ) : (
              <Clock className="w-9 h-9 animate-pulse" />
            )}
          </div>

          <span className={`text-[11px] uppercase tracking-widest font-black px-3 py-1 rounded-full border ${
            isVerified
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : isRejected
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {isVerified
              ? '✅ APPROVED • COMPLETED'
              : isRejected
              ? '❌ REJECTED / CANCELLED'
              : '⏳ PENDING ADMIN VERIFICATION'}
          </span>

          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-3">
            {isVerified
              ? 'ভিআইপি টুল অ্যাক্টিভেশন সফল!'
              : isRejected
              ? 'অর্ডারটি বাতিল করা হয়েছে'
              : 'অর্ডার সফলভাবে জমা হয়েছে!'}
          </h1>
          
          <p className="text-xs text-neutral-400 mt-1 max-w-sm leading-relaxed">
            {isVerified
              ? 'আপনার পেমেন্ট অ্যাডমিন কর্তৃক অনুমোদিত হয়েছে। নিচে টেলিগ্রাম সাপোর্ট থেকে আপনার কোড ও ফাইল সংগ্রহ করুন।'
              : isRejected
              ? 'ভুল TrxID বা পেমেন্ট অমিলের কারণে অর্ডারটি বাতিল হয়েছে। টেলিগ্রাম সাপোর্টে যোগাযোগ করুন।'
              : 'অ্যাডমিন আপনার পেমেন্ট TrxID ও স্ক্রিনশট চেক করে দ্রুত আপনার টেলিগ্রামে ফাইল ও ভিআইপি কোড বুঝিয়ে দেবেন।'}
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-black/60 border border-neutral-800 rounded-2xl p-4 text-left text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Order ID:</span>
            <button
              onClick={handleCopyOrderId}
              className="font-mono font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{completedOrder.orderId}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Game Server:</span>
            <span className="font-bold text-white">{completedOrder.selectedGame}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Package:</span>
            <span className="font-bold text-white">{completedOrder.productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Payment Method:</span>
            <span className="font-bold text-emerald-400">{completedOrder.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Transaction ID:</span>
            <span className="font-mono font-bold text-emerald-400">{completedOrder.paymentTrxId}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-800 pt-2 font-bold">
            <span className="text-neutral-400">Total Paid:</span>
            <span className="text-emerald-400 font-mono text-sm">৳{completedOrder.finalAmount || completedOrder.productPrice}.00</span>
          </div>
        </div>

        {/* Telegram Direct Action Buttons */}
        <div className="space-y-2.5">
          <a
            href={telegramAdminLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-gradient-to-r from-[#0088cc] to-[#0077b5] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0088cc]/25 cursor-pointer"
          >
            <SendHorizontal className="w-4 h-4" />
            <span>Telegram Admin ID-তে যোগাযোগ করুন</span>
          </a>

          <a
            href={telegramChannelLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#229ED9] hover:bg-[#1E88E5] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Official Telegram Channel</span>
          </a>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>হোমে ফিরে যান</span>
          </button>
        </div>
      </div>
    </div>
  );
};
