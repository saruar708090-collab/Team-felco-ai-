import React, { useState, useEffect } from 'react';
import { OrderDraft, StoreSettings } from '../types';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowRight, ArrowLeft, Check, Copy, CheckCircle } from 'lucide-react';

interface PaymentMethodProps {
  orderDraft: OrderDraft;
  setOrderDraft: React.Dispatch<React.SetStateAction<OrderDraft>>;
  navigate: (route: string) => void;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({ orderDraft, setOrderDraft, navigate }) => {
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'general'));
      if (docSnap.exists()) {
        setSettings(docSnap.data() as StoreSettings);
      }
    } catch (err) {
      // Use defaults
    }
  };

  const paymentMethodsList = [
    { 
      id: 'bKash', 
      label: 'bKash', 
      number: settings.bkashNumber || '01613562615',
      bg: 'bg-pink-600',
      textColor: 'text-white',
      badgeText: 'bKash'
    },
    { 
      id: 'Nagad', 
      label: 'Nagad', 
      number: settings.nagadNumber || '01613562615',
      bg: 'bg-orange-600',
      textColor: 'text-white',
      badgeText: 'NAGAD'
    },
    { 
      id: 'Rocket', 
      label: 'Rocket', 
      number: settings.rocketNumber || '01613562615',
      bg: 'bg-purple-700',
      textColor: 'text-white',
      badgeText: 'ROCKET'
    }
  ];

  const getNumberForMethod = (method: string) => {
    if (method === 'bKash') return settings.bkashNumber || '01613562615';
    if (method === 'Nagad') return settings.nagadNumber || '01613562615';
    if (method === 'Rocket') return settings.rocketNumber || '01613562615';
    return '01613562615';
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
      paymentInstructions: settings.paymentInstructions
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
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block">Product / Game</span>
            <span className="text-xs sm:text-sm font-black uppercase text-white">{orderDraft.productName} ({orderDraft.selectedGame})</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block">Amount</span>
            <span className="text-sm font-black text-emerald-400">BDT {orderDraft.productPrice}</span>
          </div>
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
