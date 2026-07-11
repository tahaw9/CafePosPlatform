import React, { forwardRef } from 'react';
import { OrderItem } from '../../store/useOrderStore';

export interface ThermalReceiptProps {
  cart: OrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  isTakeaway: boolean;
  tableName?: string;
  orderId?: string;
  orderCode?: number;
}

const ThermalReceipt = forwardRef<HTMLDivElement, ThermalReceiptProps>(
  ({ cart, subtotal, discountAmount, total, isTakeaway, tableName, orderId, orderCode }, ref) => {
    const dateStr = new Date().toLocaleDateString('fa-IR');
    const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    return (
      <div ref={ref} dir="rtl" className="w-[80mm] mx-auto bg-white text-black p-4 rtl font-mono print:w-[80mm] print:p-0">
        <div className="text-center mb-4 border-b-2 border-black border-dashed pb-2">
          <h1 className="font-black text-2xl mb-1 text-center font-sans tracking-tighter">THINK</h1>
          <h2 className="font-serif italic text-sm text-center mb-2" style={{ fontFamily: 'cursive' }}>Coffee</h2>
          {!isTakeaway && tableName && (
            <div className="text-sm font-bold">
              {tableName}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            صندوق‌دار: ادمین
          </div>
          {orderCode ? (
            <div className="text-lg font-black mt-2 mb-1 text-black bg-gray-100 py-1 rounded border border-gray-300">
              کد سفارش: <span className="font-mono">{orderCode}</span>
            </div>
          ) : orderId ? (
            <div className="text-lg font-black mt-2 mb-1 text-black bg-gray-100 py-1 rounded border border-gray-300">
              کد سفارش: <span className="font-mono">{orderId.replace('ORD-', '')}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-xs mt-2">
            <span>{dateStr}</span>
            <span>{timeStr}</span>
          </div>
        </div>

      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="border-b border-black">
            <th className="text-start py-1 w-1/2">شرح</th>
            <th className="text-center py-1 w-1/6">تعداد</th>
            <th className="text-end py-1 w-1/3">قیمت (ت)</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, i) => (
            <tr key={i}>
              <td className="text-start py-1 truncate pe-1">{item.name}</td>
              <td className="text-center py-1">{item.quantity}</td>
              <td className="text-end py-1">{(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t-2 border-black border-dashed pt-2 space-y-1 text-sm font-bold">
        <div className="flex justify-between">
          <span>جمع اقلام:</span>
          <span>{subtotal.toLocaleString()}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between">
            <span>تخفیف:</span>
            <span>{discountAmount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-base mt-2 pt-2 border-t border-black">
          <span>مبلغ نهایی:</span>
          <span>{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="text-center text-xs mt-6 pt-2 border-t border-black border-dashed">
        از خرید شما سپاسگزاریم
      </div>
    </div>
  );
});

export default ThermalReceipt;
