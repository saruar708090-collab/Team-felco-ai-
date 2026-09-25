import React, { useState, useEffect } from 'react';
import { OrderDraft, StoreSettings } from '../types';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowRight, ArrowLeft, Check, Copy, CheckCircle } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface PaymentMethodProps {
  orderDraft: OrderDraft;
  setOrderDraft: React.Dispatch<React.SetStateAction<OrderDraft>>;
  navigate: (route: string) => void;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({ orderDraft, setOrderDraft, navigate }) => {
  useSEO({
    title: `Payment for ${orderDraft.productName || 'Hack'}`,
    description: 'Secure your VIP Hack tool activation by selecting bKash, Rocket, or Nagad automatic deposit channels.'
  });

  if (!orderDraft.productId || !orderDraft.selectedGame) {
    useEffect(() => { navigate('/order/game'); }, []);
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
    nagadNumber: '01613562615',
    rocketNumber: '01613562615',
    paymentInstructions: 'Send money to our personal merchant number via Send Money.'
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
          setCouponSuccess(`Coupon applied successfully! BDT ${calculatedDiscount} discount.`);
        } else {
          setCouponError('This coupon code has expired or is inactive.');
        }
      } else {
        setCouponError('Invalid coupon code. Please try again.');
      }
    } catch (err) {
      setCouponError('Failed to apply coupon. Try again.');
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
        
        // Dynamically select the first available payment method that has a number configured
        const available: string[] = [];
        if (data.bkashNumber && data.bkashNumber.trim()) available.push('bKash');
        if (data.nagadNumber && data.nagadNumber.trim()) available.push('Nagad');
        if (data.rocketNumber && data.rocketNumber.trim()) available.push('Rocket');
        
        if (available.length > 0) {
          setPaymentMethod(available[0]);
        }
      }
    } catch (err) {
      // Use defaults
    }
  };

  const paymentMethodsList = [
    { 
      id: 'bKash', 
      label: 'bKash', 
      number: settings.bkashNumber,
      bg: 'bg-pink-600',
      textColor: 'text-white',
      badgeText: 'bKash'
    },
    { 
      id: 'Nagad', 
      label: 'Nagad', 
      number: settings.nagadNumber,
      bg: 'bg-orange-600',
      textColor: 'text-white',
      badgeText: 'NAGAD'
    },
    { 
      id: 'Rocket', 
      label: 'Rocket', 
      number: settings.rocketNumber,
      bg: 'bg-purple-700',
      textColor: 'text-white',
      badgeText: 'ROCKET'
    }
  ].filter(m => m.number && m.number.trim() !== '');

  const getNumberForMethod = (method: string) => {
    if (method === 'bKash') return settings.bkashNumber || '';
    if (method === 'Nagad') return settings.nagadNumber || '';
    if (method === 'Rocket') return settings.rocketNumber || '';
    return '';
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    setOrderDraft(prev => ({ 
      ...prev, 
      paymentMethod,
      bkashNumber: settings.bkashNumber,
      nagadNumber: settings.nagadNumber,
      rocketNumber: settings.rocketNumber,
      paymentInstructions: settings.paymentInstructions,
      couponCode: couponSuccess ? couponInput.toUpperCase().trim() : undefined,
      discountAmount: discountAmount,
      finalAmount: finalAmount
    }));
    navigate('/order/details');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-8 px-3 sm:px-6">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Step progress */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-900 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <button 
            onClick={() => navigate('/order/game')} 
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">Step 2 of 4</span>
            <span className="text-neutral-600">/</span>
            <span>Payment Method</span>
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <span className="text-[9px] uppercase font-black tracking-widest text-neutral-400 block">Product / Game</span>
              <span className="text-sm font-black uppercase text-white">{orderDraft.productName} ({orderDraft.selectedGame})</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase font-black tracking-widest text-neutral-400 block">Original Price</span>
              <span className="text-sm font-black text-neutral-300">BDT {orderDraft.productPrice}</span>
            </div>
          </div>

          {/* Discount details if coupon applied */}
          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Discount Applied:
              </span>
              <span className="text-red-400">- BDT {discountAmount}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs uppercase font-black tracking-widest text-neutral-200">Total Payable Amount</span>
            <span className="text-base font-black text-emerald-400">BDT {finalAmount}</span>
          </div>
        </div>

        {/* Coupon Input Box */}
        <div className="bg-neutral-950/50 border border-neutral-900 rounded-2xl p-4 space-y-2.5 shadow-md">
          <label className="text-[10px] uppercase font-black tracking-widest text-emerald-400 block">Apply Coupon Code (কোপন কোড ডিসকাউন্ট)</label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={couponInput}
              onChange={e => setCouponInput(e.target.value.toUpperCase())}
              placeholder="ENTER CODE (e.g. FELCO50)"
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 uppercase font-mono tracking-wider font-bold"
            />
            <button
              onClick={handleApplyCoupon}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-md shrink-0"
            >
              Apply
            </button>
          </div>

          {couponError && (
            <p className="text-[10px] font-bold text-red-400 mt-1 uppercase tracking-wider">{couponError}</p>
          )}
          {couponSuccess && (
            <p className="text-[10px] font-bold text-emerald-400 mt-1 uppercase tracking-wider">{couponSuccess}</p>
          )}
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-1">Select Payment Method</h1>
          <p className="text-neutral-400 text-xs">
            Select your preferred payment method below to view the official merchant number.
          </p>
        </div>

        {/* Payment Methods Compact List without showing number upfront */}
        <div className="space-y-2.5">
          {paymentMethodsList.map(m => {
            const isSelected = paymentMethod === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`cursor-pointer border rounded-xl p-4 transition-all flex items-center justify-between ${isSelected ? 'bg-neutral-900 border-emerald-500 shadow-xl ring-1 ring-emerald-500/50' : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'}`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs tracking-wider shadow-lg ${m.bg} ${m.textColor}`}>
                    {m.badgeText}
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-wider uppercase text-white">{m.label}</h3>
                    <span className="text-[11px] text-neutral-400">Click to select {m.label} payment</span>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-emerald-400 bg-emerald-400 text-black' : 'border-neutral-700 bg-neutral-900'}`}>
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Instructions Box showing number only after selection */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 space-y-3 shadow-lg animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                Selected {paymentMethod} Merchant Number
              </span>
              <span className="text-lg font-black font-mono tracking-wider text-emerald-400">{getNumberForMethod(paymentMethod)}</span>
            </div>
            <button
              onClick={() => handleCopyNumber(getNumberForMethod(paymentMethod))}
              className="px-4 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="border-t border-neutral-800 pt-3">
            <p className="text-xs text-neutral-300 leading-relaxed">
              {settings.paymentInstructions || 'Send the exact amount via Send Money. Keep your TrxID and screenshot ready.'}
            </p>
          </div>
        </div>

        {/* Next Button */}
        <div className="pt-2">
          <button 
            onClick={handleNext}
            className="w-full py-3.5 bg-white text-black font-extrabold uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-xl"
          >
            <span>Continue to Order Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
