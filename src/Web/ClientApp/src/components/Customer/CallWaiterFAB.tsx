import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import toast from 'react-hot-toast';

import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import api from '../../lib/api';

interface CallWaiterProps {
  tableId?: string;
}

export default function CallWaiterFAB({ tableId }: CallWaiterProps) {
  const [isCalling, setIsCalling] = useState(false);
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    // Determine the SignalR URL by extracting the origin from our configured axios instance
    // api.defaults.baseURL might be "http://localhost:5000/api", we want "http://localhost:5000"
    const baseURL = api.defaults.baseURL || '';
    const backendOrigin = baseURL.endsWith('/api') ? baseURL.slice(0, -4) : baseURL;
    const signalRUrl = `${backendOrigin}/hubs/cafeHub`;
    
    console.log("Connecting to SignalR at:", signalRUrl);

    const newConnection = new HubConnectionBuilder()
      .withUrl(signalRUrl)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    newConnection.start()
      .then(() => {
        console.log('Customer connected to SignalR cafeHub');
      })
      .catch((e) => {
        console.error('Failed to connect to SignalR hub:', e);
      });

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, []);

  const handleCall = async () => {
    if (!connection || connection.state !== 'Connected') {
      toast.error('ارتباط با سرور برقرار نیست. لطفا صبر کنید یا صفحه را رفرش کنید.');
      return;
    }

    setIsCalling(true);

    try {
      // Invoke the 'RequestWaiter' method on CafeHub.cs
      await connection.invoke('RequestWaiter', tableId || 'نامشخص');
      toast.success(`گارسون برای میز ${tableId || 'نامشخص'} فراخوانی شد`);
    } catch (error) {
      console.error('Error invoking RequestWaiter:', error);
      toast.error('خطا در فراخوانی گارسون.');
    } finally {
      // reset after 5 seconds to allow calling again (anti-spam)
      setTimeout(() => {
        setIsCalling(false);
      }, 5000);
    }
  };

  return (
    <button
      onClick={handleCall}
      disabled={isCalling}
      className={`fixed bottom-24 left-6 z-40 shadow-xl p-4 rounded-full flex items-center justify-center transition-all ${isCalling ? 'bg-green-600 text-white cursor-default' : 'bg-transparent border-2 border-cafe-accent text-cafe-text hover:bg-cafe-accent hover:text-[#0f3229]'
        }`}
    >
      {isCalling ? <Check size={24} strokeWidth={2} /> : <Bell size={24} strokeWidth={2} />}
    </button>
  );
}
