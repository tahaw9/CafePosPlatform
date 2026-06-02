import React, { useState } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import Dropdown from '../components/Admin/Dropdown';

export default function AdminReports() {
  const { orders } = useOrderStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [reportType, setReportType] = useState('daily');

  const isSameDay = (timestamp: number, date: Date) => {
    const tDate = new Date(timestamp);
    return tDate.getFullYear() === date.getFullYear() &&
           tDate.getMonth() === date.getMonth() &&
           tDate.getDate() === date.getDate();
  };

  const completedOrders = orders.filter(o => {
    if (o.status !== 'completed' || !o.isPaid) return false;
    
    if (reportType === 'daily' && selectedDate) {
      return isSameDay(o.createdAt, selectedDate);
    }
    
    return true; // all_time
  });
  const totalRevenue = completedOrders.reduce((sum, order) => {
    let finalAmount = order.total;
    if (order.discount) {
      if (order.discount.type === 'percentage') {
        finalAmount -= (finalAmount * order.discount.value / 100);
      } else {
        finalAmount -= order.discount.value;
      }
    }
    return sum + finalAmount;
  }, 0);

  const totalOrders = completedOrders.length;

  // Best selling items
  const itemCounts = completedOrders.flatMap(o => o.items).reduce((acc, item) => {
    acc[item.name] = (acc[item.name] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const bestSellers = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-[#0f3229]">گزارش تاریخچه فروش</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Dropdown
            value={reportType}
            onChange={(val) => setReportType(val)}
            options={[
              { value: 'daily', label: 'گزارش روزانه' },
              { value: 'all_time', label: 'کل فروش' }
            ]}
            triggerClassName="w-full sm:w-40 border-gray-200 py-2.5 bg-white font-medium"
          />
          
          {reportType === 'daily' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap hidden sm:block">تاریخ:</span>
              <DatePicker 
                value={selectedDate}
                onChange={(date: any) => setSelectedDate(date ? new Date(date.toDate()) : null)}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                containerClassName="w-full sm:w-auto"
                inputClass="border border-gray-200 rounded-lg px-4 py-2 text-center w-full sm:w-40 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f3229] font-medium"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-2">مجموع درآمد (پرداخت شده)</div>
          <div className="text-3xl font-bold text-[#0f3229]">{totalRevenue.toLocaleString()} تومان</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-2">تعداد کل سفارشات موفق</div>
          <div className="text-3xl font-bold text-[#0f3229]">{totalOrders}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
        <h2 className="text-xl font-bold mb-4">۵ آیتم پرفروش امروز</h2>
        <div className="space-y-4">
          {bestSellers.map(([name, count], index) => (
            <div key={name} className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full font-bold text-gray-500 shrink-0 ms-4">
                {index + 1}
              </div>
              <div className="flex-1 font-medium">{name}</div>
              <div className="font-bold text-[#0f3229]">{count} عدد</div>
            </div>
          ))}
          {bestSellers.length === 0 && (
            <div className="text-gray-400">اطلاعاتی برای نمایش وجود ندارد</div>
          )}
        </div>
      </div>
    </div>
  );
}
