import React, { useState, useEffect } from 'react';
import { OrderDraft, Order } from '../types';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ArrowRight, ArrowLeft, Upload, CheckCircle2, AlertCircle, ShieldCheck, Sparkles, Key, Check, MessageCircle, Phone, Send } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { checkAndConsumePaymentSms } from '../utils/smsParser';

import { StoreSettings } from '../types';

interface OrderDetailsProps {
  orderDraft: OrderDraft;
  navigate: (route: string) => void;
  setCompletedOrder: (order: Order) => void;
  theme?: 'dark' | 'light';
  settings?: StoreSettings | null;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderDraft, navigate, setCompletedOrder, theme = 'dark', settings }) => {
  const isLight = theme === 'light';

  useSEO({
    title: `Submit Proof for ${orderDraft.productName || 'Hack'}`,
    description: 'Submit your transaction ID (TRX ID) and payment proof screenshot to verify and activate your VIP game hack code immediately.'
  });

  if (!orderDraft.productId || !orderDraft.paymentMethod) {
    useEffect(() => { navigate('/'); }, []);
    return null;
  }

  const [customerName, setCustomerName] = useState(orderDraft.customerName || '');
  const [telegramId, setTelegramId] = useState(orderDraft.telegramId || '');
  const [whatsappNumber, setWhatsappNumber] = useState(orderDraft.whatsappNumber || '');
  const [paymentTrxId, setPaymentTrxId] = useState(orderDraft.paymentTrxId || '');
  const [screenshotUrl, setScreenshotUrl] = useState(orderDraft.paymentScreenshotUrl || '');
  
  const [error, setError] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 600;

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
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setScreenshotUrl(compressedDataUrl);
        setError('');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleValidateAndPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !whatsappNumber.trim() || !paymentTrxId.trim() || !screenshotUrl.trim()) {
      setError('অনুগ্রহ করে আপনার নাম, সঠিক হোয়াটসঅ্যাপ নাম্বার, TrxID এবং পেমেন্ট স্ক্রিনশট আপলোড করুন। কোনো তথ্য ফাঁকা রাখা যাবে না।');
      setShowErrorPopup(true);
      return;
    }
    setError('');
    setShowConfirmModal(true);
  };

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    try {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const orderId = `TFS-2026-${randomNum}`;
      const cleanTrxId = paymentTrxId.trim().toUpperCase();
      const finalPayable = orderDraft.finalAmount || orderDraft.productPrice || 0;

      // Optional SMS verification check (if exists)
      const isSmsVerified = await checkAndConsumePaymentSms(cleanTrxId, finalPayable, orderId);

      const newOrder: Order = {
        orderId,
        productId: orderDraft.productId || 'unknown',
        productName: orderDraft.productName || 'Tool',
        selectedGame: orderDraft.selectedGame || 'HGNICE',
        customerName: customerName.trim(),
        telegramId: telegramId.trim() || 'N/A',
        whatsappNumber: whatsappNumber.trim(),
        paymentMethod: orderDraft.paymentMethod || 'bKash',
        paymentTrxId: cleanTrxId,
        paymentScreenshotUrl: screenshotUrl,
        orderStatus: isSmsVerified ? 'COMPLETED' : 'PENDING',
        couponCode: orderDraft.couponCode || '',
        discountAmount: orderDraft.discountAmount || 0,
        finalAmount: finalPayable,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'orders', orderId), newOrder);
      setCompletedOrder(newOrder);
      navigate('/order/success');
    } catch (err: any) {
      console.error('Order submission error details:', err);
      setError(err.message || 'Failed to submit order. Please try again.');
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen py-8 px-3 sm:px-6 flex flex-col items-center transition-colors ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#080b12] text-white'
    }`}>
      <div className="w-full max-w-lg space-y-4">
        {/* Step progress */}
        <div className="flex items-center justify-between px-1">
          <button 
            onClick={() => navigate('/order/payment')} 
            className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors px-3 py-1.5 rounded-xl cursor-pointer ${
              isLight 
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' 
                : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Payment</span>
          </button>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Step 3 of 3 • Proof & Info</span>
          </div>
        </div>

        {/* Selected Package Header */}
        <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-xl transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-gradient-to-r from-[#0d121f] via-[#141b2e] to-[#0d121f] border-blue-500/30 text-white'
        }`}>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-black tracking-widest text-blue-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{orderDraft.selectedGame} • {orderDraft.paymentMethod} Payment</span>
            </span>
            <h2 className="text-sm sm:text-base font-black uppercase">
              {orderDraft.productName}
            </h2>
          </div>
          <div className={`text-right pl-3 border-l shrink-0 ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
            <span className={`text-[9px] uppercase font-black tracking-widest block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>Amount Paid</span>
            <span className="text-base sm:text-lg font-black text-emerald-500 font-mono">
              ৳{orderDraft.finalAmount || orderDraft.productPrice}.00
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <div className={`border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-gradient-to-b from-[#0e1628] to-[#0a1020] border-slate-800/90 text-white'
        }`}>
          <form onSubmit={handleValidateAndPreview} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Your Full Name (আপনার নাম) *
              </label>
              <input 
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="আপনার পুরো নাম লিখুন"
                required
                className="w-full bg-black/60 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* WhatsApp Number (Required) */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 fill-emerald-400/20" />
                  <span>WhatsApp Number *</span>
                </label>
                <input 
                  type="text"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="017XXXXXXXX বা +8801..."
                  required
                  className="w-full bg-black/60 border border-emerald-500/40 rounded-xl px-4 py-3 text-xs sm:text-sm text-emerald-400 focus:outline-none focus:border-emerald-400 transition-colors font-mono font-bold placeholder:text-neutral-600"
                />
                <span className="text-[10px] text-neutral-400 block">এই নাম্বারে ভিআইপি কোড পাঠানো হবে</span>
              </div>

              {/* Telegram Username / ID (Optional / Recommended) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram Username / ID</span>
                </label>
                <input 
                  type="text"
                  value={telegramId}
                  onChange={e => setTelegramId(e.target.value)}
                  placeholder="@username (যদি থাকে)"
                  className="w-full bg-black/60 border border-blue-500/40 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400 transition-colors font-mono placeholder:text-neutral-600"
                />
                <span className="text-[10px] text-neutral-400 block">টেলিগ্রাম সাপোর্ট পেতে</span>
              </div>
            </div>

            {/* Glowing Payment TRX ID Input */}
            <div className="space-y-1.5 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Payment Transaction ID (TrxID) *</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">SMS থেকে কপি করুন</span>
              </div>
              <input 
                type="text"
                value={paymentTrxId}
                onChange={e => setPaymentTrxId(e.target.value.toUpperCase())}
                placeholder="যেমন: BJM89K2L1P"
                required
                className="w-full bg-black/80 border border-emerald-500/40 rounded-xl px-4 py-3 text-sm sm:text-base font-mono text-emerald-400 focus:outline-none focus:border-emerald-400 transition-colors uppercase font-black tracking-widest"
              />
              <p className="text-[10px] text-neutral-400">
                টাকা পাঠানোর পর বিকাশ/নগদের ফিরতি এসএমএস-এ যে <b>TrxID</b> এসেছে তা হুবহু এখানে দিন।
              </p>
            </div>

            {/* Payment Screenshot Upload */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">Payment Screenshot Proof *</label>
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
                id="screenshot-upload" 
              />

              {!screenshotUrl ? (
                <div className="border-2 border-dashed border-neutral-700/80 hover:border-blue-400 rounded-2xl py-5 px-5 text-center bg-black/40 hover:bg-black/60 transition-all cursor-pointer">
                  <label htmlFor="screenshot-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm shrink-0">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-white">Upload Payment Screenshot</span>
                    <span className="text-[10px] text-neutral-400">টাকা পাঠানোর রিসিটের স্ক্রিনশট সিলেক্ট করুন (গ্যালারি থেকে)</span>
                  </label>
                </div>
              ) : (
                <div className="p-3 bg-black/80 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-neutral-700 shrink-0 bg-neutral-900">
                      <img src={screenshotUrl} alt="Attached Receipt" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-emerald-500/15" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-400 truncate">Screenshot Attached</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5 truncate font-mono">receipt_verified.jpeg</p>
                    </div>
                  </div>

                  <label htmlFor="screenshot-upload" className="cursor-pointer px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold uppercase text-[10px] tracking-wider rounded-xl transition-colors shrink-0">
                    Change Photo
                  </label>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#1D4ED8] hover:from-[#1E40AF] hover:to-[#1D4ED8] text-white font-black text-sm sm:text-base tracking-wide rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Review & Submit Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Error Popup Modal */}
        {showErrorPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[#0b101c] border border-red-500/40 text-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="w-14 h-14 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center justify-center mx-auto text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-red-400">তথ্য অসম্পূর্ণ বা ভুল!</h3>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                  {error || 'অনুগ্রহ করে আপনার নাম, সঠিক হোয়াটসঅ্যাপ নাম্বার, TrxID এবং পেমেন্ট স্ক্রিনশট দিন।'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowErrorPopup(false)}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer"
              >
                ঠিক আছে (OK)
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[#0b101c] border border-blue-500/30 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block mb-1">Final Step</span>
                <h3 className="text-xl font-black uppercase tracking-tight">Confirm Your Order</h3>
              </div>

              <div className="space-y-2.5 bg-black/60 p-4 rounded-2xl border border-neutral-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Product:</span>
                  <span className="font-bold text-white">{orderDraft.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Selected Game Server:</span>
                  <span className="font-bold text-blue-400">{orderDraft.selectedGame}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Payment Method:</span>
                  <span className="font-bold text-emerald-400">{orderDraft.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Customer Name:</span>
                  <span className="font-bold">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">WhatsApp Number:</span>
                  <span className="font-bold text-emerald-400 font-mono">{whatsappNumber}</span>
                </div>
                {telegramId && telegramId !== 'N/A' && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Telegram:</span>
                    <span className="font-bold text-blue-400 font-mono">{telegramId}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-neutral-800 pt-2">
                  <span className="text-neutral-400">Transaction ID (TrxID):</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">{paymentTrxId.toUpperCase()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold uppercase text-xs tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm & Activate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
