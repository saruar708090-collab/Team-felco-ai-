import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Order } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Eye, CheckCircle2, Clock, XCircle, RefreshCw, X, ExternalLink } from 'lucide-react';

interface AdminOrdersProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ currentRoute, navigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const snap = await getDocs(collection(db, 'orders'));
      const list: Order[] = [];
      snap.forEach(d => list.push({ ...d.data(), id: d.id } as Order));
      setOrders(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      console.error('Error fetching orders', err);
      const errorMessage = err.code === 'permission-denied' 
        ? 'Access Denied: Please refresh and try again in a few moments.' 
        : (err.message || String(err));
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: newStatus,
        updatedAt: new Date().toISOString()
      });
      fetchOrders();
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, orderStatus: newStatus } : null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  return (
    <AdminLayout currentRoute={currentRoute} navigate={navigate}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 block mb-1">Order Management</span>
          <h1 className="text-3xl font-black uppercase tracking-tight">Customer Orders</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-xs mb-6 flex items-center justify-between">
            <div>
              <p className="font-bold uppercase tracking-tight mb-1">Error Accessing Orders</p>
              <p className="opacity-80">{error}</p>
            </div>
            <button 
              onClick={fetchOrders}
              className="px-4 py-2 bg-red-500 text-white font-black uppercase tracking-widest rounded-lg hover:bg-red-400 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-neutral-500 text-xs">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-12 text-center text-neutral-500 text-xs">
            No orders have been submitted yet.
          </div>
        ) : (
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-900 text-neutral-500 font-bold uppercase bg-neutral-950">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Product / Game</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Payment & TRX</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  {orders.map(order => (
                    <tr key={order.orderId} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-white">{order.orderId}</td>
                      <td className="p-4">
                        <div className="font-bold">{order.productName}</div>
                        <div className="text-[10px] text-neutral-500">{order.selectedGame}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-white">{order.customerName}</div>
                        <div className="text-[10px] text-neutral-400">{order.whatsappNumber}</div>
                        <div className="text-[10px] text-neutral-500">{order.telegramId}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold">{order.paymentMethod}</div>
                        <div className="font-mono text-[10px] text-neutral-400">{order.paymentTrxId}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider ${order.orderStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : order.orderStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : order.orderStatus === 'PROCESSING' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-85 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 text-white w-full max-w-2xl rounded-2xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Order Details</span>
                  <h3 className="text-xl font-black font-mono">{selectedOrder.orderId}</h3>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Product</span>
                    <span className="font-bold text-sm">{selectedOrder.productName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Selected Game</span>
                    <span className="font-bold text-sm">{selectedOrder.selectedGame}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Customer Name</span>
                    <span className="font-bold">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">WhatsApp Number</span>
                    <span className="font-bold">{selectedOrder.whatsappNumber}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Telegram ID</span>
                    <span className="font-bold">{selectedOrder.telegramId}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Payment Method & TRX ID</span>
                    <span className="font-bold">{selectedOrder.paymentMethod}: <span className="font-mono">{selectedOrder.paymentTrxId}</span></span>
                  </div>
                </div>

                {/* Screenshot view */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">Payment Screenshot Proof</span>
                  {selectedOrder.paymentScreenshotUrl ? (
                    <div className="border border-neutral-800 rounded-xl p-2 bg-neutral-950">
                      <img 
                        src={selectedOrder.paymentScreenshotUrl} 
                        alt="Payment Screenshot" 
                        className="w-full max-h-72 object-contain rounded-lg bg-black"
                      />
                      <div className="mt-2 text-right">
                        <a 
                          href={selectedOrder.paymentScreenshotUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs text-neutral-400 hover:text-white underline inline-flex items-center gap-1"
                        >
                          <span>Open Full Image</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-500">
                      No screenshot provided.
                    </div>
                  )}
                </div>

                {/* Status Changer */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">Update Order Status</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as const).map(status => {
                      const isActive = selectedOrder.orderStatus === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(selectedOrder.orderId, status)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${isActive ? 'bg-white text-black border-white shadow-md' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'}`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
