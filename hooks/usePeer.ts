'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Peer, { MediaConnection, PeerOptions } from 'peerjs';

const PEER_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'localhost:3001';
const IS_PRODUCTION = process.env.NEXT_PUBLIC_NODE_ENV === 'production';

export interface PeerState {
  peer: Peer | null;
  peerId: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  error: string | null;
}

export function usePeer() {
  const peerRef = useRef<Peer | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const currentCallRef = useRef<MediaConnection | null>(null);

  const [peerId, setPeerId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<PeerState['connectionState']>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const initPeer = useCallback((id?: string) => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }

    setConnectionState('connecting');
    setError(null);

    const peerId = id || `moviedate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const peerConfig: PeerOptions = IS_PRODUCTION ? {
      host: PEER_SERVER_URL.replace('https://', '').replace('http://', ''),
      port: 443,
      path: '/peerjs',
      secure: true,
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ],
      },
    } : {
      host: 'localhost',
      port: 3001,
      path: '/peerjs',
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    };

    const peer = new Peer(peerId, peerConfig);

    peer.on('open', (id) => {
      console.log('Peer connected with ID:', id);
      setPeerId(id);
      setConnectionState('connected');
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setError(err.message);
      setConnectionState('error');
    });

    peer.on('disconnected', () => {
      console.log('Peer disconnected');
      setConnectionState('disconnected');
    });

    peer.on('call', (call) => {
      console.log('Incoming call from:', call.peer);
      currentCallRef.current = call;

      if (localStreamRef.current) {
        call.answer(localStreamRef.current);

        call.on('stream', (stream) => {
          console.log('Received remote stream');
          setRemoteStream(stream);
        });

        call.on('close', () => {
          setRemoteStream(null);
          currentCallRef.current = null;
        });

        call.on('error', (err) => {
          console.error('Call error:', err);
          setError(err.message);
        });
      }
    });

    peerRef.current = peer;

    return peer;
  }, []);

  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Error getting media devices:', err);
      setError('Could not access camera/microphone. Please check permissions.');

      // Try audio only
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        localStreamRef.current = audioStream;
        setLocalStream(audioStream);
        setIsVideoEnabled(false);
        return audioStream;
      } catch (audioErr) {
        setError('Could not access camera or microphone.');
        return null;
      }
    }
  }, []);

  const callPeer = useCallback((remotePeerId: string) => {
    const peer = peerRef.current;
    const stream = localStreamRef.current;

    if (!peer || !stream) {
      console.error('Peer or stream not ready');
      return;
    }

    console.log('Calling peer:', remotePeerId);

    const call = peer.call(remotePeerId, stream);
    currentCallRef.current = call;

    call.on('stream', (remoteStream) => {
      console.log('Received remote stream');
      setRemoteStream(remoteStream);
    });

    call.on('close', () => {
      setRemoteStream(null);
      currentCallRef.current = null;
    });

    call.on('error', (err) => {
      console.error('Call error:', err);
      setError(err.message);
    });
  }, []);

  const endCall = useCallback(() => {
    if (currentCallRef.current) {
      currentCallRef.current.close();
      currentCallRef.current = null;
    }
    setRemoteStream(null);
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  const cleanup = useCallback(() => {
    endCall();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setPeerId(null);
    setConnectionState('disconnected');
  }, [endCall]);

  return {
    peerRef,
    peerId,
    localStream,
    remoteStream,
    connectionState,
    error,
    isVideoEnabled,
    isAudioEnabled,
    initPeer,
    getLocalStream,
    callPeer,
    endCall,
    toggleVideo,
    toggleAudio,
    cleanup,
  };
}
