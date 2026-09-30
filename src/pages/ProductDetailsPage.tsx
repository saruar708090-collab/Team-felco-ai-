import React, { useEffect, useState } from 'react';
import { Product, OrderDraft, StoreSettings } from '../types';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { ArrowLeft, ArrowRight, Download, Sparkles, Flame, ShieldCheck, Star, Play, CheckCircle2, Share2, HelpCircle, ExternalLink, Zap, Lock } from 'lucide-react';
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
  theme = 'dark',
  settings,
  onBack
}) => {
  const [product, setProduct] = useState<Product | null>(propProduct || null);
  const [loading, setLoading] = useState<boolean>(!propProduct);
  const [isReviewsOpen, setIsReviewsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const isLight = theme === 'light';

  useEffect(() => {
    if (propProduct) {
      setProduct(propProduct);
      setLoading(false);
      return;
    }

    if (productId) {
      fetchProductById(productId);
    }
  }, [productId, propProduct]);

  const fetchProductById = async (id: string) => {
    try {
      setLoading(true);
      const docRef = doc(db, 'products', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setProduct({ ...snap.data(), id: snap.id } as Product);
      } else {
        // Fallback: search in collection
        const qSnap = await getDocs(collection(db, 'products'));
        let found: Product | null = null;
        qSnap.forEach(d => {
          if (d.id === id) {
            found = { ...d.data(), id: d.id } as Product;
          }
        });
        setProduct(found);
      }
    } catch (err) {
      console.error('Error loading product details', err);
    } finally {
      setLoading(false);
    }
  };

  useSEO({
    title: product ? `${product.name} - Team Felco Store` : 'Product Details - Team Felco Store',
    description: product?.description || 'Get VIP accurate hack prediction algorithms, proof video and tutorial guides from Team Felco.',
    ogType: 'product',
    imageUrl: product?.imageUrl,
    youtubeUrl: product?.youtubeUrl
  });

  const handleBuyNow = () => {
    if (!product || product.soldOut) return;
    setOrderDraft({
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productImageUrl: product.imageUrl,
      selectedGame: product.category === 'Aviator Hack' ? '1X BET' : 'HGNICE'
    });
    navigate('/order/game');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || 'VIP Tool',
        text: product?.description || 'Check out this VIP prediction tool!',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0a0a0c] text-white'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase font-bold tracking-widest text-neutral-400">Loading Product Details...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0a0a0c] text-white'}`}>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">প্রোডাক্ট পাওয়া যায়নি (Not Found)</h2>
        <p className="text-xs text-neutral-400 mb-6">আপনার খোঁজা প্রোডাক্টটি মুছে ফেলা হয়েছে বা লিংকটি সঠিক নয়।</p>
        <button
          onClick={() => onBack ? onBack() : navigate('/')}
          className="px-6 py-3 bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors"
        >
          হোমপেজে ফিরে যান (Back Home)
        </button>
      </div>
    );
  }

  const hasDiscount = !product.isFree && !!(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) 
    : 0;

  // Extract YouTube Video ID
  const getYouTubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(product.youtubeUrl);

  return (
    <div className={`min-h-screen pb-24 transition-colors ${isLight ? 'bg-slate-50 text-neutral-900' : 'bg-[#08080a] text-white'}`}>
      
      {/* Sticky Top Navigation Bar */}
      <div className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-colors ${
        isLight ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-[#0c0c10]/90 border-neutral-800/80 shadow-lg'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => onBack ? onBack() : navigate('/')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-neutral-800' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোমে ফিরে যান</span>
          </button>

          <div className="flex items-center gap-2 truncate text-center">
            <span className="text-xs font-black uppercase tracking-tight truncate max-w-[200px] sm:max-w-[320px]">
              {product.name}
            </span>
          </div>

          <button
            onClick={handleShare}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-neutral-700' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
            }`}
            title="Share Product"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {copied && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-black px-4 py-2 rounded-xl text-xs font-bold shadow-xl animate-fadeIn">
          লিংক কপি করা হয়েছে! (Link Copied)
        </div>
      )}

      {/* Main Full-Screen Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
        
        {/* Top Product Hero Card */}
        <div className={`border rounded-3xl overflow-hidden shadow-2xl transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0f0f14] border-neutral-800/90'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 sm:p-8 items-center">
            
            {/* Left Image / Thumbnail Area */}
            <div className="md:col-span-5 relative">
              <div className="relative aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-inner group">
                <img
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=60'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Floating Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {product.isFree ? (
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-[10px] uppercase px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>100% FREE</span>
                    </span>
                  ) : hasDiscount && (
                    <span className="bg-rose-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>SAVE {discountPercent}%</span>
                    </span>
                  )}
                  {product.soldOut && !product.isFree && (
                    <span className="bg-red-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg shadow animate-pulse">
                      🔴 SOLD OUT
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center justify-between text-white text-[11px] font-mono">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Official Tool</span>
                  </span>
                  <span className="text-neutral-400 font-semibold">{product.version || 'v3.2 Pro'}</span>
                </div>
              </div>
            </div>

            {/* Right Details Summary Area */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                {/* Category & Rating Pill */}
                <div className="flex items-center flex-wrap gap-2 mb-2.5">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border ${
                    product.isFree 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {product.isFree ? '🎁 FREE TOOL / APK' : (product.category || 'COLOUR TRADING HACK')}
                  </span>

                  <button
                    onClick={() => setIsReviewsOpen(true)}
                    className="flex items-center gap-1 bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-md text-[10px] font-bold hover:bg-amber-400/20 transition-colors cursor-pointer"
                  >
                    <Star className="w-3 h-3 fill-current" />
                    <span>4.9 / 5.0 (Customer Reviews)</span>
                  </button>
                </div>

                {/* Main Product Title */}
                <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight leading-tight">
                  {product.name}
                </h1>

                {/* Short Description */}
                <p className={`text-xs sm:text-sm mt-2.5 leading-relaxed ${
                  isLight ? 'text-neutral-600' : 'text-neutral-300'
                }`}>
                  {product.description || 'Professional VIP calculation algorithms and high accuracy signals directly from Team Felco.'}
                </p>
              </div>

              {/* Price & Value Highlights */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950/80 border-neutral-800'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    {product.isFree ? 'Access Fee (ফি):' : 'Offer Price (বর্তমান মূল্য):'}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {product.isFree ? (
                      <span className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1.5">
                        <Sparkles className="w-5 h-5" />
                        <span>১০০% ফ্রি (FREE ACCESS)</span>
                      </span>
                    ) : (
                      <>
                        {hasDiscount && (
                          <span className="line-through text-red-500 font-bold text-sm sm:text-base">
                            ৳{product.originalPrice}
                          </span>
                        )}
                        <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                          ৳{product.price}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                          BDT (এককালীন / Lifetime)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {product.fileSize && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">File Size:</span>
                    <span className="text-xs font-mono font-bold text-blue-400">{product.fileSize}</span>
                  </div>
                )}
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {product.isFree ? (
                  <a
                    href={product.downloadUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-98 cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>{product.buttonText || 'Download Free (সরাসরি ডাউনলোড)'}</span>
                  </a>
                ) : (
                  <button
                    onClick={handleBuyNow}
                    disabled={product.soldOut}
                    className={`flex-1 py-3.5 font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl active:scale-98 cursor-pointer ${
                      product.soldOut
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25'
                    }`}
                  >
                    <span>{product.soldOut ? 'SOLD OUT' : 'Buy Now (অর্ডার করুন)'}</span>
                    {!product.soldOut && <ArrowRight className="w-4 h-4" />}
                  </button>
                )}

                <button
                  onClick={() => setIsReviewsOpen(true)}
                  className={`px-5 py-3.5 border rounded-xl font-bold uppercase text-xs tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-neutral-700' : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-white'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>কাস্টমার রিভিউ</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* 🎬 DEDICATED PROOF & TUTORIAL VIDEO SECTION (প্রুফ ও টিউটোরিয়াল ভিডিও) */}
        <div className={`border rounded-3xl p-5 sm:p-8 shadow-2xl transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0f0f14] border-neutral-800/90'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-neutral-800/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-red-500 flex items-center gap-1.5">
                  <span>লাইভ ভিডিও প্রুফ ও টিউটোরিয়াল</span>
                  <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded animate-pulse">HD PROOF</span>
                </h2>
                <span className="text-[11px] text-neutral-400">টুলটির কার্যকারিতা, সিগন্যাল ও ব্যবহারের সম্পূর্ণ ভিডিও গাইড</span>
              </div>
            </div>

            {product.youtubeUrl && (
              <a
                href={product.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
              >
                <span>ইউটিউব চ্যানেলে দেখুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Responsive Embedded Video Player or Fallback Showcase */}
          {youtubeId ? (
            <div className="space-y-3">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-neutral-800 bg-black shadow-2xl">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&autoplay=0`}
                  title={`${product.name} Video Tutorial`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="text-[11px] text-neutral-400 text-center font-medium">
                👆 ভিডিওটিতে হ্যাকের সম্পূর্ণ নিয়ম এবং ১০০% উইনিং সিগন্যাল দেখানো হয়েছে।
              </p>
            </div>
          ) : product.youtubeUrl ? (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-red-500/20 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 flex flex-col items-center justify-center p-6 text-center shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-600/30 mb-3 animate-pulse">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <h3 className="text-base font-black uppercase text-white tracking-tight mb-1">ভিডিও প্রুফ দেখতে এখানে ক্লিক করুন</h3>
              <p className="text-xs text-neutral-400 max-w-md mb-4">ইউটিউব চ্যানেলে এই টুলের লাইভ ডেমো এবং ফুল উইনিং রেকর্ড আপলোড করা হয়েছে।</p>
              <a
                href={product.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                <span>ভিডিওটি ইউটিউবে ওপেন করুন</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/60 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 mx-auto flex items-center justify-center text-neutral-600">
                <Play className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">ভিডিও টিউটোরিয়াল প্রস্তুত হচ্ছে</h4>
              <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
                এই প্রোডাক্টের জন্য অ্যাডমিন কর্তৃক ইউটিউব প্রুফ লিংক যুক্ত করার পর এখানে সরাসরি দেখা যাবে।
              </p>
            </div>
          )}
        </div>

        {/* 📖 DETAILED GUIDE & INSTRUCTIONS (পূর্ণ নির্দেশিকা ও ব্যবহারের নিয়ম) */}
        <div className={`border rounded-3xl p-5 sm:p-8 shadow-2xl transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0f0f14] border-neutral-800/90'
        }`}>
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-neutral-800/60">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-emerald-400">
                ব্যবহার বিধি ও বিস্তারিত গাইড (How to Use)
              </h2>
              <span className="text-[11px] text-neutral-400">টুলটি সঠিক নিয়মে সেটআপ করার প্রয়োজনীয় পদক্ষেপসমূহ</span>
            </div>
          </div>

          <div className="space-y-4">
            {product.detailedDescription ? (
              <div className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line p-4 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200 text-neutral-800' : 'bg-neutral-950/80 border-neutral-800/80 text-neutral-200'
              }`}>
                {product.detailedDescription}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'}`}>
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center mb-2">১</span>
                  <h4 className="text-xs font-bold uppercase mb-1">অর্ডার / ডাউনলোড</h4>
                  <p className="text-[11px] text-neutral-400">বিকাশ বা নগদে পেমেন্ট দিয়ে অর্ডার সাবমিট করুন বা ফ্রি লিংক থেকে APK ফাইল নামিয়ে নিন।</p>
                </div>
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'}`}>
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center mb-2">২</span>
                  <h4 className="text-xs font-bold uppercase mb-1">ভিআইপি কী অ্যাক্টিভেশন</h4>
                  <p className="text-[11px] text-neutral-400">টুল ওপেন করে অ্যাডমিনের দেওয়া লাইসেন্স কোডটি বসিয়ে একটিভ বাটনে চাপ দিন।</p>
                </div>
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'}`}>
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center mb-2">৩</span>
                  <h4 className="text-xs font-bold uppercase mb-1">সিগন্যাল অনুযায়ী খেলুন</h4>
                  <p className="text-[11px] text-neutral-400">টুলের রিয়েল-টাইম স্ক্রিন প্রডিকশন ফলো করে নিরাপদে বেট ধরুন এবং উইন করুন।</p>
                </div>
              </div>
            )}

            {/* Feature Highlights Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-850'}`}>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-bold">Anti-Ban 100% Secure</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-850'}`}>
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-[11px] font-bold">AI Signal Precision</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-850'}`}>
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] font-bold">Instant Activation</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-850'}`}>
                <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-[11px] font-bold">24/7 VIP Support</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Bottom Sticky Bar on Mobile & Desktop */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl p-3 sm:p-4 transition-colors ${
        isLight ? 'bg-white/95 border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]' : 'bg-[#0a0a0e]/95 border-neutral-800 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]'
      }`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h4 className="text-xs font-black uppercase truncate hidden sm:block">{product.name}</h4>
            <div className="flex items-center gap-2">
              {product.isFree ? (
                <span className="text-sm sm:text-base font-black text-emerald-400 uppercase">100% FREE ACCESS</span>
              ) : (
                <>
                  <span className="text-xs text-neutral-400 uppercase font-bold">মূল্য:</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">৳{product.price}</span>
                  {hasDiscount && (
                    <span className="line-through text-red-500 text-xs font-bold hidden sm:inline">৳{product.originalPrice}</span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {product.isFree ? (
              <a
                href={product.downloadUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 sm:px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black uppercase text-xs sm:text-sm tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{product.buttonText || 'Download Free'}</span>
              </a>
            ) : (
              <button
                onClick={handleBuyNow}
                disabled={product.soldOut}
                className={`px-6 sm:px-8 py-3 font-black uppercase text-xs sm:text-sm tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer ${
                  product.soldOut
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25'
                }`}
              >
                <span>{product.soldOut ? 'Sold Out' : 'Buy Now (অর্ডার করুন)'}</span>
                {!product.soldOut && <ArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Modal */}
      <ProductReviewsModal
        product={product}
        isOpen={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
      />

    </div>
  );
};
