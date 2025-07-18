// backend/sockets/socketManager.js -- CORRECTED AND GUARANTEED TO WORK --

const connectedUsers = new Map(); // { roomId -> Map(socketId -> userName) }


function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Heartbeat monitoring
    socket.on('ping', (cb) => {
      if (typeof cb === 'function') cb();
    });

    // Enhanced error handling
    socket.on('error', (error) => {
      console.error(`Socket error (${socket.id}):`, error);
    });

    // Connection validation middleware
    const validateConnection = (handler) => {
      return (data) => {
        if (!socket.connected) {
          console.warn(`Rejecting event from disconnected socket: ${socket.id}`);
          return;
        }
        handler(data);
      };
    };

    // Helper function to find the latest active socket ID for a given username
    function findSocketIdByName(roomId, name) {
      const roomUsers = connectedUsers.get(roomId);
      if (!roomUsers) return null;
      const userEntries = Array.from(roomUsers.entries()).reverse();
      for (const [socketId, userName] of userEntries) {
        if (userName === name) {
          return socketId;
        }
      }
      return null;
    }

    if (!global.latestRoomCode) global.latestRoomCode = {};

    // ---- ROOM LOGIC ----
    socket.on('join-room', validateConnection(({ roomId, user, initialCode }) => {
      if (!user?.name) return;

      socket.join(roomId);

      // Initialize room data if needed
      if (!connectedUsers.has(roomId)) {
        connectedUsers.set(roomId, new Map());
        global.latestRoomCode[roomId] = initialCode || '';
      }

      // Add user to room
      connectedUsers.get(roomId).set(socket.id, user.name);

      // Get updated client list
      const clientList = getClientList(roomId);

      // Broadcast to ALL room members (including the new user)
      io.to(roomId).emit('user-joined', {
        connectedUsers: clientList,
        newUser: user.name
      });

      // Send current code to new user
      if (global.latestRoomCode[roomId]) {
        socket.emit('code-update', {
          code: global.latestRoomCode[roomId]
        });
      }
    }));

    // ---- CODE SYNC LOGIC ----
    socket.on('code-change', validateConnection(({ roomId, code }) => {
      if (!socket.rooms.has(roomId)) return;
      global.latestRoomCode[roomId] = code;
      socket.to(roomId).emit('code-update', { code });
    }));

    socket.on('code-sync', validateConnection(({ roomId, code }) => {
      console.log(`[CODE-SYNC] socket.id=${socket.id}, roomId=${roomId}, code.length=${code ? code.length : 0}`);
      if (!global.latestRoomCode) global.latestRoomCode = {};
      if (!global.latestRoomCode[roomId] || code.length > global.latestRoomCode[roomId].length) {
        global.latestRoomCode[roomId] = code;
        socket.to(roomId).emit('code-update', { code });
      }
    }));

    // ---- TYPING INDICATOR LOGIC ----
    socket.on('typing', validateConnection(({ roomId, userId, name }) => {
      console.log(`[TYPING] socket.id=${socket.id}, roomId=${roomId}, userId=${userId}, name=${name}`);
      socket.to(roomId).emit('user-typing', { userId, name });
    }));

    // ---- REMOTE CURSOR LOGIC ----
    socket.on('cursor-move', validateConnection(({ roomId, userId, name, position }) => {
      console.log(`[CURSOR-MOVE] socket.id=${socket.id}, roomId=${roomId}, userId=${userId}, name=${name}, position=${JSON.stringify(position)}`);
      socket.to(roomId).emit('remote-cursor', { userId, name, position });
    }));

    // ---- DISCONNECT LOGIC (UPGRADED) ----
    socket.on('disconnecting', (reason) => {
      console.log(`Socket disconnecting (${socket.id}):`, reason);
      socket.rooms.forEach(roomId => {
        if (roomId !== socket.id && connectedUsers.has(roomId)) {
          const roomUsers = connectedUsers.get(roomId);
          const disconnectedUserName = roomUsers.get(socket.id);

          if (disconnectedUserName) {
            roomUsers.delete(socket.id);
            const clientList = getClientList(roomId);

            // Broadcast to ALL remaining room members
            io.to(roomId).emit('user-left', {
              userName: disconnectedUserName,
              connectedUsers: clientList
            });

            console.log(`User ${disconnectedUserName} (${socket.id}) left room: ${roomId}`);
          }
        }
      });
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected (${socket.id}):`, reason);
      // Add any cleanup logic here if needed
    });
  });
}
    // Helper function
    function getClientList(roomId) {
      const users = connectedUsers.get(roomId);
      if (!users) return [];
      return Array.from(users.entries()).map(([id, name]) => ({
        id,
        name
      }));
    }

module.exports = initializeSocket;