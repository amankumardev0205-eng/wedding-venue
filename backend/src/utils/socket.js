import { Server } from 'socket.io';
import Message from '../models/Message.js';

let io = null;

export const initSocket = (server) => {
  if (io) return io;
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // Join a user's private room or role room
    socket.on('room:join', (roomId) => {
      if (roomId) {
        socket.join(roomId);
        console.log(`Socket joined room: ${roomId}`);
      }
    });

    // Real-time direct message sender
    socket.on('chat:send', async (data) => {
      const { sender, receiver, text, inquiryId } = data;
      if (!sender || !receiver || !text) return;
      
      try {
        const newMessage = new Message({
          sender,
          receiver,
          text,
          inquiry: inquiryId || null,
          read: false,
          createdAt: new Date().toISOString()
        });
        await newMessage.save();

        // Broadcast to receiver and sender (to sync multiple tabs)
        const messageObject = newMessage.toObject(true);
        io.to(receiver).emit('chat:message', messageObject);
        io.to(sender).emit('chat:message', messageObject);
      } catch (err) {
        console.error('Error saving socket message:', err.message);
      }
    });

    // Real-time typing status broadcast
    socket.on('chat:typing', (data) => {
      const { sender, receiver, isTyping } = data;
      if (receiver) {
        io.to(receiver).emit('chat:typing', { sender, isTyping });
      }
    });

    socket.on('disconnect', () => {
      // noop
    });
  });

  return io;
};

export const getIo = () => io;
