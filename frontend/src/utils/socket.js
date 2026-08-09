import { io } from 'socket.io-client';

let socket = null;

export function initSocketClient() {
  if (socket) return socket;
  let base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  if (base.endsWith('/api')) {
    base = base.slice(0, -4);
  } else if (base.endsWith('/api/')) {
    base = base.slice(0, -5);
  }
  socket = io(base, { 
    autoConnect: true,
    withCredentials: true
  });
  // reconnect logic is handled by socket.io
  return socket;
}

export function getSocket() {
  return socket;
}
