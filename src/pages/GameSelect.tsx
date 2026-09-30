import React, { useState, useEffect } from 'react';
import { OrderDraft } from '../types';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface GameSelectProps {
  orderDraft: OrderDraft;
  setOrderDraft: React.Dispatch<React.SetStateAction<OrderDraft>>;
  navigate: (route: string) => void;
}

interface GameOption {
  id: string;
  name: string;
  type: 'colour_trading' | 'aviator';
  subtitle: string;
  renderLogo: () => React.ReactNode;
}

const ALL_GAMES: GameOption[] = [
  // --- COLOUR TRADING GAMES ---
  {
    id: 'HGNICE',
    name: 'HGNICE',
    type: 'colour_trading',
    subtitle: 'Colour Server',
    renderLogo: () => (
      <div className="flex items-center justify-center select-none py-1">
        <svg className="w-24 h-11 rounded-lg" viewBox="0 0 220 100" fill="none">
          <rect width="220" height="100" rx="16" fill="#DF1B22" />
          <g transform="skewX(-10) translate(10, 0)">
            <rect x="28" y="31" width="13" height="10" fill="#FFFFFF" />
            <path d="M20 46 H53 V52 H42 L38 68 H25 L29 52 H20 Z" fill="#FFFFFF" />
            <rect x="56" y="31" width="12" height="37" fill="#FFFFFF" />
            <text
              x="72"
              y="68"
              fill="#FFFFFF"
              fontSize="44"
              fontWeight="900"
              fontFamily="Arial Black, Impact, sans-serif"
            >
              GNICE
            </text>
          </g>
        </svg>
      </div>
    )
  },
  {
    id: 'DKWIN',
    name: 'DKWIN',
    type: 'colour_trading',
    subtitle: 'Colour Server',
    renderLogo: () => (
      <div className="flex items-center justify-center select-none py-1">
        <svg className="w-24 h-11 rounded-lg" viewBox="0 0 220 100" fill="none">
          <rect width="220" height="100" rx="16" fill="#FDE000" />
          <path
            d="M95 52 C108 38, 102 24, 74 26 C44 28, 20 45, 24 62 C27 73, 44 76, 58 74"
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="58" cy="74" r="6" fill="#FFFFFF" />
          <g transform="skewX(-10)">
            <text
              x="54"
              y="62"
              fill="#FFFFFF"
              fontSize="31"
              fontWeight="900"
              fontFamily="Arial Black, sans-serif"
            >
              DK
            </text>
            <text
              x="114"
              y="62"
              fill="#FFFFFF"
              fontSize="32"
              fontWeight="900"
              fontFamily="Arial Black, sans-serif"
            >
              WIN
            </text>
          </g>
        </svg>
      </div>
    )
  },
  {
    id: 'BDWIN',
    name: 'BDWIN',
    type: 'colour_trading',
    subtitle: 'BDwin24 Server',
    renderLogo: () => (
      <div className="flex items-center justify-center select-none py-1">
        <svg className="w-24 h-11 rounded-lg" viewBox="0 0 230 100" fill="none">
          <defs>
            <linearGradient id="bdBlue4" x1="0" y1="20" x2="0" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A5F3FC" />
              <stop offset="45%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="bdGold4" x1="0" y1="20" x2="0" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <rect width="230" height="100" rx="16" fill="#070B14" />
          <text
            x="14"
            y="66"
            fill="url(#bdBlue4)"
            stroke="#67E8F9"
            strokeWidth="1.2"
            fontSize="44"
            fontWeight="900"
            fontFamily="Georgia, serif"
          >
            BDwin
          </text>
          <text
            x="162"
            y="66"
            fill="url(#bdGold4)"
            stroke="#FDE047"
            strokeWidth="1"
            fontSize="42"
            fontWeight="900"
            fontFamily="Arial Black, sans-serif"
          >
            24
          </text>
        </svg>
      </div>
    )
  },

  // --- AVIATOR HACK GAMES ---
  {
    id: '1X BET',
    name: '1X BET',
    type: 'aviator',
    subtitle: 'Aviator Crash',
    renderLogo: () => (
      <div className="flex items-center justify-center select-none py-1">
        <svg className="w-24 h-11 rounded-lg border border-slate-200" viewBox="0 0 230 100" fill="none">
          <rect width="230" height="100" rx="16" fill="#FFFFFF" />
          <g transform="skewX(-14) translate(22, 0)">
            <text
              x="12"
              y="66"
              fill="#002F5F"
              fontSize="46"
              fontWeight="900"
              fontFamily="Arial Black, Impact, sans-serif"
            >
              1X
            </text>
            <text
              x="80"
              y="66"
              fill="#007ACC"
              fontSize="46"
              fontWeight="900"
              fontFamily="Arial Black, Impact, sans-serif"
            >
              BET
            </text>
          </g>
        </svg>
      </div>
    )
  },
  {
    id: 'CK444',
    name: 'CK444',
    type: 'aviator',
    subtitle: 'Casino Server',
    renderLogo: () => (
      <div className="flex items-center justify-center select-none py-1">
        <svg className="w-24 h-11 rounded-lg" viewBox="0 0 220 100" fill="none">
          <defs>
            <linearGradient id="ckGold4" x1="0" y1="0" x2="220" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="216" height="96" rx="14" fill="#052E16" stroke="url(#ckGold4)" strokeWidth="3" />
          <path d="M88 28 L94 14 L110 24 L126 14 L132 28 Z" fill="url(#ckGold4)" />
          <polygon
            points="24,36 110,27 196,36 192,72 110,81 28,72"
            fill="url(#ckGold4)"
            stroke="#991B1B"
            strokeWidth="2"
          />
          <text
            x="110"
            y="64"
            textAnchor="middle"
            fill="#064E3B"
            stroke="#FEF08A"
            strokeWidth="1.2"
            fontSize="34"
            fontWeight="900"
            fontFamily="Arial Black, Impact, sans-serif"
          >
            CK444
          </text>
        </svg>
      </div>
    )
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

  const getFilteredGames = (): { games: GameOption[]; toolTitle: string } => {
    const cat = (orderDraft.productCategory || '').toLowerCase().trim();
    const name = (orderDraft.productName || '').toLowerCase().trim();

    const isAviator = cat.includes('aviator') || name.includes('aviator');
    const isColourTrading = cat.includes('colour') || cat.includes('color') || name.includes('colour') || name.includes('color') ||
                            name.includes('dkwin') || name.includes('hgnice') || name.includes('bdwin') || name.includes('all game');

    if (isAviator) {
      return { games: ALL_GAMES.filter(g => g.type === 'aviator'), toolTitle: 'Aviator Hack' };
    }

    if (isColourTrading) {
      return { games: ALL_GAMES.filter(g => g.type === 'colour_trading'), toolTitle: 'Colour Trading' };
    }

    // Default to all 5 game options if generic
    return { games: ALL_GAMES, toolTitle: 'VIP Hack' };
  };

  const { games: availableGames, toolTitle } = getFilteredGames();

  const [selectedGame, setSelectedGame] = useState<string>(() => {
    if (orderDraft.selectedGame && availableGames.some(g => g.id === orderDraft.selectedGame)) {
      return orderDraft.selectedGame;
    }
    return availableGames[0]?.id || 'HGNICE';
  });

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
          <div className="grid grid-cols-2 gap-2.5">
            {availableGames.map(game => {
              const isSelected = selectedGame === game.id;
              return (
                <div
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
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

                  <div className="my-auto">
                    {game.renderLogo()}
                  </div>

                  <span className="text-[11px] font-bold text-slate-800 tracking-tight mt-1">
                    {game.name}
                  </span>
                </div>
              );
            })}
          </div>

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
