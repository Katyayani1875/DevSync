import { io } from 'socket.io-client';

export const initSocket = async () => {
  const socket = io('http://localhost:5000', {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity, // Keep trying to reconnect
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5, // For better backoff
    pingTimeout: 20000,       // Reduced from 60s
    pingInterval: 10000,      // Reduced from 25s
    timeout: 20000,           // Connection timeout
    autoConnect: true,        // Ensure auto-connect is enabled
    closeOnBeforeunload: true
  });

  return new Promise((resolve, reject) => {
    const connectionTimeout = setTimeout(() => {
      reject(new Error('Connection timeout'));
    }, 20000);

    const errorHandler = (err) => {
      clearTimeout(connectionTimeout);
      reject(err);
    };

    const connectHandler = () => {
      clearTimeout(connectionTimeout);
      socket.off('connect_error', errorHandler);
      resolve(socket);
    };

    socket.once('connect', connectHandler);
    socket.once('connect_error', errorHandler);
  });
};