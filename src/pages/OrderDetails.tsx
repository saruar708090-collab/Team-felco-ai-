import React, { useState, useEffect } from 'react';
import { OrderDraft, Order } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ArrowRight, ArrowLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface OrderDetailsProps {
  orderDraft: OrderDraft;
  navigate: (route: string) => void;
  setCompletedOrder: (order: Order) => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderDraft, navigate, setCompletedOrder }) => {
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
        const max_size = 600; // Optimal for high quality + tiny file size

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
        
        // Convert to high-quality JPEG with 0.7 compression to guarantee under 50KB size
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
    if (!customerName.trim() || !telegramId.trim() || !whatsappNumber.trim() || !paymentTrxId.trim() || !screenshotUrl.trim()) {
      setError('Please fill in all required fields and upload your payment screenshot.');
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

      const newOrder: Order = {
        orderId,
        productId: orderDraft.productId || 'unknown',
        productName: orderDraft.productName || 'Tool',
        selectedGame: orderDraft.selectedGame || 'HGNICE',
        customerName,
        telegramId,
        whatsappNumber,
        paymentMethod: orderDraft.paymentMethod || 'bKash',
        paymentTrxId,
        paymentScreenshotUrl: screenshotUrl,
        orderStatus: 'PENDING',
        couponCode: orderDraft.couponCode || '',
        discountAmount: orderDraft.discountAmount || 0,
        finalAmount: orderDraft.finalAmount || orderDraft.productPrice || 0,
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
    <div className="min-h-screen bg-[#07070a] text-white py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Step progress */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <button 
            onClick={() => navigate('/order/payment')} 
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">Step 3 of 4</span>
            <span className="text-neutral-600">/</span>
            <span>Order Details</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight mb-1">Order Details & Proof</h1>
          <p className="text-neutral-400 text-xs">
            Provide your contact info, transaction ID, and payment screenshot proof.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-neutral-900 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleValidateAndPreview} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">Your Full Name *</label>
            <input 
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="আপনার পুরো নাম লিখুন"
              required
              className="w-full bg-[#0d0d12] border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">WhatsApp Number *</label>
              <input 
                type="text"
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                placeholder="আপনার হোয়াটসঅ্যাপ নাম্বার"
                required
                className="w-full bg-[#0d0d12] border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">Telegram Username *</label>
              <input 
                type="text"
                value={telegramId}
                onChange={e => setTelegramId(e.target.value)}
                placeholder="আপনার টেলিগ্রাম ইউজারনেম"
                required
                className="w-full bg-[#0d0d12] border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">Payment TRX ID *</label>
            <input 
              type="text"
              value={paymentTrxId}
              onChange={e => setPaymentTrxId(e.target.value.toUpperCase())}
              placeholder="টাকা পাঠানোর ট্রানজেকশন আইডি (TrxID)"
              required
              className="w-full bg-[#0d0d12] border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors uppercase font-bold tracking-wider"
            />
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
              // Compact & Sleek Upload Box
              <div className="border border-dashed border-neutral-800 rounded-xl py-4 px-5 text-center bg-[#0d0d12]/50 hover:border-emerald-500/50 hover:bg-[#0d0d12]/80 transition-all duration-200">
                <label htmlFor="screenshot-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-200">Upload Screenshot</span>
                  <span className="text-[9px] text-neutral-500">Tap to select payment receipt (Max 3MB)</span>
                </label>
              </div>
            ) : (
              // Ultra-Professional Attached Receipt Card
              <div className="p-3 bg-[#0d0d12] border border-emerald-500/20 rounded-xl flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail Preview */}
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-800 shrink-0 bg-neutral-900">
                    <img src={screenshotUrl} alt="Attached Receipt" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-emerald-500/10" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 truncate">Proof Attached</span>
                    </div>
                    <p className="text-[9px] text-neutral-400 mt-0.5 truncate font-mono">receipt_attachment.jpeg</p>
                  </div>
                </div>

                <label htmlFor="screenshot-upload" className="cursor-pointer px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-bold uppercase text-[9px] tracking-wider rounded-lg transition-colors shrink-0">
                  Change Photo
                </label>
              </div>
            )}
          </div>

          <div className="pt-3">
            <button 
              type="submit"
              className="w-full py-3.5 bg-white text-black font-extrabold uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-xl"
            >
              <span>Review Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-[#0b0b0e] border border-neutral-800 text-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block mb-1">Final Verification</span>
                <h3 className="text-xl font-black uppercase tracking-tight">Confirm Your Order</h3>
              </div>

              <div className="space-y-2.5 bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Product:</span>
                  <span className="font-bold text-white">{orderDraft.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Game:</span>
                  <span className="font-bold text-emerald-400">{orderDraft.selectedGame}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Payment:</span>
                  <span className="font-bold">{orderDraft.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Customer Name:</span>
                  <span className="font-bold">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Telegram:</span>
                  <span className="font-bold">{telegramId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">WhatsApp:</span>
                  <span className="font-bold">{whatsappNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">TRX ID:</span>
                  <span className="font-bold font-mono text-emerald-400">{paymentTrxId}</span>
                </div>
                {orderDraft.couponCode && (
                  <div className="flex justify-between border-t border-neutral-900 pt-2 text-emerald-400">
                    <span>Coupon Applied:</span>
                    <span className="font-bold">{orderDraft.couponCode} (-BDT {orderDraft.discountAmount})</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-neutral-900 pt-2 font-black text-white">
                  <span>Final Payment:</span>
                  <span>BDT {orderDraft.finalAmount || orderDraft.productPrice}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 bg-neutral-800 text-white font-bold uppercase text-xs tracking-wider rounded-xl hover:bg-neutral-700 transition-colors"
                >
                  Edit Details
                </button>
                <button 
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="flex-1 py-3 bg-white text-black font-extrabold uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {submitting ? <span>Submitting...</span> : <span>Submit Order</span>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
