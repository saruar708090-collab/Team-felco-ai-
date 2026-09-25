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
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Screenshot image file must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
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
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'orders', orderId), newOrder);

      setCompletedOrder(newOrder);
      navigate('/order/success');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderDraft.productId}`);
    } finally {
      setSubmitting(false);
      setShowConfirmModal(false);
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
              placeholder="e.g. John Doe"
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
                placeholder="e.g. +8801700000000"
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
                placeholder="e.g. @username"
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
              placeholder="e.g. 9N74K29L1A"
              required
              className="w-full bg-[#0d0d12] border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors uppercase font-bold tracking-wider"
            />
          </div>

          {/* Payment Screenshot Upload - Photo URL removed as requested */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">Payment Screenshot Proof *</label>
            
            <div className="border-2 border-dashed border-neutral-800 rounded-xl p-5 text-center bg-[#0d0d12] hover:border-emerald-500/50 transition-colors">
              <input 
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="screenshot-upload"
              />
              <label htmlFor="screenshot-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-emerald-400 shadow-md">
                  <Upload className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">Click to upload payment screenshot</span>
                <span className="text-[10px] text-neutral-500">Supports PNG, JPG (Max 2MB)</span>
              </label>
            </div>

            {screenshotUrl && (
              <div className="p-3 bg-neutral-950 border border-emerald-500/30 rounded-xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-300">Screenshot attached successfully</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">Ready</span>
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
