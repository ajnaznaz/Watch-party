'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Users, Loader2 } from 'lucide-react';
import { PeerState } from '@/hooks/usePeer';

interface ConnectionStatusProps {
  isConnected: boolean;
  peerConnectionState: PeerState['connectionState'];
  usersCount: number;
}

export function ConnectionStatus({
  isConnected,
  peerConnectionState,
  usersCount,
}: ConnectionStatusProps) {
  // Show status bar when there are issues
  const hasIssues = !isConnected || peerConnectionState === 'error' || peerConnectionState === 'disconnected';

  if (!hasIssues && usersCount >= 2) return null;

  return (
    <AnimatePresence>
      {(hasIssues || usersCount < 2) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30"
        >
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 rounded-full px-4 py-2 flex items-center gap-3">
            {!isConnected && (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-sm text-zinc-300">Reconnecting...</span>
              </>
            )}

            {isConnected && peerConnectionState === 'connecting' && (
              <>
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-sm text-zinc-300">Establishing video call...</span>
              </>
            )}

            {isConnected && peerConnectionState === 'error' && (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-sm text-zinc-300">Connection error. Try refreshing.</span>
              </>
            )}

            {isConnected &&
              peerConnectionState === 'connected' &&
              usersCount < 2 && (
                <>
                  <Users className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-zinc-300">Waiting for friend to join...</span>
                </>
              )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
