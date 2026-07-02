'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, User, Wifi, WifiOff, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PeerState } from '@/hooks/usePeer';
import { User as UserType } from '@/hooks/useSocket';

interface VideoCallProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  connectionState: PeerState['connectionState'];
  error: string | null;
  users: UserType[];
  onToggleVideo: () => void;
  onToggleAudio: () => void;
}

export function VideoCall({
  localStream,
  remoteStream,
  isVideoEnabled,
  isAudioEnabled,
  connectionState,
  error,
  users,
  onToggleVideo,
  onToggleAudio,
}: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const otherUser = users.find((u) => u.id !== 'local');

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800 p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-white">Video Call</span>
        </div>
        <div className="flex items-center gap-2">
          {connectionState === 'connected' && remoteStream ? (
            <div className="flex items-center gap-1.5 text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs">Connected</span>
            </div>
          ) : connectionState === 'connecting' ? (
            <div className="flex items-center gap-1.5 text-amber-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-xs">Connecting...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-zinc-500">
              <WifiOff className="w-3 h-3" />
              <span className="text-xs">Waiting</span>
            </div>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 space-y-3 overflow-hidden">
        {/* Remote Video (Friend) */}
        <div className="relative aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted={false}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                <User className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm">
                {otherUser ? `${otherUser.userName}` : 'Waiting for friend...'}
              </p>
            </div>
          )}
          {remoteStream && otherUser && (
            <div className="absolute bottom-2 left-2 bg-zinc-900/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white">
              {otherUser.userName}
            </div>
          )}
        </div>

        {/* Local Video (Me) - PiP style */}
        <div className="relative aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
          {localStream && isVideoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted // Muted local to avoid echo
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                {isVideoEnabled ? (
                  <User className="w-6 h-6 text-zinc-600" />
                ) : (
                  <VideoOff className="w-6 h-6 text-zinc-600" />
                )}
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-zinc-900/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white">
            You
          </div>
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-zinc-600" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <Button
          onClick={onToggleAudio}
          size="icon"
          className={`w-12 h-12 rounded-full ${
            isAudioEnabled
              ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
              : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
          }`}
        >
          {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>
        <Button
          onClick={onToggleVideo}
          size="icon"
          className={`w-12 h-12 rounded-full ${
            isVideoEnabled
              ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
              : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
          }`}
        >
          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
