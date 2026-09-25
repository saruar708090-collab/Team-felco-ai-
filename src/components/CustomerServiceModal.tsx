import React, { useState } from 'react';
import { X, Bot, User, Sparkles, Send, Headphones } from 'lucide-react';
import { StoreSettings } from '../types';

interface CustomerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings | null;
}

export const CustomerServiceModal: React.FC<CustomerServiceModalProps> = ({ isOpen, onClose, settings }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: 'আসসালামু আলাইকুম! Team Felco Store কাস্টমার সার্ভিসে আপনাকে স্বাগতম। কালার ট্রেডিং টুল, এভিয়েটর টুল বা পেমেন্ট সংক্রান্ত যেকোনো সহায়তায় আমাদের এআই অ্যাসিস্ট্যান্টকে প্রশ্ন করুন।' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
      reply = 'আমাদের অফিশিয়াল বিকাশ, নগদ বা রকেট পার্সোনাল মার্চেন্ট নাম্বারে সেন্ড মানি করে TrxID ও স্ক্রিনশট সাবমিট করুন।';
    } else if (lower.includes('how') || lower.includes('buy') || lower.includes('কিভাবে') || lower.includes('কিনব')) {
      reply = 'হোমপেজ থেকে আপনার পছন্দের টুল সিলেক্ট করুন এবং পেমেন্ট সম্পন্ন করে অর্ডার কনফার্ম করুন।';
    } else if (lower.includes('time') || lower.includes('সময়') || lower.includes('কতক্ষণ')) {
      reply = 'অর্ডার করার পর সাধারণত ১০ থেকে ৩০ মিনিটের মধ্যে টুল অ্যাক্টিভ করে দেওয়া হয়।';
    } else if (lower.includes('game') || lower.includes('গেম') || lower.includes('hgnice') || lower.includes('dkwin') || lower.includes('bdwin')) {
      reply = 'আমাদের টুলগুলো HGNICE, DKWIN, BDWIN, 1X BET এবং CK444 গেমে সম্পূর্ণ সাপোর্ট করে।';
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
      } catch (err) {
        reply = 'আপনার প্রশ্নের জন্য ধন্যবাদ! বিস্তারিত জানতে আমাদের অফিসিয়াল WhatsApp, Telegram অথবা YouTube চ্যানেলে যোগাযোগ করুন।';
      }
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0b0e] border border-neutral-800 text-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Header */}
        <div className="bg-[#060608] border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-white text-black flex items-center justify-center font-black rounded-xl shadow">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black tracking-wider text-sm sm:text-base flex items-center gap-2">
                CUSTOMER SERVICE
                <span className="bg-emerald-400 text-black text-[9px] px-1.5 py-0.5 rounded font-black">24/7 Live</span>
              </h3>
              <p className="text-[11px] text-neutral-400">Team Felco Store Support Assistant</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 mb-2">
            <p className="text-xs text-neutral-300">
              আমাদের কাস্টমার সাপোর্ট এআই চ্যাটের মাধ্যমে আপনি যেকোনো সময় সাহায্য পেতে পারেন। সরাসরি সোশ্যাল যোগাযোগের জন্য ফুটার বা নেভবার থেকে WhatsApp, Telegram ও YouTube সিলেক্ট করুন।
            </p>
          </div>

          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'model' && (
                <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shrink-0 font-bold text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`p-3 rounded-xl text-xs leading-relaxed max-w-[85%] ${m.role === 'user' ? 'bg-white text-black font-medium' : 'bg-neutral-950 border border-neutral-800 text-neutral-200'}`}>
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
              <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shrink-0 font-bold text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                Felco Support is typing...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 bg-[#060608] border-t border-neutral-800">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text" 
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="আপনার প্রশ্ন বা সমস্যা এখানে লিখুন..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
            />
            <button 
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-white text-black px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
