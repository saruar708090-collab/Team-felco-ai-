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
                <span>{settings?.storeName || 'TEAM FELCO'} SUPPORT</span>
                <span className="bg-emerald-500 text-black text-[9px] px-2 py-0.5 rounded-full font-black">24/7 Live</span>
              </h3>
              <p className="text-[11px] text-neutral-400">{settings?.businessHours || 'Team Felco Official Support Center'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Support Direct Action Buttons Strip */}
        <div className="bg-neutral-950 p-2.5 border-b border-neutral-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* WhatsApp Direct Chat */}
          {settings?.supportWhatsApp && (
            <a
              href={`https://wa.me/${settings.supportWhatsApp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-black rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <div className="text-left leading-tight truncate">
                <span className="text-[9px] uppercase font-black block">WhatsApp</span>
                <span className="text-[11px] font-black">Live Chat</span>
              </div>
            </a>
          )}

          {/* Direct Telegram Admin ID */}
          <a
            href={telegramAdminLink}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-gradient-to-r from-[#0088cc] to-[#0077b5] hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <SendHorizontal className="w-4 h-4 shrink-0" />
            <div className="text-left leading-tight truncate">
              <span className="text-[9px] text-blue-100 uppercase font-black block">Telegram Admin</span>
              <span className="text-[11px] font-black">Direct Chat</span>
            </div>
          </a>

          {/* Telegram Channel */}
          <a
            href={telegramChannelLink}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <ExternalLink className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="text-left leading-tight truncate">
              <span className="text-[9px] text-neutral-400 uppercase font-black block">Official Group</span>
              <span className="text-[11px] font-black">Channel</span>
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
