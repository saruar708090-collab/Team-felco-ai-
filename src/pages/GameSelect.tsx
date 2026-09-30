import React, { useState, useEffect } from 'react';
import { OrderDraft, GameItem } from '../types';
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck, Gamepad2 } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

import { StoreSettings } from '../types';

interface GameSelectProps {
  orderDraft: OrderDraft;
  setOrderDraft: React.Dispatch<React.SetStateAction<OrderDraft>>;
  navigate: (route: string) => void;
  theme?: 'dark' | 'light';
  settings?: StoreSettings | null;
}

const DEFAULT_GAMES: GameItem[] = [
  {
    id: 'hgnice',
    name: 'HGNICE',
    type: 'colour_trading',
    subtitle: 'COLOUR SERVER',
    badgeBg: '#DF1B22',
    badgeText: '#FFFFFF',
    active: true,
    order: 1
  },
  {
    id: 'dkwin',
    name: 'DKWIN',
    type: 'colour_trading',
    subtitle: 'COLOUR SERVER',
    badgeBg: '#EAB308',
    badgeText: '#000000',
    active: true,
    order: 2
  },
  {
    id: 'bdwin',
    name: 'BDWIN',
    type: 'colour_trading',
    subtitle: 'BDWIN24 SERVER',
    badgeBg: '#0F766E',
    badgeText: '#FFFFFF',
    active: true,
    order: 3
  },
  {
    id: '1xbet',
    name: '1X BET',
    type: 'aviator',
    subtitle: 'AVIATOR CRASH',
    badgeBg: '#1D4ED8',
    badgeText: '#FFFFFF',
    active: true,
    order: 4
  },
  {
    id: 'ck444',
    name: 'CK444',
    type: 'aviator',
    subtitle: 'CASINO SERVER',
    badgeBg: '#047857',
    badgeText: '#FFFFFF',
    active: true,
    order: 5
  }
];

