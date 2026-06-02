import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Avatar from '@radix-ui/react-avatar';
import * as Dialog from '@radix-ui/react-dialog';
import Dropdown from '../components/Admin/Dropdown';
import { useAuthStore, UserRole, User } from '../store/useAuthStore';
import { useOrderStore } from '../store/useOrderStore';
import { KeyRound, UserPlus, ShieldBan, ShieldCheck, Mail, Phone, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProfile() {
  const { user, users, addUser, updateUser } = useAuthStore();
  const { orders } = useOrderStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isNewStaffModalOpen, setIsNewStaffModalOpen] = useState(false);
  
  const [newStaffData, setNewStaffData] = useState({ name: '', phone: '', password: '', role: 'barista' as UserRole });

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  // Stats for Barista
  const todayOrders = orders.filter(o => {
    const isToday = new Date(o.createdAt).toDateString() === new Date().toDateString();
    return isToday;
  });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffData.name || !newStaffData.phone || !newStaffData.password) {
      toast.error('لطفا تمام فیلدها را پر کنید');
      return;
    }
    addUser({
      name: newStaffData.name,
      phone: newStaffData.phone,
      role: newStaffData.role,
      isActive: true
    });
    toast.success('پرسنل جدید با موفقیت اضافه شد');
    setIsNewStaffModalOpen(false);
    setNewStaffData({ name: '', phone: '', password: '', role: 'barista' });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('رمز عبور با موفقیت تغییر یافت');
    setIsPasswordModalOpen(false);
  }

  const toggleUserStatus = (id: string, currentStatus: boolean) => {
    updateUser(id, { isActive: !currentStatus });
    toast.success(currentStatus ? 'حساب کاربر تعلیق شد' : 'حساب کاربر فعال شد');
  }

  return (
    <div className="p-6 h-full flex flex-col rtl relative max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0f3229]">پروفایل</h1>
        <p className="text-gray-500 mt-1 font-medium">مدیریت حساب کاربری و دسترسی‌ها</p>
      </div>

      <Tabs.Root defaultValue="personal" className="flex flex-col flex-1" dir="rtl">
        <Tabs.List className="flex border-b border-gray-200 mb-6 shrink-0 bg-white rounded-t-2xl px-2 pt-2">
          <Tabs.Trigger 
            value="personal" 
            className="px-6 py-3 font-semibold text-gray-500 hover:text-gray-700 data-[state=active]:text-[#0f3229] data-[state=active]:border-b-2 data-[state=active]:border-[#0f3229] transition-all bg-transparent !shadow-none outline-none"
          >
            اطلاعات کاربری
          </Tabs.Trigger>
          
          {isAdmin && (
            <Tabs.Trigger 
              value="staff" 
              className="px-6 py-3 font-semibold text-gray-500 hover:text-gray-700 data-[state=active]:text-[#0f3229] data-[state=active]:border-b-2 data-[state=active]:border-[#0f3229] transition-all bg-transparent !shadow-none outline-none"
            >
              مدیریت پرسنل
            </Tabs.Trigger>
          )}

          {!isAdmin && (
            <Tabs.Trigger 
              value="shifts" 
              className="px-6 py-3 font-semibold text-gray-500 hover:text-gray-700 data-[state=active]:text-[#0f3229] data-[state=active]:border-b-2 data-[state=active]:border-[#0f3229] transition-all bg-transparent !shadow-none outline-none"
            >
              وضعیت شیفت
            </Tabs.Trigger>
          )}
        </Tabs.List>

        <Tabs.Content value="personal" className="flex-1 outline-none data-[state=active]:animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <Avatar.Root className="w-24 h-24 rounded-full bg-[#0f3229]/10 border-4 border-white shadow flex items-center justify-center overflow-hidden shrink-0">
                <Avatar.Fallback className="text-[#0f3229] text-3xl font-black font-sans">
                  {user.name.charAt(0)}
                </Avatar.Fallback>
              </Avatar.Root>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.role === 'admin' 
                      ? 'bg-amber-100 text-amber-800 border-amber-200 border' 
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200 border'
                  }`}>
                    {user.role === 'admin' ? 'مدیریت' : 'باریستا'}
                  </span>
                </div>
                
                <div className="flex gap-6 mt-4 text-gray-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span dir="ltr">{user.phone}</span>
                  </div>
                </div>
              </div>

              <Dialog.Root open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <Dialog.Trigger asChild>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium transition-colors border border-gray-200">
                    <KeyRound className="w-5 h-5 opacity-70" />
                    تغییر رمز عبور
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100] dialog-overlay" />
                  <Dialog.Content className="fixed bg-white rounded-xl shadow-xl w-[90vw] max-w-md z-[101] dialog-content p-6 rtl border border-[#8fa8a4]">
                    <Dialog.Title className="text-xl font-bold text-gray-900 mb-6">تغییر رمز عبور</Dialog.Title>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور فعلی</label>
                        <input type="password" required dir="ltr" className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] font-mono text-left text-lg tracking-widest placeholder:tracking-normal placeholder:font-sans" placeholder="••••••••" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور جدید</label>
                        <input type="password" required dir="ltr" className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] font-mono text-left text-lg tracking-widest placeholder:tracking-normal placeholder:font-sans" placeholder="••••••••" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تکرار رمز عبور جدید</label>
                        <input type="password" required dir="ltr" className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] font-mono text-left text-lg tracking-widest placeholder:tracking-normal placeholder:font-sans" placeholder="••••••••" />
                      </div>
                      <div className="pt-4 flex gap-3">
                        <button type="submit" className="flex-1 bg-[#0f3229] hover:bg-[#0b261f] text-white py-2.5 rounded-lg font-medium transition-colors">
                          ذخیره تغییرات
                        </button>
                        <Dialog.Close asChild>
                          <button type="button" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg font-medium transition-colors">
                            انصراف
                          </button>
                        </Dialog.Close>
                      </div>
                    </form>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          </div>
        </Tabs.Content>

        {isAdmin && (
          <Tabs.Content value="staff" className="flex-1 outline-none data-[state=active]:animate-fadeIn flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">لیست پرسنل کافه</h2>
              <Dialog.Root open={isNewStaffModalOpen} onOpenChange={setIsNewStaffModalOpen}>
                <Dialog.Trigger asChild>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0f3229] hover:bg-[#0b261f] text-white rounded-xl font-medium transition-colors shadow-sm">
                    <UserPlus className="w-5 h-5" />
                    افزودن پرسنل جدید
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100] dialog-overlay" />
                  <Dialog.Content className="fixed bg-white rounded-xl shadow-xl w-[90vw] max-w-md z-[101] dialog-content p-6 rtl border border-[#8fa8a4]">
                    <Dialog.Title className="text-xl font-bold text-gray-900 mb-6">افزودن پرسنل جدید</Dialog.Title>
                    <form onSubmit={handleAddStaff} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی</label>
                        <input 
                          type="text" required placeholder="مثال: علی رضایی"
                          value={newStaffData.name} onChange={e => setNewStaffData({...newStaffData, name: e.target.value})}
                          className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229]" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">شماره تماس (موبایل)</label>
                        <input 
                          type="tel" required dir="ltr" placeholder="09123456789"
                          value={newStaffData.phone} onChange={e => setNewStaffData({...newStaffData, phone: e.target.value})}
                          className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] text-left font-mono placeholder:font-sans placeholder:text-right" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نقش کاربری</label>
                        <Dropdown
                          value={newStaffData.role}
                          onChange={val => setNewStaffData({...newStaffData, role: val as UserRole})}
                          options={[
                            { value: 'barista', label: 'باریستا / صندوق‌دار' },
                            { value: 'admin', label: 'مدیریت' }
                          ]}
                          triggerClassName="w-full py-2.5 text-right font-medium bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور اولیه</label>
                        <input 
                          type="password" required dir="ltr" placeholder="••••••••"
                          value={newStaffData.password} onChange={e => setNewStaffData({...newStaffData, password: e.target.value})}
                          className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] font-mono text-left text-lg tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-right" 
                        />
                      </div>
                      <div className="pt-4 flex gap-3">
                        <button type="submit" className="flex-1 bg-[#0f3229] hover:bg-[#0b261f] text-white py-2.5 rounded-lg font-medium transition-colors">
                          ثبت پرسنل
                        </button>
                        <Dialog.Close asChild>
                          <button type="button" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg font-medium transition-colors">
                            انصراف
                          </button>
                        </Dialog.Close>
                      </div>
                    </form>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map(staff => (
                <div key={staff.id} className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col relative overflow-hidden ${!staff.isActive ? 'border-red-200 grayscale-[0.3]' : 'border-gray-100'}`}>
                  {!staff.isActive && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-red-500" />
                  )}
                  {staff.isActive && staff.role === 'admin' && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-amber-400" />
                  )}

                  <div className="flex items-center gap-4 mb-4">
                    <Avatar.Root className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <Avatar.Fallback className="text-gray-500 text-lg font-bold">
                        {staff.name.charAt(0)}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-1">{staff.name}</h3>
                      <p className="text-sm font-medium text-gray-500 font-mono mt-0.5 tracking-wider">{staff.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-50">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      staff.role === 'admin' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {staff.role === 'admin' ? 'مدیریت' : 'باریستا'}
                    </span>

                    {/* Don't allow admin to suspend themselves */}
                    {staff.id !== user.id && (
                      <div className="me-auto flex gap-2">
                        <button 
                          onClick={() => {
                            toast.success('لینک بازنشانی رمز ارسال شد');
                          }}
                          className="p-2 text-gray-400 hover:text-[#0f3229] hover:bg-[#0f3229]/10 rounded-lg transition-colors tooltip-trigger"
                          title="بازنشانی رمز"
                        >
                          <KeyRound size={18} />
                        </button>
                        <button 
                          onClick={() => toggleUserStatus(staff.id, staff.isActive)}
                          className={`p-2 rounded-lg transition-colors ${staff.isActive ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-red-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          title={staff.isActive ? 'تعلیق حساب' : 'فعال‌سازی حساب'}
                        >
                          {staff.isActive ? <ShieldBan size={18} /> : <ShieldCheck size={18} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Tabs.Content>
        )}

        {!isAdmin && (
          <Tabs.Content value="shifts" className="flex-1 outline-none data-[state=active]:animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-xl mx-auto mt-10">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarDays className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">وضعیت امروز شما</h2>
              <p className="text-gray-500 font-medium mb-8">شما در حال حاضر در شیفت کاری هستید.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <span className="block text-sm font-bold text-gray-500 mb-1">تعداد سفارشات</span>
                  <span className="block text-3xl font-black text-[#0f3229]">{todayOrders.length}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <span className="block text-sm font-bold text-gray-500 mb-1">وضعیت شیفت</span>
                  <span className="block text-xl font-black text-emerald-600 mt-2">فعال</span>
                </div>
              </div>
            </div>
          </Tabs.Content>
        )}
      </Tabs.Root>
    </div>
  );
}
