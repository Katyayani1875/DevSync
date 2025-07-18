
import React, { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import { initSocket } from '../socket';
import Editor from '../components/Editor';
import Sidebar from '../components/Sidebar';
import { Copy, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { console.error('Editor Error:', error); }
  render() {
    return this.state.hasError ? (
      <div className="p-4 bg-red-100 text-red-800">Editor Error - Please refresh</div>
    ) : this.props.children;
  }
}



const EditorPage = () => {
  const [currentCode, setCurrentCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [clients, setClients] = useState([]);
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
  }, []);

  const playSound = (soundFile) => {
    if (audioRef.current) {
      audioRef.current.src = `/sounds/${soundFile}`;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };


  useEffect(() => {
    let isMounted = true;
    let retryAttempt = 0;
    const maxRetryDelay = 30000; // 30 seconds max
    const listeners = [];

    const init = async () => {
      try {
        const socket = await initSocket();
        if (!isMounted) return;

        socketRef.current = socket;
        setIsConnected(true);
        retryAttempt = 0; // Reset retry counter on success

        // Event handlers
        const handleCodeUpdate = ({ code }) => {
          if (!isMounted) return;
          setCurrentCode(code); // Just update the state, Editor will handle the sync
        };

        // Add all other handlers similarly...
        const handleUserJoined = ({ connectedUsers, newUser, userId }) => {
          if (!isMounted) return;
          setClients(connectedUsers); // Always update clients from server
          toast.success(`${newUser} joined the room.`);
          // Only play sound if this client is not the one who triggered the join
          if (socketRef.current && socketRef.current.id !== userId) {
            playSound('join.mp3');
          }
        };

        const handleUserLeft = ({ userName, connectedUsers, userId }) => {
          if (!isMounted) return;
          setClients(connectedUsers); // Always update clients from server
          toast.error(`${userName} left the room.`);
          // Only play sound if this client is not the one who triggered the leave
          if (socketRef.current && socketRef.current.id !== userId) {
            playSound('leave.mp3');
          }
        };

        socket.on('code-update', handleCodeUpdate);
        socket.on('user-joined', handleUserJoined);
        socket.on('user-left', handleUserLeft);
        socket.on('disconnect', () => setIsConnected(false));
        socket.on('reconnect', () => setIsConnected(true));

        listeners.push(
          { event: 'code-update', handler: handleCodeUpdate },
          { event: 'user-joined', handler: handleUserJoined },
          { event: 'user-left', handler: handleUserLeft }
        );

        // Join room with retry logic
        const joinRoomWithRetry = () => {
          if (!isMounted || !socketRef.current?.connected) return;
          socketRef.current.emit('join-room', {
            roomId,
            user: { name: user?.name },
            initialCode: currentCode
          }, (ack) => {
            if (!ack?.success) {
              const delay = Math.min(2000 * Math.pow(2, retryAttempt), maxRetryDelay);
              setTimeout(joinRoomWithRetry, delay);
              retryAttempt++;
            }
          });
        };

        joinRoomWithRetry();

        // Do not play join sound for creator here; handled in event handler to avoid double sound

      } catch (err) {
        if (!isMounted) return;
        console.error('Socket init error:', err);
        const retryDelay = Math.min(2000 * Math.pow(2, retryAttempt), maxRetryDelay);
        retryAttempt++;
        setTimeout(init, retryDelay);
      }
    };

    if (user) init();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        // Cleanup all listeners
        listeners.forEach(({ event, handler }) => {
          socketRef.current.off(event, handler);
        });
        // Graceful disconnect
        if (socketRef.current.connected) {
          socketRef.current.volatile.emit('leave-room', { roomId });
          socketRef.current.disconnect();
        }
      }
    };
  }, [user, roomId]);

  const handleCodeChange = useCallback((newCode) => {
    setCurrentCode(newCode);
    if (socketRef.current?.connected) {
      socketRef.current.emit('code-change', {
        roomId,
        code: newCode
      });
    }
  }, [roomId, currentCode]);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been copied to your clipboard');
    } catch (err) {
      toast.error('Could not copy the Room ID');
      console.error(err);
    }
  }

  function leaveRoom() {
    playSound('leave.mp3'); // Play leave sound for creator
    setTimeout(() => {
      logout();
      navigate('/');
    }, 200); // Give time for sound to play
  }

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar clients={clients} />
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 p-2 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex gap-4">
            <button onClick={copyRoomId} className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
              <Copy size={16} /> Copy Room ID
            </button>
            <button onClick={leaveRoom} className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 hover:bg-red-500 rounded-md transition-colors">
              <LogOut size={16} /> Leave Room
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ErrorBoundary>
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={handleCodeChange}
              initialCode={currentCode}
              username={user?.name}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;