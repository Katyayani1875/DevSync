



import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import Avatar from 'react-avatar';



const Editor = ({ socketRef, roomId, onCodeChange, initialCode, username }) => {
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [decorations, setDecorations] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});


  // Handle initial code and updates
  useEffect(() => {
    if (editorRef.current && initialCode !== undefined) {
      if (editorRef.current.getValue() !== initialCode) {
        isRemoteChange.current = true;
        editorRef.current.setValue(initialCode);
        isRemoteChange.current = false;
      }
    }
  }, [initialCode]);



  // Socket listeners
  useEffect(() => {
    if (!socketRef.current) return;

    const handleCodeUpdate = ({ code }) => {
      if (!editorRef.current || isRemoteChange.current) return;
      if (code !== null && editorRef.current.getValue() !== code) {
        isRemoteChange.current = true;
        editorRef.current.setValue(code);
        isRemoteChange.current = false;
      }
    };

    const handleRemoteCursor = ({ userId, name, position }) => {
      setRemoteCursors(prev => ({
        ...prev,
        [userId]: { name, position }
      }));
    };

    const handleUserTyping = ({ userId, name }) => {
      setTypingUsers(prev => {
        const updated = { ...prev, [userId]: name };
        // Auto-clear after 3 seconds of inactivity
        setTimeout(() => {
          setTypingUsers(current => {
            const newState = { ...current };
            delete newState[userId];
            return newState;
          });
        }, 3000);
        return updated;
      });
    };

    socketRef.current.on('code-update', handleCodeUpdate);
    socketRef.current.on('remote-cursor', handleRemoteCursor);
    socketRef.current.on('user-typing', handleUserTyping);

    // Track cursor movements and typing
    const trackCursorMovement = (e) => {
      if (socketRef.current?.connected && username) {
        socketRef.current.emit('cursor-move', {
          roomId,
          userId: socketRef.current.id,
          name: username,
          position: e.position
        });
        // Also emit typing event
        socketRef.current.emit('typing', {
          roomId,
          userId: socketRef.current.id,
          name: username
        });
      }
    };

    let cursorListenerDisposable = null;
    if (editorRef.current) {
      cursorListenerDisposable = editorRef.current.onDidChangeCursorPosition(trackCursorMovement);
    }

    return () => {
      socketRef.current.off('code-update', handleCodeUpdate);
      socketRef.current.off('remote-cursor', handleRemoteCursor);
      socketRef.current.off('user-typing', handleUserTyping);
      if (cursorListenerDisposable) {
        cursorListenerDisposable.dispose();
      }
    };
  }, [socketRef.current, roomId, username]);


  // Update cursor decorations
  useEffect(() => {
    if (!editorRef.current || !window.monaco) return;

    const monaco = window.monaco;
    const newDecorations = Object.entries(remoteCursors)
      .filter(([userId]) => userId !== socketRef.current?.id)
      .filter(([_, cursor]) => cursor?.position)
      .map(([userId, { name, position }]) => {
        return {
          range: new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          options: {
            className: 'remote-cursor',
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
          }
        };
      });

    const decorationIds = editorRef.current.deltaDecorations(decorations, newDecorations);
    setDecorations(decorationIds);
  }, [remoteCursors]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    // Emit initial cursor position
    const position = editor.getPosition();
    if (socketRef.current?.connected && username) {
      socketRef.current.emit('cursor-move', {
        roomId,
        userId: socketRef.current.id,
        name: username,
        position
      });
    }
  };



  const handleEditorChange = (value) => {
    if (isRemoteChange.current) return;
    onCodeChange(value);
    // Emit typing event on change
    if (socketRef.current?.connected && username) {
      socketRef.current.emit('typing', {
        roomId,
        userId: socketRef.current.id,
        name: username
      });
    }
  };



  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <MonacoEditor
        height="100%"
        language="javascript"
        theme="vs-dark"
        value={initialCode}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        options={{
          fontSize: 14,
          minimap: { enabled: true },
          wordWrap: 'on',
          smoothScrolling: true,
          cursorSmoothCaretAnimation: 'on',
        }}
      />
      {/* Floating typing indicators */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {Object.entries(typingUsers).map(([userId, name]) => (
          userId !== socketRef.current?.id && (
            <div 
              key={userId} 
              className="flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded-md shadow-lg"
            >
              <Avatar name={name} size="24" round="6px" />
              <span className="font-medium">{name} is typing...</span>
            </div>
          )
        ))}
      </div>
      {/* Remote cursors with names */} 
      {Object.entries(remoteCursors).map(([userId, { name, position }]) => (
        userId !== socketRef.current?.id && position && (
          <div
            key={userId}
            className="absolute pointer-events-none"
            style={{
              top: `${(position.lineNumber - 1) * 19}px`,
              left: `${position.column * 8.5}px`,
              transform: 'translateY(-16px)'
            }}
          >
            <div className="flex items-center bg-gray-800 text-white px-2 py-1 rounded-md shadow-md">
              <Avatar name={name} size="20" round="4px" />
              <span className="ml-1 text-xs font-medium">{name}</span>
            </div>
            <div className="remote-cursor-line"></div>
          </div>
        )
      ))}
    </div>
  );
};

export default Editor;
