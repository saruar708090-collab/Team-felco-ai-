import React, { useState } from 'react';
import { Menu, X, Headphones, Sun, Moon, Shield } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenCustomerService: () => void;
  onOpenOrderTracker: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentRoute, 
  navigate, 
  onOpenCustomerService, 
  onOpenOrderTracker,
  theme,
  toggleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0d0d10] text-white border-b border-neutral-800/85 backdrop-blur-md bg-opacity-95 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => navigate('/')} 
          className="cursor-pointer flex items-center space-x-2 group"
        >
          <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-black text-xs rounded shadow">
            TF
          </div>
          <div>
            <span className="font-black tracking-wider text-xs sm:text-sm block">TEAM FELCO</span>
            <span className="text-[8px] uppercase tracking-widest text-emerald-400 block font-bold">Official Store</span>
          </div>
        </div>

        {/* Desktop Navigation & Separate Socials with Logos */}
        <div className="hidden md:flex items-center space-x-4">
          <button 
            onClick={() => navigate('/')}
            className={`text-xs uppercase font-extrabold tracking-wider transition-colors hover:text-white ${currentRoute === '/' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-0.5' : 'text-neutral-400'}`}
          >
            Home
          </button>

          {/* Track Order Button */}
          <button 
            onClick={onOpenOrderTracker}
            className="bg-neutral-900 border border-neutral-800 hover:border-neutral-600 px-3 py-1.5 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-colors text-white flex items-center gap-1.5 shadow"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Track Order
          </button>

          {/* Customer Service (Separate) */}
          <button 
            onClick={onOpenCustomerService}
            className="bg-neutral-900 border border-neutral-800 hover:border-neutral-600 px-3 py-1.5 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-colors text-white flex items-center gap-1.5 shadow"
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-400" />
            Customer Service
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 flex items-center justify-center text-amber-400 transition-all shadow"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>



          <div className="h-4 w-[1px] bg-neutral-800"></div>

          {/* WhatsApp, Telegram, YouTube separate icon buttons */}
          <div className="flex items-center space-x-2">
            {/* WhatsApp */}
            <a 
              href="https://wa.me/8801613562615" 
              target="_blank" 
              rel="noreferrer"
              title="WhatsApp Support"
              className="w-7 h-7 rounded-lg bg-[#25D366] text-black flex items-center justify-center hover:scale-110 transition-transform shadow"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </a>

            {/* Telegram */}
            <a 
              href="https://t.me/+NRQwX88nKUQxYWY1" 
              target="_blank" 
              rel="noreferrer"
              title="Telegram Support"
              className="w-7 h-7 rounded-lg bg-[#229ED9] text-white flex items-center justify-center hover:scale-110 transition-transform shadow"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.05-.78 4.11-1.79 6.85-2.97 8.23-3.54 3.91-1.63 4.72-1.91 5.25-1.92.12 0 .38.03.55.17.14.12.18.28.2.4-.02.07-.02.24-.04.38z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a 
              href="https://youtube.com/@teamfelco_78?si=y8LNiJ9C1MUsNA9Z" 
              target="_blank" 
              rel="noreferrer"
              title="YouTube Channel"
              className="w-7 h-7 rounded-lg bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 transition-transform shadow"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Mobile menu button & Theme toggle */}
        <div className="flex items-center md:hidden space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-amber-400 bg-neutral-900 rounded-lg border border-neutral-800"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-neutral-300 hover:text-white bg-neutral-900 rounded-lg border border-neutral-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0c] border-b border-neutral-800 px-4 py-3 space-y-2 shadow-2xl">
          <button 
            onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-neutral-300 hover:bg-neutral-900 hover:text-white"
          >
            Home Store
          </button>

          <button 
            onClick={() => { onOpenOrderTracker(); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-neutral-900 text-white border border-neutral-800"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Track Order Status
          </button>
          
          <button 
            onClick={() => { onOpenCustomerService(); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-neutral-900 text-white border border-neutral-800"
          >
            <Headphones className="w-4 h-4 text-emerald-400" />
            Customer Service Chat
          </button>


        </div>
      )}
    </header>
  );
};
