'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Film, Users, Sparkles, MonitorPlay, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');

  const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateRoom = () => {
    const name = userName.trim() || 'Host';
    const newRoomId = generateRoomId();
    router.push(`/room/${newRoomId}?name=${encodeURIComponent(name)}&host=true`);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      const name = userName.trim() || 'Guest';
      router.push(`/room/${roomId.toUpperCase()}?name=${encodeURIComponent(name)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <Film className="w-8 h-8 text-red-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-red-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              MovieDate
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-zinc-400"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm">Server Online</span>
          </motion.div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Watch Together,
              </span>
              <br />
              <span className="bg-gradient-to-r from-red-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                Feel Together
              </span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-lg mx-auto">
              Experience movies with friends anywhere in the world. Synchronized playback, video chat, and shared moments.
            </p>
          </motion.div>

          {/* Mode Selection */}
          {mode === 'choose' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <button
                onClick={() => setMode('create')}
                className="group relative overflow-hidden rounded-2xl bg-zinc-800/50 backdrop-blur-xl border border-zinc-700/50 p-8 text-left transition-all hover:border-red-500/50 hover:bg-zinc-800/80"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
                    <Video className="w-7 h-7 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">Create Room</h3>
                  <p className="text-zinc-400">Start a new watch party and invite your friends</p>
                </div>
              </button>

              <button
                onClick={() => setMode('join')}
                className="group relative overflow-hidden rounded-2xl bg-zinc-800/50 backdrop-blur-xl border border-zinc-700/50 p-8 text-left transition-all hover:border-amber-500/50 hover:bg-zinc-800/80"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">Join Room</h3>
                  <p className="text-zinc-400">Enter a room code to join your friend&apos;s party</p>
                </div>
              </button>
            </motion.div>
          )}

          {/* Create Room Form */}
          {mode === 'create' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-800/50 backdrop-blur-xl rounded-2xl border border-zinc-700/50 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Video className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Create a Room</h3>
                  <p className="text-zinc-400 text-sm">Set up your watch party</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Your Name</label>
                  <Input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-500 focus:border-red-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setMode('choose')}
                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateRoom}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    Create Room
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Join Room Form */}
          {mode === 'join' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-800/50 backdrop-blur-xl rounded-2xl border border-zinc-700/50 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Join a Room</h3>
                  <p className="text-zinc-400 text-sm">Enter your friend&apos;s room code</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Room Code</label>
                  <Input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    placeholder="Enter 8-digit code"
                    maxLength={8}
                    className="bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-500 focus:border-amber-500 text-center text-2xl tracking-widest"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Your Name</label>
                  <Input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-500 focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setMode('choose')}
                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!roomId.trim()}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
                  >
                    Join Room
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-6"
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto mb-3">
                <MonitorPlay className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-500">Sync Playback</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto mb-3">
                <Video className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-500">Video Chat</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-500">Reactions</p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-zinc-600 text-sm">
        <p>Movie files stay on your device. We only sync playback.</p>
      </footer>
    </div>
  );
}
