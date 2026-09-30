import React, { useEffect, useState } from 'react';
import { Product, OrderDraft, StoreSettings } from '../types';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { ArrowLeft, Download, Sparkles, Flame, ShieldCheck, Star, Play, CheckCircle2, Share2, ExternalLink, Zap, Lock, Send, MessageSquare, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#070709] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
          <span className="text-xs uppercase font-black tracking-widest text-emerald-400 animate-pulse">Loading VIP Secure System...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#070709] text-white">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">প্রোডাক্ট পাওয়া যায়নি</h2>
        <p className="text-xs text-neutral-400 mb-6">আপনার খোঁজা প্রোডাক্টটি মুছে ফেলা হয়েছে বা লিংকটি সঠিক নয়।</p>
        <button
          onClick={() => onBack ? onBack() : navigate('/')}
          className="px-6 py-3.5 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer"
        >
          হোমে ফিরে যান
        </button>
      </div>
    );
  }

  const hasDiscount = !product.isFree && !!(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) 
    : 0;

  const getYouTubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(product.youtubeUrl);

  return (
    <div className="min-h-screen pb-32 bg-[#070709] text-white selection:bg-emerald-500 selection:text-black font-sans">
      
      {/* Sleek Cyberpunk Ambient Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-emerald-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Sticky Top Navigation Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-[#070709]/85 border-b border-neutral-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => onBack ? onBack() : navigate('/')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 transition-all shadow-md cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>হোমে ফিরে যান</span>
          </button>

          <div className="flex items-center gap-2 truncate text-center">
            <span className="text-xs font-black uppercase tracking-tight truncate max-w-[200px] sm:max-w-[320px] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-emerald-400">
              {product.name}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-all shadow-md cursor-pointer hover:border-neutral-700"
            title="Share Product"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {copied && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.5)] animate-bounce">
          ✓ লিংক সফলভাবে কপি করা হয়েছে!
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8 relative z-10">
        
        {/* Top Hero Product Card */}
        <div className="bg-gradient-to-br from-[#111116] via-[#0d0d12] to-[#0a0a0e] border border-neutral-800/90 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
            
            {/* Left Image / Thumbnail Area */}
            <div className="md:col-span-5 relative">
              <div className="relative aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] group">
                <img
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=60'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Overlay Lighting Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Floating Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {product.isFree ? (
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-[10px] uppercase px-3 py-1 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>100% FREE VIP</span>
                    </span>
                  ) : hasDiscount && (
                    <span className="bg-gradient-to-r from-rose-600 to-red-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-lg shadow-[0_0_15px_rgba(225,29,72,0.4)] flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>SAVE {discountPercent}% OFF</span>
                    </span>
                  )}
                  {product.soldOut && !product.isFree && (
                    <span className="bg-red-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-lg shadow animate-pulse">
                      🔴 SOLD OUT
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 flex items-center justify-between text-white text-[11px] font-mono">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified VIP Script</span>
                  </span>
                  <span className="text-neutral-400 font-semibold">{product.version || 'v3.5 Pro'}</span>
                </div>
              </div>
            </div>

            {/* Right Details Summary */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center flex-wrap gap-2.5 mb-3">
                  <span className="text-[10px] font-black uppercase px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                    {product.isFree ? '🎁 FREE TOOL' : (product.category || 'VIP PREDICTOR')}
                  </span>

                  <button
                    onClick={() => setIsReviewsOpen(true)}
                    className="flex items-center gap-1.5 bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider hover:bg-amber-400/25 transition-all cursor-pointer shadow-[0_0_10px_rgba(251,191,36,0.1)]"
                  >
                    <Star className="w-3 h-3 fill-current text-amber-400" />
                    <span>4.9 / 5.0 (Customer Reviews)</span>
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                  {product.name}
                </h1>

                <p className="text-xs sm:text-sm mt-3 text-neutral-300 leading-relaxed">
                  {product.description || 'Professional VIP calculation algorithms and high accuracy signals directly from Team Felco.'}
                </p>
              </div>

              {/* Price Tag Box */}
              <div className="p-4 rounded-2xl bg-black/60 border border-neutral-800 flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[10px] uppercase font-black text-neutral-400 tracking-wider block">
                    {product.isFree ? 'ফি (Access Fee):' : 'বর্তমান অফার মূল্য (Offer Price):'}
                  </span>
                  <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                    {product.isFree ? (
                      <span className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        <span>১০০% ফ্রি লাইফটাইম অ্যাক্সেস</span>
                      </span>
                    ) : (
                      <>
                        {hasDiscount && (
                          <span className="line-through text-red-500 font-bold text-sm sm:text-base">
                            ৳{product.originalPrice}
                          </span>
                        )}
                        <span className="text-2xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          ৳{product.price}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
                          BDT / LIFETIME
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {product.fileSize && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-black text-neutral-400 tracking-wider block">File Size:</span>
                    <span className="text-xs font-mono font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">{product.fileSize}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={() => setIsReviewsOpen(true)}
                  className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-neutral-700 shadow-lg"
                >
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span>কাস্টমার রিভিউ দেখুন (Customer Reviews)</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* 🎬 DEDICATED PROOF & TUTORIAL VIDEO SECTION */}
        <div className="bg-gradient-to-br from-[#111116] via-[#0d0d12] to-[#0a0a0e] border border-neutral-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <span>লাইভ ভিডিও প্রুফ ও টিউটোরিয়াল</span>
                  <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">HD PROOF</span>
                </h2>
                <span className="text-xs text-neutral-400">টুলটির কার্যকারিতা, সিগন্যাল ও ব্যবহারের সম্পূর্ণ ভিডিও গাইড</span>
              </div>
            </div>

            {product.youtubeUrl && (
              <a
                href={product.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-black text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20 self-start sm:self-auto"
              >
                <span>ইউটিউব চ্যানেলে দেখুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {youtubeId ? (
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-neutral-800 bg-black shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&autoplay=0`}
                  title={`${product.name} Video Tutorial`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="text-xs text-neutral-400 text-center font-medium">
                👆 ভিডিওটিতে হ্যাকের সম্পূর্ণ নিয়ম এবং ১০০% উইনিং সিগন্যাল দেখানো হয়েছে।
              </p>
            </div>
          ) : product.youtubeUrl ? (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-red-500/30 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 flex flex-col items-center justify-center p-8 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] mb-4 animate-pulse">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <h3 className="text-lg font-black uppercase text-white tracking-tight mb-1">ভিডিও প্রুফ দেখতে এখানে ক্লিক করুন</h3>
              <p className="text-xs text-neutral-400 max-w-md mb-6">ইউটিউব চ্যানেলে এই টুলের লাইভ ডেমো এবং ফুল উইনিং রেকর্ড আপলোড করা হয়েছে।</p>
              <a
                href={product.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2"
              >
                <span>ভিডিওটি ইউটিউবে ওপেন করুন</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-neutral-800 bg-black/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 mx-auto flex items-center justify-center text-neutral-600">
                <Play className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-black text-neutral-300 uppercase tracking-wider">ভিডিও টিউটোরিয়াল প্রস্তুত হচ্ছে</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                এই প্রোডাক্টের জন্য অ্যাডমিন কর্তৃক ইউটিউব প্রুফ লিংক যুক্ত করার পর এখানে সরাসরি দেখা যাবে।
              </p>
            </div>
          )}
        </div>

        {/* 📖 DETAILED GUIDE & INSTRUCTIONS */}
        <div className="bg-gradient-to-br from-[#111116] via-[#0d0d12] to-[#0a0a0e] border border-neutral-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800/80">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                ব্যবহার বিধি ও বিস্তারিত গাইড (How to Use)
              </h2>
              <span className="text-xs text-neutral-400">টুলটি সঠিক নিয়মে সেটআপ করার প্রয়োজনীয় পদক্ষেপসমূহ</span>
            </div>
          </div>

          <div className="space-y-5">
            {product.detailedDescription ? (
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line p-5 rounded-2xl border border-neutral-800 bg-black/60 text-neutral-200 shadow-inner">
                {product.detailedDescription}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-neutral-800 bg-black/50">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center mb-3 border border-emerald-500/30">১</span>
                  <h4 className="text-xs font-black uppercase mb-1.5 text-white">অর্ডার বা ডাউনলোড</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">বিকাশ বা নগদে পেমেন্ট দিয়ে অর্ডার সাবমিট করুন বা ফ্রি লিংক থেকে APK ফাইল নামিয়ে নিন।</p>
                </div>
                <div className="p-5 rounded-2xl border border-neutral-800 bg-black/50">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center mb-3 border border-emerald-500/30">২</span>
                  <h4 className="text-xs font-black uppercase mb-1.5 text-white">ভিআইপি কী অ্যাক্টিভেশন</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">টুল ওপেন করে অ্যাডমিনের দেওয়া লাইসেন্স কোডটি বসিয়ে একটিভ বাটনে চাপ দিন।</p>
                </div>
                <div className="p-5 rounded-2xl border border-neutral-800 bg-black/50">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center mb-3 border border-emerald-500/30">৩</span>
                  <h4 className="text-xs font-black uppercase mb-1.5 text-white">সিগন্যাল অনুযায়ী খেলুন</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">টুলের রিয়েল-টাইম স্ক্রিন প্রডিকশন ফলো করে নিরাপদে বেট ধরুন এবং উইন করুন।</p>
                </div>
              </div>
            )}

            {/* Feature Highlights Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl border border-neutral-800 bg-black/60 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-200">Anti-Ban Secure</span>
              </div>
              <div className="p-3.5 rounded-xl border border-neutral-800 bg-black/60 flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-200">AI Signal Precision</span>
              </div>
              <div className="p-3.5 rounded-xl border border-neutral-800 bg-black/60 flex items-center gap-3">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-200">Instant Activation</span>
              </div>
              <div className="p-3.5 rounded-xl border border-neutral-800 bg-black/60 flex items-center gap-3">
                <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-200">24/7 VIP Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🛡️ HACK PROOF & VERIFICATION SECTION */}
        <div className="bg-gradient-to-br from-[#111116] via-[#0d0d12] to-[#0a0a0e] border border-neutral-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/10 via-red-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-blue-500 p-0.5 shadow-lg shadow-blue-500/20">
                <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <span>হ্যাকের লাইভ প্রুফ ও ভেরিফিকেশন</span>
                  <span className="text-[10px] bg-emerald-500 text-black font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    100% PROVEN
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  অর্ডার করার পূর্বে আমাদের ইউটিউব এবং টেলিগ্রাম চ্যানেলে সরাসরি উইনিং প্রমাণ দেখুন
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* 🔴 YOUTUBE PROOF CARD */}
            <div className="p-6 rounded-2xl border border-neutral-800 bg-black/60 flex flex-col justify-between transition-all hover:border-red-500/40 relative overflow-hidden group shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase text-red-500 tracking-tight">YouTube Proof Video</h4>
                      <span className="text-[10px] text-neutral-400">লাইভ ভিডিও প্রুফ ও সেটআপ গাইড</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
                    LIVE DEMO
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  ইউটিউবে আমাদের চ্যানেলে এই হ্যাক টুলের সরাসরি লাইভ উইনিং এবং কার্যকারিতা রেকর্ড করা আছে।
                </p>
              </div>

              <div className="pt-5 mt-2">
                <a
                  href={product.youtubeUrl || settings?.youtubeUrl || 'https://www.youtube.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2 cursor-pointer group-hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] active:scale-98"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>ইউটিউব প্রুফ ভিডিও দেখুন</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </div>

            {/* ✈️ TELEGRAM PROOF CARD */}
            <div className="p-6 rounded-2xl border border-neutral-800 bg-black/60 flex flex-col justify-between transition-all hover:border-blue-500/40 relative overflow-hidden group shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#229ED9] flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase text-[#229ED9] tracking-tight">Telegram Proof Channel</h4>
                      <span className="text-[10px] text-neutral-400">প্রতিদিনের উইনিং স্ক্রিনশট ও ফিডব্যাক</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                    REAL PROOF
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  আমাদের অফিসিয়াল টেলিগ্রাম চ্যানেলে মেম্বারদের লাইভ উইনিং স্ক্রিনশট ও প্রুফ নিয়মিত শেয়ার করা হয়।
                </p>
              </div>

              <div className="pt-5 mt-2">
                <a
                  href={product.telegramProofUrl || settings?.telegramChannelUrl || settings?.supportTelegram || 'https://t.me'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-[#229ED9] hover:bg-[#1e8bc0] text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(34,158,217,0.3)] flex items-center justify-center gap-2 cursor-pointer group-hover:shadow-[0_0_25px_rgba(34,158,217,0.5)] active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>টেলিগ্রাম প্রুফ চ্যানেল দেখুন</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </div>

          </div>

          <div className="mt-5 p-4 rounded-2xl bg-black/80 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2.5 text-xs text-neutral-300 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>কোনো প্রশ্ন বা ডাউট থাকলে সরাসরি আমাদের টেলিগ্রাম বা হোয়াটসঅ্যাপ সাপোর্টে কথা বলুন।</span>
            </div>
            {settings?.supportWhatsApp && (
              <a
                href={`https://wa.me/${settings.supportWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0 transition-colors bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20"
              >
                <span>হোয়াটসঅ্যাপে প্রুফ চান →</span>
              </a>
            )}
          </div>
        </div>

      </div>

      {/* Floating Bottom Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-800/90 backdrop-blur-2xl bg-[#070709]/95 p-3.5 sm:p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.9)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h4 className="text-xs font-black uppercase truncate hidden sm:block text-neutral-300">{product.name}</h4>
            <div className="flex items-center gap-2.5">
              {product.isFree ? (
                <span className="text-sm sm:text-base font-black text-emerald-400 uppercase">100% FREE ACCESS</span>
              ) : (
                <>
                  <span className="text-xs text-neutral-400 uppercase font-black">মূল্য:</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono tracking-tight">৳{product.price}</span>
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
                className="px-6 sm:px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black uppercase text-xs sm:text-sm tracking-widest rounded-xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{product.buttonText || 'Download Free'}</span>
              </a>
            ) : (
              <button
                onClick={handleBuyNow}
                disabled={product.soldOut}
                className={`px-6 sm:px-8 py-3.5 font-black uppercase text-xs sm:text-sm tracking-widest rounded-xl transition-all shadow-xl flex items-center gap-2 active:scale-95 cursor-pointer ${
                  product.soldOut
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                }`}
              >
                <span>{product.soldOut ? 'Sold Out' : 'Buy Now (অর্ডার করুন)'}</span>
                {!product.soldOut && <ArrowLeft className="w-4 h-4 rotate-180" />}
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
