import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, Loader2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useMenuStore } from '../../store/useMenuStore';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import api from '../../lib/api';
import { createOrder } from '../../lib/orderService';
import { getTables, TableDto } from '../../lib/tableService';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId?: string;
}

export default function CartModal({ isOpen, onClose, tableId }: CartModalProps) {
  const { items, removeItem, updateQuantity, clearCart, totalAmount } = useCartStore();
  const menuItems = useMenuStore(state => state.items);
  const { tableId: routeTableId } = useParams();
  const activeTableId = tableId || routeTableId || '1';

  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [tables, setTables] = useState<TableDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Connect to SignalR
    const baseURL = api.defaults.baseURL || '';
    const backendOrigin = baseURL.endsWith('/api') ? baseURL.slice(0, -4) : baseURL;
    const signalRUrl = `${backendOrigin}/hubs/cafeHub`;

    const newConnection = new HubConnectionBuilder()
      .withUrl(signalRUrl)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    newConnection.start()
      .then(() => {
        console.log('CartModal connected to SignalR cafeHub');
      })
      .catch((e) => {
        console.error('CartModal failed to connect to SignalR hub:', e);
      });

    setConnection(newConnection);

    // Fetch tables for Guid mapping
    getTables()
      .then(data => {
        setTables(data);
      })
      .catch(err => {
        console.error('Failed to load tables in CartModal:', err);
      });

    return () => {
      newConnection.stop();
    };
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0 || isSubmitting) return;

    // Pre-Dispatch Payload Validation:
    // Verify that every product with variants has an explicit valid productVariantId assigned
    for (const item of items) {
      const parentProduct = menuItems.find(p => p.id === item.menuItemId);
      if (parentProduct && parentProduct.variants && parentProduct.variants.length > 0) {
        if (!item.productVariantId) {
          toast.error(`نوع محصول "${item.name}" انتخاب نشده است. لطفاً آن را حذف و مجدداً انتخاب کنید.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    
    try {
      // Find the corresponding Guid for the table name or table ID
      const matchedTable = tables.find(t => 
        t.name === `میز ${activeTableId}` || 
        t.name.endsWith(` ${activeTableId}`) || 
        t.id === activeTableId
      );
      
      const resolvedTableGuid = matchedTable ? matchedTable.id : null;

      // Construct backend request with variant references
      const orderPayload = {
        tableId: resolvedTableGuid,
        total: totalAmount(),
        status: 'pending',
        items: items.map(item => ({
          productId: item.menuItemId,
          productVariantId: item.productVariantId || null,
          productName: item.name,
          variantName: item.variantName || null,
          unitPrice: item.price,
          quantity: item.quantity,
          note: item.note || undefined
        }))
      };

      await createOrder(orderPayload);

      // Notify backend about new order via SignalR
      if (connection && connection.state === 'Connected') {
        try {
          await connection.invoke('NewOrder', activeTableId);
        } catch (hubErr) {
          console.error('Failed to broadcast NewOrder via SignalR:', hubErr);
        }
      }

      toast.success('سفارش شما با موفقیت ثبت شد!');
      clearCart();
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
        || error?.message
        || 'خطا در ثبت سفارش';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0a221b]/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0f3229] border border-[#8fa8a4]/30 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden max-h-[90vh] shadow-2xl"
          >
            {/* Mobile Drag Affordance Pill */}
            <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            {/* Header */}
            <div className="p-5 border-b border-[#8fa8a4]/20 flex justify-between items-center bg-[#0a221b]">
              <h2 className="text-xl font-bold text-cafe-text">سفارشات شما (میز {tableId || activeTableId})</h2>
              <button onClick={onClose} className="p-2 bg-[#164237] text-cafe-item rounded-full active:scale-95 transition-transform">
                <X size={20} />
              </button>
            </div>

            {/* Items List */}
            <div className="p-5 flex-grow overflow-y-auto custom-scrollbar overscroll-contain">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-cafe-item">
                  <ShoppingBag size={48} className="opacity-40 mb-3" />
                  <p className="text-sm">سبد خرید شما خالی است</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {items.map(item => (
                    <div key={item.cartItemId} className="bg-[#164237] p-4 rounded-2xl flex flex-col gap-2.5 border border-[#8fa8a4]/10 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-cafe-text text-base">{item.name}</h4>
                          {item.variantName && (
                            <span className="text-xs text-cafe-accent font-semibold bg-[#0a221b] px-2 py-0.5 rounded-md inline-block mt-1 border border-cafe-accent/20">
                              نوع: {item.variantName}
                            </span>
                          )}
                          <span className="text-xs text-[#8fa8a4] block mt-1">
                            هر واحد: {item.price.toLocaleString('fa-IR')} تومان
                          </span>
                        </div>
                        <button 
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-red-400 p-2 hover:bg-red-400/10 rounded-full transition-colors active:scale-90"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      {item.note && (
                        <p className="text-xs text-[#8fa8a4] bg-[#0a221b] p-2 rounded-xl border border-[#8fa8a4]/10 italic">
                          یادداشت: {item.note}
                        </p>
                      )}

                      <div className="flex justify-between items-center mt-1 pt-2 border-t border-[#8fa8a4]/10">
                        <span className="font-bold text-cafe-item text-sm">
                          {(item.price * item.quantity).toLocaleString('fa-IR')} تومان
                        </span>
                        <div className="flex items-center gap-2.5 bg-[#0a221b] rounded-full px-2 py-1 border border-[#8fa8a4]/20">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                            className="w-7 h-7 flex items-center justify-center text-cafe-item rounded-full active:scale-95"
                          >
                            <Minus size={15} />
                          </button>
                          <span className="text-cafe-text font-bold w-4 text-center text-sm">{item.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-cafe-item rounded-full active:scale-95"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-[#8fa8a4]/20 bg-[#0a221b] shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-cafe-item font-medium text-sm">جمع کل سفارش:</span>
                  <span className="text-2xl font-bold text-cafe-text tracking-tight">
                    {totalAmount().toLocaleString('fa-IR')} <span className="text-sm font-normal">تومان</span>
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className={`w-full font-bold py-4 rounded-xl flex items-center justify-center transition-all ${
                    isSubmitting 
                      ? 'bg-[#164237] text-[#8fa8a4] cursor-not-allowed' 
                      : 'bg-cafe-text text-[#0f3229] active:scale-[0.98] shadow-lg shadow-black/20'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin ml-2" />
                      در حال ثبت سفارش...
                    </>
                  ) : (
                    'ثبت نهایی سفارش'
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
