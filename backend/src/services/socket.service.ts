import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import Notification from '../models/Notification';

let io: SocketServer | null = null;
const userSockets = new Map<string, string>();

export const initSocket = (server: HttpServer): void => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('register', (userId: string) => {
      userSockets.set(userId, socket.id);
    });

    socket.on('mark_all_read', async (userId: string) => {
      await Notification.updateMany({ recipient: userId, read: false }, { read: true });
    });

    socket.on('disconnect', () => {
      userSockets.forEach((socketId, userId) => {
        if (socketId === socket.id) userSockets.delete(userId);
      });
    });
  });
};

export const sendNotification = async (
  recipientId: string,
  message: string,
  type: 'application' | 'status' | 'job' | 'general',
  link?: string
): Promise<void> => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      message,
      type,
      link,
    });

    if (io) {
      const socketId = userSockets.get(recipientId);
      if (socketId) {
        io.to(socketId).emit('notification', {
          _id: notification._id,
          message: notification.message,
          type: notification.type,
          read: notification.read,
          link: notification.link,
          createdAt: notification.createdAt,
        });
      }
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};