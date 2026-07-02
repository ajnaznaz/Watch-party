'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reaction } from '@/hooks/useSocket';

interface ReactionOverlayProps {
  reactions: Reaction[];
}

interface AnimatedReaction extends Reaction {
  x: number;
  y: number;
  id: string;
}

export function ReactionOverlay({ reactions }: ReactionOverlayProps) {
  const [animatedReactions, setAnimatedReactions] = useState<AnimatedReaction[]>([]);

  useEffect(() => {
    if (reactions.length > 0) {
      const latestReaction = reactions[reactions.length - 1];
      const newAnimated: AnimatedReaction = {
        ...latestReaction,
        id: `${latestReaction.id}-${Date.now()}`,
        x: Math.random() * 60 + 20, // 20-80% range
        y: Math.random() * 30 + 70, // 70-100% range (bottom area)
      };

      setAnimatedReactions((prev) => [...prev, newAnimated]);

      // Remove after animation
      setTimeout(() => {
        setAnimatedReactions((prev) => prev.filter((r) => r.id !== newAnimated.id));
      }, 3000);
    }
  }, [reactions]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {animatedReactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{
              opacity: 1,
              scale: 0.5,
              x: `${reaction.x}vw`,
              y: `${reaction.y}vh`,
            }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0.5, 1.5, 2],
              y: [`${reaction.y}vh`, `${reaction.y - 20}vh`, `${reaction.y - 40}vh`],
            }}
            exit={{ opacity: 0, scale: 3 }}
            transition={{
              duration: 3,
              ease: 'easeOut',
            }}
            className="absolute text-5xl md:text-6xl drop-shadow-lg"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
            }}
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
