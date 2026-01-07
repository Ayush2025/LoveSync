import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ApiKeyInput } from "./ApiKeyInput";
import { GirlfriendAvatar } from "./GirlfriendAvatar";
import { ChatMessage, Girlfriend } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { aiService } from "@/services/aiService";
import { ArrowLeft, Settings, Heart, LogOut, Trash2, Brain, MessageCircle, Phone, Video, Info, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { AutoMessageSettings } from "./AutoMessageSettings";
import { AudioCallInterface } from "./AudioCallInterface";
import { LanguageSelector } from "./LanguageSelector";
import { ThreeJSAnimation } from "./ThreeJSAnimation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChatInterfaceProps {
  girlfriend: Girlfriend;
  onBack?: () => void;
  isRoleplay?: boolean;
  roleplayInfo?: {
    relationship: string;
    scenario: string;
    initialAttitude: string;
    goals: string[];
  };
  customPersonality?: string;
  isRandomEncounter?: boolean;
}

export function ChatInterface({ girlfriend, onBack, isRoleplay = false, roleplayInfo, customPersonality, isRandomEncounter = false }: ChatInterfaceProps) {
  // Enable full screen backgrounds for all companions
  console.log('ChatInterface - Full screen background with:', girlfriend.avatar);
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [showAutoSettings, setShowAutoSettings] = useState(false);
  const [isInAudioCall, setIsInAudioCall] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupButton, setShowPopupButton] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show popup button when entering chat screen - reset when girlfriend or conversation changes
  useEffect(() => {
    // Reset button to visible every time we enter the chat screen or switch to a different chat
    setShowPopupButton(true);
  }, [girlfriend.id, conversationId]);

  // Reset button when popup closes
  useEffect(() => {
    if (!showPopup && !showPopupButton) {
      // When popup closes and button is hidden, reset the button
      setShowPopupButton(true);
    }
  }, [showPopup, showPopupButton]);

  // Initialize conversation and load messages
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        // Get or create conversation
        const conversation = await apiRequest('/api/conversations', {
          method: 'POST',
          body: JSON.stringify({
            girlfriendId: girlfriend.id,
            girlfriendName: girlfriend.name,
          }),
        });

        setConversationId(conversation.id);

        // Load existing messages
        const existingMessages = await apiRequest(`/api/conversations/${conversation.id}/messages`);
        
        if (existingMessages.length === 0) {
          // Send welcome message if no existing conversation
          let welcomeContent: string;
          
          if (isRoleplay && roleplayInfo) {
            // Roleplay welcome message based on relationship and attitude
            switch (roleplayInfo.initialAttitude) {
              case 'Cold':
                welcomeContent = `*looks up briefly from phone* Oh... you're ${user?.name || 'that guy'}, right? What do you want? [keeping distance and looking uninterested]`;
                break;
              case 'Hostile':
                welcomeContent = `*crosses arms* Ugh, what are you doing here ${user?.name || 'whoever you are'}? I'm busy. [glaring and clearly annoyed]`;
                break;
              case 'Neutral':
                welcomeContent = `*looks up politely* Oh, hello ${user?.name || 'there'}. Did you need something? [maintaining polite but formal distance]`;
                break;
              case 'Friendly':
                welcomeContent = `*waves cheerfully* Hey ${user?.name || 'there'}! How are you doing? [smiling warmly but treating you like a friend]`;
                break;
              default:
                welcomeContent = `*notices you* Oh, hi ${user?.name || 'there'}... [uncertain how to react]`;
            }
          } else if (isRandomEncounter) {
            // Random encounters - they don't know the user at all
            // Create varied greetings based on the character's personality
            const isBookstore = girlfriend.name === "Brooklyn";
            
            const greetings = isBookstore ? [
              `*looks up from organizing books* Oh, hi... can I help you find something? [glancing curiously at the stranger]`,
              `*notices you browsing* Hi there! Let me know if you need help finding anything. [friendly but professional smile]`,
              `*drops a book while shelving* Oh! Sorry about that... hi. [blushing slightly while picking up the book]`,
              `*looking up from reading behind the counter* Oh, hello! Are you looking for something specific? [marking her place in the book]`,
              `*organizing the poetry section* Hi... first time here? [looking over with curious eyes]`
            ] : [
              `*notices you approaching* Oh, hi there... do I know you? [looking curious but slightly cautious]`,
              `*looks up from what she's doing* Um, hello? [polite but uncertain, clearly doesn't recognize you]`,
              `*glances your way* Hi... sorry, have we met before? [friendly but confused]`,
              `*pauses and looks at you* Hello... [waiting to see what you want, doesn't know who you are]`,
              `*notices you* Oh, hi! Do you need something? [polite stranger greeting]`
            ];
            welcomeContent = greetings[Math.floor(Math.random() * greetings.length)];
          } else {
            welcomeContent = `*looks into your eyes with love* Hey ${user?.name || 'handsome'}... I'm ${girlfriend.name}, your girlfriend 💕 I've been waiting for you baby... how are you doing? [pulling you closer with a loving smile]`;
          }

          const welcomeMessage: ChatMessage = {
            id: `welcome-${Date.now()}`,
            content: welcomeContent,
            sender: 'ai',
            timestamp: new Date()
          };

          // Save welcome message to database
          await apiRequest(`/api/conversations/${conversation.id}/messages`, {
            method: 'POST',
            body: JSON.stringify({
              content: welcomeMessage.content,
              sender: 'ai',
            }),
          });

          setMessages([welcomeMessage]);
        } else {
          // Convert database messages to ChatMessage format
          const chatMessages: ChatMessage[] = existingMessages.map((msg: any) => ({
            id: msg.id.toString(),
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(chatMessages);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
        // Fallback to in-memory welcome message
        const welcomeMessage: ChatMessage = {
          id: `welcome-${Date.now()}`,
          content: `*looks into your eyes* Hey handsome... 😘 Main ${girlfriend.name} hun, tumhari girlfriend 💕 I've been waiting for you baby... kaise ho meri jaan? Come closer na 😉💋`,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    };

    initializeConversation();
  }, [girlfriend.id, girlfriend.name, user?.id]);

  const handleSendMessage = async (content: string) => {
    if (!conversationId) {
      toast.error("Conversation not ready yet, please wait...");
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Save user message to database
      await apiRequest(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content,
          sender: 'user',
        }),
      });

      // Get recent messages for AI context
      const recentMessages = await apiRequest(`/api/conversations/${conversationId}/recent?limit=10`);
      const memoryContext = recentMessages.map((msg: any) => msg.content);

      const personalityToUse = customPersonality || girlfriend.personality;
      
      const aiResponse = await aiService.generateResponse(
        content,
        personalityToUse,
        memoryContext,
        girlfriend.id,
        isRandomEncounter ? undefined : user?.name, // Don't pass username for random encounters
        isRoleplay,
        roleplayInfo,
        girlfriend.name, // Pass character name for photo sharing
        language // Pass current language for language-aware responses
      );

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: typeof aiResponse === 'string' ? aiResponse : aiResponse.message,
        sender: 'ai',
        timestamp: new Date(),
        images: typeof aiResponse === 'object' ? aiResponse.images : undefined
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Save AI response to database
      await apiRequest(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content: typeof aiResponse === 'string' ? aiResponse : aiResponse.message,
          sender: 'ai',
        }),
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Sorry jaanu, main abhi respond nahi kar paa rahi. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat messages
  const handleClearChat = async () => {
    if (!conversationId) return;
    
    try {
      await apiRequest(`/api/conversations/${conversationId}/messages`, {
        method: 'DELETE',
      });
      setMessages([]);
      toast.success("Chat cleared successfully!");
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error("Failed to clear chat");
    }
  };

  // Clear AI memory
  const handleClearMemory = () => {
    const conversationKey = `${girlfriend.id}_${user?.name}`;
    aiService.clearMemory(conversationKey);
    toast.success("AI memory cleared successfully!");
  };

  // Handle audio call
  const handleStartAudioCall = () => {
    setIsInAudioCall(true);
    toast.success(`${t('call.connecting')} - ${girlfriend.name}`);
  };

  const handleEndAudioCall = () => {
    setIsInAudioCall(false);
    toast.success('Call ended');
  };

  // Show audio call interface if in call
  if (isInAudioCall) {
    return (
      <AudioCallInterface 
        girlfriend={girlfriend} 
        onEndCall={handleEndAudioCall}
      />
    );
  }

  return (
    <>
      {/* Floating Popup Button - Appears when entering chat screen - Positioned to avoid send button */}
      {showPopupButton && (
        <div className="fixed bottom-24 left-4 lg:bottom-20 lg:left-6 z-[9999]">
          <Button
            onClick={() => {
              setShowPopup(true);
              // Hide button when popup opens, but it will reset when component remounts or chat changes
              setShowPopupButton(false);
            }}
            className="rounded-lg shadow-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-2 border-white/30 hover:scale-105 transition-all duration-300 animate-pulse px-4 py-2 h-auto"
            size="lg"
          >
            <Info className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Interact with Model</span>
          </Button>
        </div>
      )}

    <div className="h-screen flex bg-background relative">
      {/* Full-screen background image for all AI companions */}
      <div className="absolute inset-0 z-0">
        <img 
          src={girlfriend.avatar} 
          alt={girlfriend.name}
          className={`w-full h-full object-cover ${isRoleplay ? 'opacity-60 dark:opacity-35' : 'opacity-40 dark:opacity-20'}`}
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${isRoleplay ? 'from-black/10 via-transparent to-black/30' : 'from-black/20 via-transparent to-black/40'}`}></div>
      </div>
      
      {/* Left side - Avatar Display - Hidden since we now use full-screen backgrounds */}
      <div className="hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-primary/20">
              <img 
                src={girlfriend.avatar} 
                alt={girlfriend.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background animate-pulse shadow-lg" />
          </div>
        </div>
        <div className="absolute bottom-8 left-8 right-8">
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
            <h3 className="text-xl font-bold text-foreground">{girlfriend.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{girlfriend.personality}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-500 font-medium">Online & Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface - Full width with background */}
      <div className="flex-1 flex flex-col w-full relative z-10">
        {/* Mobile Header - Improved mobile layout */}
        <Card className="lg:hidden rounded-none border-x-0 border-t-0 bg-black/20 dark:bg-black/40 backdrop-blur-md border-white/10">
          <CardHeader className="flex flex-row items-center space-y-0 py-3 px-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="mr-2 hover:bg-white/20 text-white p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <GirlfriendAvatar
              src={girlfriend.avatar}
              name={girlfriend.name}
              size="sm"
              isOnline={true}
            />
            
            <div className="ml-3 flex-1 min-w-0">
              <h2 className="text-base font-semibold truncate text-white">{girlfriend.name}</h2>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-300 font-medium">
                  {isRoleplay && roleplayInfo ? `${roleplayInfo.relationship}` : 'Online'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <div className="flex flex-col items-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleStartAudioCall}
                  className="hover:bg-white/20 text-white p-2"
                  title={t('call.audio_start')}
                  data-testid="mobile-audio-call-button"
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <span className="text-[10px] font-medium text-white/80">{t('nav.audio_call')}</span>
              </div>
              <div className="flex flex-col items-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearMemory}
                  className="hover:bg-white/20 text-white p-2"
                  title="Clear AI Memory"
                >
                  <Brain className="w-4 h-4" />
                </Button>
                <span className="text-[10px] font-medium text-white/80">Clear Memory</span>
              </div>
              <div className="flex flex-col items-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearChat}
                  className="hover:bg-white/20 text-white p-2"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <span className="text-[10px] font-medium text-white/80">Clear Chat</span>
              </div>
              <LanguageSelector />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
                className="hover:bg-white/20 text-white p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Desktop Header - LoveSync Branded */}
        <div className="hidden lg:flex items-center justify-between p-4 border-b border-white/10 bg-black/20 dark:bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="hover:bg-white/20 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 floating-animation text-pink-300" />
              <span className="text-lg font-bold text-white">
                {isRoleplay ? 'Roleplay Mode' : 'LoveSync'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-white">Welcome back, {user?.name}</div>
              <div className="text-xs text-white/80">
                {isRoleplay && roleplayInfo ? `Challenging ${roleplayInfo.relationship}: ${girlfriend.name}` : `Chatting with ${girlfriend.name}`}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleStartAudioCall}
              className="hover:bg-white/20 text-white"
              title={t('call.audio_start')}
              data-testid="desktop-audio-call-button"
            >
              <Phone className="w-4 h-4 mr-2" />
              {t('nav.audio_call')}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearMemory}
              className="hover:bg-white/20 text-white"
              title="Clear AI Memory"
            >
              <Brain className="w-4 h-4 mr-2" />
              Clear Memory
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearChat}
              className="hover:bg-white/20 text-white"
              title="Clear Chat History"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAutoSettings(true)}
              className="hover:bg-white/20 text-white"
              title="Auto Messages"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Auto Messages
            </Button>
            <LanguageSelector />
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-white/20 text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={logout}
              className="hover:bg-white/20 text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages - Mobile optimized */}
        <div className={`flex-1 overflow-y-auto ${isRoleplay ? 'backdrop-blur-none' : ''}`}>
          <div className="p-3 lg:p-4 space-y-3 lg:space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="message-bubble-enhanced">
                <MessageBubble
                  message={message}
                  girlfriendName={girlfriend.name}
                  girlfriendAvatar={girlfriend.avatar}
                />
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 lg:gap-3 max-w-[85%] lg:max-w-[80%]">
                <GirlfriendAvatar 
                  src={girlfriend.avatar}
                  name={girlfriend.name}
                  size="sm"
                  isOnline={true}
                />
                <div className="chat-bubble-ai text-foreground">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input - Mobile optimized */}
        <Card className="rounded-none border-x-0 border-b-0 bg-black/20 dark:bg-black/40 backdrop-blur-md border-white/10">
          <CardContent className="p-3 lg:p-4 pb-safe-area">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              girlfriendName={girlfriend.name}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Auto Message Settings Modal */}
      {showAutoSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AutoMessageSettings
            conversationId={conversationId || undefined}
            girlfriendName={girlfriend.name}
            personality={customPersonality || girlfriend.personality}
            onClose={() => setShowAutoSettings(false)}
          />
        </div>
      )}

      {/* Popup Overlay Dialog */}
      <Dialog 
        open={showPopup} 
        onOpenChange={(open) => {
          setShowPopup(open);
          // Reset button when popup closes (via X button or clicking outside)
          if (!open) {
            // Reset button immediately when popup closes
            setShowPopupButton(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 border-2 border-pink-200 dark:border-pink-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-pink-600 dark:text-pink-400 flex items-center gap-2">
              <Info className="w-6 h-6" />
              Welcome to Chat!
            </DialogTitle>
            <DialogDescription className="text-base text-gray-700 dark:text-gray-300 pt-2">
              You're now chatting with <span className="font-semibold text-pink-600 dark:text-pink-400">{girlfriend.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Three.js Animation */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Interactive 3D Animation</h3>
              <ThreeJSAnimation />
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
              <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">Quick Tips:</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                  <span>Send messages to start a conversation with {girlfriend.name}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                  <span>Use the audio call button for voice conversations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                  <span>Clear memory to reset the conversation context</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                  <span>Enable auto messages for automatic responses</span>
                </li>
              </ul>
            </div>
            {isRoleplay && roleplayInfo && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-lg mb-2 text-purple-800 dark:text-purple-200">Roleplay Mode:</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  <strong>Relationship:</strong> {roleplayInfo.relationship}
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  <strong>Scenario:</strong> {roleplayInfo.scenario}
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  <strong>Initial Attitude:</strong> {roleplayInfo.initialAttitude}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => {
                setShowPopup(false);
                // Reset button immediately when popup is closed via "Got it!" button
                setShowPopupButton(true);
              }}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}