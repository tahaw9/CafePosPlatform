import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Order, OrderStatus } from '../../store/useOrderStore';
import KanbanOrderCard from './KanbanOrderCard';

interface KanbanColumnProps {
  column: { id: OrderStatus; title: string; color: string };
  orders: Order[];
  activeOrder: Order | null;
  unpaidOrderIds: Set<string>;
  printingOrderId: string | null;
  onSelectOrder: (order: Order) => void;
  onPrint: (order: Order) => void;
  onEdit: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onPaymentChange: (order: Order, method: string) => void;
}

export default function KanbanColumn({
  column,
  orders,
  activeOrder,
  unpaidOrderIds,
  printingOrderId,
  onSelectOrder,
  onPrint,
  onEdit,
  onCancel,
  onStatusChange,
  onPaymentChange
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id }
  });

  const isDropTarget = isOver && activeOrder && activeOrder.status !== column.id;

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[300px] flex flex-col rounded-2xl p-4 transition-all duration-200 ${
        isDropTarget
          ? 'bg-gray-200/90 ring-2 ring-[#0f3229]/40 shadow-md border border-[#0f3229]/20'
          : 'bg-gray-100 border border-transparent'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-2 select-none">
        <h2 className="font-bold text-gray-800">{column.title}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${column.color}`}>
          {orders.length}
        </span>
      </div>
      
      {/* Scrollable Order Cards List */}
      <div className="flex-1 overflow-y-auto space-y-4 ps-1 custom-scrollbar">
        {/* Drop Target Indication Banner */}
        {isDropTarget && (
          <div className="border-2 border-dashed border-[#0f3229]/40 bg-[#0f3229]/5 rounded-xl p-3 text-center text-xs font-bold text-[#0f3229] transition-all animate-pulse">
            رها کنید برای انتقال به «{column.title}»
          </div>
        )}

        {orders.map(order => (
          <KanbanOrderCard
            key={order.id}
            order={order}
            columnId={column.id}
            isUnpaid={unpaidOrderIds.has(order.id)}
            isPrinting={printingOrderId === order.id}
            onSelectOrder={onSelectOrder}
            onPrint={onPrint}
            onEdit={onEdit}
            onCancel={onCancel}
            onStatusChange={onStatusChange}
            onPaymentChange={onPaymentChange}
          />
        ))}
        
        {orders.length === 0 && !isDropTarget && (
          <div className="text-center py-10 text-gray-400 text-sm select-none">
            سفارشی در این مرحله نیست
          </div>
        )}
      </div>
    </div>
  );
}
