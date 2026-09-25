import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CustomerServiceModal } from './components/CustomerServiceModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { Home } from './pages/Home';
import { GameSelect } from './pages/GameSelect';
import { PaymentMethod } from './pages/PaymentMethod';
import { OrderDetails } from './pages/OrderDetails';
import { OrderSuccess } from './pages/OrderSuccess';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';
import { AdminOrders } from './pages/AdminOrders';
import { AdminPaymentSettings } from './pages/AdminPaymentSettings';
import { AdminCustomerService } from './pages/AdminCustomerService';
import { AdminCoupons } from './pages/AdminCoupons';
import { OrderDraft, Order, StoreSettings } from './types';
import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Headphones } from 'lucide-react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname || '/');
  const [orderDraft, setOrderDraft] = useState<OrderDraft>({});
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('store_theme') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('store_theme', newTheme);
  };

  const defaultSettings: StoreSettings = {
    storeName: 'TEAM FELCO STORE',
    supportWhatsApp: '01613562615',
    supportTelegram: 'https://t.me/+NRQwX88nKUQxYWY1',
    supportText: '24/7 Professional Support for all verified orders and tool activations.',
    businessHours: 'Monday - Sunday: 24 Hours Active',
    bkashNumber: '01613562615',
    nagadNumber: '01613562615',
    rocketNumber: '01613562615',
    paymentInstructions: 'Send money to our personal merchant number via Send Money. Save your TrxID and screenshot.'
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    fetchGlobalSettings();

    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error('Anonymous sign-in failed:', err);
        }
      }
      
      const isBypassed = localStorage.getItem('admin_bypassed') === 'true';
      setIsAdminAuthenticated(!!user || isBypassed);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchGlobalSettings = async () => {
    setGlobalLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'general'));
      if (docSnap.exists()) {
        setSettings(docSnap.data() as StoreSettings);
      } else {
        setSettings(defaultSettings);
      }
    } catch (err) {
      setSettings(defaultSettings);
    } finally {
      setGlobalLoading(false);
    }
  };

  const navigate = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  // Check admin route protection
  const isAdminRoute = currentRoute.startsWith('/admin');
  const isSecretPortal = currentRoute === '/tf-admin-secure-portal';
  
  if (isAdminRoute && !isAdminAuthenticated && !authChecking) {
    navigate('/tf-admin-secure-portal');
  }

  // Render correct page
  const renderPage = () => {
    switch (currentRoute) {
      case '/':
        return (
          <Home 
            navigate={navigate} 
            setOrderDraft={setOrderDraft} 
            onOpenCustomerService={() => setIsCustomerServiceOpen(true)} 
            onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
            theme={theme}
            settings={settings}
            setGlobalLoading={setGlobalLoading}
          />
        );
      case '/order/game':
        return <GameSelect orderDraft={orderDraft} setOrderDraft={setOrderDraft} navigate={navigate} />;
      case '/order/payment':
        return <PaymentMethod orderDraft={orderDraft} setOrderDraft={setOrderDraft} navigate={navigate} />;
      case '/order/details':
        return <OrderDetails orderDraft={orderDraft} navigate={navigate} setCompletedOrder={setCompletedOrder} />;
      case '/order/success':
        return <OrderSuccess completedOrder={completedOrder} navigate={navigate} onOpenCustomerService={() => setIsCustomerServiceOpen(true)} />;
      case '/tf-admin-secure-portal':
        return <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} navigate={navigate} />;
      case '/admin/dashboard':
        return <AdminDashboard currentRoute={currentRoute} navigate={navigate} />;
      case '/admin/products':
        return <AdminProducts currentRoute={currentRoute} navigate={navigate} />;
      case '/admin/orders':
        return <AdminOrders currentRoute={currentRoute} navigate={navigate} />;
      case '/admin/payment-settings':
        return <AdminPaymentSettings currentRoute={currentRoute} navigate={navigate} />;
      case '/admin/customer-service':
        return <AdminCustomerService currentRoute={currentRoute} navigate={navigate} />;
      case '/admin/coupons':
        return <AdminCoupons currentRoute={currentRoute} navigate={navigate} />;
      default:
        return (
          <Home 
            navigate={navigate} 
            setOrderDraft={setOrderDraft} 
            onOpenCustomerService={() => setIsCustomerServiceOpen(true)} 
            onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
            theme={theme}
            settings={settings}
            setGlobalLoading={setGlobalLoading}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-white selection:text-black transition-colors duration-300 ${
      theme === 'light' ? 'bg-slate-100 text-neutral-900' : 'bg-[#0a0a0c] text-white'
    }`}>
      {!isAdminRoute && (
        <Navbar 
          currentRoute={currentRoute} 
          navigate={navigate} 
          onOpenCustomerService={() => setIsCustomerServiceOpen(true)} 
          onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}

      {renderPage()}

      {!isAdminRoute && (
        <>
          <Footer navigate={navigate} settings={settings} />

          {/* Floating Quick Social & Customer Service Dock on Screen */}
          <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
            <button
              onClick={() => setIsCustomerServiceOpen(true)}
              className="bg-white text-black px-3.5 py-2.5 rounded-xl shadow-2xl font-black uppercase text-xs tracking-wider flex items-center gap-2 hover:bg-neutral-200 hover:scale-105 transition-all group border border-neutral-300"
              title="Customer Service"
            >
              <div className="w-5 h-5 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                <Headphones className="w-3 h-3" />
              </div>
              <span className="font-extrabold text-[11px]">Customer Service</span>
            </button>

            {/* Compact Social Icons Row */}
            <div className="flex items-center gap-1.5 bg-neutral-950/80 backdrop-blur-md p-1.5 rounded-xl border border-neutral-800 shadow-xl">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${settings?.supportWhatsApp?.replace(/[^0-9]/g, '') || "8801613562615"}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[#25D366] text-black flex items-center justify-center shadow hover:scale-110 transition-transform group relative"
                title="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>

              {/* Telegram */}
              <a
                href={settings?.supportTelegram || "https://t.me/+NRQwX88nKUQxYWY1"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[#229ED9] text-white flex items-center justify-center shadow hover:scale-110 transition-transform group relative"
                title="Telegram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.05-.78 4.11-1.79 6.85-2.97 8.23-3.54 3.91-1.63 4.72-1.91 5.25-1.92.12 0 .38.03.55.17.14.12.18.28.2.4-.02.07-.02.24-.04.38z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href={settings?.youtubeUrl || "https://youtube.com/@teamfelco_78?si=y8LNiJ9C1MUsNA9Z"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[#FF0000] text-white flex items-center justify-center shadow hover:scale-110 transition-transform group relative"
                title="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Facebook Page */}
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shadow hover:scale-110 transition-transform group relative"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          <CustomerServiceModal 
            isOpen={isCustomerServiceOpen}
            onClose={() => setIsCustomerServiceOpen(false)}
            settings={settings}
          />

          <OrderTrackerModal
            isOpen={isOrderTrackerOpen}
            onClose={() => setIsOrderTrackerOpen(false)}
          />
        </>
      )}

      {/* Global loading spinner overlay */}
      {globalLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050508] text-white select-none pointer-events-auto transition-opacity duration-150">
          <div className="flex flex-col items-center space-y-4">
            {/* Ultra-Fast Neon Equalizer Frequency Wave */}
            <div className="flex items-end justify-center gap-1.5 h-10">
              <div className="w-1.5 bg-emerald-500 rounded-full animate-bounce h-6 [animation-duration:0.4s]"></div>
              <div className="w-1.5 bg-emerald-400 rounded-full animate-bounce h-9 [animation-duration:0.3s] shadow-[0_0_10px_rgba(52,211,153,0.7)]"></div>
              <div className="w-1.5 bg-emerald-500 rounded-full animate-bounce h-5 [animation-duration:0.5s]"></div>
              <div className="w-1.5 bg-emerald-400 rounded-full animate-bounce h-8 [animation-duration:0.35s] shadow-[0_0_10px_rgba(52,211,153,0.7)]"></div>
              <div className="w-1.5 bg-emerald-500 rounded-full animate-bounce h-6 [animation-duration:0.45s]"></div>
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]">TEAM FELCO</h3>
              <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Loading...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
