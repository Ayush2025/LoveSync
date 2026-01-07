import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Girlfriend } from '@/types';

interface AudioCallInterfaceProps {
  girlfriend: Girlfriend;
  onEndCall: () => void;
}

export function AudioCallInterface({ girlfriend, onEndCall }: AudioCallInterfaceProps) {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const audioContext = useRef<AudioContext | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const animationFrame = useRef<number | null>(null);
  const websocket = useRef<WebSocket | null>(null);

  // Connect to audio WebSocket server
  const connectToAudioServer = async () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log('[AudioCall] Connecting to WebSocket:', wsUrl);
      
      websocket.current = new WebSocket(wsUrl);
      
      websocket.current.onopen = () => {
        console.log('[AudioCall] WebSocket connected');
        // Start the audio call
        websocket.current?.send(JSON.stringify({
          type: 'start_call',
          girlfriendId: girlfriend.id,
          audioConfig: {
            sampleRate: 44100,
            channels: 1
          }
        }));
      };
      
      websocket.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('[AudioCall] Received message:', data.type);
        
        if (data.type === 'audio_response') {
          console.log('[AudioCall] AI Response:', data.aiText);
          playAudioResponse(data.audioData);
          toast.success(`AI: ${data.aiText}`);
        }
      };
      
      websocket.current.onerror = (error) => {
        console.error('[AudioCall] WebSocket error:', error);
        toast.error('Connection error during call');
      };
      
      websocket.current.onclose = () => {
        console.log('[AudioCall] WebSocket disconnected');
      };
      
    } catch (error) {
      console.error('[AudioCall] Failed to connect to audio server:', error);
      toast.error('Failed to connect to audio server');
    }
  };

  // Play AI audio response
  const playAudioResponse = (audioData: number[]) => {
    if (!audioContext.current || !audioData.length) return;
    
    try {
      const buffer = audioContext.current.createBuffer(1, audioData.length, 44100);
      const channelData = buffer.getChannelData(0);
      
      for (let i = 0; i < audioData.length; i++) {
        channelData[i] = audioData[i];
      }
      
      const source = audioContext.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.current.destination);
      source.start();
      
      console.log('[AudioCall] Playing AI audio response');
    } catch (error) {
      console.error('[AudioCall] Error playing audio response:', error);
    }
  };

  // Initialize audio call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        console.log('[AudioCall] Starting audio call initialization...');
        
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStream.current = stream;
        console.log('[AudioCall] Microphone access granted');

        // Set up audio context for visualization
        audioContext.current = new AudioContext();
        const source = audioContext.current.createMediaStreamSource(stream);
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = 256;
        
        const bufferLength = analyser.current.frequencyBinCount;
        dataArray.current = new Uint8Array(bufferLength);
        
        source.connect(analyser.current);

        // Connect to WebSocket server for audio communication
        await connectToAudioServer();

        // Simulate connection delay
        setTimeout(() => {
          setIsConnecting(false);
          setIsConnected(true);
          toast.success(`${t('call.connected')} - ${girlfriend.name}`);
          startCallTimer();
          console.log('[AudioCall] Call connected successfully');
        }, 2000);

      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast.error('Could not access microphone');
        onEndCall();
      }
    };

    initializeCall();
    return () => {
      cleanup();
    };
  }, []);

  // Audio level visualization
  useEffect(() => {
    if (isConnected && analyser.current && dataArray.current) {
      const updateAudioLevel = () => {
        if (analyser.current && dataArray.current) {
          analyser.current.getByteFrequencyData(dataArray.current);
          const average = dataArray.current.reduce((a, b) => a + b) / dataArray.current.length;
          setAudioLevel(average / 255 * 100);
        }
        animationFrame.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isConnected]);

  const startCallTimer = () => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  };

  const cleanup = () => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
    }
    if (audioContext.current) {
      audioContext.current.close();
    }
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    if (websocket.current) {
      websocket.current.send(JSON.stringify({ type: 'end_call' }));
      websocket.current.close();
    }
  };

  // Simulate sending audio data to server (for demo purposes)
  useEffect(() => {
    if (isConnected && websocket.current) {
      const interval = setInterval(() => {
        // Send simulated audio data to trigger AI responses
        const audioData = new Array(1024).fill(0).map(() => Math.random() * 0.1);
        websocket.current?.send(JSON.stringify({
          type: 'audio_data',
          data: audioData
        }));
      }, 5000); // Send every 5 seconds to trigger AI responses

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const toggleMute = () => {
    if (mediaStream.current) {
      const audioTracks = mediaStream.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    cleanup();
    onEndCall();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/30 backdrop-blur-lg border-white/20 text-white">
        <CardHeader className="text-center">
          <div className="relative mb-4">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 p-1">
              <img
                src={girlfriend.avatar}
                alt={girlfriend.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            
            {/* Audio level indicator */}
            {isConnected && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-green-400 rounded-full transition-all duration-100 ${
                        audioLevel > (i * 20) ? 'h-4' : 'h-1'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold">{girlfriend.name}</CardTitle>
          
          <div className="mt-2">
            {isConnecting && (
              <p className="text-blue-300 animate-pulse">{t('call.connecting')}</p>
            )}
            {isConnected && (
              <div className="space-y-1">
                <p className="text-green-300">{t('call.connected')}</p>
                <p className="text-sm text-gray-300">
                  {t('call.duration')}: {formatDuration(callDuration)}
                </p>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex justify-center space-x-6">
            {/* Mute button */}
            <Button
              onClick={toggleMute}
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              className="rounded-full w-16 h-16"
              data-testid="mute-button"
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>

            {/* End call button */}
            <Button
              onClick={handleEndCall}
              variant="destructive"
              size="lg"
              className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
              data-testid="end-call-button"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>

            {/* Speaker button */}
            <Button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              variant={isSpeakerOn ? "default" : "secondary"}
              size="lg"
              className="rounded-full w-16 h-16"
              data-testid="speaker-button"
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </Button>
          </div>

          {/* Call status indicators */}
          {isConnected && (
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Audio call active</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}