import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, CheckCircle, XCircle, X, Percent, DollarSign, CheckCircle2 } from 'lucide-react';

interface AdminCouponsProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  active: boolean;
  createdAt?: string;
}

export const AdminCoupons: React.FC<AdminCouponsProps> = ({ currentRoute, navigate }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const snap = await getDocs(collection(db, 'coupons'));
      const list: Coupon[] = [];
      snap.forEach(d => {
        list.push({ ...d.data() } as Coupon);
      });
      setCoupons(list);
    } catch (err: any) {
      console.error('Error fetching coupons', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setActive(true);
    setModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const cleanCode = code.trim().toUpperCase();
    const val = parseFloat(discountValue) || 0;

    try {
      const payload: Coupon = {
        code: cleanCode,
        discountType,
        discountValue: val,
        active,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'coupons', cleanCode), payload);
      setModalOpen(false);
      setSuccessMessage(`Coupon "${cleanCode}" saved successfully.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchCoupons();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'coupons');
    }
  };

  const handleDeleteCoupon = async (couponCode: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) return;
    try {
      await deleteDoc(doc(db, 'coupons', couponCode));
      setSuccessMessage(`Coupon "${couponCode}" deleted.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchCoupons();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `coupons/${couponCode}`);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await updateDoc(doc(db, 'coupons', coupon.code), {
        active: !coupon.active
      });
      fetchCoupons();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `coupons/${coupon.code}`);
    }
  };

  return (
    <AdminLayout currentRoute={currentRoute} navigate={navigate}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 block mb-1">Promo & Marketing</span>
            <h1 className="text-3xl font-black uppercase tracking-tight">Coupon Codes</h1>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="px-6 py-3.5 bg-white text-black font-extrabold uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-xs mb-6 flex items-center justify-between">
            <div>
              <p className="font-bold uppercase tracking-tight mb-1">Error Accessing Coupons</p>
              <p className="opacity-80">{error}</p>
            </div>
            <button 
              onClick={fetchCoupons}
              className="px-4 py-2 bg-red-500 text-white font-black uppercase tracking-widest rounded-lg hover:bg-red-400 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-neutral-500 text-xs">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-900 rounded-2xl text-neutral-500 text-xs">
            No coupon codes active. Click "Create Coupon" to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coupons.map(coupon => (
              <div key={coupon.code} className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-emerald-50/5 border border-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-black">
                        {coupon.discountType === 'percentage' ? <Percent className="w-5 h-5" /> : <span className="font-bold text-xs uppercase">BDT</span>}
                      </div>
                      <div>
                        <h3 className="font-black text-lg tracking-wider text-white font-mono">{coupon.code}</h3>
                        <span className="text-xs text-neutral-400">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off Total` : `BDT ${coupon.discountValue} Fixed Discount`}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleToggleActive(coupon)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${coupon.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-400'}`}
                    >
                      {coupon.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{coupon.active ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-900">
                  <button 
                    onClick={() => handleDeleteCoupon(coupon.code)}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-85 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 text-white w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black uppercase tracking-tight">Create Coupon</h3>
                <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCoupon} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">Coupon Code</label>
                  <input 
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FELCO50"
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white uppercase font-mono tracking-wider font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed BDT</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">Value</label>
                    <input 
                      type="number"
                      value={discountValue}
                      onChange={e => setDiscountValue(e.target.value)}
                      placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 150'}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">Status</label>
                  <select
                    value={active ? 'true' : 'false'}
                    onChange={e => setActive(e.target.value === 'true')}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-3 bg-neutral-800 text-white font-bold uppercase text-xs tracking-wider rounded-xl hover:bg-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-white text-black font-extrabold uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-colors"
                  >
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
