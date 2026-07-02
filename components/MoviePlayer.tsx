'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  Film,
  Heart,
  Laugh,
  Frown,
  Flame,
  Smile,
  Gauge,
  Upload,
  MonitorPlay,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { MovieState } from '@/hooks/useSocket';

interface MoviePlayerProps {
  movieUrl: string | null;
  movieState: MovieState;
  onFileSelect: (file: File) => void;
  onPlay: (currentTime: number, playbackSpeed: number) => void;
  onPause: (currentTime: number) => void;
  onSeek: (currentTime: number) => void;
  onSpeedChange: (playbackSpeed: number) => void;
  onReaction: (emoji: string) => void;
  isHost: boolean;
  usersCount: number;
}

const REACTIONS = [
  { emoji: '\u2764\uFE0F', icon: Heart, color: 'red' },
  { emoji: '\uD83D\uDE02', icon: Laugh, color: 'yellow' },
  { emoji: '\uD83D\uDE32', icon: Smile, color: 'blue' },
  { emoji: '\uD83D\uDE22', icon: Frown, color: 'cyan' },
  { emoji: '\uD83D\uDD25', icon: Flame, color: 'orange' },
];

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function MoviePlayer({
  movieUrl,
  movieState,
  onFileSelect,
  onPlay,
  onPause,
  onSeek,
  onSpeedChange,
  onReaction,
  isHost,
  usersCount,
}: MoviePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserActionRef = useRef(false);

  // Sync with remote movie state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !movieUrl) return;

    // Check if this is a remote action (not from this user)
    const timeDiff = Math.abs(video.currentTime - movieState.currentTime);

    if (timeDiff > 2) {
      video.currentTime = movieState.currentTime;
    }

    if (movieState.isPlaying !== isPlaying) {
      if (movieState.isPlaying) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }

    if (movieState.playbackSpeed !== playbackSpeed) {
      video.playbackRate = movieState.playbackSpeed;
      setPlaybackSpeed(movieState.playbackSpeed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieState, movieUrl]);

  // Time update handler
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  }, []);

  // Loaded metadata handler
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  }, []);

  // Play/Pause handlers
  const handlePlay = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setIsPlaying(true);
      if (isUserActionRef.current) {
        onPlay(video.currentTime, playbackSpeed);
        isUserActionRef.current = false;
      }
    }
  }, [onPlay, playbackSpeed]);

  const handlePause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setIsPlaying(false);
      if (isUserActionRef.current) {
        onPause(video.currentTime);
        isUserActionRef.current = false;
      }
    }
  }, [onPause]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      isUserActionRef.current = true;
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, []);

  // Seek handler
  const handleSeek = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  const handleSeekCommit = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (video) {
      isUserActionRef.current = true;
      onSeek(value[0]);
    }
  }, [onSeek]);

  // Volume handlers
  const handleVolumeChange = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (video) {
      video.volume = value[0];
      setVolume(value[0]);
      setIsMuted(value[0] === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  }, []);

  // Fullscreen handler
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  }, []);

  // Playback speed handler
  const handleSpeedChange = useCallback((speed: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      setPlaybackSpeed(speed);
      isUserActionRef.current = true;
      onSpeedChange(speed);
      setShowSpeedMenu(false);
    }
  }, [onSpeedChange]);

  // Skip handlers
  const skipBackward = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(0, video.currentTime - 10);
    }
  }, []);

  const skipForward = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.min(video.duration, video.currentTime + 10);
    }
  }, []);

  // Controls visibility
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // File input handler
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // If no movie loaded, show upload screen
  if (!movieUrl) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800 h-full flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Film className="w-12 h-12 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Select a Movie</h3>
          <p className="text-zinc-400 mb-6 max-w-sm">
            Choose a movie file from your device. The file never leaves your computer - we only sync playback.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white px-8 py-6 text-lg rounded-xl"
          >
            <Upload className="w-5 h-5 mr-2" />
            Choose Movie File
          </Button>
          <p className="text-zinc-600 text-sm mt-4">Supports MP4, WebM, and other browser formats</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-2xl overflow-hidden border border-zinc-800 group"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={movieUrl}
        className="w-full aspect-video bg-black"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onClick={togglePlayPause}
        playsInline
      />

      {/* Gradient Overlays */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} />

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <MonitorPlay className="w-5 h-5 text-white" />
                <span className="text-white font-medium">MovieDate</span>
              </div>

              {/* Change Movie Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Change Movie
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Center Play Button */}
            <div className="flex-1 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlayPause}
                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 text-white" />
                ) : (
                  <Play className="w-10 h-10 text-white ml-1" />
                )}
              </motion.button>
            </div>

            {/* Bottom Controls */}
            <div className="p-4 space-y-4">
              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <span className="text-white text-sm w-16">{formatTime(currentTime)}</span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  onValueCommit={handleSeekCommit}
                  className="flex-1 cursor-pointer"
                />
                <span className="text-white text-sm w-16 text-right">{formatTime(duration)}</span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>

                  {/* Skip Buttons */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipBackward}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipForward}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  {/* Volume */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-24"
                  />

                  {/* Speed */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="text-white hover:bg-white/20"
                    >
                      <Gauge className="w-4 h-4 mr-1" />
                      {playbackSpeed}x
                    </Button>
                    <AnimatePresence>
                      {showSpeedMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full left-0 mb-2 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-zinc-700 p-2 min-w-[120px]"
                        >
                          {PLAYBACK_SPEEDS.map((speed) => (
                            <button
                              key={speed}
                              onClick={() => handleSpeedChange(speed)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                playbackSpeed === speed
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'text-white hover:bg-zinc-800'
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reactions */}
                  {REACTIONS.map((reaction) => (
                    <Button
                      key={reaction.emoji}
                      variant="ghost"
                      size="icon"
                      onClick={() => onReaction(reaction.emoji)}
                      className="text-xl hover:bg-white/20 hover:scale-110 transition-all"
                    >
                      {reaction.emoji}
                    </Button>
                  ))}

                  {/* Fullscreen */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting for friend overlay */}
      {usersCount < 2 && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4"
            >
              <Film className="w-8 h-8 text-zinc-400" />
            </motion.div>
            <p className="text-white font-medium">Waiting for friend to join...</p>
            <p className="text-zinc-400 text-sm mt-1">Share the room code</p>
          </div>
        </div>
      )}
    </div>
  );
}
