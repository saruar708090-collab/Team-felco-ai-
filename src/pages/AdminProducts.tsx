import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Product } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, X, Upload, ImageIcon, Loader2 } from 'lucide-react';

interface AdminProductsProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ currentRoute, navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Colour Trading Hack');
  const [active, setActive] = useState(true);
  const [soldOut, setSoldOut] = useState(false);
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
      const errorMessage = err.code === 'permission-denied' 
        ? 'Access Denied: Please wait 1-2 minutes for security rules to propagate and refresh page.' 
        : (err.message || String(err));
      setError(errorMessage);
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
        const max_size = 600; // Optimal size for high quality + low storage footprint

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
    setPrice('');
    setOriginalPrice('');
    setImageUrl('');
    setCategory('Colour Trading Hack');
    setActive(true);
    setSoldOut(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setDetailedDescription(product.detailedDescription || '');
    setPrice(product.price.toString());
    setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
    setImageUrl(product.imageUrl);
    setCategory(product.category || 'Colour Trading Hack');
    setActive(product.active);
    setSoldOut(!!product.soldOut);
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = editingProduct ? editingProduct.id : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload: Product = {
        id,
        name,
        description,
        detailedDescription: detailedDescription || undefined,
        price: parseFloat(price) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        imageUrl,
        category,
        active,
        soldOut,
        updatedAt: new Date().toISOString()
      };

      if (!editingProduct) {
        payload.createdAt = new Date().toISOString();
      }

      await setDoc(doc(db, 'products', id), payload, { merge: true });
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), {
        active: !product.active,
        updatedAt: new Date().toISOString()
      });
      fetchProducts();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${product.id}`);
    }
  };

  return (
    <AdminLayout currentRoute={currentRoute} navigate={navigate}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 block mb-1">Catalog Management</span>
            <h1 className="text-3xl font-black uppercase tracking-tight">Products</h1>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="px-6 py-3.5 bg-white text-black font-extrabold uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-xs mb-6 flex items-center justify-between">
            <div>
              <p className="font-bold uppercase tracking-tight mb-1">Error Accessing Products</p>
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
          <div className="text-center py-12 text-neutral-500 text-xs">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative shrink-0">
                        <img src={product.imageUrl} alt={product.name} className="w-14 h-14 object-cover rounded-xl bg-neutral-900" />
                        {product.soldOut && (
                          <div className="absolute inset-0 bg-red-600/75 rounded-xl flex items-center justify-center">
                            <span className="text-[7px] font-black uppercase text-white tracking-widest text-center leading-none">SOLD OUT</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center flex-wrap gap-1.5">
                          <h3 className="font-black uppercase tracking-wide text-sm sm:text-base">{product.name}</h3>
                          {product.category && (
                            <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold uppercase px-2 py-0.5 rounded">
                              {product.category}
                            </span>
                          )}
                          {product.soldOut && (
                            <span className="text-[8px] bg-rose-600 text-white font-extrabold uppercase px-1.5 py-0.5 rounded animate-pulse">
                              SOLD OUT
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-400 mt-0.5">
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="line-through text-red-500">BDT {product.originalPrice}</span>
                          )}
                          <span className="text-emerald-400">BDT {product.price}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleToggleActive(product)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${product.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-400'}`}
                    >
                      {product.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{product.active ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed mb-6 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-900">
                  <button 
                    onClick={() => handleOpenEdit(product)}
                    className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-85 backdrop-blur-sm overflow-y-auto">
            <div className="bg-neutral-900 border border-neutral-800 text-white w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between mb-6 shrink-0 border-b border-neutral-800/80 pb-4">
                <h3 className="text-xl font-black uppercase tracking-tight">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-5 overflow-y-auto pr-1 flex-1 pb-4 scrollbar-thin scrollbar-thumb-neutral-800">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">Product Name (প্রোডাক্টের নাম)</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="e.g. BDWIN VIP Colour Hack"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">Description (সংক্ষিপ্ত বিবরণ)</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={2}
                    required
                    placeholder="প্রোডাক্ট কার্ডে দেখানোর জন্য সংক্ষিপ্ত বিবরণ..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white resize-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">Detailed Guide / Instructions (পূর্ণ নির্দেশিকা / বিস্তারিত বিবরণ - Optional)</label>
                  <textarea 
                    value={detailedDescription}
                    onChange={e => setDetailedDescription(e.target.value)}
                    rows={4}
                    placeholder="কাস্টমার প্রোডাক্টটিতে ক্লিক করলে যে বিস্তারিত টিউটোরিয়াল বা বিবরণ দেখতে পাবে তা এখানে লিখুন..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white resize-y transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">Discounted Price (বর্তমান দাম BDT)</label>
                    <input 
                      type="number"
                      step="1"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      required
                      placeholder="e.g. 4500"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white font-mono transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">Original Price (আসল দাম BDT - Optional)</label>
                    <input 
                      type="number"
                      step="1"
                      value={originalPrice}
                      onChange={e => setOriginalPrice(e.target.value)}
                      placeholder="e.g. 6000"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white font-mono transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">Status (সক্রিয়তা)</label>
                    <select
                      value={active ? 'true' : 'false'}
                      onChange={e => setActive(e.target.value === 'true')}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white transition-colors"
                    >
                      <option value="true">Active (সক্রিয়)</option>
                      <option value="false">Inactive (নিষ্ক্রিয়)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-1">Stock Status (স্টক অবস্থা)</label>
                    <select
                      value={soldOut ? 'true' : 'false'}
                      onChange={e => setSoldOut(e.target.value === 'true')}
                      className="w-full bg-neutral-950 border border-rose-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500 font-bold transition-colors"
                    >
                      <option value="false">In Stock (স্টক আছে)</option>
                      <option value="true">🔴 SOLD OUT (সোল্ড আউট)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">Hack Type (Category) *</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-neutral-950 border border-emerald-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold transition-colors"
                    >
                      <option value="Colour Trading Hack">Colour Trading Hack</option>
                      <option value="Aviator Hack">Aviator Hack</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">Product Image (Gallery or Link) *</label>
                  <div className="space-y-3">
                    {/* Image preview box */}
                    <div className={`w-full aspect-video rounded-xl border border-dashed flex items-center justify-center overflow-hidden bg-neutral-950 transition-colors ${imageUrl ? 'border-emerald-500/50' : 'border-neutral-800'}`}>
                      {imageUrl ? (
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-neutral-500">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                          <span className="text-[10px] uppercase font-bold tracking-widest">No Image Selected</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Image Upload Button */}
                      <label className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-black uppercase text-[10px] tracking-widest transition-all ${
                        isUploading ? 'bg-neutral-800 border-neutral-700 text-neutral-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      }`}>
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>{isUploading ? 'Uploading...' : 'Direct Gallery Photo'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload} 
                          disabled={isUploading}
                        />
                      </label>

                      {/* URL Field */}
                      <input 
                        type="url"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        placeholder="Or paste direct image URL..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white font-mono transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-800/80 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-3 bg-neutral-800 text-white font-bold uppercase text-xs tracking-wider rounded-xl hover:bg-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-emerald-500 text-black font-extrabold uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-400 transition-colors"
                  >
                    Save Product
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
