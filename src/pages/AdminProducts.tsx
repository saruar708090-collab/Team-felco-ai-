import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Product } from '../types';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, X, Upload, ImageIcon, Loader2, Send, Play, Sparkles } from 'lucide-react';

interface AdminProductsProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ currentRoute, navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [telegramProofUrl, setTelegramProofUrl] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Colour Trading Hack');
  const [active, setActive] = useState(true);
  const [soldOut, setSoldOut] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [buttonText, setButtonText] = useState('Download Free');
  const [version, setVersion] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const snap = await getDocs(collection(db, 'products'));
      const list: Product[] = [];
      snap.forEach(d => list.push({ ...d.data(), id: d.id } as Product));
      setProducts(list);
    } catch (err: any) {
      console.error('Error fetching products', err);
      setError(err?.message || 'Error loading products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('File is too large. Please select an image under 3MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 600;

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setImageUrl(dataUrl);
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setDetailedDescription('');
    setYoutubeUrl('');
    setTelegramProofUrl('');
    setPrice('');
    setOriginalPrice('');
    setImageUrl('');
    setCategory('Colour Trading Hack');
    setActive(true);
    setSoldOut(false);
    setIsFree(false);
    setDownloadUrl('');
    setButtonText('Download Free (ফ্রি ডাউনলোড)');
    setVersion('v1.0');
    setFileSize('12 MB');
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name || '');
    setDescription(product.description || '');
    setDetailedDescription(product.detailedDescription || '');
    setYoutubeUrl(product.youtubeUrl || '');
    setTelegramProofUrl(product.telegramProofUrl || '');
    setPrice(product.price ? product.price.toString() : (product.isFree ? '0' : ''));
    setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
    setImageUrl(product.imageUrl || '');
    setCategory(product.category || 'Colour Trading Hack');
    setActive(product.active !== false);
    setSoldOut(!!product.soldOut);
    setIsFree(!!product.isFree);
    setDownloadUrl(product.downloadUrl || '');
    setButtonText(product.buttonText || 'Download Free (ফ্রি ডাউনলোড)');
    setVersion(product.version || '');
    setFileSize(product.fileSize || '');
    setError(null);
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('অনুগ্রহ করে প্রোডাক্টের নাম লিখুন');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const id = editingProduct ? editingProduct.id : `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
      const finalPrice = isFree ? 0 : (parseFloat(price) || 0);

      // Default high quality game banner if admin didn't provide image
      const finalImageUrl = imageUrl.trim() || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=60';

      // Clean payload without undefined values to prevent Firestore crashes
      const payload: Record<string, any> = {
        id,
        name: name.trim(),
        description: description.trim() || '',
        detailedDescription: detailedDescription.trim() || '',
        youtubeUrl: youtubeUrl.trim() || '',
        telegramProofUrl: telegramProofUrl.trim() || '',
        price: finalPrice,
        imageUrl: finalImageUrl,
        category: isFree && category === 'Colour Trading Hack' ? 'Free Tools & APKs' : (category || 'Colour Trading Hack'),
        active: Boolean(active),
        soldOut: isFree ? false : Boolean(soldOut),
        isFree: Boolean(isFree),
        downloadUrl: downloadUrl.trim() || '',
        buttonText: buttonText.trim() || 'Download Free',
        version: version.trim() || '',
        fileSize: fileSize.trim() || '',
        updatedAt: new Date().toISOString()
      };

      if (originalPrice && !isFree) {
        payload.originalPrice = parseFloat(originalPrice) || 0;
      }

      if (!editingProduct) {
        payload.createdAt = new Date().toISOString();
      }

      await setDoc(doc(db, 'products', id), payload, { merge: true });

      // Automatically broadcast notification for new product launch
      if (!editingProduct) {
        try {
          const notifId = `notif-prod-${id}-${Date.now().toString().slice(-4)}`;
          await setDoc(doc(db, 'notifications', notifId), {
            id: notifId,
            title: `🚀 নতুন প্রোডাক্ট যুক্ত হয়েছে: ${name.trim()}`,
            message: `${name.trim()} এখন ওয়েবসাইটে উপলভ্য!${!isFree ? ` মূল্য: ৳${finalPrice}.00` : ' সম্পূর্ণ ফ্রি ডাউনলোড করুন!'}`,
            type: 'product',
            badge: isFree ? 'FREE DOWNLOAD' : 'NEW PRODUCT',
            link: `/product/${id}`,
            active: true,
            createdAt: new Date().toISOString()
          });
        } catch (notifErr) {
          console.error('Failed to auto-create notification for new product', notifErr);
        }
      }

      setSuccessMsg(editingProduct ? 'প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!' : 'নতুন প্রোডাক্ট সফলভাবে যুক্ত করা হয়েছে এবং ওয়েবসাইটে নোটিফিকেশন পাঠানো হয়েছে!');
      setTimeout(() => setSuccessMsg(null), 3500);

      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err?.message || 'প্রোডাক্ট সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setSuccessMsg('প্রোডাক্ট সফলভাবে ডিলিট করা হয়েছে');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchProducts();
    } catch (err: any) {
      console.error('Error deleting product', err);
      alert('Delete failed: ' + (err.message || String(err)));
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), {
        active: !product.active,
        updatedAt: new Date().toISOString()
      });
      fetchProducts();
    } catch (err: any) {
      console.error('Error toggling product status', err);
    }
  };

  return (
    <AdminLayout currentRoute={currentRoute} navigate={navigate}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 block mb-1">Catalog Management</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">Products (প্রোডাক্টসমূহ)</h1>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Product (নতুন প্রোডাক্ট)</span>
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-400 text-xs flex items-center gap-2 shadow-lg animate-fadeIn">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-xs mb-6 flex items-center justify-between">
            <div>
              <p className="font-bold uppercase tracking-tight mb-1">Error Occurred</p>
              <p className="opacity-80">{error}</p>
            </div>
            <button 
              onClick={fetchProducts}
              className="px-4 py-2 bg-red-500 text-white font-black uppercase tracking-widest rounded-lg hover:bg-red-400 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-neutral-400 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs uppercase font-bold tracking-widest">Loading products...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between hover:border-neutral-800 transition-all shadow-md">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative shrink-0">
                        <img 
                          src={product.imageUrl || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=60'} 
                          alt={product.name} 
                          className="w-14 h-14 object-cover rounded-xl bg-neutral-900 border border-neutral-800" 
                        />
                        {product.soldOut && (
                          <div className="absolute inset-0 bg-red-600/80 rounded-xl flex items-center justify-center">
                            <span className="text-[8px] font-black uppercase text-white">SOLD</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                            product.isFree 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                          }`}>
                            {product.isFree ? '🎁 FREE TOOL' : (product.category || 'VIP TOOL')}
                          </span>
                          {product.youtubeUrl && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>YT Video</span>
                            </span>
                          )}
                          {product.telegramProofUrl && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                              <Send className="w-2.5 h-2.5" />
                              <span>TG Proof</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-white mt-1 uppercase tracking-tight">{product.name}</h3>
                        <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                          {product.isFree ? 'FREE ACCESS' : `BDT ৳${product.price}`}
                          {product.originalPrice && !product.isFree ? (
                            <span className="text-neutral-500 line-through text-[10px] ml-1.5">৳{product.originalPrice}</span>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer ${
                        product.active 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                      }`}
                    >
                      {product.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{product.active ? 'ACTIVE' : 'OFF'}</span>
                    </button>
                  </div>

                  {product.description && (
                    <p className="text-xs text-neutral-400 line-clamp-2 mb-3 bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-900">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-900">
                  <button 
                    onClick={() => handleOpenEdit(product)}
                    className="px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 text-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="px-3.5 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
            <div className="bg-neutral-900 border border-neutral-800 text-white w-full max-w-xl rounded-3xl p-5 sm:p-7 shadow-2xl relative my-6 max-h-[92vh] flex flex-col">
              <div className="flex items-center justify-between mb-4 shrink-0 border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">
                      {editingProduct ? 'Edit Product (প্রোডাক্ট এডিট)' : 'Add New Product (নতুন প্রোডাক্ট)'}
                    </h3>
                    <span className="text-[11px] text-neutral-400">শুধু নাম ও দাম ছাড়া বাকি সব ঘর ঐচ্ছিক (Optional)</span>
                  </div>
                </div>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 overflow-y-auto pr-1 flex-1 pb-4 scrollbar-thin scrollbar-thumb-neutral-800">
                
                {/* Free Product Switch */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block">
                      🎁 Free Product / Direct Download? (ফ্রি প্রোডাক্ট?)
                    </span>
                    <span className="text-[11px] text-neutral-400 block mt-0.5">
                      এটি চালু করলে পেমেন্টের বদলে সরাসরি ডাউনলোড বাটন থাকবে।
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFree(!isFree)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isFree ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {isFree ? 'YES (ফ্রি)' : 'NO (পেইড)'}
                  </button>
                </div>

                {/* Product Name */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Product Name (প্রোডাক্টের নাম) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="e.g. BDWIN VIP Colour Hack বা Aviator 100% Signal Bot"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-bold"
                  />
                </div>

                {/* Free Product Download Link & Button Text */}
                {isFree && (
                  <div className="space-y-3 bg-neutral-950 p-4 rounded-2xl border border-emerald-500/30">
                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">
                        Direct Download URL (আপনার ডাউনলোড লিংক / APK লিংক)
                      </label>
                      <input 
                        type="text"
                        value={downloadUrl}
                        onChange={e => setDownloadUrl(e.target.value)}
                        placeholder="https://mega.nz/... অথবা https://t.me/..."
                        className="w-full bg-neutral-900 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-xs text-emerald-400 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Button Text</label>
                        <input 
                          type="text"
                          value={buttonText}
                          onChange={e => setButtonText(e.target.value)}
                          placeholder="Download Free"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Version (ভার্সন)</label>
                        <input 
                          type="text"
                          value={version}
                          onChange={e => setVersion(e.target.value)}
                          placeholder="v2.5 Pro"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">File Size (সাইজ)</label>
                        <input 
                          type="text"
                          value={fileSize}
                          onChange={e => setFileSize(e.target.value)}
                          placeholder="14.5 MB"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Short Description */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Short Description (সংক্ষিপ্ত বিবরণ - Optional)
                  </label>
                  <input 
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. 100% Accurate AI Predictions with instant bypass"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                {/* Detailed Guide / Instructions */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Detailed Guide / Instructions (পূর্ণ নির্দেশিকা / বিস্তারিত বিবরণ - Optional)
                  </label>
                  <textarea 
                    value={detailedDescription}
                    onChange={e => setDetailedDescription(e.target.value)}
                    rows={2}
                    placeholder="প্রোডাক্টে ক্লিক করলে কাস্টমার যে বিস্তারিত টিউটোরিয়াল বা গাইড দেখতে পাবে..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white resize-y transition-colors"
                  />
                </div>

                {/* YouTube Video Proof Link */}
                <div className="bg-red-500/5 border border-red-500/20 p-3.5 rounded-2xl">
                  <label className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 mb-1">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>YouTube Video Proof Link (ইউটিউব প্রুফ লিংক - Optional)</span>
                  </label>
                  <input 
                    type="text"
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=... (না দিলেও চলবে)"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 transition-colors font-mono"
                  />
                </div>

                {/* Telegram Proof Link */}
                <div className="bg-blue-500/5 border border-blue-500/20 p-3.5 rounded-2xl">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-1">
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram Proof Channel / Post Link (টেলিগ্রাম প্রুফ লিংক - Optional)</span>
                  </label>
                  <input 
                    type="text"
                    value={telegramProofUrl}
                    onChange={e => setTelegramProofUrl(e.target.value)}
                    placeholder="e.g. https://t.me/your_proof_channel (না দিলেও চলবে)"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>

                {/* Price */}
                {!isFree && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                        Offer Price (বিক্রয় মূল্য BDT) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number"
                        step="1"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono transition-colors font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                        Original Price (আসল দাম BDT - Optional)
                      </label>
                      <input 
                        type="number"
                        step="1"
                        value={originalPrice}
                        onChange={e => setOriginalPrice(e.target.value)}
                        placeholder="e.g. 1000"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white font-mono transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">Status (সক্রিয়তা)</label>
                    <select
                      value={active ? 'true' : 'false'}
                      onChange={e => setActive(e.target.value === 'true')}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                    >
                      <option value="true">Active (সক্রিয়)</option>
                      <option value="false">Inactive (নিষ্ক্রিয়)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">Hack Category / Type</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-neutral-950 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold transition-colors"
                    >
                      <option value="Colour Trading Hack">Colour Trading Hack</option>
                      <option value="Aviator Hack">Aviator Hack</option>
                      <option value="Free Tools & APKs">Free Tools & APKs (ফ্রি টুলস)</option>
                      <option value="All Games Predictor">All Games Predictor</option>
                    </select>
                  </div>
                </div>

                {/* Product Image */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Product Image (ছবি - গ্যালারি থেকে সিলেক্ট করুন বা লিংক দিন)
                  </label>
                  <div className="space-y-3">
                    <div className={`w-full aspect-[21/9] rounded-xl border border-dashed flex items-center justify-center overflow-hidden bg-neutral-950 transition-colors ${imageUrl ? 'border-emerald-500/50' : 'border-neutral-800'}`}>
                      {imageUrl ? (
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-neutral-500">
                          <ImageIcon className="w-6 h-6 mb-1 opacity-40 text-emerald-400" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">ছবি না দিলেও ডিফল্ট ছবি সেট হবে</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-black uppercase text-[10px] tracking-widest transition-all ${
                        isUploading ? 'bg-neutral-800 border-neutral-700 text-neutral-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      }`}>
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>{isUploading ? 'Uploading...' : 'Upload from Gallery'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload} 
                          disabled={isUploading}
                        />
                      </label>

                      <input 
                        type="text"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        placeholder="Or direct image link (Optional)..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold uppercase text-xs tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-7 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
