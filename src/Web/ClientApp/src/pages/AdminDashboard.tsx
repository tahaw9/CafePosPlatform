import { MessageSquare, Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore, OrderStatus, PaymentMethod, Order } from '../store/useOrderStore';
import toast from 'react-hot-toast';
import Dropdown from '../components/Admin/Dropdown';
import OrderDetailModal from '../components/Admin/OrderDetailModal';
import * as Dialog from '@radix-ui/react-dialog';
import { useUnpaidOrderStore } from '../store/useUnpaidOrderStore';

const STATUS_COLUMNS = [
  { id: 'pending', title: 'در انتظار', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'preparing', title: 'در حال آماده‌سازی', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'completed', title: 'تکمیل شده', color: 'bg-green-100 text-green-800 border-green-200' },
];

export default function AdminDashboard() {
  const { orders, fetchInitialData, updateOrderStatus, isLoading, isSubmitting } = useOrderStore();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { flagOrder, isSubmitting: isFlagging, unpaidOrders, fetchUnpaidOrders } = useUnpaidOrderStore();
  const [isUnpaidModalOpen, setIsUnpaidModalOpen] = useState(false);
  const [targetUnpaidOrderId, setTargetUnpaidOrderId] = useState<string | null>(null);
  const [debtorName, setDebtorName] = useState('');
  const [debtorPhone, setDebtorPhone] = useState('');

  useEffect(() => {
    fetchInitialData();
    fetchUnpaidOrders();
  }, [fetchInitialData, fetchUnpaidOrders]);

  const handleCancelOrder = async (id: string) => {
    if (window.confirm('آیا از لغو این سفارش اطمینان دارید؟')) {
      try {
        await updateOrderStatus(id, 'cancelled');
        toast.success('سفارش لغو شد');
      } catch {
        // Error toast is already handled by the store
      }
    }
  };

  const handleUnpaidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUnpaidOrderId) return;
    if (!debtorName || !/^09[0-9]{9}$/.test(debtorPhone)) {
      toast.error('لطفا نام و شماره موبایل معتبر (با 09 شروع شود) وارد کنید');
      return;
    }

    try {
      await flagOrder({
        orderId: targetUnpaidOrderId,
        customerName: debtorName,
        phoneNumber: debtorPhone
      });
      await fetchUnpaidOrders();
      setIsUnpaidModalOpen(false);
      setDebtorName('');
      setDebtorPhone('');
      setTargetUnpaidOrderId(null);
    } catch (error) {
      // Error handled by store
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50 h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#0f3229] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-bold text-sm">در حال دریافت سفارشات زنده...</span>
        </div>
      </div>
    );
  }

  // Exclude cancelled from the visible kanban board typically, or we could add a column
  const activeOrders = orders.filter(o => o.status !== 'cancelled');

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-black text-[#0f3229]">داشبورد سفارشات زنده</h1>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map(column => {
          const columnOrders = activeOrders.filter(o => o.status === column.id);
          
          return (
            <div key={column.id} className="flex-1 min-w-[300px] flex flex-col bg-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="font-bold text-gray-800">{column.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${column.color}`}>
                  {columnOrders.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 ps-1 custom-scrollbar">
                {columnOrders.map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="font-bold text-lg hover:text-[#0f3229] transition-colors flex items-center gap-1"
                        >
                          #{order.orderCode} <Info size={16} className="text-gray-400" />
                        </button>
                        <div className="text-sm text-gray-500 mt-1">
                          {order.tableNumber ? `میز ${order.tableNumber}` : 'بیرون‌بر'}
                        </div>
                      </div>
                      <div className="text-end flex flex-col items-end gap-1">
                        <div className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {order.isPaid ? (
                          <span className="inline-block mt-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">پرداخت شده</span>
                        ) : unpaidOrders.some(uo => uo.orderId === order.id) ? (
                          <span className="inline-block mt-1 bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-xs border border-red-200">عدم پرداخت (نسیه)</span>
                        ) : (
                          <div className="mt-1">
                            <Dropdown 
                              value="" 
                              onChange={async (val) => {
                                if (val === 'unpaid') {
                                  setTargetUnpaidOrderId(order.id);
                                  setIsUnpaidModalOpen(true);
                                  return;
                                }
                                try {
                                  await useOrderStore.getState().markAsPaid(order.id, val as PaymentMethod);
                                  toast.success('پرداخت تایید شد');
                                } catch {
                                  // Error toast is already handled by the store
                                }
                              }}
                              placeholder="ثبت پرداخت ▼"
                              options={[
                                { value: 'card', label: '💳 کارتخوان' },
                                { value: 'cash', label: '💵 نقد' },
                                { value: 'transfer', label: '🏦 کارت به کارت' },
                                { value: 'unpaid', label: '❌ عدم پرداخت (نسیه)' }
                              ]}
                              triggerClassName="bg-red-100 !text-red-700 border-none hover:bg-red-200 !px-2 !py-0.5 !rounded !text-xs transition-colors h-auto focus:ring-0"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <ul className="text-sm space-y-2 mb-4 bg-gray-50 p-3 rounded-lg flex-1">
                      {order.items.map(item => (
                        <li key={item.id} className="flex flex-col border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                          <div className="flex justify-between">
                            <span className="text-gray-700 font-medium"><span className="text-gray-400 ms-1">{item.quantity}x</span> {item.name}</span>
                          </div>
                          {item.note && (
                            <div className="flex items-start mt-1.5 p-2 bg-[#8fa8a4]/15 rounded-md">
                              <MessageSquare className="w-3.5 h-3.5 ms-1.5 mt-0.5 text-[#0f3229] shrink-0" />
                              <span className="text-xs italic text-gray-800 font-medium leading-relaxed">{item.note}</span>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-col gap-2 mt-auto pt-2">
                      <Dropdown 
                        value={order.status}
                        onChange={async (val) => {
                          try {
                            await updateOrderStatus(order.id, val as OrderStatus);
                            toast.success('وضعیت سفارش بروزرسانی شد');
                          } catch {
                            // Error toast is already handled by the store
                          }
                        }}
                        options={[
                          { value: 'pending', label: '⏳ در انتظار' },
                          { value: 'preparing', label: '🔥 آماده‌سازی' },
                          { value: 'completed', label: '✅ تکمیل شده' }
                        ]}
                        triggerClassName={`w-full py-2 !rounded-lg text-sm font-medium border-0 opacity-90 hover:opacity-100 ${
                          order.status === 'pending' ? 'bg-red-100 !text-red-700' :
                          order.status === 'preparing' ? 'bg-amber-100 !text-amber-800' :
                          'bg-green-100 !text-green-800'
                        }`}
                      />
                      
                      {column.id !== 'completed' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/admin/pos?orderId=${order.id}`)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                          >
                            ویرایش
                          </button>
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium transition-colors border border-red-200"
                          >
                            لغو سفارش
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {columnOrders.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    سفارشی در این مرحله نیست
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <OrderDetailModal 
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      {/* Debt Registration Modal */}
      <Dialog.Root open={isUnpaidModalOpen} onOpenChange={setIsUnpaidModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100] dialog-overlay print:hidden" />
          <Dialog.Content 
            className="fixed bg-white rounded-xl shadow-xl w-[90vw] max-w-md p-6 z-[101] dialog-content rtl"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">ثبت سفارش نسیه</Dialog.Title>
            <form onSubmit={handleUnpaidSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی مشتری</label>
                <input 
                  type="text" 
                  value={debtorName}
                  onChange={(e) => setDebtorName(e.target.value)}
                                  className="
w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229]"
                  placeholder="مثال: علی محمدی"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل</label>
                <input 
                  type="tel" 
                  value={debtorPhone}
                  onChange={(e) => setDebtorPhone(e.target.value)}
                                  className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] focus:border-transparent text-left"
                  dir="ltr"
                  placeholder="09123456789"
                  pattern="^09[0-9]{9}$"
                  required
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={isFlagging}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isFlagging ? 'در حال ثبت...' : 'ثبت بدهی'}
                </button>
                <Dialog.Close asChild>
                  <button type="button" className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors">
                    انصراف
                  </button>
                </Dialog.Close>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
