import React, { useRef, useEffect } from 'react';

const AudioPlayer = ({ playJoin, playLeave }) => {
  const joinAudioRef = useRef(null);
  const leaveAudioRef = useRef(null);

  useEffect(() => {
    // Preload audio files
    joinAudioRef.current = new Audio('/sounds/join.mp3');
    leaveAudioRef.current = new Audio('/sounds/leave.mp3');
    
    // Cleanup on unmount
    return () => {
      joinAudioRef.current = null;
      leaveAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (playJoin && joinAudioRef.current) {
      joinAudioRef.current.currentTime = 0;
      joinAudioRef.current.play().catch(e => console.log("Join sound play failed:", e));
    }
  }, [playJoin]);

  useEffect(() => {
    if (playLeave && leaveAudioRef.current) {
      leaveAudioRef.current.currentTime = 0;
      leaveAudioRef.current.play().catch(e => console.log("Leave sound play failed:", e));
    }
  }, [playLeave]);

  return null; // This component doesn't render anything
};

export default AudioPlayer;