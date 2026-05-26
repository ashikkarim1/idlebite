'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket(restaurant_id: string, user_id: string) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!restaurant_id || !user_id) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    socket = io(apiUrl);

    socket.on('connect', () => {
      console.log('Socket connected');
      socket?.emit('auth', { restaurant_id, user_id });
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    return () => {
      socket?.disconnect();
    };
  }, [restaurant_id, user_id]);

  return { socket, connected };
}

export function useSocketEvent(
  event: string,
  callback: (data: unknown) => void,
  dependencies: unknown[] = []
) {
  useEffect(() => {
    if (!socket) return;
    socket.on(event, callback);
    return () => {
      socket?.off(event, callback);
    };
  }, [event, callback, ...dependencies]);
}
