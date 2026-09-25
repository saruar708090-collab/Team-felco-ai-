import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { db, auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Package, ShoppingCart, Clock, CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react';
import { Product, Order } from '../types';

interface AdminDashboardProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentRoute, navigate }) => {
  const [productsCount, setProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Longer delay to ensure auth and rules are fully ready/propagated
    const timer = setTimeout(() => {
      if (auth.currentUser || localStorage.getItem('admin_bypassed') === 'true') {
        fetchDashboardData();
      } else {
        console.warn('Dashboard fetch skipped: User not authenticated');
        setLoading(false);
        setError('Authentication session not ready. Please try again.');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard data from:', (db as any)._databaseId?.database);
      
      const prodSnap = await getDocs(collection(db, 'products'));
      console.log('Products fetched:', prodSnap.size);
      setProductsCount(prodSnap.size);

      const orderSnap = await getDocs(collection(db, 'orders'));
      console.log('Orders fetched:', orderSnap.size);
      setOrdersCount(orderSnap.size);

      let pCount = 0;
      let cCount = 0;
      const ordersList: Order[] = [];

      orderSnap.forEach(docSnap => {
        const order = docSnap.data() as Order;
        ordersList.push(order);
        if (order.orderStatus === 'PENDING') pCount++;
        if (order.orderStatus === 'COMPLETED') cCount++;
      });

      setPendingCount(pCount);
      setCompletedCount(cCount);
      setRecentOrders(ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
    } catch (err: any) {
      console.error('CRITICAL: Dashboard Fetch Error', err);
      // Specific guidance for permission errors
      if (err.code === 'permission-denied') {
        setError('Access Denied: Please check your Firebase Console > Firestore > Rules and ensure "allow read, write: if true;" is set and Published.');
      } else {
        setError(err.message || String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout currentRoute={currentRoute} navigate={navigate}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 block mb-1">Admin Overview</span>
          <h1 className="text-3xl font-black uppercase tracking-tight">Dashboard Metrics</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-xs flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-bold uppercase tracking-tight">Database Error</p>
              <p className="opacity-80">{error}</p>
              <button 
                onClick={fetchDashboardData}
                className="mt-2 text-[10px] font-black uppercase tracking-widest bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-neutral-500 block mb-1">Total Products</span>
              <span className="text-3xl font-black">{loading ? '...' : productsCount}</span>
            </div>
            <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-white">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-neutral-500 block mb-1">Total Orders</span>
              <span className="text-3xl font-black">{loading ? '...' : ordersCount}</span>
            </div>
            <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-white">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-neutral-500 block mb-1">Pending Orders</span>
              <span className="text-3xl font-black text-amber-400">{loading ? '...' : pendingCount}</span>
            </div>
            <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-neutral-500 block mb-1">Completed Orders</span>
              <span className="text-3xl font-black text-emerald-400">{loading ? '...' : completedCount}</span>
            </div>
            <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black uppercase tracking-wider text-sm">Recent Orders</h3>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors underline"
            >
              View All Orders &rarr;
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-neutral-500 text-xs">Loading orders...</div>
          ) : recentOrders.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-xs">No orders submitted yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-900 text-neutral-500 font-bold uppercase">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Product / Game</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Method / TRX ID</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  {recentOrders.map(order => (
                    <tr key={order.orderId} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3.5 font-mono font-bold text-white">{order.orderId}</td>
                      <td className="py-3.5">
                        <div className="font-bold">{order.productName}</div>
                        <div className="text-[10px] text-neutral-500">{order.selectedGame}</div>
                      </td>
                      <td className="py-3.5">
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-[10px] text-neutral-500">{order.whatsappNumber}</div>
                      </td>
                      <td className="py-3.5">
                        <div className="font-bold">{order.paymentMethod}</div>
                        <div className="font-mono text-[10px] text-neutral-400">{order.paymentTrxId}</div>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider ${order.orderStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : order.orderStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-300'}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
