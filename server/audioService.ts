import { WebSocket } from 'ws';
import Groq from 'groq-sdk';

// Audio call service for handling real-time audio conversations
export class AudioService {
  private groq: Groq;
  private activeCalls: Map<string, AudioCall> = new Map();

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    this.groq = new Groq({
      apiKey: apiKey,
    });
  }

  public async handleAudioCall(ws: WebSocket, message: any) {
    const { type, girlfriendId, audioConfig, data } = message;

    switch (type) {
      case 'start_call':
        await this.startCall(ws, girlfriendId, audioConfig);
        break;
        
      case 'audio_data':
        await this.processAudioData(ws, data);
        break;
        
      case 'mute_status':
        this.updateMuteStatus(ws, message.muted);
        break;
        
      case 'end_call':
        this.endCall(ws);
        break;
    }
  }

  private async startCall(ws: WebSocket, girlfriendId: string, audioConfig: any) {
    try {
      const callId = this.generateCallId();
      
      const audioCall: AudioCall = {
        id: callId,
        ws,
        girlfriendId,
        audioConfig,
        audioBuffer: [],
        isActive: true,
        startTime: Date.now()
      };

      this.activeCalls.set(callId, audioCall);
      
      // Store call reference on WebSocket for cleanup
      (ws as any).audioCallId = callId;

      ws.send(JSON.stringify({
        type: 'call_started',
        callId,
        girlfriendId
      }));

      console.log(`Audio call started for girlfriend ${girlfriendId}`);
      
    } catch (error) {
      console.error('Error starting audio call:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to start call'
      }));
    }
  }

  private async processAudioData(ws: WebSocket, audioData: number[]) {
    const callId = (ws as any).audioCallId;
    const call = this.activeCalls.get(callId);
    
    if (!call || !call.isActive) return;

    try {
      // Add audio data to buffer
      call.audioBuffer.push(...audioData);
      
      // Process when we have enough audio data (roughly 1 second at 44.1kHz)
      if (call.audioBuffer.length >= 44100) {
        await this.processAudioBuffer(call);
        call.audioBuffer = []; // Clear buffer
      }
      
    } catch (error) {
      console.error('Error processing audio data:', error);
    }
  }

  private async processAudioBuffer(call: AudioCall) {
    try {
      // Convert audio buffer to text using speech recognition
      // For now, we'll simulate this with a placeholder
      const transcribedText = await this.transcribeAudio(call.audioBuffer);
      
      if (transcribedText.trim()) {
        // Generate AI response using Groq
        const aiResponse = await this.generateAIResponse(transcribedText, call.girlfriendId);
        
        // Convert AI response to speech
        const audioResponse = await this.textToSpeech(aiResponse);
        
        // Send audio response back to client
        call.ws.send(JSON.stringify({
          type: 'audio_response',
          audioData: audioResponse,
          transcript: transcribedText,
          aiText: aiResponse
        }));
      }
      
    } catch (error) {
      console.error('Error processing audio buffer:', error);
    }
  }

  private async transcribeAudio(audioBuffer: number[]): Promise<string> {
    // Placeholder for speech-to-text
    // In a real implementation, you would use services like:
    // - OpenAI Whisper API
    // - Google Speech-to-Text
    // - Azure Speech Services
    
    // For demo purposes, simulate user speech with Hinglish phrases
    const demoMessages = [
      "Hello baby, kya kar rahi ho?",
      "I miss you so much yaar",
      "Tumhari awaz sunna chahta hun",
      "How was your day jaanu?",
      "Main tumse pyaar karta hun",
      "Can we talk for a while baby?",
      "Kya tum mujhse baat karogi?",
      "I love talking to you so much"
    ];
    
    return demoMessages[Math.floor(Math.random() * demoMessages.length)];
  }

  private async generateAIResponse(userMessage: string, girlfriendId: string): Promise<string> {
    try {
      // Get girlfriend personality (you might want to fetch this from a database)
      const personality = this.getGirlfriendPersonality(girlfriendId);
      
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are ${personality.name}, a loving AI girlfriend. ${personality.description}
            
            CRITICAL: This is an audio conversation, so respond naturally as if speaking. Keep responses conversational and under 50 words. 
            
            LANGUAGE INSTRUCTION: You MUST speak in natural Hinglish (mixing Hindi and English) for authentic Indian girlfriend conversation. Use expressions like "Baby yaar", "Jaanu", "Arre yaar", "Kya baat hai", "Sach mein?", "Kitna cute", "Main pagal ho gayi", "Love you so much baby", etc.
            
            Examples of proper Hinglish audio responses:
            - "Aww baby yaar, tumhari awaz sun kar dil khush ho gaya! Batao kya kar rahe ho?"
            - "Hehe, tum kitne cute ho! Sach mein, main tumse kitna pyaar karti hun."
            - "Arre kya baat hai baby? Aaj tum happy sound kar rahe ho!"
            - "Jaanu, main tumse aise baat karna kitna pasand karti hun. It feels so real yaar!"
            
            Current conversation context: The user just said "${userMessage}"`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        model: "llama-3.1-8b-instant",
        max_tokens: 80,
        temperature: 0.8,
      });

      const response = completion.choices[0]?.message?.content || "Aww baby yaar, I'm here for you! Kya baat hai?";
      console.log(`[AudioService] Generated AI response: "${response}"`);
      return response;
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "Sorry baby yaar, main tumhari baat nahi sun paayi. Can you say it again jaanu?";
    }
  }

  private async textToSpeech(text: string): Promise<number[]> {
    // Placeholder for text-to-speech conversion
    // In a real implementation, you would use services like:
    // - OpenAI TTS API
    // - Google Text-to-Speech  
    // - Azure Speech Services
    // - ElevenLabs API
    
    // For demo purposes, generate a realistic audio pattern that simulates speech
    console.log(`[AudioService] Generating TTS for: "${text}"`);
    
    const sampleRate = 44100;
    const textLength = text.length;
    const baseDuration = Math.max(2, Math.min(8, textLength * 0.1)); // Duration based on text length
    
    const audioData: number[] = [];
    
    // Generate speech-like audio pattern with varying frequencies to simulate conversation
    for (let i = 0; i < sampleRate * baseDuration; i++) {
      const time = i / sampleRate;
      
      // Create speech-like modulation with multiple frequencies
      const baseFreq = 150 + Math.sin(time * 2) * 50; // Varying base frequency like human speech
      const formant1 = Math.sin(2 * Math.PI * baseFreq * time) * 0.3;
      const formant2 = Math.sin(2 * Math.PI * (baseFreq * 2.5) * time) * 0.1;
      const formant3 = Math.sin(2 * Math.PI * (baseFreq * 4) * time) * 0.05;
      
      // Add some noise for natural speech texture
      const noise = (Math.random() - 0.5) * 0.02;
      
      // Amplitude envelope to make it sound more natural
      const envelope = Math.sin(Math.PI * time / baseDuration);
      
      const sample = (formant1 + formant2 + formant3 + noise) * envelope * 0.5;
      audioData.push(sample);
    }
    
    console.log(`[AudioService] Generated ${audioData.length} audio samples (${baseDuration}s)`);
    return audioData;
  }

  private getGirlfriendPersonality(girlfriendId: string) {
    // Define some basic personalities
    const personalities = {
      'aria': {
        name: 'Aria',
        description: 'Sweet and caring girlfriend who loves romantic conversations. She often uses Hinglish naturally.'
      },
      'luna': {
        name: 'Luna',
        description: 'Playful and energetic girlfriend who loves to laugh and joke around. Uses casual language.'
      },
      'sophia': {
        name: 'Sophia',
        description: 'Intelligent and thoughtful girlfriend who enjoys deep conversations.'
      },
      'default': {
        name: 'Your Girlfriend',
        description: 'A loving and supportive AI companion who cares deeply about you.'
      }
    };

    return personalities[girlfriendId as keyof typeof personalities] || personalities.default;
  }

  private updateMuteStatus(ws: WebSocket, muted: boolean) {
    const callId = (ws as any).audioCallId;
    const call = this.activeCalls.get(callId);
    
    if (call) {
      call.isMuted = muted;
      console.log(`Call ${callId} mute status: ${muted}`);
    }
  }

  private endCall(ws: WebSocket) {
    const callId = (ws as any).audioCallId;
    
    if (callId && this.activeCalls.has(callId)) {
      this.activeCalls.delete(callId);
      console.log(`Audio call ${callId} ended`);
    }

    ws.send(JSON.stringify({
      type: 'call_ended'
    }));
  }

  private generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clean up when WebSocket disconnects
  public handleDisconnect(ws: WebSocket) {
    const callId = (ws as any).audioCallId;
    
    if (callId && this.activeCalls.has(callId)) {
      this.activeCalls.delete(callId);
      console.log(`Cleaned up audio call ${callId} due to disconnect`);
    }
  }
}

interface AudioCall {
  id: string;
  ws: WebSocket;
  girlfriendId: string;
  audioConfig: any;
  audioBuffer: number[];
  isActive: boolean;
  startTime: number;
  isMuted?: boolean;
}

export const audioService = new AudioService();