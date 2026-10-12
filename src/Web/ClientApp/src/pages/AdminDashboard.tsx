import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  CollisionDetection
} from '@dnd-kit/core';
import { useOrderStore, OrderStatus, PaymentMethod, Order } from '../store/useOrderStore';
import toast from 'react-hot-toast';
import OrderDetailModal from '../components/Admin/OrderDetailModal';
import * as Dialog from '@radix-ui/react-dialog';
import { useUnpaidOrderStore } from '../store/useUnpaidOrderStore';
import { printReceiptViaIframe } from '../lib/printUtils';
import { usePcPosStore } from '../store/usePcPosStore';
import KanbanColumn from '../components/Admin/KanbanColumn';
import KanbanOrderCard from '../components/Admin/KanbanOrderCard';

const STATUS_COLUMNS: { id: OrderStatus; title: string; color: string }[] = [
  { id: 'pending', title: 'در انتظار', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'preparing', title: 'در حال آماده‌سازی', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'completed', title: 'تکمیل شده', color: 'bg-green-100 text-green-800 border-green-200' },
];

export default function AdminDashboard() {
  const { orders, fetchInitialData, updateOrderStatus, isLoading } = useOrderStore();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const { flagOrder, isSubmitting: isFlagging, unpaidOrders, fetchUnpaidOrders } = useUnpaidOrderStore();
  const [isUnpaidModalOpen, setIsUnpaidModalOpen] = useState(false);
  const [targetUnpaidOrderId, setTargetUnpaidOrderId] = useState<string | null>(null);
  const [debtorName, setDebtorName] = useState('');
  const [debtorPhone, setDebtorPhone] = useState('');
  
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // DnD Sensors: 8px drag threshold for mouse, 200ms press with 6px tolerance for touchscreens (prevents scroll interference)
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 6,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor);

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  // Collision detection: prioritizes pointer location within droppable columns, falling back to bounding rect intersection
  const collisionDetectionStrategy: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return rectIntersection(args);
  };

  const handlePrint = (order: Order) => {
    setPrintingOrder(order);
    
    printReceiptViaIframe({
      cart: order.items,
      subtotal: order.total,
      discountAmount: order.discount ? (order.discount.type === 'amount' ? order.discount.value : (order.total * order.discount.value / 100)) : 0,
      total: order.total - (order.discount ? (order.discount.type === 'amount' ? order.discount.value : (order.total * order.discount.value / 100)) : 0),
      isTakeaway: order.tableId === 'takeaway',
      tableName: order.tableNumber ? `میز ${order.tableNumber}` : undefined,
      orderId: order.id,
      orderCode: order.orderCode
    });

    setTimeout(() => setPrintingOrder(null), 1000);
  };

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
        // Error toast is handled by the store
      }
    }
  };

  const handlePaymentChange = async (order: Order, val: string) => {
    if (val === 'unpaid') {
      setTargetUnpaidOrderId(order.id);
      setIsUnpaidModalOpen(true);
      return;
    }

    if (val === 'card' && usePcPosStore.getState().isPcPosEnabled) {
      const success = await usePcPosStore.getState().triggerPayment(order.id, order.total);
      if (success) {
        try {
          await useOrderStore.getState().markAsPaid(order.id, 'card');
          toast.success('پرداخت تایید شد');
          usePcPosStore.getState().reset();
        } catch {
          // Handled
        }
      }
      return;
    }

    try {
      await useOrderStore.getState().markAsPaid(order.id, val as PaymentMethod);
      toast.success('پرداخت تایید شد');
    } catch {
      // Handled
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
      // Handled
    }
  };

  const activeOrders = useMemo(() => orders.filter(o => o.status !== 'cancelled'), [orders]);
  const unpaidOrderIds = useMemo(() => new Set(unpaidOrders.map(uo => uo.orderId)), [unpaidOrders]);

  const handleDragStart = (event: DragStartEvent) => {
    const order = activeOrders.find(o => o.id === event.active.id);
    if (order) {
      setActiveOrder(order);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOrder(null);

    if (!over) return;

    const targetStatus = over.id as OrderStatus;
    const orderId = String(active.id);
    const order = activeOrders.find(o => o.id === orderId);

    if (!order || order.status === targetStatus) return;

    try {
      await updateOrderStatus(orderId, targetStatus);
      toast.success('وضعیت سفارش بروزرسانی شد');
    } catch {
      // Handled with rollback in store
    }
  };

  const handleDragCancel = () => {
    setActiveOrder(null);
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

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-black text-[#0f3229]">داشبورد سفارشات زنده</h1>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              orders={activeOrders.filter(o => o.status === column.id)}
              activeOrder={activeOrder}
              unpaidOrderIds={unpaidOrderIds}
              printingOrderId={printingOrder?.id || null}
              onSelectOrder={setSelectedOrder}
              onPrint={handlePrint}
              onEdit={(orderId) => navigate(`/admin/pos?orderId=${orderId}`)}
              onCancel={handleCancelOrder}
              onStatusChange={async (orderId, newStatus) => {
                try {
                  await updateOrderStatus(orderId, newStatus);
                  toast.success('وضعیت سفارش بروزرسانی شد');
                } catch {
                  // Handled
                }
              }}
              onPaymentChange={handlePaymentChange}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeOrder ? (
            <KanbanOrderCard
              order={activeOrder}
              columnId={activeOrder.status}
              isOverlay={true}
              isUnpaid={unpaidOrderIds.has(activeOrder.id)}
              isPrinting={printingOrder?.id === activeOrder.id}
              onSelectOrder={() => {}}
              onPrint={() => {}}
              onEdit={() => {}}
              onCancel={() => {}}
              onStatusChange={() => {}}
              onPaymentChange={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

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
