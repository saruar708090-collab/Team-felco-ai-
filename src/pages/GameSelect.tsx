import React, { useState, useEffect } from 'react';
import { OrderDraft, GameItem } from '../types';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

interface GameSelectProps {
  orderDraft: OrderDraft;
  setOrderDraft: React.Dispatch<React.SetStateAction<OrderDraft>>;
  navigate: (route: string) => void;
}

const DEFAULT_GAMES: GameItem[] = [
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

export const GameSelect: React.FC<GameSelectProps> = ({ orderDraft, setOrderDraft, navigate }) => {
  useSEO({
    title: `Select Game for ${orderDraft.productName || 'VIP Hack'}`,
    description: 'Select your target game server to configure your VIP Hack.'
  });

  if (!orderDraft.productId) {
    useEffect(() => {
      navigate('/');
    }, []);
    return null;
  }

  const [games, setGames] = useState<GameItem[]>(DEFAULT_GAMES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const snap = await getDocs(collection(db, 'games'));
        const list: GameItem[] = [];
        snap.forEach(d => {
          const data = d.data() as GameItem;
          if (data.active !== false) {
            list.push({ ...data, id: d.id });
          }
        });
        if (list.length > 0) {
          list.sort((a, b) => (a.order || 99) - (b.order || 99));
          setGames(list);
        }
      } catch (err) {
        console.error('Error fetching games in GameSelect', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const getFilteredGames = (): { games: GameItem[]; toolTitle: string } => {
    const cat = (orderDraft.productCategory || '').toLowerCase().trim();
    const name = (orderDraft.productName || '').toLowerCase().trim();

    const isAviator = cat.includes('aviator') || name.includes('aviator');
    const isColourTrading = cat.includes('colour') || cat.includes('color') || name.includes('colour') || name.includes('color') ||
                            name.includes('dkwin') || name.includes('hgnice') || name.includes('bdwin') || name.includes('all game');

    if (isAviator) {
      const filtered = games.filter(g => g.type === 'aviator');
      return { games: filtered.length > 0 ? filtered : games, toolTitle: 'Aviator Hack' };
    }

    if (isColourTrading) {
      const filtered = games.filter(g => g.type === 'colour_trading');
      return { games: filtered.length > 0 ? filtered : games, toolTitle: 'Colour Trading' };
    }

    return { games, toolTitle: 'VIP Hack' };
  };

  const { games: availableGames, toolTitle } = getFilteredGames();

  const [selectedGame, setSelectedGame] = useState<string>(() => {
    return orderDraft.selectedGame || availableGames[0]?.name || 'HGNICE';
  });

  useEffect(() => {
    if (availableGames.length > 0 && !availableGames.some(g => g.name === selectedGame)) {
      setSelectedGame(availableGames[0].name);
    }
  }, [availableGames]);

  const handleNext = () => {
    setOrderDraft(prev => ({ ...prev, selectedGame }));
    navigate('/order/payment');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white py-6 px-3 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-3">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
          <span className="text-[11px] font-bold text-neutral-400">
            {orderDraft.productName} • ৳{orderDraft.productPrice}
          </span>
        </div>

        {/* Main Gateway Card */}
        <div className="bg-[#F8FAFC] text-neutral-900 rounded-[24px] p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-4">
          {/* Top Dark Header Pill */}
          <div className="bg-[#121B2B] text-white rounded-xl py-3 px-4 text-center shadow-md">
            <h1 className="text-sm sm:text-base font-bold tracking-wide">
              টার্গেট গেম সার্ভার নির্বাচন করুন
            </h1>
            <span className="text-[10px] text-blue-300 font-semibold">
              {toolTitle} Supported Games ({availableGames.length})
            </span>
          </div>

          {/* 2-Column Grid */}
          {loading ? (
            <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500 font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>গেম লোড হচ্ছে...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {availableGames.map(game => {
                const isSelected = selectedGame === game.name;
                return (
                  <div
                    key={game.id}
                    onClick={() => setSelectedGame(game.name)}
                    className={`relative cursor-pointer rounded-2xl bg-white border-2 p-3 flex flex-col items-center justify-between min-h-[96px] transition-all duration-150 ${
                      isSelected
                        ? 'border-[#1D4ED8] shadow-md ring-2 ring-[#2563EB]/20 bg-blue-50/10'
                        : 'border-slate-200/80 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <span className="absolute top-2 right-2 bg-[#DC2626] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider leading-none shadow-sm">
                      LIVE
                    </span>

                    {isSelected && (
                      <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Logo/Badge Container */}
                    <div className="my-auto w-full py-1">
                      <div
                        style={{ backgroundColor: game.badgeBg || '#1E293B', color: game.badgeText || '#FFFFFF' }}
                        className="w-full h-11 rounded-lg flex flex-col items-center justify-center shadow-sm border border-black/10 overflow-hidden px-1"
                      >
                        <span className="font-black text-sm tracking-wider uppercase font-mono line-clamp-1">
                          {game.name}
                        </span>
                        <span className="text-[7.5px] font-bold opacity-80 uppercase tracking-tight">
                          {game.subtitle || 'VIP Server'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-slate-800 tracking-tight mt-1 line-clamp-1 text-center">
                      {game.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Status Strip */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-center text-xs font-bold text-slate-700">
            Selected: <span className="text-[#1D4ED8]">{selectedGame} VIP SERVER</span>
          </div>

          {/* Solid Blue Button */}
          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-base tracking-wide rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>পেমেন্ট করতে এগিয়ে যান</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
