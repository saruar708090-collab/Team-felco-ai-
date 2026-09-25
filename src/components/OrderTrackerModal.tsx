import React, { useState } from 'react';
import { Search, X, CheckCircle2, Clock, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Order } from '../types';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearching(true);
    setError('');
    setSearchResult(null);
    setSearched(true);

    try {
      const trimmed = searchTerm.trim();
      const ordersRef = collection(db, 'orders');

      // First try searching by paymentTrxId
      let q = query(ordersRef, where('paymentTrxId', '==', trimmed));
      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Try searching by orderId
        q = query(ordersRef, where('orderId', '==', trimmed));
        querySnapshot = await getDocs(q);
      }

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        setSearchResult({ id: docSnap.id, ...(docSnap.data() as Order) });
      } else {
        setError('No order found with this Transaction ID or Order ID. Please check and try again.');
      }
    } catch (err: any) {
      setError('Error searching orders. Please try again later.');
    } finally {
      setSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Completed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <RefreshCw className="w-4 h-4 animate-spin" /> Processing
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Clock className="w-4 h-4" /> Pending Verification
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 p-2 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-white">Track Your Order</h2>
            <p className="text-xs text-neutral-400">Enter your Transaction ID (TrxID) or Order ID</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="e.g. 9H7K82M1 or TF-17271"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-neutral-600 outline-none transition-colors pr-12 font-mono uppercase"
            />
            <button
              type="submit"
              disabled={searching}
              className="absolute right-2 top-2 bottom-2 bg-white hover:bg-neutral-200 text-black px-4 rounded-lg font-black text-xs uppercase transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {searchResult && (
          <div className="mt-6 p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Order ID</div>
                <div className="text-sm font-mono font-black text-white">{searchResult.orderId}</div>
              </div>
              <div>{getStatusBadge(searchResult.orderStatus)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-neutral-500 block mb-1">Product</span>
                <span className="font-extrabold text-white">{searchResult.productName}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Game / Platform</span>
                <span className="font-extrabold text-white">{searchResult.selectedGame}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Customer Name</span>
                <span className="font-semibold text-neutral-300">{searchResult.customerName}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Payment Method</span>
                <span className="font-semibold text-emerald-400 uppercase">{searchResult.paymentMethod}</span>
              </div>
              <div className="col-span-2">
                <span className="text-neutral-500 block mb-1">Transaction ID (TrxID)</span>
                <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{searchResult.paymentTrxId}</span>
              </div>
            </div>
          </div>
        )}

        {searched && !searchResult && !error && !searching && (
          <div className="mt-6 text-center text-xs text-neutral-500 py-6">
            Enter a valid Transaction ID to check real-time status.
          </div>
        )}
      </div>
    </div>
  );
};
