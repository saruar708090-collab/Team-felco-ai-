import React, { useEffect } from 'react';
import { Order } from '../types';
import { CheckCircle2, ShieldCheck, ArrowRight, Home, Headphones } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface OrderSuccessProps {
  completedOrder: Order | null;
  navigate: (route: string) => void;
  onOpenCustomerService: () => void;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({ completedOrder, navigate, onOpenCustomerService }) => {
  useSEO({
    title: completedOrder ? `Order Successful - ${completedOrder.orderId}` : 'Order Successful',
    description: 'Congratulations! Your order proof has been successfully received. Copy your order ID to track activation status.'
  });

  if (!completedOrder) {
    useEffect(() => { navigate('/'); }, []);
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold block mb-2">Transaction Confirmed</span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4">Order Submitted Successfully</h1>
        <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
          Your order has been received and securely logged in our database. Our admins are verifying your TRX ID and payment screenshot.
        </p>

        {/* Order Details Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-left space-y-4 mb-8">
          <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
            <span className="text-xs uppercase font-bold text-neutral-400">Order ID</span>
            <span className="font-black font-mono text-white text-sm bg-black px-3 py-1 rounded-lg border border-neutral-700">
              {completedOrder.orderId}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Product:</span>
              <span className="font-bold">{completedOrder.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Selected Game:</span>
              <span className="font-bold">{completedOrder.selectedGame}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Payment Method:</span>
              <span className="font-bold">{completedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">TRX ID:</span>
              <span className="font-bold font-mono">{completedOrder.paymentTrxId}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
              <span className="text-neutral-400">Order Status:</span>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider">
                {completedOrder.orderStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-4 bg-white text-black font-extrabold uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </button>
          <button
            onClick={onOpenCustomerService}
            className="flex-1 py-4 bg-neutral-900 border border-neutral-700 text-white font-extrabold uppercase text-xs tracking-widest rounded-xl hover:border-white transition-colors flex items-center justify-center gap-2"
          >
            <Headphones className="w-4 h-4" />
            <span>Contact Support</span>
          </button>
        </div>
      </div>
    </div>
  );
};
