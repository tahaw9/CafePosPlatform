import React, { useEffect, useState } from 'react';
import { useUnpaidOrderStore } from '../store/useUnpaidOrderStore';
import { Search, Filter, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUnpaidOrders() {
  const { unpaidOrders, isLoading, isSubmitting, fetchUnpaidOrders, settleOrder } = useUnpaidOrderStore();
  
  const [phoneFilter, setPhoneFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');

  useEffect(() => {
    fetchUnpaidOrders({ isSettled: false });
  }, [fetchUnpaidOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUnpaidOrders({ 
      phoneNumber: phoneFilter || undefined, 
      customerName: nameFilter || undefined,
      isSettled: false
    });
  };

  const handleSettle = async (id: string) => {
    if (window.confirm('آیا از تسویه حساب این سفارش اطمینان دارید؟')) {
      try {
        await settleOrder(id);
      } catch (error) {
        // error toast already handled in store
      }
    }
  };

  return (
    <div className="p-6 h-full flex flex-col rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">سفارشات پرداخت نشده (نسیه)</h1>
        <p className="text-gray-500">مدیریت و تسویه حساب سفارشات نسیه مشتریان</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 shrink-0">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">نام مشتری</label>
            <div className="relative">
              <input 
                type="text" 
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="جستجو نام..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f3229]"
              />
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل</label>
            <div className="relative">
              <input 
                type="text" 
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                placeholder="جستجو شماره موبایل..."
                dir="ltr"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f3229] text-left"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="px-6 py-2 bg-[#0f3229] hover:bg-[#0b261f] text-white rounded-lg font-medium transition-colors flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <Filter size={18} /> اعمال فیلتر
          </button>
        </form>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0f3229]"></div>
          </div>
        ) : unpaidOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <CheckCircle size={48} className="mb-4 text-gray-300" />
            <p className="text-lg">هیچ سفارش پرداخت نشده‌ای یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {unpaidOrders.filter(o => !o.isSettled).map(order => (
              <div key={order.id} className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-amber-400"></div>
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{order.customerName}</h3>
                    <p className="text-sm text-gray-500 dir-ltr text-right">{order.phoneNumber}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">#{order.orderCode}</span>
                </div>
                
                <div className="text-xs text-gray-500 mb-3 border-b pb-2">
                  {new Date(order.createdAt).toLocaleDateString('fa-IR', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>
                
                <div className="flex-1 mb-4">
                  <ul className="text-sm space-y-1 text-gray-700">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <li key={idx}>- {item}</li>
                    ))}
                    {order.items.length > 3 && (
                      <li className="text-gray-400 italic">...و {order.items.length - 3} مورد دیگر</li>
                    )}
                  </ul>
                </div>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-sm text-gray-600">مبلغ بدهی:</span>
                    <span className="font-bold text-lg text-red-600">{order.total.toLocaleString()} تومان</span>
                  </div>
                  
                  <button
                    onClick={() => handleSettle(order.id)}
                    disabled={isSubmitting}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'در حال ثبت...' : 'تسویه حساب'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
