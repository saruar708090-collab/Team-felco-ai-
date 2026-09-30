import React, { useState, useEffect } from 'react';
import { OrderDraft, StoreSettings } from '../types';
import { db, auth } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, Check, Copy, CheckCircle2, AlertTriangle, Tag, ShieldCheck, Wallet } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface PaymentMethodProps {
  orderDraft: OrderDraft;
  setOrderDraft: React.Dispatch<React.SetStateAction<OrderDraft>>;
  navigate: (route: string) => void;
  theme?: 'dark' | 'light';
  settings?: StoreSettings | null;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({ orderDraft, setOrderDraft, navigate, theme = 'dark', settings: propSettings }) => {
  useSEO({
    title: `Payment for ${orderDraft.productName || 'Hack'}`,
    description: 'Secure your VIP Hack tool activation by selecting bKash, Nagad, or Rocket Mobile Banking.'
  });

  if (!orderDraft.productId || !orderDraft.selectedGame) {
    useEffect(() => {
      navigate('/order/game');
    }, []);
    return null;
  }

  const [paymentMethod, setPaymentMethod] = useState<string>(orderDraft.paymentMethod || 'bKash');
  const [settings, setSettings] = useState<StoreSettings>(propSettings || {
    storeName: 'TEAM FELCO STORE',
    supportWhatsApp: '01613562615',
    supportTelegram: 'https://t.me/+NRQwX88nKUQxYWY1',
    supportText: '24/7 Professional Support',
    businessHours: '24 Hours Active',
    bkashNumber: '01613562615',
    bkashActive: true,
    bkashOfflineNotice: 'বিকাশ সার্ভার সাময়িক সময়ের জন্য বন্ধ রয়েছে। অনুগ্রহ করে নগদ অথবা রকেটে পেমেন্ট করুন।',
    nagadNumber: '01613562615',
    nagadActive: true,
    nagadOfflineNotice: 'নগদ সার্ভার সাময়িক সময়ের জন্য বন্ধ রয়েছে। অনুগ্রহ করে বিকাশ অথবা রকেটে পেমেন্ট করুন।',
    rocketNumber: '01613562615',
    rocketActive: true,
    rocketOfflineNotice: 'রকেট সার্ভার সাময়িক সময়ের জন্য বন্ধ রয়েছে। অনুগ্রহ করে বিকাশ অথবা নগদে পেমেন্ট করুন।',
    customPaymentMethods: [],
    paymentInstructions: 'Send money to our personal number via Send Money.'
  });
  const [copied, setCopied] = useState(false);


  // Coupon States
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(orderDraft.productPrice || 0);

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    setDiscountAmount(0);
    setFinalAmount(orderDraft.productPrice || 0);

    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    try {
      const docSnap = await getDoc(doc(db, 'coupons', code));
      if (docSnap.exists()) {
        const couponData = docSnap.data();
        if (couponData.active) {
          const originalPrice = orderDraft.productPrice || 0;
          let calculatedDiscount = 0;

          if (couponData.discountType === 'percentage') {
            calculatedDiscount = Math.round((originalPrice * couponData.discountValue) / 100);
          } else {
            calculatedDiscount = couponData.discountValue;
          }

          if (calculatedDiscount > originalPrice) {
            calculatedDiscount = originalPrice;
          }

          setDiscountAmount(calculatedDiscount);
          setFinalAmount(originalPrice - calculatedDiscount);
          setCouponSuccess(`Coupon applied! ৳${calculatedDiscount} discount.`);
        } else {
          setCouponError('This coupon code has expired or is inactive.');
        }
      } else {
        setCouponError('Invalid coupon code.');
      }
    } catch {
      setCouponError('Failed to apply coupon.');
    }
  };

  useEffect(() => {
    if (propSettings) {
      setSettings(propSettings);
    }
    fetchSettings();
  }, [propSettings]);

  const fetchSettings = async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) {
        const data = snap.data() as StoreSettings;
        setSettings(data);
      }
    } catch (err) {
      console.error('Error loading store settings', err);
    }
  };

  const standardMethods = [
    {
      id: 'bKash',
      label: 'Bkash',
      displayName: 'Bkash',
      number: settings.bkashNumber,
      isActive: settings.bkashActive !== false && Boolean(settings.bkashNumber && settings.bkashNumber.trim()),
      offlineNotice: settings.bkashOfflineNotice || 'বিকাশ পেমেন্ট সাময়িক সময়ের জন্য বন্ধ রয়েছে।',
      instructions: 'উক্ত নাম্বারে সেন্ড মানি (Send Money) করবেন এবং নির্ধারিত অর্থ প্রদান করবেন কম বা বেশি হলে অর্ডার সফল হবে না ✅',
      renderLogo: () => (
        <div className="flex flex-col items-center justify-center py-1">
          {settings.bkashLogoUrl ? (
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md border border-[#E2136E]/30 relative overflow-hidden p-1 active:scale-95 transition-transform">
              <img src={settings.bkashLogoUrl} alt="bKash" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#E2136E] flex items-center justify-center shadow-md border border-[#E2136E]/30 relative overflow-hidden active:scale-95 transition-transform">
              <svg viewBox="0 0 100 100" className="w-8.5 h-8.5">
                {/* Left Wing fold */}
                <polygon points="15,35 45,38 45,62" fill="#FFFFFF" />
                {/* Center spine fold */}
                <polygon points="45,38 58,35 45,62" fill="#FCE7F3" />
                {/* Main wing shadow panel */}
                <polygon points="58,35 78,52 45,62" fill="#FFFFFF" />
                {/* Head tip folder */}
                <polygon points="78,52 92,49 86,55" fill="#FCE7F3" />
                {/* Lower tail shadow fold */}
                <polygon points="45,62 49,85 32,98" fill="#FCE7F3" />
                {/* Central bird structure body */}
                <polygon points="45,62 78,52 86,55 49,85" fill="#FFFFFF" />
                {/* Tail wing stabilizer */}
                <polygon points="49,85 74,72 86,55" fill="#FCE7F3" />
              </svg>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'Nagad',
      label: 'Nagad',
      displayName: 'Nagad',
      number: settings.nagadNumber,
      isActive: settings.nagadActive !== false && Boolean(settings.nagadNumber && settings.nagadNumber.trim()),
      offlineNotice: settings.nagadOfflineNotice || 'নগদ পেমেন্ট সাময়িক সময়ের জন্য বন্ধ রয়েছে।',
      instructions: 'উক্ত নাম্বারে সেন্ড মানি (Send Money) করবেন এবং নির্ধারিত অর্থ প্রদান করবেন কম বা বেশি হলে অর্ডার সফল হবে না ✅',
      renderLogo: () => (
        <div className="flex flex-col items-center justify-center py-1">
          {settings.nagadLogoUrl ? (
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md border border-[#ED1C24]/30 relative overflow-hidden p-1 active:scale-95 transition-transform">
              <img src={settings.nagadLogoUrl} alt="Nagad" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#F7941D] to-[#ED1C24] flex flex-col items-center justify-center shadow-md border border-[#ED1C24]/30 relative overflow-hidden p-0.5 active:scale-95 transition-transform">
              <svg viewBox="0 0 100 100" className="w-7 h-7">
                {/* Circular swirling rays */}
                <path d="M50,15 A35,35 0 1,1 15,50 A35,35 0 0,1 50,15 M50,23 A27,27 0 1,0 77,50 A27,27 0 0,0 50,23 Z" fill="white" />
                <circle cx="50" cy="50" r="10" fill="white" className="opacity-30" />
                {/* Middle core flame */}
                <path d="M44,42 C44,32 56,32 56,42 C56,50 48,52 48,58 L52,58" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              </svg>
              <span className="text-white font-black text-[9px] -mt-0.5 tracking-tighter">নগদ</span>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'Rocket',
      label: 'Rocket',
      displayName: 'Rocket',
      number: settings.rocketNumber,
      isActive: settings.rocketActive !== false && Boolean(settings.rocketNumber && settings.rocketNumber.trim()),
      offlineNotice: settings.rocketOfflineNotice || 'রকেট পেমেন্ট সাময়িক সময়ের জন্য বন্ধ রয়েছে।',
      instructions: 'উক্ত নাম্বারে সেন্ড মানি (Send Money) করবেন এবং নির্ধারিত অর্থ প্রদান করবেন কম বা বেশি হলে অর্ডার সফল হবে না ✅',
      renderLogo: () => (
        <div className="flex flex-col items-center justify-center py-1">
          {settings.rocketLogoUrl ? (
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md border border-[#8C3494]/30 relative overflow-hidden p-1 active:scale-95 transition-transform">
              <img src={settings.rocketLogoUrl} alt="Rocket" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#8C3494] flex flex-col items-center justify-center shadow-md border border-[#8C3494]/30 relative overflow-hidden p-0.5 active:scale-95 transition-transform">
              <svg viewBox="0 0 100 100" className="w-6.5 h-6.5">
                {/* Paper airplane flying right-up */}
                <path d="M15,65 L85,25 L55,80 L46,56 Z" fill="white" />
                <path d="M46,56 L85,25 L15,65 Z" fill="#F3E8FF" />
                <path d="M46,56 L55,80 L51,60 Z" fill="#D8B4FE" />
              </svg>
              <span className="text-white font-extrabold text-[8px] tracking-tighter -mt-0.5 leading-none">রকেট</span>
            </div>
          )}
        </div>
      )
    }
  ];

  const customMethods = (settings.customPaymentMethods || []).map(cm => ({
    id: cm.id,
    label: cm.name,
    displayName: cm.name,
    number: cm.number,
    isActive: cm.active !== false && Boolean(cm.number && cm.number.trim()),
    offlineNotice: cm.offlineNotice || `${cm.name} পেমেন্ট সাময়িক সময়ের জন্য বন্ধ রয়েছে।`,
    instructions: cm.instructions || 'উক্ত নাম্বারে সেন্ড মানি (Send Money) করবেন এবং নির্ধারিত অর্থ প্রদান করবেন কম বা বেশি হলে অর্ডার সফল হবে না ✅',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center py-1">
        <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center shadow-md border border-neutral-700 relative overflow-hidden p-1 active:scale-95 transition-transform">
          {cm.logoUrl ? (
            <img src={cm.logoUrl} alt={cm.name} className="w-full h-full object-contain" />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-400" />
              <span className="text-[7px] font-bold text-neutral-300 truncate max-w-[40px]">{cm.name}</span>
            </div>
          )}
        </div>
      </div>
    )
  }));

  const paymentMethodsList = [...standardMethods, ...customMethods];

  const selectedMethodObj = paymentMethodsList.find(m => m.id === paymentMethod) || paymentMethodsList[0];

  const handleCopyNumber = (num: string) => {
    if (!num) return;
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    if (!selectedMethodObj || !selectedMethodObj.isActive) return;
    setOrderDraft(prev => ({
      ...prev,
      paymentMethod: selectedMethodObj.id,
      bkashNumber: settings.bkashNumber,
      nagadNumber: settings.nagadNumber,
      rocketNumber: settings.rocketNumber,
      paymentInstructions: selectedMethodObj.instructions || settings.paymentInstructions,
      couponCode: couponSuccess ? couponInput.toUpperCase().trim() : undefined,
      discountAmount: discountAmount,
      finalAmount: finalAmount
    }));
    navigate('/order/details');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1] py-6 px-3 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-[390px] sm:max-w-[420px] space-y-3">
        
        {/* Top Minimal Back Navigation */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-600">
          <button
            onClick={() => navigate('/order/game')}
            className="flex items-center gap-1 font-bold hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <span className="font-bold text-[11px] text-slate-700">
            {orderDraft.selectedGame} • ৳{finalAmount}.00
          </span>
        </div>

        {/* Clean Luxury White Merchant Gateway Card */}
        <div className="bg-[#FFFFFF] text-slate-900 rounded-[28px] p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-100 space-y-4">
          
          {/* Top Dark Navy Rounded Header */}
          <div className="bg-[#0f172a] text-white rounded-2xl py-3 px-4 text-center shadow-md">
            <h1 className="text-sm sm:text-[15px] font-black tracking-wide">
              পেমেন্ট পদ্ধতি নির্বাচন করুন
            </h1>
          </div>

          {/* 3-Column Grid Layout (Screenshot_20260930_154107 style) */}
          <div className="grid grid-cols-3 gap-2">
            {paymentMethodsList.map(m => {
              const isSelected = paymentMethod === m.id;
              const isOffline = !m.isActive;

              return (
                <div
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`relative cursor-pointer rounded-2xl border-2 p-2 flex flex-col items-center justify-between min-h-[96px] transition-all duration-150 ${
                    isSelected
                      ? isOffline
                        ? 'border-red-500 bg-red-50/40 ring-2 ring-red-400/20 shadow-md'
                        : 'border-[#1a56db] bg-blue-50/30 ring-2 ring-[#1a56db]/20 shadow-md'
                      : isOffline
                        ? 'border-red-200 bg-red-50/10 opacity-70'
                        : 'border-slate-200 hover:border-slate-300 bg-white shadow-sm'
                  }`}
                >
                  {/* LIVE Badge */}
                  <span className="absolute top-1.5 right-1.5 bg-[#dc2626] text-white text-[7px] font-black uppercase px-1 py-0.5 rounded-full tracking-wider leading-none shadow-sm">
                    LIVE
                  </span>

                  {/* Selected Check Circle */}
                  {isSelected && (
                    <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-full bg-[#1a56db] text-white flex items-center justify-center shadow">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}

                  {/* Logo Container */}
                  <div className="my-auto w-full pt-1.5">
                    {m.renderLogo()}
                  </div>

                  {/* English Label underneath */}
                  <span className="text-[10px] font-black text-slate-800 tracking-tight mt-1 text-center line-clamp-1">
                    {m.displayName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Account Number & Copy Box */}
          {selectedMethodObj.isActive ? (
            <div className="bg-[#f1f5f9] border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-500 block tracking-wider">
                    {selectedMethodObj.displayName.toUpperCase()} (SEND MONEY)
                  </span>
                  <div className="text-lg font-black font-mono tracking-wider text-slate-900 mt-0.5">
                    {selectedMethodObj.number || '01613562615'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyNumber(selectedMethodObj.number || '01613562615')}
                  className={`px-3.5 py-1.5 font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#1a56db] hover:bg-[#1e429f] text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 leading-snug flex items-start gap-1">
                <span>
                  {selectedMethodObj.instructions}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-600 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{selectedMethodObj.offlineNotice}</span>
            </div>
          )}

          {/* Coupon Code Section */}
          <div className="space-y-1">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="COUPON CODE"
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 text-slate-900 bg-white focus:border-[#1a56db] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Apply
              </button>
            </div>

            {couponError && <p className="text-[10px] text-red-600 font-bold pl-1">{couponError}</p>}
            {couponSuccess && <p className="text-[10px] text-emerald-600 font-bold pl-1 flex items-center gap-1"><Check className="w-3 h-3"/>{couponSuccess}</p>}
          </div>

          {/* Secured Seal */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secured by FELCO PAY</span>
          </div>

          {/* Solid Royal Blue Action Button */}
          <button
            onClick={handleNext}
            disabled={!selectedMethodObj.isActive}
            className="w-full py-3.5 bg-[#1a56db] hover:bg-[#1e429f] text-white font-black text-base tracking-wide rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>Pay ৳{finalAmount}.00</span>
          </button>
        </div>
      </div>
    </div>
  );
};
