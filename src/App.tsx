import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CustomerServiceModal } from './components/CustomerServiceModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { LiveSalesActivity } from './components/LiveSalesActivity';
import { Home } from './pages/Home';
import { GameSelect } from './pages/GameSelect';
import { PaymentMethod } from './pages/PaymentMethod';
import { OrderDetails } from './pages/OrderDetails';
import { OrderSuccess } from './pages/OrderSuccess';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';
import { AdminOrders } from './pages/AdminOrders';
import { AdminNotifications } from './pages/AdminNotifications';
import { AdminPaymentSettings } from './pages/AdminPaymentSettings';
import { AdminCustomerService } from './pages/AdminCustomerService';
import { AdminCoupons } from './pages/AdminCoupons';
import { AdminGames } from './pages/AdminGames';
import { AdminSiteCustomizer } from './pages/AdminSiteCustomizer';
import { AdminReviews } from './pages/AdminReviews';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { NotificationModal } from './components/NotificationModal';
import { OrderDraft, Order, StoreSettings } from './types';
import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Headphones, X } from 'lucide-react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname || '/');
  const [orderDraft, setOrderDraft] = useState<OrderDraft>({});
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [isPopupDismissed, setIsPopupDismissed] = useState(false);
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
        } catch {
          // Ignore anonymous sign-in failure when offline or disabled
        }
      }
      
      const isBypassed = localStorage.getItem('admin_bypassed') === 'true';
      setIsAdminAuthenticated(!!user || isBypassed);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchGlobalSettings = async () => {
    try {
      const cached = localStorage.getItem('tf_cached_settings');
      if (cached) {
        setSettings(JSON.parse(cached));
        setGlobalLoading(false);
      }
    } catch {
      // Ignore cache read error
    }

    const timeoutId = setTimeout(() => {
      setSettings(prev => prev || defaultSettings);
      setGlobalLoading(false);
    }, 3000);

    try {
      const docSnap = await getDoc(doc(db, 'settings', 'general'));
      if (docSnap.exists()) {
        const freshSettings = docSnap.data() as StoreSettings;
        setSettings(freshSettings);
        try {
          localStorage.setItem('tf_cached_settings', JSON.stringify(freshSettings));
        } catch {
          // Ignore storage quota error
        }
      } else {
        setSettings(prev => prev || defaultSettings);
      }
    } catch {
      setSettings(prev => prev || defaultSettings);
    } finally {
      clearTimeout(timeoutId);
      setGlobalLoading(false);
    }
  };

  const navigate = (route: string) => {
    if (currentRoute.startsWith('/admin') && route === '/') {
      fetchGlobalSettings();
      setIsPopupDismissed(false);
    }
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
    if (currentRoute.startsWith('/product/')) {
      const productId = currentRoute.replace('/product/', '').split('?')[0];
      return (
        <ProductDetailsPage
          productId={productId}
          navigate={navigate}
          setOrderDraft={setOrderDraft}
          theme={theme}
          settings={settings}
          onBack={() => navigate('/')}
        />
      );
    }

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
        return <GameSelect orderDraft={orderDraft} setOrderDraft={setOrderDraft} navigate={navigate} theme={theme} settings={settings} />;
      case '/order/payment':
        return <PaymentMethod orderDraft={orderDraft} setOrderDraft={setOrderDraft} navigate={navigate} theme={theme} settings={settings} />;
      case '/order/details':
        return <OrderDetails orderDraft={orderDraft} navigate={navigate} setCompletedOrder={setCompletedOrder} theme={theme} settings={settings} />;
      case '/order/success':
        return <OrderSuccess completedOrder={completedOrder} navigate={navigate} onOpenCustomerService={() => setIsCustomerServiceOpen(true)} theme={theme} settings={settings} />;
      case '/tf-admin-secure-portal':
        return <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} navigate={navigate} />;
      case '/admin/dashboard':
        return <AdminDashboard currentRoute={currentRoute} navigate={navigate} />;
      case '/admin/products':
        return <AdminProducts currentRoute={currentRoute} navigate={navigate} />;
      case '/admin/games':
        return <AdminGames currentRoute={currentRoute} navigate={navigate} />;
      case '/admin/orders':
        return <AdminOrders currentRoute={currentRoute} navigate={navigate} />;
      case '/admin/notifications':
        return <AdminNotifications currentRoute={currentRoute} navigate={navigate} />;
      case '/admin/payment-settings':
        return <AdminPaymentSettings currentRoute={currentRoute} navigate={navigate} />;
      case '/admin/site-customizer':
        return <AdminSiteCustomizer currentRoute={currentRoute} navigate={navigate} />;
      case '/admin/customer-service':
        return <AdminCustomerService currentRoute={currentRoute} navigate={navigate} />;
      case '/admin/coupons':
        return <AdminCoupons currentRoute={currentRoute} navigate={navigate} />;
      case '/admin/reviews':
        return <AdminReviews currentRoute={currentRoute} navigate={navigate} />;
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
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
          settings={settings}
        />
      )}

      {renderPage()}

      {!isAdminRoute && (
        <>
          <Footer navigate={navigate} settings={settings} />

          {/* Floating Quick Social & Customer Service Dock on Screen */}
          <div className="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end gap-2">
            <button
              onClick={() => setIsCustomerServiceOpen(true)}
              className="bg-white hover:bg-neutral-100 text-black px-3 py-1.5 rounded-xl shadow-2xl font-black uppercase text-[10px] sm:text-[11px] tracking-wider flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all group border border-neutral-300 cursor-pointer"
              title="Customer Service"
            >
              <div className="w-4 h-4 rounded-md bg-black text-white flex items-center justify-center shrink-0">
                <Headphones className="w-2.5 h-2.5" />
              </div>
              <span className="font-extrabold">CUSTOMER SERVICE</span>
            </button>

            {/* Prominent Social Icons Row (Telegram Direct Admin ID & YouTube) */}
            <div className="flex items-center gap-2 bg-neutral-950/90 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-800 shadow-2xl">
              {/* Telegram Direct Admin ID */}
              <a
                href={settings?.telegramSupportUsername?.startsWith('http') ? settings.telegramSupportUsername : `https://t.me/${settings?.telegramSupportUsername?.replace('@', '') || settings?.supportTelegram?.replace('@', '') || 'TeamFelcoAdmin'}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#0088cc] to-[#29b6f6] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform group relative"
                title="Telegram Direct Admin"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.05-.78 4.11-1.79 6.85-2.97 8.23-3.54 3.91-1.63 4.72-1.91 5.25-1.92.12 0 .38.03.55.17.14.12.18.28.2.4-.02.07-.02.24-.04.38z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href={settings?.youtubeUrl || "https://youtube.com/@teamfelco_78?si=y8LNiJ9C1MUsNA9Z"}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FF0000] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform group relative"
                title="YouTube"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
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

          <NotificationModal
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            navigate={navigate}
            onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
          />

          {/* ULTRA-PREMIUM ENTRY NOTICE POPUP MODAL */}
          {!isSecretPortal && !globalLoading && !isPopupDismissed && settings?.popupNoticeActive && (settings?.popupNoticeImage || settings?.popupNoticeText || settings?.popupNoticeTitle) && (
            <div
              onClick={() => setIsPopupDismissed(true)}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-modal-backdrop"
            >
              <div
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-md rounded-[28px] overflow-hidden border-2 border-blue-500/40 bg-gradient-to-b from-[#0f172a] via-[#0b0f19] to-[#06080F] text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col max-h-[90vh] animate-spring-modal"
              >
                {/* Instant Close (X) Button */}
                <button
                  type="button"
                  onClick={() => setIsPopupDismissed(true)}
                  aria-label="Close notice"
                  className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 flex items-center justify-center shadow-lg transition-transform active:scale-90 hover:scale-105 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Banner Photo */}
                {settings.popupNoticeImage && (
                  <div className="w-full bg-black relative shrink-0 max-h-[48vh] overflow-hidden flex items-center justify-center border-b border-neutral-800">
                    <img
                      src={settings.popupNoticeImage}
                      alt="Notice"
                      className="w-full h-full object-cover max-h-[48vh]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60 pointer-events-none" />
                  </div>
                )}

                {/* Content Container */}
                <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
                  {settings.popupNoticeTitle && (
                    <div className="text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full inline-block mb-1.5">
                        OFFICIAL ANNOUNCEMENT
                      </span>
                      <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wide leading-snug">
                        {settings.popupNoticeTitle}
                      </h2>
                    </div>
                  )}

                  {settings.popupNoticeText && (
                    <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed whitespace-pre-line text-center">
                      {settings.popupNoticeText}
                    </p>
                  )}

                  {/* Customizable Action Button */}
                  {settings.popupNoticeButtonLink ? (
                    <a
                      href={settings.popupNoticeButtonLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setIsPopupDismissed(true)}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <span>{settings.popupNoticeButtonText || 'Join Telegram Channel'}</span>
                      <span className="text-sm">→</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsPopupDismissed(true)}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <span>{settings.popupNoticeButtonText || 'Continue to Store'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Live Sales & Customer Order Activity Notifications */}
          <LiveSalesActivity />
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
