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
import { AdminUsers } from './pages/AdminUsers';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { NotificationModal } from './components/NotificationModal';
import { AuthModal } from './components/AuthModal';
import { AccountProfileModal } from './components/AccountProfileModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AuthPage } from './pages/AuthPage';
import { OrderDraft, Order, StoreSettings } from './types';
import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Headphones, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname || '/');
  const [orderDraft, setOrderDraft] = useState<OrderDraft>({});
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isOrderHistoryModalOpen, setIsOrderHistoryModalOpen] = useState(false);
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

  const isMaintenanceMode = settings?.maintenanceMode && !isAdminRoute && !isSecretPortal;

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
      case '/admin/users':
        return <AdminUsers currentRoute={currentRoute} navigate={navigate} />;
      case '/login':
        return <AuthPage initialMode="login" navigate={navigate} theme={theme} settings={settings} />;
      case '/register':
        return <AuthPage initialMode="register" navigate={navigate} theme={theme} settings={settings} />;
      case '/auth':
        return <AuthPage initialMode="login" navigate={navigate} theme={theme} settings={settings} />;
      case '/orders':
      case '/order-history':
      case '/my-orders':
        return (
          <>
            <Home 
              navigate={navigate} 
              setOrderDraft={setOrderDraft} 
              onOpenCustomerService={() => setIsCustomerServiceOpen(true)} 
              onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
              theme={theme}
              settings={settings}
              setGlobalLoading={setGlobalLoading}
            />
            <OrderHistoryModal
              isOpen={true}
              onClose={() => navigate('/')}
              onOpenAuth={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
            />
          </>
        );
      case '/account':
      case '/profile':
        return (
          <>
            <Home 
              navigate={navigate} 
              setOrderDraft={setOrderDraft} 
              onOpenCustomerService={() => setIsCustomerServiceOpen(true)} 
              onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
              theme={theme}
              settings={settings}
              setGlobalLoading={setGlobalLoading}
            />
            <AccountProfileModal
              isOpen={true}
              onClose={() => navigate('/')}
              onOpenOrderHistory={() => {
                navigate('/order-history');
              }}
              onOpenAuth={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
            />
          </>
        );
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
      {isMaintenanceMode ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#070709] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-6 max-w-md">
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto shadow-2xl shadow-red-500/10 animate-pulse">
              <ShieldAlert className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white">
                Under Maintenance
              </h1>
              <div className="h-1 w-20 bg-red-600 mx-auto rounded-full" />
            </div>

            <p className="text-sm sm:text-base text-neutral-400 font-medium leading-relaxed bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
              {settings?.maintenanceMessage || 'We are currently updating our systems to provide a better experience. We will be back online shortly!'}
            </p>

            <div className="flex flex-col gap-3 pt-4">
              <p className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Need urgent support?</p>
              <div className="flex items-center justify-center gap-4">
                <a 
                  href={settings?.supportTelegram || 'https://t.me'} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all"
                >
                  Telegram
                </a>
                <a 
                  href={settings?.supportWhatsApp ? `https://wa.me/${settings.supportWhatsApp.replace(/[^0-9]/g, '')}` : '#'} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl text-xs font-black uppercase tracking-wider text-[#25D366] transition-all"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {!isAdminRoute && (
        <Navbar 
          currentRoute={currentRoute} 
          navigate={navigate} 
          onOpenCustomerService={() => setIsCustomerServiceOpen(true)} 
          onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenAccount={() => setIsAccountModalOpen(true)}
          onOpenOrderHistory={() => setIsOrderHistoryModalOpen(true)}
          onOpenAuth={(mode?: 'login' | 'register') => {
            setAuthModalMode(mode || 'login');
            setIsAuthModalOpen(true);
          }}
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

          {/* Customer Auth Modal (Login / Register) */}
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            defaultMode={authModalMode}
            onSuccess={() => setIsAuthModalOpen(false)}
            settings={settings}
          />

          {/* Customer Account Profile Modal */}
          <AccountProfileModal
            isOpen={isAccountModalOpen}
            onClose={() => setIsAccountModalOpen(false)}
            onOpenOrderHistory={() => {
              setIsAccountModalOpen(false);
              setIsOrderHistoryModalOpen(true);
            }}
            onOpenAuth={() => {
              setIsAccountModalOpen(false);
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
          />

          {/* Customer Order History Modal (ODER History) */}
          <OrderHistoryModal
            isOpen={isOrderHistoryModalOpen}
            onClose={() => setIsOrderHistoryModalOpen(false)}
            onOpenAuth={() => {
              setIsOrderHistoryModalOpen(false);
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
          />

          {/* ULTRA-PREMIUM ENTRY NOTICE POPUP MODAL */}
          {!isSecretPortal && !globalLoading && !isPopupDismissed && settings?.popupNoticeActive && (settings?.popupNoticeImage || settings?.popupNoticeText || settings?.popupNoticeTitle) && (
            <div
              onClick={() => setIsPopupDismissed(true)}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-modal-backdrop"
            >
              <div
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-[440px] rounded-[40px] overflow-hidden border border-white/10 bg-[#070709] text-white shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] animate-spring-modal"
              >
                {/* Visual Accent Top Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 shrink-0" />

                {/* Instant Close (X) Button - Minimalist Style */}
                <button
                  type="button"
                  onClick={() => setIsPopupDismissed(true)}
                  className="absolute top-5 right-5 z-30 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer backdrop-blur-md border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Banner Photo with Inner Shadow & Overlay */}
                {settings.popupNoticeImage && (
                  <div className="w-full relative shrink-0 aspect-[16/10] overflow-hidden">
                    <img
                      src={settings.popupNoticeImage}
                      alt="Notice"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-transparent opacity-80" />
                    <div className="absolute inset-0 shadow-[inset_0_-20px_40px_rgba(7,7,9,0.8)]" />
                  </div>
                )}

                {/* Content Container */}
                <div className={`p-8 sm:p-10 space-y-6 overflow-y-auto flex-1 ${!settings.popupNoticeImage ? 'pt-12' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">
                        OFFICIAL NOTICE
                      </span>
                    </div>
                    
                    {settings.popupNoticeTitle && (
                      <h2 className="text-xl sm:text-2xl font-black uppercase text-center text-white tracking-tight leading-[1.1]">
                        {settings.popupNoticeTitle}
                      </h2>
                    )}
                  </div>

                  {settings.popupNoticeText && (
                    <div className="relative">
                      <p className="text-xs sm:text-[13px] text-neutral-400 font-medium leading-relaxed whitespace-pre-line text-center px-2">
                        {settings.popupNoticeText}
                      </p>
                    </div>
                  )}

                  {/* Dynamic Action Button - Ultra Premium Design */}
                  <div className="pt-2">
                    {settings.popupNoticeButtonLink ? (
                      <a
                        href={settings.popupNoticeButtonLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setIsPopupDismissed(true)}
                        className="group relative w-full py-4 bg-white text-black font-black text-xs sm:text-sm uppercase tracking-widest rounded-[20px] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10">{settings.popupNoticeButtonText || 'GET STARTED'}</span>
                        <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsPopupDismissed(true)}
                        className="group relative w-full py-4 bg-white text-black font-black text-xs sm:text-sm uppercase tracking-widest rounded-[20px] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 overflow-hidden cursor-pointer"
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10">{settings.popupNoticeButtonText || 'CONTINUE TO STORE'}</span>
                        <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => setIsPopupDismissed(true)}
                      className="w-full mt-4 text-[10px] font-bold text-neutral-600 hover:text-neutral-400 uppercase tracking-widest transition-colors"
                    >
                      Dismiss Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Sales & Customer Order Activity Notifications */}
          <LiveSalesActivity />
        </>
      )}
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
