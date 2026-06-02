import { MessageSquare, Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore, OrderStatus, PaymentMethod, Order } from '../store/useOrderStore';
import toast from 'react-hot-toast';
import Dropdown from '../components/Admin/Dropdown';
import OrderDetailModal from '../components/Admin/OrderDetailModal';

const STATUS_COLUMNS = [
  { id: 'pending', title: 'در انتظار', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'preparing', title: 'در حال آماده‌سازی', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'completed', title: 'تکمیل شده', color: 'bg-green-100 text-green-800 border-green-200' },
];

export default function AdminDashboard() {
  const { orders, fetchInitialData, updateOrderStatus } = useOrderStore();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Only fetch if empty to prevent overriding state in development
    if (orders.length === 0) {
      fetchInitialData();
    }
  }, [fetchInitialData, orders.length]);

  const handleCancelOrder = (id: string) => {
    if (window.confirm('آیا از لغو این سفارش اطمینان دارید؟')) {
      updateOrderStatus(id, 'cancelled');
      toast.success('سفارش لغو شد');
    }
  };

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
                          #{order.id.replace('ORD-', '')} <Info size={16} className="text-gray-400" />
                        </button>
                        <div className="text-sm text-gray-500 mt-1">
                          {order.tableId === 'takeaway' ? 'بیرون‌بر' : `میز ${order.tableId}`}
                        </div>
                      </div>
                      <div className="text-end flex flex-col items-end gap-1">
                        <div className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {order.isPaid ? (
                          <span className="inline-block mt-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">پرداخت شده</span>
                        ) : (
                          <div className="mt-1">
                            <Dropdown 
                              value="" 
                              onChange={(val) => {
                                useOrderStore.getState().markAsPaid(order.id, val as PaymentMethod);
                                toast.success('پرداخت تایید شد');
                              }}
                              placeholder="ثبت پرداخت ▼"
                              options={[
                                { value: 'card', label: '💳 کارتخوان' },
                                { value: 'cash', label: '💵 نقد' },
                                { value: 'transfer', label: '🏦 کارت به کارت' }
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
                        onChange={(val) => updateOrderStatus(order.id, val as OrderStatus)}
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
    </div>
  );
}
