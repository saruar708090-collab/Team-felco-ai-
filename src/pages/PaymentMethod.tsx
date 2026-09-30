import React, { useState, useEffect } from 'react';
import { OrderDraft, StoreSettings } from '../types';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Check, Copy, CheckCircle2, AlertTriangle, Tag, Wallet } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface PaymentMethodProps {
  orderDraft: OrderDraft;
  setOrderDraft: React.Dispatch<React.SetStateAction<OrderDraft>>;
  navigate: (route: string) => void;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({ orderDraft, setOrderDraft, navigate }) => {
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
  const [settings, setSettings] = useState<StoreSettings>({
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
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'general'));
      if (docSnap.exists()) {
        const data = docSnap.data() as StoreSettings;
        setSettings(data);

        // Auto select first active method if current is not active
        const isBkashActive = data.bkashActive !== false && Boolean(data.bkashNumber && data.bkashNumber.trim());
        const isNagadActive = data.nagadActive !== false && Boolean(data.nagadNumber && data.nagadNumber.trim());
        const isRocketActive = data.rocketActive !== false && Boolean(data.rocketNumber && data.rocketNumber.trim());

        if (isBkashActive) {
          setPaymentMethod('bKash');
        } else if (isNagadActive) {
          setPaymentMethod('Nagad');
        } else if (isRocketActive) {
          setPaymentMethod('Rocket');
        } else if (data.customPaymentMethods && data.customPaymentMethods.length > 0) {
          const activeCustom = data.customPaymentMethods.find(c => c.active !== false);
          if (activeCustom) setPaymentMethod(activeCustom.id);
        }
      }
    } catch {
      // Use defaults
    }
  };

  const standardMethods = [
    {
      id: 'bKash',
      label: 'Bkash Personal',
      bnName: 'বিকাশ',
      number: settings.bkashNumber,
      isActive: settings.bkashActive !== false && Boolean(settings.bkashNumber && settings.bkashNumber.trim()),
      offlineNotice: settings.bkashOfflineNotice || 'বিকাশ পেমেন্ট বর্তমানে সাময়িক সময়ের জন্য বন্ধ রয়েছে। অনুগ্রহ করে নগদ অথবা রকেটে পেমেন্ট করুন।',
      renderLogo: () => (
        <div className="flex items-center justify-center select-none py-1">
          <svg className="w-10 h-10 shrink-0" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" rx="20" fill="#D41A5E" />
            <polygon points="18,24 32,36 25,24" fill="#FFFFFF" />
            <polygon points="18,18 49,21 42,47" fill="#FFFFFF" />
            <polygon points="50,22 65,42 43,48" fill="#FFFFFF" />
            <polygon points="43,49 72,53 47,66" fill="#FFFFFF" />
            <polygon points="50,65 72,54 72,57" fill="#FFFFFF" />
            <polygon points="42,49 46,69 33,81" fill="#FFFFFF" />
            <polygon points="64,40 79,38 73,52" fill="#FFFFFF" />
            <polygon points="80,38 86,44 77,44" fill="#FFFFFF" />
          </svg>
        </div>
      )
    },
    {
      id: 'Nagad',
      label: 'Nagad Personal',
      bnName: 'নগদ',
      number: settings.nagadNumber,
      isActive: settings.nagadActive !== false && Boolean(settings.nagadNumber && settings.nagadNumber.trim()),
      offlineNotice: settings.nagadOfflineNotice || 'নগদ পেমেন্ট বর্তমানে সাময়িক সময়ের জন্য বন্ধ রয়েছে। অনুগ্রহ করে বিকাশ অথবা রকেটে পেমেন্ট করুন।',
      renderLogo: () => (
        <div className="flex items-center justify-center select-none py-1">
          <svg className="w-10 h-10 shrink-0" viewBox="0 0 100 100" fill="none">
            <defs>
              <radialGradient id="nagadMiniGrad4" cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor="#F7941D" />
                <stop offset="55%" stopColor="#F15A24" />
                <stop offset="100%" stopColor="#E01E26" />
              </radialGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#nagadMiniGrad4)" />
            <path
              d="M37 16 C23 23, 21 43, 34 53 C47 62, 66 56, 70 39 C71 34, 70 29, 68 25 C64 38, 52 46, 40 43 C29 40, 26 27, 37 16 Z"
              fill="#FFFFFF"
            />
            <path d="M35 28 C35 19, 41 13, 46 10 L50 17 C43 21, 38 25, 35 28 Z" fill="#FFFFFF" />
            <path d="M40 31 C43 21, 51 14, 61 12 L62 21 C53 22, 46 26, 40 31 Z" fill="#FFFFFF" />
            <path d="M46 33 C52 25, 62 19, 74 22 L68 31 C60 28, 52 29, 46 33 Z" fill="#FFFFFF" />
            <circle cx="47" cy="32" r="2.2" fill="#FFFFFF" />
            <line x1="38" y1="36" x2="56" y2="36" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M47 34 L46 41 L43 46 M46 41 L52 42 L54 45" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <text
              x="50"
              y="84"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="28"
              fontWeight="900"
              fontFamily="sans-serif"
              letterSpacing="-0.5"
            >
              নগদ
            </text>
          </svg>
        </div>
      )
    },
    {
      id: 'Rocket',
      label: 'Rocket Personal',
      bnName: 'রকেট',
      number: settings.rocketNumber,
      isActive: settings.rocketActive !== false && Boolean(settings.rocketNumber && settings.rocketNumber.trim()),
      offlineNotice: settings.rocketOfflineNotice || 'রকেট পেমেন্ট বর্তমানে সাময়িক সময়ের জন্য বন্ধ রয়েছে। অনুগ্রহ করে বিকাশ অথবা নগদে পেমেন্ট করুন।',
      renderLogo: () => (
        <div className="flex items-center justify-center select-none py-1">
          <svg className="w-24 h-10 shrink-0 rounded-lg" viewBox="0 0 220 92" fill="none">
            <rect width="220" height="92" rx="12" fill="#89288F" />
            <text
              x="24"
              y="39"
              fill="#FFFFFF"
              fontSize="17"
              fontWeight="900"
              fontFamily="Arial Black, sans-serif"
            >
              ROCKET
            </text>
            <polygon points="102,26 172,7 144,50 133,36 155,16 121,34" fill="#FFFFFF" />
            <polygon points="121,34 133,36 126,46" fill="#F3E5F5" />
            <text
              x="110"
              y="69"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="34"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              রকেট
            </text>
            <text
              x="115"
              y="83"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="8.5"
              fontWeight="700"
              fontFamily="sans-serif"
            >
              ডাচ্-বাংলা ব্যাংক
            </text>
          </svg>
        </div>
      )
    }
  ];

  // Custom added payment methods
  const customMethodsList = (settings.customPaymentMethods || []).map(cm => ({
    id: cm.id,
    label: `${cm.name} ${cm.accountType ? `(${cm.accountType})` : ''}`,
    bnName: cm.name,
    number: cm.number,
    isActive: cm.active !== false && Boolean(cm.number && cm.number.trim()),
    offlineNotice: cm.offlineNotice || `${cm.name} পেমেন্ট বর্তমানে সাময়িক সময়ের জন্য বন্ধ রয়েছে।`,
    instructions: cm.instructions,
    renderLogo: () => (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow">
        <Wallet className="w-5 h-5" />
      </div>
    )
  }));

  const paymentMethodsList = [...standardMethods, ...customMethodsList];

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
    <div className="min-h-screen bg-[#07090e] text-white py-6 px-3 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-3">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => navigate('/order/game')}
            className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <span className="text-[11px] font-bold text-neutral-400">
            {orderDraft.selectedGame} • ৳{finalAmount}.00
          </span>
        </div>

        {/* Main Gateway Card */}
        <div className="bg-[#F8FAFC] text-neutral-900 rounded-[24px] p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-4">
          {/* Top Dark Header Pill */}
          <div className="bg-[#121B2B] text-white rounded-xl py-3 px-4 text-center shadow-md">
            <h1 className="text-sm sm:text-base font-bold tracking-wide">
              পেমেন্ট পদ্ধতি নির্বাচন করুন
            </h1>
          </div>

          {/* Clean Payment Cards Grid */}
          <div className={`grid gap-2 ${paymentMethodsList.length > 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3'}`}>
            {paymentMethodsList.map(m => {
              const isSelected = paymentMethod === m.id;
              const isOffline = !m.isActive;

              return (
                <div
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`relative cursor-pointer rounded-2xl border-2 p-2.5 flex flex-col items-center justify-between min-h-[96px] transition-all duration-150 ${
                    isSelected
                      ? isOffline
                        ? 'border-red-500 ring-2 ring-red-400/20 bg-red-50/40 shadow-md'
                        : 'border-[#1D4ED8] shadow-md ring-2 ring-[#2563EB]/20 bg-blue-50/10'
                      : isOffline
                        ? 'border-red-200/80 bg-red-50/20 hover:border-red-300 opacity-75'
                        : 'border-slate-200/80 hover:border-slate-300 shadow-sm bg-white'
                  }`}
                >
                  {/* Status Badge: LIVE or সাময়িক বন্ধ */}
                  {isOffline ? (
                    <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider leading-none shadow-sm">
                      সাময়িক বন্ধ
                    </span>
                  ) : (
                    <span className="absolute top-1.5 right-1.5 bg-[#DC2626] text-white text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider leading-none shadow-sm">
                      LIVE
                    </span>
                  )}

                  {/* Top-Left Selected Checkmark */}
                  {isSelected && (
                    <div className={`absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-full text-white flex items-center justify-center shadow ${
                      isOffline ? 'bg-red-600' : 'bg-[#1D4ED8]'
                    }`}>
                      <Check className="w-2 h-2 stroke-[3]" />
                    </div>
                  )}

                  {/* Logo */}
                  <div className={`my-auto ${isOffline ? 'opacity-50 grayscale-[40%]' : ''}`}>
                    {m.renderLogo()}
                  </div>

                  {/* Method Name Text Underneath */}
                  <span className={`text-[10px] font-bold tracking-tight mt-1 text-center line-clamp-1 ${
                    isOffline ? 'text-red-700' : 'text-slate-800'
                  }`}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Number & Copy Instruction Box or Offline Alert */}
          {selectedMethodObj.isActive ? (
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">
                    {selectedMethodObj.label} (Send Money)
                  </span>
                  <span className="text-base font-black font-mono tracking-wider text-slate-900">
                    {selectedMethodObj.number}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyNumber(selectedMethodObj.number)}
                  className="px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-600 border-t border-slate-200 pt-1.5 leading-relaxed">
                {selectedMethodObj.instructions || settings.paymentInstructions || 'এই নাম্বারে সেন্ড মানি করে নিচে Pay বাটনে ক্লিক করুন।'}
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-black text-red-800 uppercase tracking-wide text-[11px]">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>পেমেন্ট সাময়িক সময়ের জন্য বন্ধ</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-600">
                {selectedMethodObj.offlineNotice || `দুঃখিত! ${selectedMethodObj.label} পেমেন্ট বর্তমানে সাময়িক সময়ের জন্য বন্ধ রয়েছে। অনুগ্রহ করে চালু থাকা অন্য মাধ্যমে পেমেন্ট করুন।`}
              </p>
            </div>
          )}

          {/* Coupon Code Strip */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Coupon Code"
                className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 uppercase font-mono"
              />
            </div>
            <button
              onClick={handleApplyCoupon}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-all shrink-0 cursor-pointer"
            >
              Apply
            </button>
          </div>
          {couponError && <p className="text-[10px] font-bold text-red-500">{couponError}</p>}
          {couponSuccess && <p className="text-[10px] font-bold text-emerald-600">{couponSuccess}</p>}

          {/* Secured by Footer */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 pt-1">
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black">
              ✓
            </span>
            <span>Secured by FELCO PAY</span>
          </div>

          {/* Solid Blue Large CTA Button (Pay ৳...) */}
          <button
            onClick={handleNext}
            disabled={!selectedMethodObj.isActive}
            className={`w-full py-3.5 font-bold text-base tracking-wide rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
              selectedMethodObj.isActive
                ? 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white cursor-pointer active:scale-[0.99]'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>
              {selectedMethodObj.isActive ? `Pay ৳${finalAmount}.00` : '🚫 এই মাধ্যমে পেমেন্ট সাময়িক বন্ধ'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