export const GameSelect: React.FC<GameSelectProps> = ({ orderDraft, setOrderDraft, navigate, theme = 'dark', settings }) => {
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

  const getFilteredGames = () => {
    const pName = (orderDraft.productName || '').toLowerCase();
    const isAviator = pName.includes('aviator') || pName.includes('crash');
    const isColourTrading = pName.includes('colour') || pName.includes('color') || pName.includes('bdwin') || pName.includes('hgnice') || pName.includes('dkwin') || pName.includes('tiranga');

    if (isAviator) {
      const filtered = games.filter(g => g.type === 'aviator');
      return { games: filtered.length > 0 ? filtered : games, toolTitle: 'Aviator Supported Games' };
    }

    if (isColourTrading) {
      const filtered = games.filter(g => g.type === 'colour_trading');
      return { games: filtered.length > 0 ? filtered : games, toolTitle: 'Colour Trading Supported Games' };
    }

    return { games, toolTitle: 'Supported Game Servers' };
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

  // Render extremely sharp game logos with elite premium visual vectors
  const renderGameBadgeLogo = (game: GameItem) => {
    if (game.logoUrl && game.logoUrl.trim()) {
      return (
        <div className="w-full h-12 rounded-xl overflow-hidden shadow-md border border-slate-300/80 bg-neutral-900 relative flex items-center justify-center">
          <img 
            src={game.logoUrl} 
            alt={game.name} 
            className="w-full h-full object-cover rounded-xl" 
          />
        </div>
      );
    }

    const name = game.name.toUpperCase();
    if (name.includes('HGNICE')) {
      return (
        <div className="w-full h-11 rounded-xl bg-[#E50914] flex items-center justify-center shadow-md border border-white/20 relative overflow-hidden active:scale-95 transition-transform">
          <svg viewBox="0 0 100 30" className="w-24 h-8">
            {/* Styled "+HGNICE" italic text */}
            <text x="50" y="21" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="900" fontStyle="italic" fontSize="13" fill="#FFFFFF" textAnchor="middle" letterSpacing="-0.3">
              +HGNICE
            </text>
          </svg>
        </div>
      );
    }
    if (name.includes('DKWIN') || name.includes('DK WIN')) {
      return (
        <div className="w-full h-11 rounded-xl bg-[#FCD34D] flex items-center justify-center shadow-md border border-yellow-300 relative overflow-hidden active:scale-95 transition-transform">
          <svg viewBox="0 0 100 30" className="w-24 h-8 flex items-center">
            {/* Orbital ring DX symbol on left */}
            <ellipse cx="25" cy="15" rx="14" ry="7" fill="none" stroke="#FFFFFF" strokeWidth="2" transform="rotate(-15 25 15)" />
            <text x="25" y="19" fontFamily="sans-serif" fontWeight="900" fontSize="10" fill="#FFFFFF" textAnchor="middle">
              DX
            </text>
            {/* "WIN" text on right */}
            <text x="65" y="21" fontFamily="system-ui, sans-serif" fontWeight="950" fontStyle="italic" fontSize="14" fill="#FFFFFF" textAnchor="middle">
              WIN
            </text>
          </svg>
        </div>
      );
    }
    if (name.includes('BDWIN')) {
      return (
        <div className="w-full h-11 rounded-xl bg-[#0d1527] flex items-center justify-center shadow-md border border-blue-500/30 relative overflow-hidden active:scale-95 transition-transform p-1">
          <svg viewBox="0 0 100 30" className="w-24 h-8">
            <defs>
              <linearGradient id="bdwinBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#0077FF" />
              </linearGradient>
              <linearGradient id="bdwinGold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFE000" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>
            {/* "BDWIN" blue styled text */}
            <text x="32" y="21" fontFamily="sans-serif" fontWeight="900" fontSize="13" fill="url(#bdwinBlue)" textAnchor="middle" letterSpacing="-0.5">
              BDWIN
            </text>
            {/* "24" gold stylized */}
            <text x="78" y="21" fontFamily="sans-serif" fontWeight="900" fontSize="15" fill="url(#bdwinGold)" textAnchor="middle">
              24
            </text>
          </svg>
        </div>
      );
    }
    if (name.includes('1X') || name.includes('BET')) {
      return (
        <div className="w-full h-11 rounded-xl bg-[#09152b] flex items-center justify-center shadow-md border border-blue-600/30 relative overflow-hidden active:scale-95 transition-transform">
          <svg viewBox="0 0 100 30" className="w-24 h-8">
            {/* "1X" and "BET" bold italic styling */}
            <text x="50" y="21" fontFamily="system-ui, sans-serif" fontWeight="950" fontStyle="italic" fontSize="16" textAnchor="middle">
              <tspan fill="#0D47A1">1X</tspan>
              <tspan fill="#00B0FF">BET</tspan>
            </text>
          </svg>
        </div>
      );
    }
    if (name.includes('CK') || name.includes('444')) {
      return (
        <div className="w-full h-11 rounded-xl bg-gradient-to-b from-[#0A3C23] to-[#052214] flex flex-col items-center justify-center shadow-md border border-[#D4AF37]/50 relative overflow-hidden active:scale-95 transition-transform p-0.5">
          {/* Gold inner border line */}
          <div className="absolute inset-0.5 border border-[#D4AF37]/25 rounded-lg pointer-events-none" />
          <svg viewBox="0 0 100 30" className="w-24 h-8">
            {/* Tiny gold crown on top */}
            <path d="M42,7 L45,11 L50,6 L55,11 L58,7 L56,13 L44,13 Z" fill="#D4AF37" />
            {/* "CK444" in gold-embossed styling */}
            <text x="50" y="25" fontFamily="sans-serif" fontWeight="950" fontSize="11" fill="#FFE000" textAnchor="middle" stroke="#000000" strokeWidth="0.5" letterSpacing="0.3">
              CK444
            </text>
          </svg>
        </div>
      );
    }
    return (
      <div 
        style={{ backgroundColor: game.badgeBg || '#1e293b' }}
        className="w-full h-10 rounded-lg flex flex-col items-center justify-center shadow-md border border-white/15"
      >
        <span 
          style={{ color: game.badgeText || '#ffffff' }}
          className="font-extrabold text-xs tracking-wider font-sans uppercase line-clamp-1"
        >
          🎮 {game.name}
        </span>
        <span className="text-[6px] opacity-80 font-bold tracking-widest uppercase">
          {game.subtitle || 'VIP SERVER'}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1] py-6 px-3 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-[390px] sm:max-w-[420px] space-y-3">
        
        {/* Top Header Step */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-600">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 font-bold hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
          <span className="font-bold text-[11px] text-slate-700">
            {orderDraft.productName} • ৳{orderDraft.productPrice}
          </span>
        </div>

        {/* Clean Luxury White Merchant Gateway Card */}
        <div className="bg-[#FFFFFF] text-slate-900 rounded-[28px] p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-100 space-y-3.5">
          
          {/* Top Dark Navy Rounded Header */}
          <div className="bg-[#0f172a] text-white rounded-2xl py-3 px-4 text-center shadow-md">
            <h1 className="text-sm sm:text-[15px] font-black tracking-wide flex items-center justify-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-blue-400" />
              <span>টার্গেট গেম সার্ভার নির্বাচন করুন</span>
            </h1>
            <span className="text-[11px] text-blue-300 font-medium block mt-0.5">
              {toolTitle} ({availableGames.length})
            </span>
          </div>

          {/* Game Server list sitting nicely side-by-side on the first line */}
          {loading ? (
            <div className="py-10 flex items-center justify-center gap-2 text-xs text-slate-500 font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>গেম লোড হচ্ছে...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {availableGames.map(game => {
                const isSelected = selectedGame === game.name;
                return (
                  <div
                    key={game.id}
                    onClick={() => setSelectedGame(game.name)}
                    className={`relative cursor-pointer rounded-2xl border-2 p-3 flex flex-col items-center justify-between aspect-square transition-all duration-150 ${
                      isSelected
                        ? 'border-[#1a56db] bg-blue-50/30 ring-2 ring-[#1a56db]/20 shadow-md scale-95'
                        : 'border-slate-200 hover:border-slate-300 bg-white shadow-sm'
                    }`}
                  >
                    {/* LIVE Red Pill Badge (Top Right) */}
                    <span className="absolute top-2.5 right-2.5 bg-[#dc2626] text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider leading-none shadow-sm">
                      LIVE
                    </span>

                    {/* Blue Selected Check Circle (Top Left) */}
                    {isSelected && (
                      <div className="absolute top-2.5 left-2.5 w-4 h-4 rounded-full bg-[#1a56db] text-white flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Logo/Badge Container - perfectly centered */}
                    <div className="my-auto w-full pt-2">
                      {renderGameBadgeLogo(game)}
                    </div>

                    <span className="text-[11px] font-black text-slate-800 tracking-tight mt-1 line-clamp-1 text-center">
                      {game.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Status Strip */}
          <div className="bg-[#f1f5f9] border border-slate-200 rounded-xl p-2.5 text-center text-xs font-bold text-slate-700">
            Selected: <span className="text-[#1a56db] font-black">{selectedGame} VIP SERVER</span>
          </div>

          {/* Secured Seal */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secured by FELCO PAY</span>
          </div>

          {/* Solid Royal Blue Action Button */}
          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-[#1a56db] hover:bg-[#1e429f] text-white font-black text-base tracking-wide rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>পেমেন্ট করতে এগিয়ে যান</span>
          </button>
        </div>
      </div>
    </div>
  );
};
