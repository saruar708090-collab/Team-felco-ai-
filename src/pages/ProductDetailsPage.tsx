import React, { useEffect, useState } from 'react';
import { Product, OrderDraft, StoreSettings } from '../types';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Play, CheckCircle2, Share2, ExternalLink, ShieldCheck, Star } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { ProductReviewsModal } from '../components/ProductReviewsModal';

interface ProductDetailsPageProps {
  productId?: string;
  selectedProduct?: Product | null;
  navigate: (route: string) => void;
  setOrderDraft: React.Dispatch<React.SetStateAction<OrderDraft>>;
  theme?: 'dark' | 'light';
  settings?: StoreSettings | null;
  onBack?: () => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  productId,
  selectedProduct: propProduct,
  navigate,
  setOrderDraft,
  settings,
  onBack
}) => {
  const [product, setProduct] = useState<Product | null>(propProduct || null);
  const [loading, setLoading] = useState<boolean>(!propProduct);
  const [isReviewsOpen, setIsReviewsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (propProduct) {
      setProduct(propProduct);
      setLoading(false);
      return;
    }

    if (productId) {
      const fetchProduct = async () => {
        try {
          const snap = await getDoc(doc(db, 'products', productId));
          if (snap.exists()) {
            setProduct({ ...snap.data(), id: snap.id } as Product);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [productId, propProduct]);

  useSEO({
    title: product ? `${product.name} - Team Felco Store` : 'Product Details',
    description: product?.description || 'VIP prediction tool from Team Felco.',
    imageUrl: product?.imageUrl
  });

  const handleBuyNow = () => {
    if (!product || product.soldOut) return;
    if (product.isFree && product.downloadUrl) {
      window.open(product.downloadUrl, '_blank');
      return;
    }
    setOrderDraft({
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productImageUrl: product.imageUrl,
      selectedGame: product.category || 'Other'
    });
    navigate('/order/game');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#070709] text-white">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-[#070709] text-white">Product Not Found</div>;

  const youtubeId = product.youtubeUrl?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2];

  return (
    <div className="min-h-screen pb-32 bg-[#070709] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#070709]/90 border-b border-neutral-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => onBack ? onBack() : navigate('/')} className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-300">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-xs font-black uppercase truncate max-w-[150px]">{product.name}</span>
          <button onClick={handleShare} className="p-2 bg-neutral-900 rounded-lg text-neutral-300 border border-neutral-800">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {copied && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-black px-4 py-2 rounded-lg text-xs font-bold">
          Link Copied!
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Main Product Info */}
        <div className="bg-[#0d0d12] border border-neutral-800 rounded-2xl overflow-hidden p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-square rounded-xl overflow-hidden border border-neutral-800 bg-black">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-between py-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  {product.category || 'VIP Tool'}
                </span>
                <button onClick={() => setIsReviewsOpen(true)} className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  <Star className="w-3 h-3 fill-current" /> 4.9 Reviews
                </button>
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase">{product.name}</h1>
              <p className="text-sm text-neutral-400 mt-2 leading-relaxed">{product.description}</p>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-black/40 border border-neutral-800">
              <span className="text-[10px] font-bold text-neutral-500 uppercase block">মূল্য (Price):</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl font-black text-emerald-400 font-mono">৳{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm line-through text-neutral-600 font-bold">৳{product.originalPrice}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video Proof Section */}
        <div className="bg-[#0d0d12] border border-neutral-800 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-black uppercase flex items-center gap-2 mb-4">
            <Play className="w-4 h-4 text-red-500 fill-current" />
            লাইভ ভিডিও প্রুফ
          </h2>
          {youtubeId ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-neutral-800 bg-black shadow-lg">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                title="Video Proof"
                allowFullScreen
              />
            </div>
          ) : product.youtubeUrl ? (
            <a href={product.youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center p-8 border border-dashed border-neutral-800 rounded-xl bg-black/20 text-red-400 font-bold uppercase text-xs gap-2">
              <ExternalLink className="w-4 h-4" /> ইউটিউব চ্যানেলে ভিডিওটি দেখুন
            </a>
          ) : (
            <div className="text-center p-6 text-neutral-500 text-xs font-bold uppercase">No Video Proof Provided Yet</div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-[#0d0d12] border border-neutral-800 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-black uppercase flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            ব্যবহার বিধি (How to Use)
          </h2>
          <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
            {product.detailedDescription || '১. পেমেন্ট দিয়ে অর্ডার সাবমিট করুন।\n২. অ্যাডমিনের কাছ থেকে একটিভেশন কোড বুঝে নিন।\n৩. টুলের সিগন্যাল ফলো করে নিরাপদে বেট ধরুন।'}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Buy Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#070709]/95 border-t border-neutral-800 p-4 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase block">প্রোডাক্ট:</span>
            <span className="text-sm font-black truncate max-w-[120px] sm:max-w-none inline-block">{product.name}</span>
          </div>
          <button
            onClick={handleBuyNow}
            disabled={product.soldOut}
            className={`px-8 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
              product.soldOut 
                ? 'bg-neutral-800 text-neutral-500' 
                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {product.soldOut ? 'Sold Out' : (product.isFree ? (product.buttonText || settings?.freeDownloadBtnText || 'Download Free') : (product.buttonText || settings?.buyNowBtnText || 'BUY NOW'))}
          </button>
        </div>
      </div>

      <ProductReviewsModal product={product} isOpen={isReviewsOpen} onClose={() => setIsReviewsOpen(false)} />
    </div>
  );
};
