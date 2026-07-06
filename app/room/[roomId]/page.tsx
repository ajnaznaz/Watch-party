'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSocket, User, Message, Reaction, MovieState } from '@/hooks/useSocket';
import { usePeer } from '@/hooks/usePeer';
import { VideoCall } from '@/components/VideoCall';
import { MoviePlayer } from '@/components/MoviePlayer';
import { ChatPanel } from '@/components/ChatPanel';
import { ReactionOverlay } from '@/components/ReactionOverlay';
import { RoomHeader } from '@/components/RoomHeader';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, AlertCircle, Users, Loader2, Wifi, WifiOff } from 'lucide-react';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const userName = searchParams.get('name') || 'Guest';
  const isHost = searchParams.get('host') === 'true';

  const {
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMovieSelected,
    sendMoviePlay,
    sendMoviePause,
    sendMovieSeek,
    sendMovieSpeedChange,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    sendReaction,
    socketRef,
    isDemoMode,
  } = useSocket(roomId);

  const {
    peerId,
    localStream,
    remoteStream,
    connectionState: peerConnectionState,
    error: peerError,
    isVideoEnabled,
    isAudioEnabled,
    initPeer,
    getLocalStream,
    callPeer,
    endCall,
    toggleVideo,
    toggleAudio,
    cleanup: cleanupPeer,
  } = usePeer();

  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [movieState, setMovieState] = useState<MovieState>({
    isPlaying: false,
    currentTime: 0,
    playbackSpeed: 1,
    lastUpdate: Date.now(),
    movieName: null,
  });
  const [isConnected, setIsConnected] = useState(DEMO_MODE);
  const [isRoomFull, setIsRoomFull] = useState(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [movieFile, setMovieFile] = useState<File | null>(null);
  const [movieUrl, setMovieUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize connection
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      // Initialize peer
      const peer = initPeer();

      // Get local media stream
      await getLocalStream();

      // Connect socket (or demo mode)
      connect();

      // In demo mode, simulate being connected
      if (DEMO_MODE) {
        setUsers([
          {
            id: 'demo-user-1',
            peerId: peerId || 'demo-peer',
            userName: userName,
            joinedAt: Date.now(),
          },
        ]);
      }

      setIsLoading(false);
    };

    init();

    return () => {
      leaveRoom();
      disconnect();
      cleanupPeer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Join room when peer is ready (real mode)
  useEffect(() => {
    if (DEMO_MODE || !peerId) return;

    const socket = socketRef.current;
    if (!socket) return;

    // If already connected, join immediately. 
    // If not connected yet, the 'connect' listener in the other useEffect will handle it.
    if (socket.connected) {
      joinRoom(roomId, peerId, userName);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peerId]);

  // Set up socket event listeners (real mode)
  useEffect(() => {
    if (DEMO_MODE) return;

    const socket = socketRef.current;
    if (!socket) return;

    socket.on('connect', () => {
      setIsConnected(true);
      if (peerId) {
        // Automatically rejoin the room if the socket reconnects (e.g. after a deploy)
        joinRoom(roomId, peerId, userName);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room-state', (state: { users: User[]; movieState: MovieState; messages: Message[] }) => {
      setUsers(state.users);
      setMovieState(state.movieState);
      setMessages(state.messages);
    });

    socket.on('user-joined', (user: User) => {
      setUsers((prev) => {
        if (prev.some((u) => u.id === user.id)) return prev;
        return [...prev, user];
      });
      setShowNotification(`${user.userName} joined the room`);
      setTimeout(() => setShowNotification(null), 3000);

      if (user.peerId && user.peerId !== peerId && localStream) {
        setTimeout(() => {
          callPeer(user.peerId);
        }, 1000);
      }
    });

    socket.on('user-left', (data: { id: string; userName: string }) => {
      setUsers((prev) => prev.filter((u) => u.id !== data.id));
      setShowNotification(`${data.userName} left the room`);
      setTimeout(() => setShowNotification(null), 3000);
      endCall();
    });

    socket.on('room-full', () => {
      setIsRoomFull(true);
    });

    socket.on('movie-play', (data: { currentTime: number; playbackSpeed: number }) => {
      setMovieState((prev) => ({
        ...prev,
        isPlaying: true,
        currentTime: data.currentTime,
        playbackSpeed: data.playbackSpeed,
      }));
    });

    socket.on('movie-pause', (data: { currentTime: number }) => {
      setMovieState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: data.currentTime,
      }));
    });

    socket.on('movie-seek', (data: { currentTime: number }) => {
      setMovieState((prev) => ({
        ...prev,
        currentTime: data.currentTime,
      }));
    });

    socket.on('movie-speed-change', (data: { playbackSpeed: number }) => {
      setMovieState((prev) => ({
        ...prev,
        playbackSpeed: data.playbackSpeed,
      }));
    });

    socket.on('movie-selected', (data: { movieName: string }) => {
      setMovieState((prev) => ({
        ...prev,
        movieName: data.movieName,
      }));
    });

    socket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('new-reaction', (reaction: Reaction) => {
      setReactions((prev) => [...prev, reaction]);
    });

    socket.on('user-typing', (data: { userName: string }) => {
      setTypingUser(data.userName);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser(null);
      }, 2000);
    });

    socket.on('user-stopped-typing', () => {
      setTypingUser(null);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room-state');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('room-full');
      socket.off('movie-play');
      socket.off('movie-pause');
      socket.off('movie-seek');
      socket.off('movie-speed-change');
      socket.off('movie-selected');
      socket.off('new-message');
      socket.off('new-reaction');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peerId, localStream]);

  const handleMoviePlay = useCallback((currentTime: number, playbackSpeed: number) => {
    sendMoviePlay(currentTime, playbackSpeed);
  }, [sendMoviePlay]);

  const handleMoviePause = useCallback((currentTime: number) => {
    sendMoviePause(currentTime);
  }, [sendMoviePause]);

  const handleMovieSeek = useCallback((currentTime: number) => {
    sendMovieSeek(currentTime);
  }, [sendMovieSeek]);

  const handleMovieSpeedChange = useCallback((playbackSpeed: number) => {
    sendMovieSpeedChange(playbackSpeed);
  }, [sendMovieSpeedChange]);

  const handleSendMessage = useCallback((text: string) => {
    if (DEMO_MODE) {
      // Add message locally in demo mode
      const demoMessage: Message = {
        id: Date.now().toString(),
        userId: 'demo-user',
        userName: userName,
        text: text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, demoMessage]);
      return;
    }
    sendMessage(text);
  }, [sendMessage, userName]);

  const handleTypingStart = useCallback(() => {
    sendTypingStart();
  }, [sendTypingStart]);

  const handleTypingStop = useCallback(() => {
    sendTypingStop();
  }, [sendTypingStop]);

  const handleReaction = useCallback((emoji: string) => {
    if (DEMO_MODE) {
      setReactions((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          userId: 'local',
          userName: userName,
          emoji,
          timestamp: Date.now(),
        },
      ]);
      return;
    }
    sendReaction(emoji);
    setReactions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        userId: 'local',
        userName: userName,
        emoji,
        timestamp: Date.now(),
      },
    ]);
  }, [sendReaction, userName]);

  const handleFileSelect = useCallback((file: File) => {
    setMovieFile(file);
    const url = URL.createObjectURL(file);
    setMovieUrl(url);
    
    // Broadcast file selection to the other user
    sendMovieSelected(file.name);
    setMovieState(prev => ({ ...prev, movieName: file.name }));
  }, [sendMovieSelected]);

  // Clean up reactions after they've animated
  useEffect(() => {
    if (reactions.length > 0) {
      const timer = setTimeout(() => {
        setReactions((prev) => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [reactions]);

  if (isRoomFull) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 rounded-2xl p-8 max-w-md text-center border border-zinc-800"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Room is Full</h2>
          <p className="text-zinc-400 mb-6">This watch party already has 2 participants.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
          >
            Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Connecting to room...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Demo Mode Banner */}
      {DEMO_MODE && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-amber-200 text-sm">
            <Wifi className="w-4 h-4" />
            <span>Demo Mode - Run the backend server for full functionality</span>
          </div>
        </div>
      )}

      {/* Header */}
      <RoomHeader
        roomId={roomId}
        users={users}
        isConnected={isConnected}
        onLeave={() => {
          leaveRoom();
          disconnect();
          cleanupPeer();
          router.push('/');
        }}
      />

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-800/90 backdrop-blur-xl border border-zinc-700 rounded-full px-6 py-3 text-white shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" />
              <span>{showNotification}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        {/* Left Side - Video Call */}
        <div className="lg:w-[30%] order-2 lg:order-1">
          <VideoCall
            localStream={localStream}
            remoteStream={remoteStream}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            connectionState={peerConnectionState}
            error={peerError}
            users={users}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
          />
        </div>

        {/* Right Side - Movie Player */}
        <div className="lg:w-[70%] order-1 lg:order-2">
          <MoviePlayer
            movieUrl={movieUrl}
            movieState={movieState}
            onFileSelect={handleFileSelect}
            onPlay={handleMoviePlay}
            onPause={handleMoviePause}
            onSeek={handleMovieSeek}
            onSpeedChange={handleMovieSpeedChange}
            onReaction={handleReaction}
            isHost={isHost}
            usersCount={users.length}
          />
        </div>
      </main>

      {/* Chat Panel */}
      <ChatPanel
        messages={messages}
        typingUser={typingUser}
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />

      {/* Reaction Overlay */}
      <ReactionOverlay reactions={reactions} />

      {/* Connection Status */}
      <ConnectionStatus
        isConnected={isConnected}
        peerConnectionState={peerConnectionState}
        usersCount={users.length}
      />
    </div>
  );
}
