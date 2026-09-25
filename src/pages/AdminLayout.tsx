import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, CreditCard, Headphones, Settings as SettingsIcon, LogOut, Shield, Percent } from 'lucide-react';
import { auth } from '../firebase';

interface AdminLayoutProps {
  currentRoute: string;
  navigate: (route: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentRoute, navigate, children }) => {
  const handleLogout = async () => {
    await auth.signOut();
    navigate('/tf-admin-secure-portal');
  };

  const navItems = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', route: '/admin/products', icon: Package },
    { label: 'Orders', route: '/admin/orders', icon: ShoppingCart },
    { label: 'Coupons', route: '/admin/coupons', icon: Percent },
    { label: 'Payment Settings', route: '/admin/payment-settings', icon: CreditCard },
    { label: 'Customer Service', route: '/admin/customer-service', icon: Headphones },
  ];

  return (
    <div className="min-h-screen md:h-screen bg-black text-white flex flex-col md:flex-row md:overflow-hidden overflow-y-auto">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-neutral-950 border-r border-neutral-900 flex flex-col justify-between p-6 shrink-0 md:overflow-y-auto">
        <div>
          <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-neutral-900">
            <div className="w-9 h-9 bg-white text-black flex items-center justify-center font-black rounded-lg">
              TF
            </div>
            <div>
              <span className="font-black tracking-widest text-sm block">FELCO ADMIN</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Management Portal</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => navigate(item.route)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${isActive ? 'bg-white text-black shadow-lg' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-neutral-900 mt-6">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors mb-2"
          >
            <Shield className="w-4 h-4" />
            <span>View Live Store</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-black p-4 sm:p-10 overflow-y-auto h-auto md:h-full">
        {children}
      </main>
    </div>
  );
};
