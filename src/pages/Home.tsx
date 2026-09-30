import React, { useEffect, useState } from 'react';
import { Product, OrderDraft } from '../types';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowRight, Search, ShieldCheck, Star, Gamepad2, X, Flame, Sparkles, Download, ExternalLink } from 'lucide-react';
import { ProductReviewsModal } from '../components/ProductReviewsModal';
import { ProductDetailsPage } from './ProductDetailsPage';
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

  const [customGames, setCustomGames] = useState<string[]>([]);

  // Dynamic SEO tag management based on currently viewed product details
  useSEO({
    title: viewingProductDetails 
      ? viewingProductDetails.name 
      : 'Team Felco Store - Premium Colour Trading & Game Hacks',
    description: (viewingProductDetails && viewingProductDetails.description)
      ? viewingProductDetails.description 
      : 'Get premium VIP colour trading predictions, auto-calculators, game prediction algorithms and tutorial guides directly from Team Felco.',
    ogType: viewingProductDetails ? 'product' : 'website',
    imageUrl: viewingProductDetails?.imageUrl,
    youtubeUrl: viewingProductDetails?.youtubeUrl
  });

  const categories = React.useMemo(() => {
    const base = ['All', 'Colour Trading Hack', 'Aviator Hack', 'Free Tools & APKs'];
    const productCats = products.map(p => p.category).filter(Boolean) as string[];
    const all = Array.from(new Set([...base, ...customGames, ...productCats]));
    return all;
  }, [products, customGames]);

  const defaultProducts: Product[] = [
    {
      id: 'colour-trading-tool',
      name: 'COLOUR TRADING TOOL',
      description: 'Advanced algorithmic pattern analyzer and probability calculator for color trading games. Real-time signal calculation with high precision success tracking.',
      price: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=60',
      category: 'Colour Trading Hack',
      active: true
    },
    {
      id: 'aviator-tool',
      name: 'AVIATOR TOOL',
      description: 'Professional multiplier predictor and crash timing analytics tool for aviator games. Engineered for precision and real-time trend visualization.',
      price: 6500,
      imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=60',
      category: 'Aviator Hack',
      active: true
    }
  ];

  useEffect(() => {
    fetchProducts();
    const fetchGames = async () => {
      try {
        const snap = await getDocs(collection(db, 'games'));
        const gameNames: string[] = [];
        snap.forEach(d => {
          const data = d.data();
          if (data.active !== false && data.name) {
            gameNames.push(data.name);
          }
        });
        if (gameNames.length > 0) {
          setCustomGames(gameNames);
        } else {
          setCustomGames(['HGNICE', 'DKWIN', 'BDWIN', '1X BET', 'CK444']);
        }
      } catch {
        setCustomGames(['HGNICE', 'DKWIN', 'BDWIN', '1X BET', 'CK444']);
      }
    };
    fetchGames();
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
              <h2 className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                {settings?.trackOrderBannerTitle || 'Track Order'}
              </h2>
              <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {settings?.trackOrderBannerSubtitle || 'Check status instantly with TrxID or Order ID.'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenOrderTracker}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-md shrink-0 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Order</span>
          </button>
        </div>

        {/* Game / Category Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className={`flex items-center gap-1.5 text-xs font-bold uppercase mr-1 shrink-0 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            <Gamepad2 className="w-4 h-4 text-emerald-500" />
            <span>{settings?.gameFilterLabel || 'Game Filter:'}</span>
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
              const hasDiscount = !!(product.originalPrice && product.originalPrice > product.price);
              const discountPercent = hasDiscount 
                ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) 
                : 0;

              const isRecent = (() => {
                if (!product.createdAt) return false;
                try {
                  const createdTime = new Date(product.createdAt).getTime();
                  if (isNaN(createdTime)) return false;
                  const now = Date.now();
                  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
                  return now - createdTime < fourteenDaysMs;
                } catch {
                  return false;
                }
              })();

              return (
                <div 
                  key={product.id}
                  className={`group border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 ease-out transform hover:-translate-y-1.5 relative ${
                    isLight 
                      ? 'bg-white border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-[0_16px_35px_rgba(16,185,129,0.18)] hover:ring-1 hover:ring-emerald-500/25' 
                      : 'bg-[#121214] border-neutral-800/80 shadow-md hover:border-emerald-500/60 hover:shadow-[0_16px_40px_rgba(16,185,129,0.22)] hover:ring-1 hover:ring-emerald-500/35'
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

                      {/* Top-Left Visual Badges: Sale & New */}
                      <div className="absolute top-2 left-2 flex flex-col sm:flex-row gap-1 z-10 pointer-events-none">
                        {hasDiscount && !product.soldOut && (
                          <span className="bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-lg shadow-red-600/40 flex items-center gap-1 border border-white/15">
                            <Flame className="w-2.5 h-2.5 shrink-0 fill-current animate-pulse text-amber-200" />
                            <span>SALE</span>
                          </span>
                        )}

                        {isRecent && !product.soldOut && (
                          <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-lg shadow-cyan-500/40 flex items-center gap-1 border border-white/15">
                            <Sparkles className="w-2.5 h-2.5 shrink-0 text-cyan-200" />
                            <span>NEW</span>
                          </span>
                        )}
                      </div>

                      {/* Floating Price Badge (Top-Right) */}
                      <div className="absolute top-2 right-2 bg-black/85 backdrop-blur-md px-2 py-1 rounded-lg border border-neutral-700/60 shadow-lg text-right z-10">
                        {product.isFree ? (
                          <div className="text-xs sm:text-sm font-black text-emerald-400 tracking-tight leading-tight flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>100% FREE</span>
                          </div>
                        ) : (
                          <>
                            {hasDiscount && (
                              <div className="text-[9px] font-bold text-red-400 line-through leading-tight">
                                BDT {product.originalPrice}
                              </div>
                            )}
                            <div className="text-xs sm:text-sm font-black text-emerald-400 tracking-tight leading-tight">
                              BDT {product.price}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Floating Discount Badge (Bottom-Left) */}
                      {!product.isFree && hasDiscount && !product.soldOut && (
                        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-rose-600 to-red-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-md z-10 uppercase tracking-wide">
                          SAVE {discountPercent}%
                        </div>
                      )}
                      {product.isFree && (
                        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-black text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-md z-10 uppercase tracking-wide flex items-center gap-1">
                          <Download className="w-2.5 h-2.5 stroke-[3]" />
                          <span>NO ORDER NEEDED</span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between gap-1.5">
                      <div>
                        {/* Category Badge */}
                        <div className="flex items-center flex-wrap gap-1 mb-1">
                          <span className={`inline-block text-[8px] sm:text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                            product.isFree 
                              ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300 font-black' 
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {product.isFree ? '🎁 FREE TOOL / APK' : (product.category || 'COLOUR TRADING HACK')}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className={`text-xs sm:text-sm font-black uppercase tracking-tight line-clamp-1 group-hover:text-emerald-400 transition-colors ${
                          isLight ? 'text-neutral-900' : 'text-white'
                        }`}>
                          {product.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Buy Now / Direct Download & Reviews) */}
                  <div className="p-2.5 sm:p-3 pt-0 flex flex-col gap-1.5">
                    {product.isFree ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.downloadUrl) {
                            window.open(product.downloadUrl, '_blank');
                          } else {
                            setViewingProductDetails(product);
                          }
                        }}
                        className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black uppercase text-[11px] sm:text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{product.buttonText || 'Download Free'}</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => !product.soldOut && handleBuyNow(product)}
                        disabled={product.soldOut}
                        className={`w-full py-2 font-black uppercase text-[11px] sm:text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 active:scale-[0.98] cursor-pointer ${
                          product.soldOut
                            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            : isLight
                              ? 'bg-neutral-900 text-white hover:bg-black shadow-sm'
                              : 'bg-white text-black hover:bg-neutral-200 shadow-md'
                        }`}
                      >
                        <span>{product.soldOut ? 'SOLD OUT' : (product.buttonText || settings?.buyNowBtnText || 'BUY NOW')}</span>
                        {!product.soldOut && !product.buttonText && !settings?.buyNowBtnText && <span className="text-xs">→</span>}
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setViewingProductDetails(product)}
                        className={`py-1.5 px-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 border active:scale-[0.98] cursor-pointer ${
                          isLight 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100' 
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        <span>বিস্তারিত ও প্রুফ</span>
                      </button>

                      <button
                        onClick={() => setSelectedProduct(product)}
                        className={`py-1.5 px-2 text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 border group/rev active:scale-[0.98] cursor-pointer ${
                          isLight 
                            ? 'bg-slate-50 border-slate-200 text-neutral-600 hover:bg-amber-50 hover:border-amber-300' 
                            : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:bg-neutral-850'
                        }`}
                      >
                        <Star className="w-3 h-3 text-amber-400 fill-current shrink-0" />
                        <span className="font-bold text-amber-400">4.9</span>
                        <span className="font-medium">রিভিউ</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Customer Reviews Modal */}
      <ProductReviewsModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Full-Screen Product Details Page View */}
      {viewingProductDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black animate-fadeIn">
          <ProductDetailsPage
            selectedProduct={viewingProductDetails}
            navigate={navigate}
            setOrderDraft={setOrderDraft}
            theme={theme}
            settings={settings}
            onBack={() => setViewingProductDetails(null)}
          />
        </div>
      )}
    </div>
  );
};
