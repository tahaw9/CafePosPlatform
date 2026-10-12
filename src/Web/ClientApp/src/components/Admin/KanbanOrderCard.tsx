import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { MessageSquare, Info, Printer, Loader2, GripVertical } from 'lucide-react';
import { Order, OrderStatus, PaymentMethod } from '../../store/useOrderStore';
import Dropdown from './Dropdown';

interface KanbanOrderCardProps {
  order: Order;
  columnId: string;
  isOverlay?: boolean;
  isUnpaid: boolean;
  isPrinting: boolean;
  onSelectOrder: (order: Order) => void;
  onPrint: (order: Order) => void;
  onEdit: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onPaymentChange: (order: Order, method: string) => void;
}

export default function KanbanOrderCard({
  order,
  columnId,
  isOverlay = false,
  isUnpaid,
  isPrinting,
  onSelectOrder,
  onPrint,
  onEdit,
  onCancel,
  onStatusChange,
  onPaymentChange
}: KanbanOrderCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: order.id,
    data: { order, columnId },
    disabled: isOverlay
  });

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      className={`bg-white p-4 rounded-xl border flex flex-col transition-all select-none touch-manipulation ${
        isOverlay
          ? 'shadow-2xl ring-2 ring-[#0f3229]/30 border-[#0f3229]/20 rotate-1 scale-[1.02] cursor-grabbing w-[320px]'
          : isDragging
            ? 'opacity-30 border-dashed border-2 border-gray-300 shadow-none scale-[0.99] cursor-grabbing'
            : 'shadow-sm border-gray-100 hover:shadow-md hover:border-gray-200 cursor-grab active:cursor-grabbing'
      }`}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-1.5">
          {/* Grip Drag Affordance */}
          <div 
            className="mt-0.5 text-gray-300 hover:text-gray-500 transition-colors p-0.5 rounded touch-none"
            title="برای جابجایی بکشید"
          >
            <GripVertical size={18} />
          </div>
          <div>
            <button 
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onSelectOrder(order)}
              className="font-bold text-lg hover:text-[#0f3229] transition-colors flex items-center gap-1 cursor-pointer"
            >
              #{order.orderCode} <Info size={16} className="text-gray-400" />
            </button>
            <div className="text-sm text-gray-500 mt-0.5">
              {order.tableNumber ? `میز ${order.tableNumber}` : 'بیرون‌بر'}
            </div>
          </div>
        </div>

        <div className="text-end flex flex-col items-end gap-1">
          <div className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          {order.isPaid ? (
            <span className="inline-block mt-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
              پرداخت شده
            </span>
          ) : isUnpaid ? (
            <span className="inline-block mt-1 bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-xs border border-red-200">
              عدم پرداخت (نسیه)
            </span>
          ) : (
            <div className="mt-1" onPointerDown={(e) => e.stopPropagation()}>
              <Dropdown 
                value="" 
                onChange={(val) => onPaymentChange(order, val)}
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
      
      {/* Order Items List */}
      <ul className="text-sm space-y-2 mb-4 bg-gray-50 p-3 rounded-lg flex-1">
        {order.items.map(item => (
          <li key={item.id} className="flex flex-col border-b border-gray-100 last:border-0 pb-2 last:pb-0">
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">
                <span className="text-gray-400 ms-1">{item.quantity}x</span> {item.name}
              </span>
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

      {/* Card Footer Actions */}
      <div className="flex flex-col gap-2 mt-auto pt-2" onPointerDown={(e) => e.stopPropagation()}>
        <Dropdown 
          value={order.status}
          onChange={(val) => onStatusChange(order.id, val as OrderStatus)}
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
        
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => onPrint(order)}
            disabled={isPrinting}
            className={`flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200 flex items-center justify-center gap-2 cursor-pointer ${isPrinting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPrinting ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            چاپ
          </button>
          {columnId !== 'completed' && (
            <button 
              type="button"
              onClick={() => onEdit(order.id)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200 cursor-pointer"
            >
              ویرایش
            </button>
          )}
        </div>
        
        {columnId !== 'completed' && (
          <button 
            type="button"
            onClick={() => onCancel(order.id)}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium transition-colors border border-red-200 cursor-pointer"
          >
            لغو سفارش
          </button>
        )}
      </div>
    </div>
  );
}
