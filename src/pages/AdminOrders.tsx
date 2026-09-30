import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Order } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Eye, CheckCircle2, Clock, XCircle, RefreshCw, X, ExternalLink, Zap, Copy, Check, Smartphone, Trash2 } from 'lucide-react';
import { parsePaymentSms, registerPaymentAndAutoVerify } from '../utils/smsParser';

interface AdminOrdersProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ currentRoute, navigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Auto-Verify SMS states
  const [smsInput, setSmsInput] = useState('');
  const [manualTrxId, setManualTrxId] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [verifyingSms, setVerifyingSms] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const webhookUrl = 'https://teamfelco.netlify.app/.netlify/functions/sms-webhook?key=FELCO2026';

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

  const handleAutoVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyFeedback(null);

    let trxIdToSave = manualTrxId.trim().toUpperCase();
    let amountToSave = parseFloat(manualAmount) || 0;
    let methodToSave = 'bKash';
    let senderToSave = '';

    if (smsInput.trim()) {
      const parsed = parsePaymentSms(smsInput);
      if (parsed) {
        trxIdToSave = parsed.trxId;
        amountToSave = parsed.amount || amountToSave;
        methodToSave = parsed.method;
        senderToSave = parsed.sender;
      } else if (!trxIdToSave) {
        // Fallback if user pasted just a raw TrxID into the SMS box
        const singleToken = smsInput.trim().toUpperCase();
        if (/^[A-Z0-9]{6,20}$/.test(singleToken)) {
          trxIdToSave = singleToken;
        } else {
          setVerifyFeedback({
            type: 'error',
            message: 'মেসেজ থেকে TrxID খুঁজে পাওয়া যায়নি। পুরো বিকাশ/নগদ মেসেজ পেস্ট করুন অথবা নিচে সরাসরি TrxID লিখুন।'
          });
          return;
        }
      }
    }

    if (!trxIdToSave) {
      setVerifyFeedback({
        type: 'error',
        message: 'অনুগ্রহ করে বিকাশ/নগদ/রকেটের SMS পেস্ট করুন অথবা TrxID লিখুন।'
      });
      return;
    }

    try {
      setVerifyingSms(true);
      const { matchedOrderId } = await registerPaymentAndAutoVerify({
        trxId: trxIdToSave,
        amount: amountToSave,
        method: methodToSave,
        sender: senderToSave,
        rawSms: smsInput.trim()
      });

      setSmsInput('');
      setManualTrxId('');
      setManualAmount('');
      await fetchOrders();

      if (matchedOrderId) {
        setVerifyFeedback({
          type: 'success',
          message: `✅ সফল! TrxID (${trxIdToSave}) চেক করে অর্ডার #${matchedOrderId} অটোমেটিক COMPLETED (ভেরিফাই) করে দেওয়া হয়েছে!`
        });
      } else {
        setVerifyFeedback({
          type: 'info',
          message: `⚡ TrxID (${trxIdToSave}${amountToSave ? ` - BDT ${amountToSave}` : ''}) ডাটাবেজে সেভ হয়েছে! কাস্টমার ওয়েবসাইটে এই TrxID দিয়ে অর্ডার সাবমিট করার সাথে সাথে অটোমেটিক ভেরিফাই হয়ে যাবে!`
        });
      }
    } catch (err: any) {
      setVerifyFeedback({
        type: 'error',
        message: err.message || 'ভেরিফাই করতে সমস্যা হয়েছে।'
      });
    } finally {
      setVerifyingSms(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['orderStatus'], adminMsg?: string) => {
    try {
      const updatePayload: any = {
        orderStatus: newStatus,
        updatedAt: new Date().toISOString()
      };
      if (adminMsg !== undefined) {
        updatePayload.adminMessage = adminMsg;
      }
      await updateDoc(doc(db, 'orders', orderId), updatePayload);
      fetchOrders();
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, orderStatus: newStatus, adminMessage: adminMsg !== undefined ? adminMsg : prev.adminMessage } : null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে অর্ডার #${orderId} ডিলিট করতে চান?`)) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders(prev => prev.filter(o => o.orderId !== orderId));
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  return (
    <AdminLayout currentRoute={currentRoute} navigate={navigate}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 block mb-1">Order Management</span>
            <h1 className="text-3xl font-black uppercase tracking-tight">Customer Orders</h1>
          </div>
          <button
            onClick={() => setShowWebhookGuide(!showWebhookGuide)}
            className="px-4 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Smartphone className="w-4 h-4" />
            <span>{showWebhookGuide ? 'অটো SMS সেটআপ লুকান' : 'ফোনের SMS অটোমেটিক কানেক্ট করুন'}</span>
          </button>
        </div>

        {/* Auto-Verify Payment System Card */}
        <div className="bg-neutral-950 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  Auto Payment Verification (বিকাশ / নগদ / রকেট অটো ভেরিফাই)
                </h2>
                <p className="text-[11px] text-neutral-400">
                  আপনার ফোনে টাকা আসার SMS এখানে পেস্ট করুন অথবা অটোমেটিক SMS Forwarder অ্যাপ কানেক্ট করে রাখুন।
                </p>
              </div>
            </div>
          </div>

          {showWebhookGuide && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 space-y-3 text-xs">
              <h3 className="font-black text-emerald-400 uppercase tracking-wider">
                📱 ফোনে টাকা আসলেই ১০০% অটোমেটিক ভেরিফাই করার নিয়ম (SMS Forwarder):
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 leading-relaxed">
                <li>আপনার অ্যান্ড্রয়েড ফোনে Google Play Store থেকে যেকোনো <b>"SMS to URL Forwarder"</b> বা <b>"Incoming SMS Forwarder"</b> অ্যাপ ডাউনলোড করুন।</li>
                <li>অ্যাপটিতে ফিল্টার হিসেবে <b>bKash</b>, <b>NAGAD</b>, <b>16216</b> (Rocket) সেট করুন।</li>
                <li>নিচের <b>Webhook URL</b>-টি কপি করে অ্যাপের Webhook / URL ঘরে বসিয়ে চালু করে দিন:</li>
              </ol>
              <div className="flex items-center gap-2 bg-black border border-neutral-800 rounded-xl p-2.5">
                <code className="text-[11px] font-mono text-emerald-400 flex-1 break-all">{webhookUrl}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    setCopiedWebhook(true);
                    setTimeout(() => setCopiedWebhook(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shrink-0"
                >
                  {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWebhook ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-neutral-400">
                এটি চালু থাকলে আপনার ফোনে বিকাশ/নগদে টাকা আসার সাথে সাথে মেসেজটি অটোমেটিক সাইটে চলে আসবে এবং কাস্টমারের অর্ডার নিজে নিজেই <b>COMPLETED</b> হয়ে যাবে!
              </p>
            </div>
          )}

          <form onSubmit={handleAutoVerifySubmit} className="space-y-3">
            <div>
              <textarea
                value={smsInput}
                onChange={e => setSmsInput(e.target.value)}
                rows={2}
                placeholder="বিকাশ/নগদ/রকেটের পুরো মেসেজটি এখানে পেস্ট করুন (যেমন: You have received Tk 450.00 from ... TrxID BJM89K2L1P)..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={manualTrxId}
                onChange={e => setManualTrxId(e.target.value.toUpperCase())}
                placeholder="অথবা শুধু TrxID লিখুন"
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 uppercase"
              />
              <input
                type="number"
                value={manualAmount}
                onChange={e => setManualAmount(e.target.value)}
                placeholder="টাকার পরিমাণ (Optional)"
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={verifyingSms}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider rounded-xl px-4 py-2.5 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{verifyingSms ? 'চেক করা হচ্ছে...' : 'অটো ভেরিফাই করুন'}</span>
              </button>
            </div>
          </form>

          {verifyFeedback && (
            <div className={`p-3.5 rounded-xl border text-xs font-bold ${
              verifyFeedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : verifyFeedback.type === 'info'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {verifyFeedback.message}
            </div>
          )}
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
                        {order.couponCode && (
                          <div className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold uppercase px-1.5 py-0.5 rounded inline-block mt-0.5">
                            {order.couponCode} (-{order.discountAmount})
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider ${order.orderStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : order.orderStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : order.orderStatus === 'PROCESSING' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.orderStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order.orderId, 'COMPLETED')}
                                title="Approve Order"
                                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order.orderId, 'CANCELLED')}
                                title="Reject Order"
                                className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.orderId)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                    <span className="font-bold text-sm text-white">{selectedOrder.productName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Selected Game</span>
                    <span className="font-bold text-sm text-emerald-400">{selectedOrder.selectedGame}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Customer Name</span>
                    <span className="font-bold">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">WhatsApp Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{selectedOrder.whatsappNumber || 'N/A'}</span>
                      {selectedOrder.whatsappNumber && (
                        <a
                          href={`https://wa.me/${selectedOrder.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `হ্যালো ${selectedOrder.customerName}! Team Felco থেকে আপনার #${selectedOrder.orderId} (${selectedOrder.productName} - ${selectedOrder.selectedGame}) অর্ডারটি এপ্রুভ করা হয়েছে। এই নিন আপনার ভিআইপি কোড:`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded text-[10px] font-bold"
                        >
                          Chat on WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Telegram ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{selectedOrder.telegramId}</span>
                      <a
                        href={`https://t.me/${selectedOrder.telegramId.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-[10px] font-bold"
                      >
                        Open Telegram
                      </a>
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Payment Method & TRX ID</span>
                    <span className="font-bold">{selectedOrder.paymentMethod}: <span className="font-mono">{selectedOrder.paymentTrxId}</span></span>
                  </div>
                  {selectedOrder.couponCode && (
                    <div>
                      <span className="text-emerald-400 block mb-0.5">Applied Coupon & Discount</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {selectedOrder.couponCode} (-BDT {selectedOrder.discountAmount})
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Final Amount Paid</span>
                    <span className="font-bold text-sm text-white font-mono">
                      BDT {selectedOrder.finalAmount || 'Original Price BDT'}
                    </span>
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

                {/* Status Changer & Admin Message */}
                <div className="space-y-4 pt-2 border-t border-neutral-800">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                      Send Message to User (ইউজারের জন্য বার্তা / ভিআইপি কোড / নোট):
                    </label>
                    <textarea
                      value={selectedOrder.adminMessage || ''}
                      onChange={(e) => setSelectedOrder({ ...selectedOrder, adminMessage: e.target.value })}
                      placeholder="এখানে আপনার ভিআইপি অ্যাক্টিভেশন কোড, ডাউনলোড লিংক অথবা রিজেক্ট হওয়ার কারণ লিখুন..."
                      rows={3}
                      className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">Update Order Status</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as const).map(status => {
                        const isActive = selectedOrder.orderStatus === status;
                        return (
                          <button
                            key={status}
                            onClick={() => handleUpdateStatus(selectedOrder.orderId, status, selectedOrder.adminMessage)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${isActive ? 'bg-white text-black border-white shadow-md' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'}`}
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
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
