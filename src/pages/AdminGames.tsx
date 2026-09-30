import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { GameItem } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, CheckCircle2, Gamepad2, X, Loader2, Sparkles, Upload } from 'lucide-react';

interface AdminGamesProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

const DEFAULT_INITIAL_GAMES: GameItem[] = [
  {
    id: 'hgnice',
    name: 'HGNICE',
    type: 'colour_trading',
    subtitle: 'Colour Server',
    badgeBg: '#DF1B22',
    badgeText: '#FFFFFF',
    active: true,
    order: 1
  },
  {
    id: 'dkwin',
    name: 'DKWIN',
    type: 'colour_trading',
    subtitle: 'Colour Server',
    badgeBg: '#FDE000',
    badgeText: '#000000',
    active: true,
    order: 2
  },
  {
    id: 'bdwin',
    name: 'BDWIN',
    type: 'colour_trading',
    subtitle: 'BDwin24 Server',
    badgeBg: '#070B14',
    badgeText: '#67E8F9',
    active: true,
    order: 3
  },
  {
    id: '1xbet',
    name: '1X BET',
    type: 'aviator',
    subtitle: 'Aviator Crash',
    badgeBg: '#FFFFFF',
    badgeText: '#002F5F',
    active: true,
    order: 4
  },
  {
    id: 'ck444',
    name: 'CK444',
    type: 'aviator',
    subtitle: 'Casino Server',
    badgeBg: '#052E16',
    badgeText: '#FDE047',
    active: true,
    order: 5
  }
];

