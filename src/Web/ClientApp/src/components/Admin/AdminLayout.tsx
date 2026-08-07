import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Grid2X2, MonitorSmartphone, Package, FileBarChart, LogOut, User } from 'lucide-react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useAuthStore } from '../../store/useAuthStore';
import { RealtimeProvider } from './RealtimeProvider';
import PcPosModal from './PcPosModal';

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === 'admin';

  const links = [
    { name: 'داشبورد (سفارشات)', path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, active: true },
    { name: 'وضعیت میزها', path: '/admin/tables', icon: <Grid2X2 size={20} />, active: isAdmin },
    { name: 'صندوق (POS)', path: '/admin/pos', icon: <MonitorSmartphone size={20} />, active: true },
    { name: 'انبار و منو', path: '/admin/inventory', icon: <Package size={20} />, active: true },
    { name: 'سفارشات پرداخت نشده', path: '/admin/unpaid-orders', icon: <FileBarChart size={20} />, active: true },
    { name: 'گزارشات', path: '/admin/reports', icon: <FileBarChart size={20} />, active: isAdmin },
    { name: 'پروفایل', path: '/admin/profile', icon: <User size={20} />, active: true },
  ].filter(l => l.active);

  return (
    <RealtimeProvider>
      <div className="min-h-screen bg-[#f3f4f6] text-gray-900 flex flex-col md:flex-row rtl print:min-h-auto print:bg-white print:block">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-s border-gray-200 flex flex-col shrink-0 print:hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-center">
          <span className="font-black text-2xl text-[#0f3229]">مدیریت کافه</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {links.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-[#0f3229] text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                {link.icon}
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
              <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 transition-colors">
                <LogOut size={20} />
                <span className="font-medium">خروج از حساب کاربری</span>
              </button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-[100] dialog-overlay" />
              <AlertDialog.Content 
                className="fixed bg-white rounded-xl shadow-xl p-6 w-[90vw] max-w-md z-[101] dialog-content rtl"
              >
                <AlertDialog.Title className="text-xl font-bold text-gray-900 mb-2">خروج از حساب کاربری</AlertDialog.Title>
                <AlertDialog.Description className="text-gray-500 mb-6 font-medium">
                  آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
                </AlertDialog.Description>
                <div className="flex gap-3 justify-end">
                  <AlertDialog.Cancel asChild>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors">
                      انصراف
                    </button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <button 
                      onClick={logout}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      خروج
                    </button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-screen relative bg-gray-50 print:overflow-visible print:h-auto print:block print:bg-white">
        <Outlet />
      </main>
      <PcPosModal />
    </div>
    </RealtimeProvider>
  );
}
