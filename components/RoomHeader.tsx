'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Copy, Check, Users, LogOut, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/hooks/useSocket';

interface RoomHeaderProps {
  roomId: string;
  users: User[];
  isConnected: boolean;
  onLeave: () => void;
}

export function RoomHeader({ roomId, users, isConnected, onLeave }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code');
    }
  };

  const shareRoom = async () => {
    const url = `${window.location.origin}/room/${roomId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join my MovieDate!',
          text: `Join me for a watch party! Room code: ${roomId}`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to share');
    }
  };

  return (
    <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="relative">
            <Film className="w-6 h-6 text-red-500" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent hidden sm:inline">
            MovieDate
          </span>
        </motion.div>

        {/* Room Info */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          {/* Room Code */}
          <button
            onClick={copyRoomCode}
            className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg px-4 py-2 transition-colors group"
          >
            <span className="text-zinc-400 text-sm">Room:</span>
            <span className="text-white font-mono font-bold tracking-wider">{roomId}</span>
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            )}
          </button>

          {/* Users */}
          <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-4 py-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <span className="text-white font-medium">{users.length}/2</span>
          </div>

          {/* Share Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={shareRoom}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hidden sm:flex"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Invite
          </Button>
        </motion.div>

        {/* Connection & Leave */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {/* Connection Status */}
          <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="hidden sm:inline">{isConnected ? 'Connected' : 'Reconnecting...'}</span>
          </div>

          {/* Leave Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onLeave}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
