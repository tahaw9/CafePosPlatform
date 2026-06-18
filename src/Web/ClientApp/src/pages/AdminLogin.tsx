import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '../store/useAuthStore';
import { LogIn, AtSign, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Login with phone and password
      const loginRes = await api.post('/Users/login-phone', {
        phoneNumber: username,
        password: password
      });

      const token = loginRes.data?.accessToken;
      if (!token) {
        throw new Error('Token not received from server');
      }

      // Temporarily set the token so the api interceptor can use it for the next request
      useAuthStore.getState().setAuth(token, { id: '', name: '', phone: '', role: 'barista', isActive: true });

      // 2. Fetch current user profile
      const meRes = await api.get('/Users/me');
      const userData = meRes.data;

      // 3. Set full auth state
      setAuth(token, {
        id: userData.id || Date.now().toString(),
        name: userData.fullName || userData.userName || 'کاربر',
        phone: username,
        // Fallback to basic string parsing if role structure is unknown
        role: JSON.stringify(userData).toLowerCase().includes('admin') ? 'admin' : 'barista',
        isActive: true
      });

      toast.success('ورود با موفقیت انجام شد');
      navigate(from, { replace: true });

    } catch (error: any) {
      console.error('Login failed:', error);
      const msg = error.response?.data?.title || error.response?.data?.detail || 'نام کاربری یا رمز عبور اشتباه است';
      toast.error(msg);
      useAuthStore.getState().logout();
    } finally {
      setIsLoading(false);
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



    </div>
  );
}
