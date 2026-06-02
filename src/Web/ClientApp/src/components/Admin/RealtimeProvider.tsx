import React, { useEffect, useState, useRef } from 'react';
import * as Toast from '@radix-ui/react-toast';
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import { Bell, Coffee, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';

interface ToastData {
  id: string;
  title: string;
  description: string;
  type: 'order' | 'waiter';
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const { token } = useAuthStore();

  // Create audio elements
  const newOrderAudio = useRef(new Audio('/new-order.wav'));
  const bellAudio = useRef(new Audio('/bell.wav'));
  const hasInteracted = useRef(false);

  useEffect(() => {
    const onInteract = () => {
      if (!hasInteracted.current) {
        hasInteracted.current = true;
        setToasts(prev => prev.filter(t => t.id !== 'audio-warning'));
      }
    };

    window.addEventListener('click', onInteract, { once: true });
    window.addEventListener('keydown', onInteract, { once: true });
    window.addEventListener('touchstart', onInteract, { once: true });

    return () => {
      window.removeEventListener('click', onInteract);
      window.removeEventListener('keydown', onInteract);
      window.removeEventListener('touchstart', onInteract);
    };
  }, []);

  const playAudio = (audioElement: HTMLAudioElement) => {
    const isInteracted = hasInteracted.current || (navigator as any).userActivation?.hasBeenActive;

    if (!isInteracted) {
      setToasts(prev => {
        if (prev.some(t => t.id === 'audio-warning')) return prev;
        return [...prev, {
          id: 'audio-warning',
          type: 'waiter',
          title: 'صدا غیرفعال است',
          description: 'برای پخش صدای اعلان‌ها، لطفاً یک بار روی صفحه کلیک کنید.',
        }];
      });
      return;
    }

    audioElement.currentTime = 0;
    audioElement.play().catch(e => console.warn("Audio play failed:", e));
  };

  const handleNewOrder = (orderDetails: any) => {
    const tableStr = orderDetails?.tableId === 'takeaway' ? 'بیرون‌بر' : `میز ${orderDetails?.tableId || 'نامشخص'}`;
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, {
      id,
      type: 'order',
      title: 'سفارش جدید دریافت شد',
      description: `سفارش جدید برای ${tableStr} ثبت شد.`,
    }]);

    playAudio(newOrderAudio.current);
  };

  const handleWaiterCall = (tableId: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, {
      id,
      type: 'waiter',
      title: 'درخواست سالن‌کار',
      description: `مشتری در میز ${tableId || 'نامشخص'} درخواست سالن‌کار دارد.`,
    }]);

    playAudio(bellAudio.current);
  };

  useEffect(() => {
    // Determine the SignalR URL by extracting the origin from our configured axios instance
    // api.defaults.baseURL might be "http://localhost:5000/api", we want "http://localhost:5000"
    const baseURL = api.defaults.baseURL || '';
    const backendOrigin = baseURL.endsWith('/api') ? baseURL.slice(0, -4) : baseURL;
    const signalRUrl = `${backendOrigin}/hubs/cafeHub`;

    console.log("Admin connecting to SignalR at:", signalRUrl);

    const newConnection = new HubConnectionBuilder()
      .withUrl(signalRUrl, {
        accessTokenFactory: () => token || '',
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [token]);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('Connected to SignalR cafeHub');

          connection.on('ReceiveNewOrder', handleNewOrder);
          connection.on('WaiterCalled', handleWaiterCall);
        })
        .catch(e => console.log('SignalR disabled or unreachable purely in preview mode.'));

      return () => {
        connection.stop();
      };
    }
  }, [connection]);

  return (
    <Toast.Provider swipeDirection="right">
      {children}

      {toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          className="toast-root bg-white border border-gray-200 shadow-xl rounded-xl p-4 flex gap-4 w-full max-w-sm items-start relative overflow-hidden rtl"
          duration={5000}
          onOpenChange={(open) => {
            if (!open) {
              setToasts(prev => prev.filter(t => t.id !== toast.id));
            }
          }}
        >
          {/* Accent border */}
          <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${toast.type === 'order' ? 'bg-[#0f3229]' : 'bg-amber-500'}`} />

          <div className={`mt-0.5 shrink-0 rounded-full p-2 ${toast.type === 'order' ? 'bg-[#0f3229]/10 text-[#0f3229]' : 'bg-amber-100 text-amber-600'}`}>
            {toast.type === 'order' ? <Coffee size={20} /> : <Bell size={20} />}
          </div>

          <div className="flex-1">
            <Toast.Title className="font-bold text-gray-900 mb-1">{toast.title}</Toast.Title>
            <Toast.Description className="text-sm text-gray-500 font-medium">{toast.description}</Toast.Description>
          </div>

          <Toast.Close className="text-gray-400 hover:text-gray-700 p-1 shrink-0 transition-colors">
            <X size={18} />
          </Toast.Close>
        </Toast.Root>
      ))}

      <Toast.Viewport className="fixed bottom-0 right-0 p-6 flex flex-col gap-3 w-full max-w-sm m-0 list-none z-[2147483647] outline-none" />

      {/* Dev Environment Fake Triggers */}
      {(import.meta as any).env.DEV && (
        <div className="fixed bottom-4 left-4 z-[99999] bg-white p-3 rounded-2xl border-2 border-dashed border-emerald-500 flex flex-col gap-2 rtl shadow-xl print:hidden">
          <div className="text-xs font-bold text-emerald-800 text-center mb-1">ابزار تست SignalR</div>
          <button
            onClick={() => handleNewOrder({ tableId: Math.floor(Math.random() * 10) + 1 })}
            className="text-xs py-2 px-4 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors rounded-lg font-bold"
          >
            تست: سفارش جدید
          </button>
          <button
            onClick={() => handleWaiterCall(String(Math.floor(Math.random() * 10) + 1))}
            className="text-xs py-2 px-4 bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors rounded-lg font-bold"
          >
            تست: احضار سالن‌کار
          </button>
        </div>
      )}
    </Toast.Provider>
  );
}
