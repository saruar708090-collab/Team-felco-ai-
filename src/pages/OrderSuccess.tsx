import React, { useEffect, useState } from 'react';
import { Order, StoreSettings } from '../types';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { CheckCircle2, Home, Clock, XCircle, Send, SendHorizontal, Copy, Check, ExternalLink } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import confetti from 'canvas-confetti';

interface OrderSuccessProps {
  completedOrder: Order | null;
  navigate: (route: string) => void;
  onOpenCustomerService: () => void;
  theme?: 'dark' | 'light';
  settings?: StoreSettings | null;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({ completedOrder, navigate, onOpenCustomerService, theme = 'dark', settings: propSettings }) => {
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

    if (completedOrder.orderStatus === 'COMPLETED') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    getDoc(doc(db, 'settings', 'general')).then(snap => {
      if (snap.exists()) {
        setSettings(snap.data() as StoreSettings);
      }
    }).catch(() => {});

    const unsubOrder = onSnapshot(doc(db, 'orders', completedOrder.orderId), snap => {
      if (snap.exists()) {
        const data = snap.data() as Order;
        if (data.orderStatus === 'COMPLETED' && liveStatus !== 'COMPLETED') {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
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
          {completedOrder.whatsappNumber && (
            <div className="flex justify-between">
              <span className="text-neutral-400">WhatsApp:</span>
              <span className="font-bold text-emerald-400 font-mono">{completedOrder.whatsappNumber}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-800 pt-2 font-bold">
            <span className="text-neutral-400">Total Paid:</span>
            <span className="text-emerald-400 font-mono text-sm">৳{completedOrder.finalAmount || 0}.00</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* WhatsApp Admin Direct Support Button */}
          {settings?.supportWhatsApp && (
            <a
              href={`https://wa.me/${settings.supportWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `হ্যালো অ্যাডমিন! আমি Team Felco ওয়েবসাইট থেকে #${completedOrder.orderId} (${completedOrder.productName} - ${completedOrder.selectedGame}) অর্ডার করেছি। আমার TrxID: ${completedOrder.paymentTrxId}। অনুগ্রহ করে ভেরিফাই করে দিন।`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>WhatsApp Admin-এ মেসেজ দিন</span>
            </a>
          )}

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
