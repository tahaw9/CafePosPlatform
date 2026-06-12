import React, { useEffect } from 'react';
import { useOrderStore, TableStatus } from '../store/useOrderStore';

const STATUS_COLORS: Record<TableStatus, string> = {
  empty: 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200',
  occupied: 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200',
  waiter_called: 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 animate-pulse',
};

const STATUS_TEXT: Record<TableStatus, string> = {
  empty: 'خالی',
  occupied: 'پر',
  waiter_called: 'گارسون',
};

export default function AdminTables() {
  const { tables, orders, fetchInitialData } = useOrderStore();

  useEffect(() => {
    if (tables.length === 0) fetchInitialData();
  }, [fetchInitialData, tables.length]);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0f3229]">وضعیت میزها</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map(table => {
          // Find if there's an active order for this table
          const activeOrder = orders.find(
            o => o.tableId === table.id && o.status !== 'cancelled' && o.status !== 'completed'
          );

          return (
            <div 
              key={table.id}
              className={`border-2 rounded-2xl p-4 flex flex-col cursor-pointer transition-colors ${STATUS_COLORS[table.status]}`}
            >
              <div className="text-center font-bold text-xl mb-2">{table.name}</div>
              <div className="mt-auto pt-2 border-t border-black/10 text-center text-sm font-medium">
                {STATUS_TEXT[table.status]}
              </div>
              {activeOrder && (
                <div className="text-center text-xs mt-1 bg-black/5 rounded px-1 py-0.5" title="سفارش فعال">
                  #{activeOrder.orderCode}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
