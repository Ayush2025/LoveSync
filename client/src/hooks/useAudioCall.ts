import { useState, useRef, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface UseAudioCallOptions {
  onCallEnd?: () => void;
  onError?: (error: string) => void;
}

export function useAudioCall(options: UseAudioCallOptions = {}) {
  const [isInCall, setIsInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startCall = useCallback(async (girlfriendId: string) => {
    try {
      setIsConnecting(true);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      mediaStreamRef.current = stream;

      // Initialize WebSocket connection for audio streaming
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/audio`;
      
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('Audio WebSocket connected');
        // Send call initiation message
        ws.send(JSON.stringify({
          type: 'start_call',
          girlfriendId,
          audioConfig: {
            sampleRate: 44100,
            channels: 1
          }
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'call_started':
            setIsConnecting(false);
            setIsInCall(true);
            startCallTimer();
            break;
            
          case 'audio_response':
            // Play AI response audio
            playAudioResponse(data.audioData);
            break;
            
          case 'call_ended':
            endCall();
            break;
            
          case 'error':
            options.onError?.(data.message);
            endCall();
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        options.onError?.('Connection failed');
        endCall();
      };

      // Set up audio processing
      setupAudioProcessing(stream, ws);

    } catch (error) {
      console.error('Error starting call:', error);
      options.onError?.('Could not access microphone');
      setIsConnecting(false);
    }
  }, [options]);

  const setupAudioProcessing = (stream: MediaStream, ws: WebSocket) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (event) => {
      if (ws.readyState === WebSocket.OPEN && !isMuted) {
        const inputBuffer = event.inputBuffer.getChannelData(0);
        
        // Convert to Int16Array for transmission
        const pcmData = new Int16Array(inputBuffer.length);
        for (let i = 0; i < inputBuffer.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputBuffer[i])) * 0x7FFF;
        }

        // Send audio data
        ws.send(JSON.stringify({
          type: 'audio_data',
          data: Array.from(pcmData)
        }));
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  };

  const playAudioResponse = async (audioData: number[]) => {
    try {
      const audioContext = new AudioContext();
      const buffer = audioContext.createBuffer(1, audioData.length, 44100);
      const channelData = buffer.getChannelData(0);
      
      for (let i = 0; i < audioData.length; i++) {
        channelData[i] = audioData[i] / 0x7FFF;
      }

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.error('Error playing audio response:', error);
    }
  };

  const startCallTimer = () => {
    const startTime = Date.now();
    callTimerRef.current = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  };

  const toggleMute = useCallback(() => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
      
      // Notify server about mute status
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({
          type: 'mute_status',
          muted: !isMuted
        }));
      }
    }
  }, [isMuted]);

  const endCall = useCallback(() => {
    // Clean up media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Close WebSocket
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    // Clear timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    setIsInCall(false);
    setIsConnecting(false);
    setCallDuration(0);
    setIsMuted(false);
    
    options.onCallEnd?.();
  }, [options]);

  return {
    isInCall,
    isConnecting,
    isMuted,
    callDuration,
    startCall,
    endCall,
    toggleMute
  };
}