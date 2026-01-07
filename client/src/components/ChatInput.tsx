import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Heart, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  girlfriendName?: string;
}

export function ChatInput({ onSendMessage, isLoading = false, disabled = false, girlfriendName }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickMessages = [
    { text: "Kaise ho baby? 💕", emoji: "💕" },
    { text: "I missed you jaanu! 😘", emoji: "😘" }, 
    { text: "You look so handsome 😍", emoji: "😍" },
    { text: "Kiss me cutie 💋", emoji: "💋" },
    { text: "I love you meri jaan 💖", emoji: "💖" },
    { text: "Come closer na 😉", emoji: "😉" }
  ];

  const handleSendPicRequest = () => {
    const picMessages = [
      "Send me a pic baby 📸",
      "Share a photo with me 💕",
      "I want to see you 😍",
      "Show me how you look 📷",
      "Send me a cute pic 💖"
    ];
    const randomMessage = picMessages[Math.floor(Math.random() * picMessages.length)];
    onSendMessage(randomMessage);
  };

  return (
    <div className="space-y-3">
      {/* Quick message buttons - Emoji only */}
      <div className="flex flex-wrap gap-2 justify-center">
        {quickMessages.map((quickMsg, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSendMessage(quickMsg.text)}
            disabled={isLoading || disabled}
            className="text-lg px-3 py-2 h-auto min-h-[2.5rem] hover:bg-primary/10 hover:text-primary border-primary/20 aspect-square"
          >
            {quickMsg.emoji}
          </Button>
        ))}
        
        {/* Send Me Pic Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSendPicRequest}
          disabled={isLoading || disabled}
          className="text-lg px-3 py-2 h-auto min-h-[2.5rem] hover:bg-pink-500/20 hover:text-pink-600 border-pink-400/30 aspect-square bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950"
          title="Send me a pic"
        >
          📸
        </Button>
      </div>

      {/* Message input form - Mobile optimized */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading || disabled}
            className={cn(
              "min-h-[50px] max-h-[120px] text-base lg:text-sm resize-none pr-12 transition-all duration-300",
              "focus:ring-primary/50 border-primary/20 hover:border-primary/30"
            )}
          />
          <Heart className="absolute right-3 top-3 w-4 h-4 text-primary/40" />
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className={cn(
            "px-4 py-3 min-h-[50px] bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700",
            "text-white shadow-lg transition-all duration-300 hover:shadow-xl",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}