export const AdminGames: React.FC<AdminGamesProps> = ({ currentRoute, navigate }) => {
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<GameItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'colour_trading' | 'aviator' | 'other'>('colour_trading');
  const [subtitle, setSubtitle] = useState('');
  const [badgeBg, setBadgeBg] = useState('#1E293B');
  const [badgeText, setBadgeText] = useState('#FFFFFF');
  const [logoUrl, setLogoUrl] = useState('');
  const [active, setActive] = useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  const handleGameImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('ফাইল সাইজ ৩ এমবি (3MB)-এর নিচে হতে হবে।');
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 400;

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
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        setLogoUrl(dataUrl);
        setIsUploadingLogo(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const snap = await getDocs(collection(db, 'games'));
      const list: GameItem[] = [];
      snap.forEach(d => list.push({ ...d.data(), id: d.id } as GameItem));

      if (list.length === 0) {
        for (const g of DEFAULT_INITIAL_GAMES) {
          await setDoc(doc(db, 'games', g.id), {
            ...g,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        setGames(DEFAULT_INITIAL_GAMES);
      } else {
        list.sort((a, b) => (a.order || 99) - (b.order || 99));
        setGames(list);
      }
    } catch (err: any) {
      console.error('Error fetching games', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingGame(null);
    setName('');
    setType('colour_trading');
    setSubtitle('Colour Server');
    setBadgeBg('#DF1B22');
    setBadgeText('#FFFFFF');
    setLogoUrl('');
    setActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (game: GameItem) => {
    setEditingGame(game);
    setName(game.name);
    setType(game.type || 'colour_trading');
    setSubtitle(game.subtitle || '');
    setBadgeBg(game.badgeBg || '#1E293B');
    setBadgeText(game.badgeText || '#FFFFFF');
    setLogoUrl(game.logoUrl || '');
    setActive(game.active);
    setModalOpen(true);
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const id = editingGame 
        ? editingGame.id 
        : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

      const payload: GameItem = {
        id,
        name: name.trim().toUpperCase(),
        type,
        subtitle: subtitle.trim() || (type === 'colour_trading' ? 'Colour Server' : 'Aviator Server'),
        badgeBg,
        badgeText,
        logoUrl: logoUrl.trim() || '',
        active,
        order: editingGame ? (editingGame.order || games.length + 1) : games.length + 1,
        updatedAt: new Date().toISOString()
      };

      if (!editingGame) {
        payload.createdAt = new Date().toISOString();
      }

      await setDoc(doc(db, 'games', id), payload, { merge: true });
      setSuccessMessage(editingGame ? 'গেম সফলভাবে আপডেট করা হয়েছে!' : 'নতুন গেম সফলভাবে যুক্ত করা হয়েছে!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setModalOpen(false);
      fetchGames();
    } catch (err: any) {
      setError(err.message || String(err));
      handleFirestoreError(err, OperationType.WRITE, 'games');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGame = async (id: string, gameName: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${gameName}" গেমটি ডিলিট করতে চান?`)) return;
    try {
      await deleteDoc(doc(db, 'games', id));
      setSuccessMessage(`"${gameName}" সফলভাবে ডিলিট করা হয়েছে!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchGames();
    } catch (err: any) {
      setError(err.message || String(err));
      handleFirestoreError(err, OperationType.DELETE, `games/${id}`);
    }
  };

  const handleToggleActive = async (game: GameItem) => {
    try {
      await updateDoc(doc(db, 'games', game.id), {
        active: !game.active,
        updatedAt: new Date().toISOString()
      });
      fetchGames();
    } catch (err: any) {
      setError(err.message || String(err));
      handleFirestoreError(err, OperationType.UPDATE, `games/${game.id}`);
    }
  };

  return (
    <AdminLayout currentRoute={currentRoute} navigate={navigate}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 block mb-1">Store Games & Servers</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-2.5">
              <Gamepad2 className="w-8 h-8 text-emerald-400" />
              <span>Game & Category Manager</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              এখানে যেকোনো নতুন গেম যুক্ত, তথ্য এডিট এবং অপ্রয়োজনীয় গেম ডিলিট করতে পারবেন।
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Game</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-xs">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-neutral-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>গেমের তালিকা লোড হচ্ছে...</span>
          </div>
        ) : games.length === 0 ? (
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-12 text-center space-y-4">
            <Gamepad2 className="w-12 h-12 text-neutral-600 mx-auto" />
            <p className="text-neutral-400 text-sm font-bold">বর্তমানে কোনো গেম যুক্ত নেই।</p>
            <button
              onClick={handleOpenAdd}
              className="px-6 py-3 bg-emerald-500 text-black font-black uppercase text-xs rounded-xl"
            >
              Add First Game
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map(game => (
              <div
                key={game.id}
                className={`bg-neutral-950 border rounded-3xl p-5 space-y-4 flex flex-col justify-between transition-all ${
                  game.active ? 'border-neutral-800 hover:border-emerald-500/40' : 'border-red-900/40 opacity-75'
                }`}
              >
                <div>
                  {/* Game Badge Preview */}
                  <div
                    style={{ backgroundColor: game.badgeBg || '#1E293B', color: game.badgeText || '#FFFFFF' }}
                    className="w-full aspect-square max-h-40 rounded-2xl flex flex-col items-center justify-center shadow-inner border border-white/10 relative overflow-hidden"
                  >
                    {game.logoUrl && game.logoUrl.trim() ? (
                      <img 
                        src={game.logoUrl} 
                        alt={game.name} 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <>
                        <span className="font-black text-xl tracking-wider uppercase font-mono">
                          {game.name}
                        </span>
                        <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                          {game.subtitle || game.type}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                        Category Type:
                      </span>
                      <span className="text-xs font-black text-emerald-400 uppercase">
                        {game.type === 'colour_trading' ? 'Colour Trading' : game.type === 'aviator' ? 'Aviator Hack' : 'Other Game'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleActive(game)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                        game.active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {game.active ? '🟢 Active (চালু)' : '🔴 Inactive (বন্ধ)'}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-neutral-900">
                  <button
                    onClick={() => handleOpenEdit(game)}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteGame(game.id, game.name)}
                    className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20 cursor-pointer"
                    title="Delete Game"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ADD / EDIT GAME MODAL */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#0d0d10] border border-neutral-800 text-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="text-lg font-black uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>{editingGame ? 'Edit Game Information' : 'Add New Game'}</span>
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGame} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Game Name (গেমের নাম) *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. HGNICE, DKWIN, TIRANGA, 91 CLUB"
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 uppercase font-black"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Game Category Type (গেম ক্যাটাগরি)
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="colour_trading">Colour Trading Server</option>
                    <option value="aviator">Aviator / Crash Hack</option>
                    <option value="other">Casino / Other Server</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Subtitle / Server Label (সার্ভার নাম)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    placeholder="e.g. Colour Server, VIP Server, 24 Server"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Game Logo / Image URL (লোগো বা ছবির লিংক অথবা গ্যালারি থেকে আপলোড)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={e => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <label className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>{isUploadingLogo ? 'আপলোড হচ্ছে...' : 'গ্যালারি'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleGameImageUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  {logoUrl && (
                    <div className="mt-2 flex items-center gap-3 bg-black p-2 rounded-xl border border-neutral-800">
                      <img src={logoUrl} alt="Logo Preview" className="w-8 h-8 rounded object-cover bg-neutral-900" />
                      <span className="text-[10px] text-emerald-400 font-mono truncate flex-1">লোগো সংযুক্ত হয়েছে</span>
                      <button 
                        type="button" 
                        onClick={() => setLogoUrl('')}
                        className="text-red-400 text-[10px] font-bold hover:underline px-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>



                {/* Badge Live Preview */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Card Preview (প্রিভিউ)
                  </label>
                  <div
                    style={{ backgroundColor: badgeBg, color: badgeText }}
                    className="w-full aspect-square max-h-40 rounded-xl flex flex-col items-center justify-center border border-white/10 shadow relative overflow-hidden"
                  >
                    {logoUrl && logoUrl.trim() ? (
                      <img 
                        src={logoUrl} 
                        alt="Preview" 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <>
                        <span className="font-black text-lg tracking-wider uppercase font-mono">
                          {name || 'GAME NAME'}
                        </span>
                        <span className="text-[9px] font-bold opacity-80 uppercase">
                          {subtitle || 'Server'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="gameActive"
                    checked={active}
                    onChange={e => setActive(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <label htmlFor="gameActive" className="text-xs font-bold text-neutral-300 cursor-pointer">
                    Active on Store (কাস্টমারদের কাছে দৃশ্যমান থাকবে)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs uppercase rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{saving ? 'Saving...' : editingGame ? 'Update Game' : 'Save Game'}</span>
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
