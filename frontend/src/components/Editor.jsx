import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import Avatar from 'react-avatar';
import { Play } from 'lucide-react';

const languageOptions = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java', 
};


const Editor = ({ socketRef, roomId, onCodeChange, initialCode, username, language: initialLanguage = 'javascript', onExecute, currentLanguage }) => {
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [decorations, setDecorations] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [language, setLanguage] = useState(initialLanguage);
  const [value, setValue] = useState(initialCode || '');
  const [output, setOutput] = useState('');
  const [executionMethod, setExecutionMethod] = useState('Checking...');

  // Detect execution method on mount
  useEffect(() => {
    setExecutionMethod('Local/Web'); // Set directly since we're not checking Docker
  }, []);

  // Function to execute code via backend
  const executeCode = async (code, lang) => {
    try {
      const token = localStorage.getItem('devsync-token');
      if (!token) {
        throw new Error('Not authenticated. Please login again.');
      }

      setOutput(`Executing (${executionMethod})...`);
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, language: lang })
      });

      if (response.status === 401) {
        localStorage.removeItem('devsync-token');
        window.location.reload();
        throw new Error('Session expired. Please login again.');
      }

      const result = await response.json();

      // Handle both output and error cases
      if (result.output) {
        setOutput(result.output);
      } else if (result.error) {
        setOutput(`Error: ${result.error}`);
      } else {
        setOutput('Execution completed with no output');
      }

      return result;
    } catch (error) {
      console.error('Execution error:', error);
      setOutput(`Error: ${error.message}`);
      return { error: error.message };
    }
  };
  // Handle language-specific configurations
  useEffect(() => {
    if (editorRef.current && window.monaco) {
      const model = editorRef.current.getModel();
      if (model && language) {
        window.monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);



  // Handle initial code and updates
  useEffect(() => {
    if (editorRef.current && initialCode !== undefined) {
      if (editorRef.current.getValue() !== initialCode) {
        isRemoteChange.current = true;
        editorRef.current.setValue(initialCode);
        setValue(initialCode);
        isRemoteChange.current = false;
      }
    }
  }, [initialCode]);




  // Socket listeners
  useEffect(() => {
    if (!socketRef.current) return;

    // --- Event Handlers ---
    const handleCodeUpdate = ({ code, lang }) => {
      if (!editorRef.current || isRemoteChange.current) return;
      if (code !== null && editorRef.current.getValue() !== code) {
        isRemoteChange.current = true;
        editorRef.current.setValue(code);
        setValue(code);
        isRemoteChange.current = false;
      }
      if (lang && lang !== language) {
        setLanguage(lang);
      }
    };

    const handleLanguageChange = ({ language: newLang }) => {
      if (newLang && newLang !== language) {
        setLanguage(newLang);
      }
    };

    const cursorTimeouts = {}; // Use a local object for timeouts
    const handleRemoteCursor = ({ userId, name, position }) => {
      setRemoteCursors(prev => ({ ...prev, [userId]: { name, position } }));
      if (cursorTimeouts[userId]) clearTimeout(cursorTimeouts[userId]);
      cursorTimeouts[userId] = setTimeout(() => {
        setRemoteCursors(prev => {
          const newCursors = { ...prev };
          delete newCursors[userId];
          return newCursors;
        });
      }, 2000); // Cursor disappears after 2 seconds of inactivity
    };

    const handleUserTyping = ({ userId, name }) => {
      setTypingUsers(prev => {
        const updated = { ...prev, [userId]: name };
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

    // --- Registering Socket Listeners ---
    socketRef.current.on('code-update', handleCodeUpdate);
    socketRef.current.on('language-change', handleLanguageChange);
    socketRef.current.on('remote-cursor', handleRemoteCursor);
    socketRef.current.on('user-typing', handleUserTyping);

    // --- Setting up Monaco Editor Listeners ---
    let cursorListenerDisposable = null;
    if (editorRef.current) {
      cursorListenerDisposable = editorRef.current.onDidChangeCursorPosition((e) => {
        if (socketRef.current?.connected && username) {
          socketRef.current.emit('cursor-move', {
            roomId,
            userId: socketRef.current.id,
            name: username,
            position: e.position,
          });
        }
      });
    }

    // --- Cleanup Function ---
    return () => {
      socketRef.current.off('code-update', handleCodeUpdate);
      socketRef.current.off('language-change', handleLanguageChange);
      socketRef.current.off('remote-cursor', handleRemoteCursor);
      socketRef.current.off('user-typing', handleUserTyping);
      if (cursorListenerDisposable) {
        cursorListenerDisposable.dispose();
      }
      Object.values(cursorTimeouts).forEach(clearTimeout);
    };
  }, [socketRef.current, roomId, username, language]);


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


  const handleEditorDidMount = (editor, monaco) => {
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
    // Register languages (optional, for completeness)
    if (monaco) {
      monaco.languages.register({ id: 'python' });
      monaco.languages.register({ id: 'cpp' });
      monaco.languages.register({ id: 'java' });
      // Add more as needed
    }
  };




  const handleEditorChange = (newValue) => {
    if (isRemoteChange.current) return;
    setValue(newValue);
    onCodeChange(newValue);

    if (socketRef.current?.connected) {
      // Send the new code to others
      socketRef.current.emit('code-change', {
        roomId,
        code: newValue,
        language,
      });

      // Also send the typing signal at the same time
      socketRef.current.emit('typing', {
        roomId,
        userId: socketRef.current.id,
        name: username,
      });
    }
  };




  return (
    <div className="h-full flex flex-col">
      {/* Language selector and Run button */}
      <div className="bg-gray-800 p-2 flex justify-between items-center">
        <select
          value={language}
          onChange={(e) => {
            const newLang = e.target.value;
            setLanguage(newLang);
            if (socketRef.current?.connected) {
              socketRef.current.emit('language-change', { roomId, language: newLang });
            }
          }}
          className="bg-gray-700 text-white px-3 py-1 rounded"
        >
          {Object.entries(languageOptions).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <button
          onClick={async () => {
            if (!editorRef.current) return;
            const result = await executeCode(editorRef.current.getValue(), language);
            setOutput(result.output || result.error);
          }}
          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded flex items-center gap-2"
        >
          <Play size={14} />
          Run
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-1">
        Execution method: {executionMethod}
      </div>
      {/* Editor */}
      <div style={{ position: 'relative', height: '100%' }}>
        {/* Output Panel */}
        {output && (
          <div className="bg-gray-900 text-green-400 p-3 border-t border-gray-700 font-mono text-sm" style={{whiteSpace: 'pre-wrap'}}>
            <strong>Output:</strong>
            <div>{output}</div>
          </div>
        )}
        <MonacoEditor
          height="100%"
          language={language}
          theme="vs-dark"
          value={value}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            wordWrap: 'on',
            smoothScrolling: true,
            cursorSmoothCaretAnimation: 'on',
            automaticLayout: true,
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
    </div>
  );
};

export default Editor;
