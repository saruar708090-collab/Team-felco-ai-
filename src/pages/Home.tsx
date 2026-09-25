import React, { useEffect, useState } from 'react';
import { Product, OrderDraft } from '../types';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowRight, Search, ShieldCheck, Star, MessageSquare, Gamepad2, X } from 'lucide-react';
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
    if (setGlobalLoading) setGlobalLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      if (querySnapshot.empty) {
        setProducts(defaultProducts);
      } else {
        const list: Product[] = [];
        querySnapshot.forEach(docSnap => {
          const data = docSnap.data() as Product;
          if (data.active !== false) {
            list.push({ ...data, id: docSnap.id, category: data.category || 'HGNICE' });
          }
        });
        setProducts(list.length > 0 ? list : defaultProducts);
      }
    } catch (err) {
      setProducts(defaultProducts);
    } finally {
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
        
        {/* Scrolling Notice */}
        {settings?.scrollingNotice && (
          <div className={`relative overflow-hidden py-3 border-y mb-4 ${
            isLight ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
          }`}>
            <div className="flex items-center gap-2 px-4 absolute left-0 z-10 h-full font-black text-[10px] uppercase tracking-tighter shadow-xl">
              <span className="bg-emerald-500 text-black px-2 py-0.5 rounded">Notice</span>
            </div>
            <div className="whitespace-nowrap animate-marquee flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-widest pl-24">
                {settings.scrollingNotice}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest">
                {settings.scrollingNotice}
              </span>
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
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {[1, 2].map(i => (
              <div key={i} className={`rounded-xl sm:rounded-2xl h-64 sm:h-96 animate-pulse ${isLight ? 'bg-slate-200' : 'bg-neutral-900/60 border border-neutral-800'}`} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={`text-center py-16 border rounded-2xl ${isLight ? 'bg-white border-slate-200 text-neutral-500' : 'bg-neutral-900/40 border-neutral-800 text-neutral-400'}`}>
            <p className="text-xs font-bold uppercase tracking-wider">No tools available for '{selectedCategory}'.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                className={`group border transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl backdrop-blur-sm ${
                  isLight 
                    ? 'bg-white border-slate-200 hover:border-emerald-500 shadow-slate-200/50' 
                    : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-500'
                }`}
              >
                <div onClick={() => setViewingProductDetails(product)} className="cursor-pointer group/card flex-1 flex flex-col justify-start" title="প্রোডাক্টের বিস্তারিত দেখতে এখানে চাপুন">
                  <div className={`relative h-32 sm:h-52 overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-neutral-950'}`}>
                    {product.soldOut && (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <span className="bg-red-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg border border-red-500 animate-pulse">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                    <img 
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=60'} 
                      alt={product.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${product.soldOut ? 'opacity-50 grayscale' : ''}`}
                    />
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/85 backdrop-blur-md border border-neutral-800 px-2.5 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-xs font-black tracking-wider text-emerald-400 flex flex-col items-end gap-0.5">
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[7px] sm:text-[9px] line-through text-red-500 font-extrabold block">
                          BDT {product.originalPrice}
                        </span>
                      )}
                      <span>BDT {product.price}</span>
                    </div>

                    {product.originalPrice && product.originalPrice > product.price && !product.soldOut && (
                      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-rose-600 text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider animate-bounce">
                        SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {product.category || 'HGNICE'}
                      </span>
                    </div>

                    <h3 className={`text-xs sm:text-lg font-black uppercase tracking-wide group-hover:text-emerald-500 transition-colors line-clamp-1 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                      {product.name}
                    </h3>
                    <p className={`text-[10px] sm:text-xs leading-relaxed line-clamp-2 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="p-3 sm:p-5 pt-0 space-y-2">
                  <button 
                    onClick={() => !product.soldOut && handleBuyNow(product)}
                    disabled={product.soldOut}
                    className={`w-full py-2.5 sm:py-3 font-extrabold uppercase text-[10px] sm:text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md group/btn ${
                      product.soldOut
                        ? 'bg-neutral-800 border border-neutral-700 text-neutral-500 cursor-not-allowed opacity-60'
                        : isLight 
                          ? 'bg-neutral-900 text-white hover:bg-neutral-800' 
                          : 'bg-white text-black hover:bg-neutral-200'
                    }`}
                  >
                    <span>{product.soldOut ? 'Sold Out' : 'Buy Now'}</span>
                    {!product.soldOut && <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />}
                  </button>

                  <button
                    onClick={() => setSelectedProduct(product)}
                    className={`w-full py-2 font-bold uppercase text-[9px] sm:text-[11px] tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 border ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-neutral-700 hover:bg-slate-100' 
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span>Customer Reviews (4.9★)</span>
                  </button>
                </div>
              </div>
            ))}
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
                              className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-red-600/5 hover:bg-red-600/10 transition-colors"
                            >
                              <span className="text-xs font-bold text-red-500 uppercase tracking-wider underline">ইউটিউবে ভিডিও গাইডটি দেখতে এখানে ক্লিক করুন ↗</span>
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
