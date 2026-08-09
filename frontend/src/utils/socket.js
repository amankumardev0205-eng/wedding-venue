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

  socket.on('connect', () => {
    console.log('Socket.io: Connected to server successfully with ID:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket.io: Connection error details:', err.message, err.description || '');
  });

  socket.on('disconnect', (reason) => {
    console.warn('Socket.io: Disconnected from server. Reason:', reason);
  });

  return socket;
}

export function getSocket() {
  return socket;
}
