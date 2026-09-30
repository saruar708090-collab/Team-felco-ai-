import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs, deleteDoc, doc, query } from 'firebase/firestore';
import { Star, Trash2, MessageSquare, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface AdminReviewsProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

interface ReviewItem {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: any;
}

export const AdminReviews: React.FC<AdminReviewsProps> = ({ currentRoute, navigate }) => {
  useSEO({
    title: 'Admin Reviews Management - Team Felco',
    description: 'Manage customer product reviews and ratings.'
  });

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const q = query(collection(db, 'reviews'));
      const snap = await getDocs(q);
      const list: ReviewItem[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as ReviewItem);
      });
      setReviews(list);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err?.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string, userName: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${userName}"-এর রিভিউটি ডিলিট করতে চান?`)) return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setSuccessMsg('রিভিউটি সফলভাবে ডিলিট করা হয়েছে!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `reviews/${reviewId}`);
    }
  };

  return (
    <AdminLayout currentRoute={currentRoute} navigate={navigate}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 block mb-1">Customer Feedback</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-2.5">
              <MessageSquare className="w-8 h-8 text-emerald-400" />
              <span>Reviews & Ratings</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              কাস্টমারদের দেওয়া সকল প্রোডাক্ট রিভিউ এখানে দেখতে ও অপ্রয়োজনীয় রিভিউ ডিলিট করতে পারবেন।
            </p>
          </div>

          <button
            onClick={fetchReviews}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-neutral-800 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-neutral-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>রিভিউ লোড হচ্ছে...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-16 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-neutral-700 mx-auto" />
            <h3 className="text-sm font-bold text-neutral-400 uppercase">কোনো রিভিউ পাওয়া যায়নি</h3>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto">
              কাস্টমাররা প্রোডাক্ট পেজ থেকে রিভিউ জমা দিলে তা এখানে সাথে সাথে প্রদর্শিত হবে।
            </p>
          </div>
        ) : (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-900 text-neutral-500 font-bold uppercase bg-neutral-950">
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Product ID</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Comment</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  {reviews.map(review => (
                    <tr key={review.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="p-4 font-bold text-white">{review.userName}</td>
                      <td className="p-4 font-mono text-neutral-400">{review.productId}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold">{review.rating} / 5</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-md">
                        <p className="text-neutral-300 leading-relaxed">{review.comment}</p>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(review.id, review.userName)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
