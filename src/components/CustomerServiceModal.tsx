import React, { useState } from 'react';
import { X, Bot, User, Sparkles, Send, Headphones, MessageSquare, SendHorizontal, ExternalLink, ShieldCheck } from 'lucide-react';
import { StoreSettings } from '../types';

interface CustomerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings | null;
}

export const CustomerServiceModal: React.FC<CustomerServiceModalProps> = ({ isOpen, onClose, settings }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: 'আসসালামু আলাইকুম! Team Felco Store সাপোর্ট সেন্টারে আপনাকে স্বাগতম। কালার ট্রেডিং বা এভিয়েটর টুল সংক্রান্ত যেকোনো সহায়তায় আমাদের এআই অ্যাসিস্ট্যান্টকে প্রশ্ন করুন অথবা সরাসরি আমাদের টেলিগ্রাম অ্যাডমিনের সাথে কথা বলুন।' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const telegramAdminLink = settings?.telegramSupportUsername
    ? (settings.telegramSupportUsername.startsWith('http') ? settings.telegramSupportUsername : `https://t.me/${settings.telegramSupportUsername.replace('@', '')}`)
    : (settings?.supportTelegram?.startsWith('http') ? settings.supportTelegram : `https://t.me/${settings?.supportTelegram?.replace('@', '') || 'TeamFelcoAdmin'}`);

  const telegramChannelLink = settings?.telegramChannelUrl || 'https://t.me/+NRQwX88nKUQxYWY1';

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    const lower = userText.toLowerCase();
    let reply = '';

    if (lower.includes('নাম্বার') || lower.includes('bkash') || lower.includes('nagad') || lower.includes('পেমেন্ট')) {
      reply = 'আমাদের অফিশিয়াল বিকাশ, নগদ বা রকেট পার্সোনাল নাম্বারে সেন্ড মানি করে TrxID সাবমিট করুন। পেমেন্ট সম্পন্ন হলে অ্যাডমিন দ্রুত ভেরিফাই করে টেলিগ্রামে ভিআইপি কোড বুঝিয়ে দেবেন।';
    } else if (lower.includes('how') || lower.includes('buy') || lower.includes('কিভাবে') || lower.includes('কিনব')) {
      reply = 'হোমপেজ থেকে আপনার পছন্দের প্যাকেজের "BUY NOW" বাটনে চাপ দিন, গেম সিলেক্ট করুন এবং বিকাশ/নগদে টাকা পাঠিয়ে অর্ডার কনফার্ম করুন।';
    } else if (lower.includes('time') || lower.includes('সময়') || lower.includes('কতক্ষণ')) {
      reply = 'অর্ডার সাবমিট করার পর সাধারণত ৫ থেকে ১০ মিনিটের মধ্যে অ্যাডমিন আপনার টেলিগ্রামে টুল কোড ও ফাইল বুঝিয়ে দেন।';
    } else if (lower.includes('game') || lower.includes('গেম') || lower.includes('hgnice') || lower.includes('dkwin') || lower.includes('bdwin')) {
      reply = 'আমাদের টুলগুলো HGNICE, DKWIN, BDWIN, 1X BET এবং CK444 সহ সকল গেম সার্ভারে ১০০% নিখুঁত কাজ করে।';
    } else {
      try {
        const res = await fetch('/api/gemini-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            history: messages
          })
        });

        const data = await res.json();
        if (data.error || !data.reply) {
          throw new Error(data.error || 'No reply');
        }
        reply = data.reply;
      } catch {
        reply = 'আপনার প্রশ্নের জন্য ধন্যবাদ! দ্রুততম সময়ে সহায়তার জন্য নিচে থাকা "Telegram Admin ID"-তে সরাসরি মেসেজ দিন।';
      }
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
      setLoading(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0f19] border border-neutral-800 text-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[540px]">
        {/* Header */}
        <div className="bg-[#060a12] border-b border-neutral-800/90 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black rounded-2xl shadow-lg">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black tracking-wider text-sm sm:text-base flex items-center gap-2">
                CUSTOMER SERVICE
                <span className="bg-emerald-500 text-black text-[9px] px-2 py-0.5 rounded-full font-black">24/7 Live</span>
              </h3>
              <p className="text-[11px] text-neutral-400">Team Felco Official Support Center</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telegram Direct Action Buttons Strip */}
        <div className="bg-neutral-950 p-3 border-b border-neutral-800/80 grid grid-cols-2 gap-2">
          {/* Direct Telegram Admin ID */}
          <a
            href={telegramAdminLink}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 bg-gradient-to-r from-[#0088cc] to-[#0077b5] hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <SendHorizontal className="w-4 h-4" />
            <div className="text-left leading-tight">
              <span className="text-[9px] text-blue-100 uppercase font-black block">Live Chat Admin</span>
              <span className="text-[11px] font-black">Telegram Admin ID</span>
            </div>
          </a>

          {/* Telegram Channel */}
          <a
            href={telegramChannelLink}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <ExternalLink className="w-4 h-4 text-blue-400" />
            <div className="text-left leading-tight">
              <span className="text-[9px] text-neutral-400 uppercase font-black block">Official Updates</span>
              <span className="text-[11px] font-black">Telegram Channel</span>
            </div>
          </a>
        </div>

        {/* Chat Messages */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'model' && (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-black/60 border border-neutral-800 text-neutral-200 shadow-sm'
              }`}>
                {m.text}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5 items-center">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-black/60 border border-neutral-800 text-neutral-400 text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-400" />
                Felco Support is typing...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-3.5 bg-[#060a12] border-t border-neutral-800">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text" 
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="আপনার প্রশ্ন বা সমস্যা এখানে লিখুন..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center shadow cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
