import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMenuStore } from '../store/useMenuStore';
import { useOrderStore, OrderItem, PaymentMethod, OrderStatus } from '../store/useOrderStore';
import { Minus, Plus, Trash2, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import ThermalReceipt from '../components/Admin/ThermalReceipt';
import Dropdown from '../components/Admin/Dropdown';
import * as Dialog from '@radix-ui/react-dialog';

export default function AdminPOS() {
  const { items, categories, fetchMenu } = useMenuStore();
  const { orders, addOrder, tables, updateOrderStatus } = useOrderStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const editingOrderId = queryParams.get('orderId');
  
  const editingOrder = orders.find(o => o.id === editingOrderId);

  const [activeCategory, setActiveCategory] = useState<string>('coffee');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('takeaway');
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('amount');
  const [discountValue, setDiscountValue] = useState<string>('');

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenPreview = () => {
    if (cart.length === 0) return;
    setIsPreviewOpen(true);
  };

  const executePrint = () => {
    setIsPreviewOpen(false);
    // Slight delay to allow modal to close completely before printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  useEffect(() => {
    if (items.length === 0) fetchMenu();
  }, [fetchMenu, items.length]);

  useEffect(() => {
    if (editingOrder) {
      setCart(editingOrder.items);
      setSelectedTable(editingOrder.tableId);
      if (editingOrder.discount) {
        setDiscountType(editingOrder.discount.type);
        setDiscountValue(editingOrder.discount.value.toString());
      }
      if (editingOrder.paymentMethod) {
        setPaymentMethod(editingOrder.paymentMethod);
      }
    }
  }, [editingOrder]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: Math.random().toString(36).substr(2, 9), productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * (Number(discountValue) || 0)) / 100 
    : (Number(discountValue) || 0);
  const total = subtotal - discountAmount;

  const handleCheckout = (status: OrderStatus, isPaid: boolean) => {
    if (cart.length === 0) {
      toast.error('سبد خرید خالی است');
      return;
    }

    const newOrderData = {
      tableId: selectedTable,
      items: cart,
      status,
      total: subtotal, // Pre-discount total
      discount: discountValue ? { type: discountType, value: Number(discountValue) } : null,
      paymentMethod: isPaid ? paymentMethod : null,
      isPaid
    };

    if (editingOrder) {
      useOrderStore.setState(state => ({
        orders: state.orders.map(o => o.id === editingOrder.id ? { ...o, ...newOrderData, updatedAt: Date.now() } : o)
      }));
      toast.success('سفارش بروزرسانی شد');
      
      if (status === 'completed' || isPaid) {
        handleOpenPreview();
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        navigate('/admin/dashboard');
      }
      return;
    }

    addOrder(newOrderData);
    toast.success('سفارش با موفقیت ثبت شد');
    
    // Call print when adding a new order
    if (status === 'completed' || isPaid) {
        handleOpenPreview();
      
      // Delay clearing to let the print frame capture the DOM
      setTimeout(() => {
        setCart([]);
        setDiscountValue('');
        setSelectedTable('takeaway');
        setPaymentMethod('card');
      }, 500);
    } else {
      setCart([]);
      setDiscountValue('');
      setSelectedTable('takeaway');
      setPaymentMethod('card');
    }
  };

  const handleCancelOrder = () => {
    if (editingOrder && window.confirm('آیا از لغو این سفارش اطمینان دارید؟')) {
      updateOrderStatus(editingOrder.id, 'cancelled');
      toast.success('سفارش لغو شد');
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="flex h-full rtl">
      {/* Menu Grid */}
      <div className="flex-1 flex flex-col bg-gray-50 h-full hide-scrollbar overflow-hidden print:hidden">
        {/* Categories */}
        <div className="flex p-4 gap-2 overflow-x-auto border-b bg-white shrink-0">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${activeCategory === c.id ? 'bg-[#0f3229] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.filter(i => i.category === activeCategory).map(item => (
              <div 
                key={item.id}
                onClick={() => item.isAvailable ? addToCart(item) : undefined}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] ${!item.isAvailable ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                <div className="h-24 w-full bg-gray-200">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="font-bold text-sm mb-1 line-clamp-1">{item.name}</div>
                  <div className="text-[#d4af37] font-medium text-xs">{item.price.toLocaleString()} تومان</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col shrink-0 relative print:hidden">
        {editingOrder && (
          <div className="bg-amber-100 text-amber-800 p-2 text-center text-sm font-bold flex justify-between items-center">
            <span>ویرایش سفارش #{editingOrder.id.replace('ORD-', '')}</span>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="px-2 py-1 bg-white rounded shadow-sm text-xs"
            >
              انصراف
            </button>
          </div>
        )}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">سبد خرید (صندوق)</h2>
          
          <div className="mt-4 flex gap-2">
            <div className="flex-1">
              <Dropdown 
                value={selectedTable}
                onChange={(val) => setSelectedTable(val)}
                options={[
                  { value: 'takeaway', label: 'بیرون‌بر' },
                  ...tables.map(t => ({ value: t.id, label: t.name }))
                ]}
                triggerClassName="w-full bg-gray-50 border-gray-200 py-2.5"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
          {cart.map(item => (
            <div key={item.id} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl">
              <div className="flex justify-between items-start">
                <span className="font-medium">{item.name}</span>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-red-100 p-1 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{(item.price * item.quantity).toLocaleString()} تومان</span>
                <div className="flex items-center gap-2 bg-white rounded-lg border">
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 rounded">
                    <Plus size={16} />
                  </button>
                  <span className="w-4 text-center font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 rounded">
                    <Minus size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-1">
                <input 
                  type="text"
                  placeholder="یادداشت (توضیحات مشتری)"
                  value={item.note || ''}
                  onChange={(e) => {
                    setCart(prev => prev.map(i => i.id === item.id ? { ...i, note: e.target.value } : i));
                  }}
                  className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded focus:outline-none focus:border-emerald-500 italic placeholder:not-italic"
                />
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="text-center text-gray-400 py-10">سبد خرید خالی است</div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 space-y-3">
          {/* Discount Segment */}
          <div className="flex gap-2 bg-white p-2 rounded-xl border">
            <div className="border-e border-gray-100 pe-1">
              <Dropdown 
                value={discountType} 
                onChange={(val) => setDiscountType(val as any)}
                options={[
                  { value: 'amount', label: 'مبلغ' },
                  { value: 'percentage', label: 'درصد %' }
                ]}
                triggerClassName="w-[110px] border-none shadow-none bg-transparent hover:bg-gray-50 !py-1 !px-2"
              />
            </div>
            <input 
              type="number" 
              placeholder="تخفیف" 
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="flex-1 px-2 focus:outline-none bg-transparent w-full"
            />
          </div>

          <div className="flex justify-between text-sm">
            <span>جمع کل:</span>
            <span>{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-red-500">
            <span>تخفیف:</span>
            <span>- {discountAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-[#0f3229]">
            <span>قابل پرداخت:</span>
            <span>{total.toLocaleString()} تومان</span>
          </div>

          {/* Payment Method */}
          <div className="pt-2">
            <Dropdown 
              value={paymentMethod || 'card'} 
              onChange={(val) => setPaymentMethod(val as PaymentMethod)}
              options={[
                { value: 'card', label: '💳 کارتخوان' },
                { value: 'cash', label: '💵 نقد' },
                { value: 'transfer', label: '🏦 کارت به کارت' }
              ]}
              triggerClassName="w-full py-2.5 bg-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-sm font-bold">
            <button 
              onClick={() => handleCheckout(editingOrder ? editingOrder.status : 'pending', false)}
              className="py-3 rounded-xl border-2 border-[#0f3229] text-[#0f3229] hover:bg-[#0f3229]/5 transition-colors text-center"
            >
              {editingOrder ? 'ثبت ویرایش' : 'ثبت موقت'}
            </button>
            <button 
              onClick={() => handleCheckout('completed', true)}
              className="py-3 rounded-xl bg-[#0f3229] text-white hover:bg-[#0b261f] transition-colors text-center"
            >
              ثبت و پرداخت
            </button>
            
            <button 
              onClick={handleOpenPreview}
              className="py-3 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <Printer size={18} /> چاپ
            </button>
            
            {editingOrder && (
              <button 
                onClick={handleCancelOrder}
                className="py-3 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center justify-center"
              >
                لغو کامل سفارش
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pre-Print Preview Modal */}
      <Dialog.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100] dialog-overlay print:hidden" />
          <Dialog.Content 
            className="fixed bg-gray-100 rounded-xl shadow-xl w-[90vw] max-w-[400px] max-h-[90vh] overflow-y-auto z-[101] dialog-content flex flex-col print:hidden"
            dir="rtl"
          >
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 flex justify-between items-center z-10">
              <Dialog.Title className="font-bold text-lg text-gray-900">پیش‌نمایش چاپ</Dialog.Title>
            </div>
            
            {/* The preview container styling the receipt to mock 80mm paper */}
            <div className="p-6 flex justify-center bg-gray-100">
              <div className="shadow-lg break-inside-avoid">
                <ThermalReceipt 
                  cart={cart}
                  subtotal={subtotal}
                  discountAmount={discountAmount}
                  total={total}
                  tableId={selectedTable}
                  orderId={editingOrder?.id}
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0 flex gap-3">
              <button
                className="flex-1 py-2 bg-[#0f3229] hover:bg-[#0b261f] text-white rounded-lg font-medium transition-colors"
                onClick={executePrint}
              >
                ادامه و چاپ
              </button>
              <Dialog.Close asChild>
                <button className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors">
                  انصراف
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Hidden Receipt for Printing */}
      <div className="hidden print:block print:absolute print:top-0 print:left-0 print:w-full print:bg-white print:z-[9999] print:min-h-screen">
        <ThermalReceipt 
          cart={cart}
          subtotal={subtotal}
          discountAmount={discountAmount}
          total={total}
          tableId={selectedTable}
          orderId={editingOrder?.id}
        />
      </div>
    </div>
  );
}
