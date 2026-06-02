import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '../store/useAuthStore';
import { LogIn, AtSign, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, users } = useAuthStore();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock API call to .NET Core backend
      await new Promise(resolve => setTimeout(resolve, 800));

      // Quick mock logic: username == admin vs barista
      const role: UserRole = username.toLowerCase().includes('barista') ? 'barista' : 'admin';
      
      const user = users.find(u => u.role === role) || users[0];

      if (!user) {
         throw new Error('User not found');
      }

      setAuth(`mock-jwt-token-${Date.now()}`, user);
      toast.success('ورود با موفقیت انجام شد');
      navigate(from, { replace: true });

    } catch (error) {
      toast.error('نام کاربری یا رمز عبور اشتباه است');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) {
      setAuth(`mock-jwt-token-${role}-${Date.now()}`, user);
      toast.success(`ورود سریع به عنوان ${role === 'admin' ? 'مدیریت' : 'باریستا'}`);
      navigate('/admin/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f3229] flex flex-col items-center justify-center p-4 sm:p-8 rtl" dir="rtl">
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0f3229]/10 text-[#0f3229] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">ورود به پنل مدیریت</h1>
            <p className="text-gray-500 mt-2 font-medium">لطفاً اطلاعات کاربری خود را وارد کنید</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نام کاربری</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 pr-11 pl-4 focus:outline-none focus:ring-2 focus:ring-[#0f3229] focus:bg-white transition-all font-mono text-left"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رمز عبور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 pr-11 pl-4 focus:outline-none focus:ring-2 focus:ring-[#0f3229] focus:bg-white transition-all font-mono tracking-widest text-left"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0f3229] hover:bg-[#0b261f] text-white py-3.5 rounded-xl font-bold transition-all transform active:scale-[0.98] mt-4 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'ورود به حساب'
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Dev Quick Login Buttons */}
      {(import.meta as any).env.DEV && (
        <div className="w-full max-w-md mt-6 p-6 rounded-2xl border border-emerald-800 bg-[#0f3229]/50 backdrop-blur-sm shadow-inner">
          <div className="flex items-center gap-2 mb-4 justify-center text-emerald-200 opacity-80">
            <div className="h-px bg-emerald-800 flex-1"></div>
            <span className="text-xs font-bold tracking-widest px-2 uppercase">ورود سریع - حالت توسعه</span>
            <div className="h-px bg-emerald-800 flex-1"></div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleQuickLogin('admin')}
              className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-100 py-3 rounded-xl font-medium transition-colors text-sm"
            >
              ورود به عنوان مدیریت
            </button>
            <button
              onClick={() => handleQuickLogin('barista')}
              className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 py-3 rounded-xl font-medium transition-colors text-sm"
            >
              ورود به عنوان باریستا
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
