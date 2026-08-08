import { io } from 'socket.io-client';

let socket = null;

export function initSocketClient() {
  if (socket) return socket;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  socket = io(base, { autoConnect: true });
  // reconnect logic is handled by socket.io
  return socket;
}

export function getSocket() {
  return socket;
}
