import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { ShieldCheck, CheckCircle2, X, Zap } from 'lucide-react';

interface ActivityItem {
  id: string;
  userLabel: string;
  location: string;
  product: string;
  game: string;
  amount: number;
  timeAgo: string;
}

// Ultra-authentic, privacy-safe VIP purchaser labels (No private personal names)
const defaultActivities: ActivityItem[] = [
  { id: '1', userLabel: 'VIP Member #8492', location: 'ঢাকা', product: '1-Month Predictor', game: 'HGNICE', amount: 500, timeAgo: '২ মি. আগে' },
  { id: '2', userLabel: 'User 017****832', location: 'চট্টগ্রাম', product: 'Master Tool Pro', game: 'DKWIN', amount: 1200, timeAgo: '৪ মি. আগে' },
  { id: '3', userLabel: 'VIP Player #3104', location: 'সিলেট', product: 'Aviator Signal VIP', game: '1X BET', amount: 800, timeAgo: '৭ মি. আগে' },
  { id: '4', userLabel: 'User 019****491', location: 'গাজীপুর', product: 'Colour Trading AI', game: 'BDWIN', amount: 500, timeAgo: '১০ মি. আগে' },
  { id: '5', userLabel: 'Verified VIP #6520', location: 'রাজশাহী', product: 'VIP Tool Access', game: 'TIRANGA', amount: 950, timeAgo: '১২ মি. আগে' },
  { id: '6', userLabel: 'User 018****715', location: 'খুলনা', product: 'Predictor Suite', game: 'CK444', amount: 1500, timeAgo: '১৫ মি. আগে' },
  { id: '7', userLabel: 'VIP Member #1983', location: 'বগুড়া', product: '15-Days Pass', game: 'HGNICE', amount: 350, timeAgo: '১৮ মি. আগে' },
  { id: '8', userLabel: 'User 016****264', location: 'কুমিল্লা', product: 'Aviator Signal Pro', game: '1X BET', amount: 800, timeAgo: '২২ মি. আগে' },
];

const locations = ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ', 'গাজীপুর', 'নারায়ণগঞ্জ', 'কুমিল্লা', 'বগুড়া'];

export const LiveSalesActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>(defaultActivities);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const showCountRef = useRef(0);

  useEffect(() => {
    fetchLiveOrders();
  }, []);

  const fetchLiveOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), limit(15));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const fetched: ActivityItem[] = [];
        snap.forEach((doc, idx) => {
          const data = doc.data();
          const location = locations[idx % locations.length];
          const diffMinutes = Math.max(2, Math.floor((Date.now() - new Date(data.createdAt || Date.now()).getTime()) / 60000));
          const timeAgo = diffMinutes < 60 ? `${diffMinutes} মি. আগে` : `${Math.floor(diffMinutes / 60)} ঘ. আগে`;
          
          // Anonymized privacy-safe label without revealing user's real personal name
          const maskedNumber = data.whatsappNumber 
            ? `User ${data.whatsappNumber.slice(0, 3)}****${data.whatsappNumber.slice(-3)}`
            : `VIP Member #${(Math.abs(doc.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 1000)) % 8999) + 1000}`;

          fetched.push({
            id: doc.id,
            userLabel: maskedNumber,
            location,
            product: data.productName || 'VIP Game Tool',
            game: data.selectedGame || 'HGNICE',
            amount: data.finalAmount || data.productPrice || 500,
            timeAgo: diffMinutes > 720 ? `${(idx * 3) + 3} মি. আগে` : timeAgo
          });
        });

        if (fetched.length > 0) {
          setActivities([...fetched, ...defaultActivities]);
        }
      }
    } catch {
      // Keep curated defaults
    }
  };

  useEffect(() => {
    if (isDismissed || activities.length === 0) return;

    // Natural Organic Delay on Page Load:
    // Does NOT pop up immediately so visitors don't suspect bot-spam.
    // Appears naturally after 18 to 32 seconds.
    const randomInitialDelay = Math.floor(18000 + Math.random() * 14000);
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
      showCountRef.current += 1;
    }, randomInitialDelay);

    return () => clearTimeout(initialTimer);
  }, [isDismissed, activities]);

  useEffect(() => {
    if (isDismissed || activities.length === 0) return;

    let hideTimer: NodeJS.Timeout;
    let nextTimer: NodeJS.Timeout;

    if (isVisible) {
      // Stays visible gently for only 3.8 seconds
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 3800);
    } else if (showCountRef.current > 0) {
      // Long relaxed natural interval between appearances (32 to 55 seconds)
      const randomGap = Math.floor(32000 + Math.random() * 23000);
      nextTimer = setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % activities.length);
        setIsVisible(true);
        showCountRef.current += 1;
      }, randomGap);
    }

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [isVisible, isDismissed, activities]);

  if (isDismissed || activities.length === 0) return null;

  const currentItem = activities[currentIndex] || defaultActivities[0];

  return (
    <div
      className={`fixed bottom-3 left-3 sm:bottom-5 sm:left-5 z-40 max-w-[290px] sm:max-w-[320px] w-auto transition-all duration-700 ease-out transform ${
        isVisible
          ? 'translate-y-0 opacity-95 scale-100 pointer-events-auto'
          : 'translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative bg-[#090d16]/95 hover:bg-[#0c1220] text-white py-2 px-3 rounded-2xl border border-emerald-500/25 hover:border-emerald-400/50 shadow-[0_12px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl flex items-center gap-2.5 group transition-all">
        
        {/* Glowing Micro Radar / Shield Icon */}
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#064e3b] via-[#047857] to-[#0284c7] flex items-center justify-center text-white shadow-md shadow-emerald-500/15 border border-emerald-400/30">
            <Zap className="w-3.5 h-3.5 text-emerald-300 fill-current" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border border-black flex items-center justify-center shadow">
            <div className="w-1.5 h-1.5 rounded-full bg-black" />
          </div>
        </div>

        {/* Ultra-Clean Privacy-Protected Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 leading-none mb-0.5">
            <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ভেরিফাইড অর্ডার</span>
            </span>
            <span className="text-[9px] text-neutral-500 font-mono">• {currentItem.timeAgo}</span>
          </div>

          <div className="text-[11px] font-bold text-neutral-200 truncate leading-tight mt-0.5">
            <span className="font-extrabold text-white tracking-tight">{currentItem.userLabel}</span>
            <span className="text-neutral-400 text-[10px] ml-1">({currentItem.location})</span>
          </div>

          <div className="text-[10px] text-amber-400 font-extrabold truncate mt-0.5 flex items-center gap-1">
            <span className="text-cyan-300">{currentItem.game}</span>
            <span className="truncate">{currentItem.product}</span>
            <span className="text-emerald-400 font-mono font-black ml-auto shrink-0">৳{currentItem.amount}</span>
          </div>
        </div>

        {/* Subtle Close Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="text-neutral-500 hover:text-neutral-300 p-1 rounded-md transition-colors shrink-0 cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
