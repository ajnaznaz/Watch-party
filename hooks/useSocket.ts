'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export interface User {
  id: string;
  peerId: string;
  userName: string;
  joinedAt: number;
}

export interface MovieState {
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  lastUpdate: number;
  duration: number;
  movieName?: string | null;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  emoji?: string | null;
}

export interface Reaction {
  id: string;
  userId: string;
  userName: string;
  emoji: string;
  timestamp: number;
}

export interface RoomState {
  users: User[];
  movieState: MovieState;
  messages: Message[];
}

export function useSocket(roomId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(DEMO_MODE);

  const connect = useCallback(() => {
    if (DEMO_MODE) {
      console.log('[Demo Mode] Simulating socket connection');
      setIsDemoMode(true);
      return null;
    }

    if (!socketRef.current) {
      console.log('[Socket] Connecting to:', SOCKET_URL);
      socketRef.current = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        console.log('[Socket] Connected successfully');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
      });
    }
    return socketRef.current;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const joinRoom = useCallback((roomId: string, peerId: string, userName: string) => {
    if (DEMO_MODE) {
      console.log('[Demo Mode] Join room:', roomId, peerId, userName);
      return;
    }
    const socket = socketRef.current;
    if (socket) {
      socket.emit('join-room', { roomId, peerId, userName });
    }
  }, []);

  const leaveRoom = useCallback(() => {
    if (DEMO_MODE) {
      console.log('[Demo Mode] Leave room');
      return;
    }
    const socket = socketRef.current;
    if (socket) {
      socket.emit('leave-room');
    }
  }, []);

  const sendMoviePlay = useCallback((currentTime: number, playbackSpeed: number = 1) => {
    if (DEMO_MODE) return;
    const socket = socketRef.current;
    if (socket) {
      socket.emit('movie-play', { currentTime, playbackSpeed });
    }
  }, []);

  const sendMovieSelected = useCallback((movieName: string) => {
    if (DEMO_MODE) return;
    const socket = socketRef.current;
    if (socket) {
      socket.emit('movie-selected', { movieName });
    }
  }, []);

  const sendMoviePause = useCallback((currentTime: number) => {
    if (DEMO_MODE) return;
    const socket = socketRef.current;
    if (socket) {
      socket.emit('movie-pause', { currentTime });
    }
  }, []);

  const sendMovieSeek = useCallback((currentTime: number) => {
    if (DEMO_MODE) return;
    const socket = socketRef.current;
    if (socket) {
      socket.emit('movie-seek', { currentTime });
    }
  }, []);

  const sendMovieSpeedChange = useCallback((playbackSpeed: number) => {
    if (DEMO_MODE) return;
    const socket = socketRef.current;
    if (socket) {
      socket.emit('movie-speed-change', { playbackSpeed });
    }
  }, []);

  const sendMovieDuration = useCallback((duration: number) => {
    if (DEMO_MODE) return;
    const socket = socketRef.current;
    if (socket) {
      socket.emit('movie-duration', { duration });
    }
  }, []);

  const sendMessage = useCallback((text: string, emoji?: string) => {
    if (DEMO_MODE) return;
    const socket = socketRef.current;
    if (socket) {
      socket.emit('send-message', { text, emoji });
    }
  }, []);

  const sendTypingStart = useCallback(() => {
    if (DEMO_MODE) return;
    const socket = socketRef.current;
    if (socket) {
      socket.emit('typing-start');
    }
  }, []);

  const sendTypingStop = useCallback(() => {
    if (DEMO_MODE) return;
    const socket = socketRef.current;
    if (socket) {
      socket.emit('typing-stop');
    }
  }, []);

  const sendReaction = useCallback((emoji: string) => {
    if (DEMO_MODE) return;
    const socket = socketRef.current;
    if (socket) {
      socket.emit('send-reaction', { emoji });
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socketRef,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMovieSelected,
    sendMoviePlay,
    sendMoviePause,
    sendMovieSeek,
    sendMovieSpeedChange,
    sendMovieDuration,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    sendReaction,
    isDemoMode,
  };
}
