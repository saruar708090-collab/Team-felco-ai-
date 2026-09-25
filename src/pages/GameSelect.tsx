import React, { useState, useEffect } from 'react';
import { OrderDraft } from '../types';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface GameSelectProps {
  orderDraft: OrderDraft;
  setOrderDraft: React.Dispatch<React.SetStateAction<OrderDraft>>;
  navigate: (route: string) => void;
}

export const GameSelect: React.FC<GameSelectProps> = ({ orderDraft, setOrderDraft, navigate }) => {
  useSEO({
    title: `Select Game for ${orderDraft.productName || 'Hack'}`,
    description: 'Select your preferred game server to configure the automated calculation bot and forecasting algorithms.'
  });

  if (!orderDraft.productId) {
    useEffect(() => { navigate('/'); }, []);
    return null;
  }

  const isColourTrading = orderDraft.productCategory === 'Colour Trading Hack' || orderDraft.productId === 'colour-trading-tool';
  
  const games = [
    {
      id: 'HGNICE',
      name: 'HGNICE',
      category: 'Colour Prediction',
      bg: 'bg-red-600',
      textColor: 'text-white',
      badgeText: 'HGNICE',
      borderColor: 'border-red-500'
    },
    {
      id: 'DKWIN',
      name: 'DKWIN',
      category: 'Gaming Portal',
      bg: 'bg-yellow-400',
      textColor: 'text-black',
      badgeText: 'DKWIN',
      borderColor: 'border-yellow-500'
    },
    {
      id: 'BDWIN',
      name: 'BDWIN',
      category: 'Trading Network',
      bg: 'bg-gradient-to-r from-blue-600 to-cyan-500',
      textColor: 'text-white',
      badgeText: 'BDWIN',
      borderColor: 'border-blue-400'
    },
    {
      id: '1X BET',
      name: '1X BET',
      category: 'Aviator & Casino',
      bg: 'bg-blue-900',
      textColor: 'text-white',
      badgeText: '1XBET',
      borderColor: 'border-blue-600'
    },
    {
      id: 'CK444',
      name: 'CK444',
      category: 'Premium Terminal',
      bg: 'bg-gradient-to-b from-amber-500 to-emerald-800',
      textColor: 'text-yellow-100',
      badgeText: 'CK444',
      borderColor: 'border-amber-400'
    }
  ];

  const allowedGameKeys = isColourTrading 
    ? ['HGNICE', 'DKWIN', 'BDWIN']
    : ['HGNICE', 'DKWIN', 'BDWIN', '1X BET', 'CK444'];

  const filteredGames = games.filter(g => allowedGameKeys.includes(g.id));
  const [selectedGame, setSelectedGame] = useState<string>(orderDraft.selectedGame || allowedGameKeys[0]);

  const handleNext = () => {
    setOrderDraft(prev => ({ ...prev, selectedGame }));
    navigate('/order/payment');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-8 px-3 sm:px-6">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Step progress */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-900 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">Step 1 of 4</span>
            <span className="text-neutral-600">/</span>
            <span>Game Select</span>
          </div>
        </div>

        {/* Selected Product Banner */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block">Product</span>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-white">{orderDraft.productName}</h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block">Price</span>
            <span className="text-sm sm:text-base font-black text-emerald-400">BDT {orderDraft.productPrice}</span>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-1">Select Target Game</h1>
          <p className="text-neutral-400 text-xs">
            Choose your target game platform for license activation.
          </p>
        </div>

        {/* Compact Game List with exact brand badges */}
        <div className="space-y-2.5">
          {filteredGames.map(game => {
            const isSelected = selectedGame === game.id;
            return (
              <div 
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`cursor-pointer border rounded-xl p-3.5 transition-all flex items-center justify-between ${isSelected ? 'bg-neutral-900 border-emerald-500 shadow-xl ring-1 ring-emerald-500/50' : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'}`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-[11px] tracking-tighter shadow-lg ${game.bg} ${game.textColor} border ${game.borderColor}`}>
                    {game.badgeText}
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-wider uppercase text-white">{game.name}</h3>
                    <p className="text-[11px] text-neutral-400">{game.category}</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-emerald-400 bg-emerald-400 text-black' : 'border-neutral-700 bg-neutral-900'}`}>
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Button */}
        <div className="pt-2">
          <button 
            onClick={handleNext}
            className="w-full py-3.5 bg-white text-black font-extrabold uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-xl"
          >
            <span>Continue to Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
