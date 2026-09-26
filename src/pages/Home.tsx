import React, { useEffect, useState } from 'react';
import { Product, OrderDraft } from '../types';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowRight, Search, ShieldCheck, Star, Gamepad2, X } from 'lucide-react';
import { ProductReviewsModal } from '../components/ProductReviewsModal';
import { useSEO } from '../hooks/useSEO';

interface HomeProps {
  navigate: (route: string) => void;
  setOrderDraft: React.Dispatch<React.SetStateAction<OrderDraft>>;
  onOpenCustomerService: () => void;
  onOpenOrderTracker: () => void;
  theme?: 'dark' | 'light';
  settings?: any;
  setGlobalLoading?: (loading: boolean) => void;
}

export const Home: React.FC<HomeProps> = ({ navigate, setOrderDraft, onOpenOrderTracker, theme = 'dark', settings, setGlobalLoading }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewingProductDetails, setViewingProductDetails] = useState<Product | null>(null);

  // Dynamic SEO tag management based on currently viewed product details
  useSEO({
    title: viewingProductDetails 
      ? viewingProductDetails.name 
      : 'Team Felco Store - Premium Colour Trading & Game Hacks',
    description: viewingProductDetails 
      ? viewingProductDetails.description 
      : 'Get premium VIP colour trading predictions, auto-calculators, game prediction algorithms and tutorial guides directly from Team Felco.',
    ogType: viewingProductDetails ? 'product' : 'website',
    imageUrl: viewingProductDetails?.imageUrl,
    youtubeUrl: viewingProductDetails?.youtubeUrl
  });

  const categories = ['All', 'HGNICE', 'DKWIN', 'BDWIN', '1X BET', 'CK444'];

  const defaultProducts: Product[] = [
    {
      id: 'colour-trading-tool',
      name: 'COLOUR TRADING TOOL',
      description: 'Advanced algorithmic pattern analyzer and probability calculator for color trading games. Real-time signal calculation with high precision success tracking.',
      price: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=60',
      category: 'HGNICE',
      active: true
    },
    {
      id: 'aviator-tool',
      name: 'AVIATOR TOOL',
      description: 'Professional multiplier predictor and crash timing analytics tool for aviator games. Engineered for precision and real-time trend visualization.',
      price: 6500,
      imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=60',
      category: '1X BET',
      active: true
    }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    let hasCached = false;
    try {
      const cached = localStorage.getItem('tf_cached_products');
      if (cached) {
        const parsed = JSON.parse(cached) as Product[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          setLoading(false);
          if (setGlobalLoading) setGlobalLoading(false);
          hasCached = true;
        }
      }
    } catch {
      // Ignore cache read error
    }

    if (!hasCached && setGlobalLoading) {
      setGlobalLoading(true);
    }

    const timeoutId = setTimeout(() => {
      setProducts(prev => (prev.length > 0 ? prev : defaultProducts));
      setLoading(false);
      if (setGlobalLoading) setGlobalLoading(false);
    }, 3000);

    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      if (querySnapshot.empty) {
        setProducts(prev => (prev.length > 0 ? prev : defaultProducts));
      } else {
        const list: Product[] = [];
        querySnapshot.forEach(docSnap => {
          const data = docSnap.data() as Product;
          if (data.active !== false) {
            list.push({ ...data, id: docSnap.id, category: data.category || 'HGNICE' });
          }
        });
        const finalProducts = list.length > 0 ? list : defaultProducts;
        setProducts(finalProducts);
        try {
          localStorage.setItem('tf_cached_products', JSON.stringify(finalProducts));
        } catch {
          // Ignore storage quota error
        }
      }
    } catch {
      setProducts(prev => (prev.length > 0 ? prev : defaultProducts));
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      if (setGlobalLoading) setGlobalLoading(false);
    }
  };

  const handleBuyNow = (product: Product) => {
    setOrderDraft(prev => ({
      ...prev,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productCategory: product.category
    }));
    navigate('/order/game');
  };

  const filteredProducts = products.filter(p => {
    if (selectedCategory === 'All') return true;
    return (p.category || '').toLowerCase() === selectedCategory.toLowerCase() ||
           p.name.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen py-6 sm:py-10 transition-colors duration-300 ${isLight ? 'bg-slate-100 text-neutral-900' : 'bg-[#050505] text-white'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
        
        {/* Professional Announcement Bar */}
        {settings?.scrollingNotice && (
          <div className={`relative overflow-hidden rounded-xl border px-3 py-2.5 flex items-center gap-3 transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-sm'
              : 'bg-neutral-900/90 border-neutral-800 shadow-md'
          }`}>
            {/* Left Minimal Status Tag */}
            <div className={`flex items-center gap-2 pr-3 border-r shrink-0 z-10 ${
              isLight ? 'border-slate-200 bg-white' : 'border-neutral-800 bg-neutral-900/95'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest ${
                isLight ? 'text-neutral-800' : 'text-neutral-200'
              }`}>
                Notice
              </span>
            </div>

            {/* Slow & Smooth Readable Ticker */}
            <div className="flex-1 overflow-hidden relative">
              <div className="animate-marquee items-center whitespace-nowrap">
                {[0, 1].map((idx) => (
                  <div key={idx} className="flex items-center">
                    <span className={`text-xs font-medium tracking-wide px-6 ${
                      isLight ? 'text-neutral-700' : 'text-neutral-300'
                    }`}>
                      {settings.scrollingNotice}
                    </span>
                    <span className="text-emerald-500/60 text-xs px-4">•</span>
                    <span className={`text-xs font-medium tracking-wide px-6 ${
                      isLight ? 'text-neutral-700' : 'text-neutral-300'
                    }`}>
                      {settings.scrollingNotice}
                    </span>
                    <span className="text-emerald-500/60 text-xs px-4">•</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Track Order Quick Banner */}
        <div className={`border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl transition-colors ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-neutral-900 border-neutral-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>Track Order</h2>
              <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>Check status instantly with TrxID or Order ID.</p>
            </div>
          </div>
          <button
            onClick={onOpenOrderTracker}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-md shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Order</span>
          </button>
        </div>

        {/* Game / Category Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className={`flex items-center gap-1.5 text-xs font-bold uppercase mr-1 shrink-0 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            <Gamepad2 className="w-4 h-4 text-emerald-500" />
            <span>Game Filter:</span>
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shadow-sm ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-black shadow-emerald-500/20 shadow-lg'
                  : isLight
                    ? 'bg-white border border-slate-200 text-neutral-700 hover:bg-slate-50'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`rounded-xl h-56 sm:h-72 animate-pulse ${isLight ? 'bg-slate-200' : 'bg-neutral-900/60 border border-neutral-800'}`} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={`text-center py-16 border rounded-2xl ${isLight ? 'bg-white border-slate-200 text-neutral-500' : 'bg-neutral-900/40 border-neutral-800 text-neutral-400'}`}>
            <p className="text-xs font-bold uppercase tracking-wider">No tools available for '{selectedCategory}'.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredProducts.map(product => {
              const hasDiscount = product.originalPrice && product.originalPrice > product.price;
              const discountPercent = hasDiscount 
                ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) 
                : 0;

              return (
                <div 
                  key={product.id}
                  className={`group border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 relative ${
                    isLight 
                      ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400' 
                      : 'bg-[#121214] border-neutral-800/80 shadow-md hover:border-emerald-500/50 hover:shadow-emerald-500/5'
                  }`}
                >
                  <div 
                    onClick={() => setViewingProductDetails(product)} 
                    className="cursor-pointer group/card flex-1 flex flex-col" 
                    title="বিস্তারিত দেখতে ক্লিক করুন"
                  >
                    {/* Compact Image Container with Floating Badges (Original Premium Layout) */}
                    <div className={`relative aspect-square w-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-neutral-950'}`}>
                      {product.soldOut && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center z-20">
                          <span className="bg-red-600 text-white font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                      
                      <img 
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=60'} 
                        alt={product.name}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${product.soldOut ? 'opacity-30 grayscale' : ''}`}
                      />

                      {/* Floating Price Badge (Top-Right) */}
                      <div className="absolute top-2 right-2 bg-black/85 backdrop-blur-md px-2 py-1 rounded-lg border border-neutral-700/60 shadow-lg text-right z-10">
                        {hasDiscount && (
                          <div className="text-[9px] font-bold text-red-400 line-through leading-tight">
                            BDT {product.originalPrice}
                          </div>
                        )}
                        <div className="text-xs sm:text-sm font-black text-emerald-400 tracking-tight leading-tight">
                          BDT {product.price}
                        </div>
                      </div>

                      {/* Floating Discount Badge (Bottom-Left) */}
                      {hasDiscount && !product.soldOut && (
                        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-rose-600 to-red-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-md z-10 uppercase tracking-wide">
                          SAVE {discountPercent}%
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between gap-1.5">
                      <div>
                        {/* Category Badge */}
                        <span className="inline-block text-[8px] sm:text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 mb-1">
                          {product.category || 'COLOUR TRADING HACK'}
                        </span>

                        {/* Title */}
                        <h3 className={`text-xs sm:text-sm font-black uppercase tracking-tight line-clamp-1 group-hover:text-emerald-400 transition-colors ${
                          isLight ? 'text-neutral-900' : 'text-white'
                        }`}>
                          {product.name}
                        </h3>

                        {/* Summary / Description */}
                        <p className={`text-[10px] line-clamp-2 mt-0.5 leading-relaxed ${
                          isLight ? 'text-neutral-500' : 'text-neutral-400'
                        }`}>
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Buy Now & Reviews) */}
                  <div className="p-2.5 sm:p-3 pt-0 flex flex-col gap-1.5">
                    <button 
                      onClick={() => !product.soldOut && handleBuyNow(product)}
                      disabled={product.soldOut}
                      className={`w-full py-2 font-black uppercase text-[11px] sm:text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 active:scale-[0.98] ${
                        product.soldOut
                          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          : isLight
                            ? 'bg-neutral-900 text-white hover:bg-black shadow-sm'
                            : 'bg-white text-black hover:bg-neutral-200 shadow-md'
                      }`}
                    >
                      <span>{product.soldOut ? 'SOLD OUT' : 'BUY NOW'}</span>
                      {!product.soldOut && <span className="text-xs">→</span>}
                    </button>

                    <button
                      onClick={() => setSelectedProduct(product)}
                      className={`w-full py-1.5 px-2 text-[10px] rounded-lg transition-all flex items-center justify-center gap-1.5 border group/rev active:scale-[0.98] ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200 text-neutral-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800' 
                          : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:bg-neutral-850 hover:border-amber-500/30 hover:text-neutral-200'
                      }`}
                    >
                      <Star className="w-3 h-3 text-amber-400 fill-current shrink-0 group-hover/rev:scale-110 transition-transform" />
                      <span className="font-bold text-amber-400">4.9</span>
                      <span className="text-neutral-500 text-[9px]">•</span>
                      <span className="font-medium tracking-wide">Customer Reviews</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ProductReviewsModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Product Details Modal */}
      {viewingProductDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className={`border text-white w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] flex flex-col transition-colors ${isLight ? 'bg-white border-slate-200 text-neutral-900' : 'bg-[#0d0d10] border-neutral-800'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between mb-6 shrink-0 border-b pb-4 ${isLight ? 'border-slate-100' : 'border-neutral-800'}`}>
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                  {viewingProductDetails.category || 'HGNICE'}
                </span>
                <h3 className={`text-base sm:text-lg font-black uppercase tracking-tight mt-1.5 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  {viewingProductDetails.name}
                </h3>
              </div>
              <button 
                onClick={() => setViewingProductDetails(null)} 
                className={`transition-colors ${isLight ? 'text-neutral-400 hover:text-neutral-900' : 'text-neutral-400 hover:text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto pr-1 flex-1 pb-4 space-y-5 scrollbar-thin">
              {/* Product Image */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-950 shadow-md">
                <img 
                  src={viewingProductDetails.imageUrl || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=60'} 
                  alt={viewingProductDetails.name} 
                  className="w-full h-full object-cover" 
                />
                {viewingProductDetails.soldOut && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-red-600 text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg border border-red-500 animate-pulse">
                      SOLD OUT
                    </span>
                  </div>
                )}
              </div>

              {/* Pricing Block */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-900'}`}>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>Price (মূল্য):</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {viewingProductDetails.originalPrice && viewingProductDetails.originalPrice > viewingProductDetails.price && (
                      <span className="line-through text-red-500 font-bold text-sm">BDT {viewingProductDetails.originalPrice}</span>
                    )}
                    <span className="text-emerald-500 font-black text-xl">BDT {viewingProductDetails.price}</span>
                  </div>
                </div>
                {viewingProductDetails.originalPrice && viewingProductDetails.originalPrice > viewingProductDetails.price && !viewingProductDetails.soldOut && (
                  <span className="bg-rose-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider animate-bounce">
                    SAVE {Math.round(((viewingProductDetails.originalPrice - viewingProductDetails.price) / viewingProductDetails.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Description & Guide */}
              <div className="space-y-4">
                <div>
                  <h4 className={`text-[10px] sm:text-xs uppercase font-extrabold tracking-widest ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>Short Summary (সংক্ষিপ্ত বিবরণ)</h4>
                  <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                    {viewingProductDetails.description}
                  </p>
                </div>

                {viewingProductDetails.detailedDescription && (
                  <div className={`pt-4 border-t ${isLight ? 'border-slate-100' : 'border-neutral-800'}`}>
                    <h4 className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-emerald-500">Detailed Guide & Instructions (বিস্তারিত নির্দেশিকা)</h4>
                    <p className={`text-xs mt-2 leading-relaxed whitespace-pre-line ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                      {viewingProductDetails.detailedDescription}
                    </p>
                  </div>
                )}

                {/* Embedded YouTube video block */}
                {viewingProductDetails.youtubeUrl && (
                  <div className={`pt-4 border-t ${isLight ? 'border-slate-100' : 'border-neutral-800'} space-y-2`}>
                    <h4 className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-[#ff0000] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block animate-pulse" />
                      <span>Video Tutorial & Hack Proof (ভিডিও প্রুফ / ব্যবহারের নিয়ম)</span>
                    </h4>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-md">
                      {(() => {
                        // Extract video ID from any YouTube URL format (watch?v=, share, embed, etc.)
                        let videoId = '';
                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                        const match = viewingProductDetails.youtubeUrl.match(regExp);
                        if (match && match[2].length === 11) {
                          videoId = match[2];
                        }
                        
                        if (videoId) {
                          return (
                            <iframe
                              className="absolute top-0 left-0 w-full h-full"
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          );
                        } else {
                          return (
                            <a
                              href={viewingProductDetails.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-black hover:from-neutral-850 hover:to-neutral-900 transition-all border border-red-500/10 group cursor-pointer"
                            >
                              {/* Giant Red Pulsating YouTube Logo Container */}
                              <div className="relative mb-3.5 flex items-center justify-center">
                                <div className="absolute inset-0 bg-red-600/25 rounded-full blur-2xl group-hover:bg-red-600/40 transition-all duration-300 w-20 h-20"></div>
                                <svg viewBox="0 0 24 24" className="w-20 h-20 text-red-600 fill-current relative drop-shadow-2xl group-hover:scale-110 group-hover:text-red-500 transition-all duration-300">
                                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.522 3.543 12 3.543 12 3.543s-7.522 0-9.388.513a3.003 3.003 0 0 0-2.11 2.107C0 8.029 0 12 0 12s0 3.971.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.478 20.457 12 20.457 12 20.457s7.522 0 9.388-.513a3.003 3.003 0 0 0 2.11-2.107C24 15.971 24 12 24 12s0-3.971-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                              </div>
                              <span className="text-sm font-black text-white uppercase tracking-widest group-hover:text-red-500 transition-colors">WATCH VIDEO TUTORIAL</span>
                              <span className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1 group-hover:underline">
                                ইউটিউবে ভিডিও গাইডটি দেখতে এখানে ক্লিক করুন ↗
                              </span>
                            </a>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action Button */}
            <div className={`pt-4 border-t shrink-0 flex items-center justify-end space-x-3 ${isLight ? 'border-slate-100' : 'border-neutral-800'}`}>
              <button 
                onClick={() => setViewingProductDetails(null)} 
                className={`px-5 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-colors ${isLight ? 'bg-slate-100 text-neutral-700 hover:bg-slate-200' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
              >
                Close (বন্ধ করুন)
              </button>
              <button 
                onClick={() => {
                  if (!viewingProductDetails.soldOut) {
                    handleBuyNow(viewingProductDetails);
                    setViewingProductDetails(null);
                  }
                }}
                disabled={viewingProductDetails.soldOut}
                className={`px-6 py-3 font-extrabold uppercase text-xs tracking-widest rounded-xl transition-all flex items-center gap-1.5 shadow-md ${
                  viewingProductDetails.soldOut
                    ? 'bg-neutral-800 border border-neutral-700 text-neutral-500 cursor-not-allowed opacity-60'
                    : isLight 
                      ? 'bg-neutral-900 text-white hover:bg-neutral-800' 
                      : 'bg-emerald-500 text-black hover:bg-emerald-400'
                }`}
              >
                <span>{viewingProductDetails.soldOut ? 'Sold Out' : 'Buy Now (অর্ডার করুন)'}</span>
                {!viewingProductDetails.soldOut && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
