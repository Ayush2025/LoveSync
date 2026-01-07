import { ChatMessage } from "@/types";
import { GirlfriendAvatar } from "./GirlfriendAvatar";
import { cn } from "@/lib/utils";
import { User, X, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

// Function to parse and format actions/expressions in brackets
const formatMessage = (content: string, isUser: boolean) => {
  // Split the content by bracketed expressions
  const parts = content.split(/(\[.*?\])/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      // This is an action/expression - style it differently
      return (
        <span key={index} className="action-expression">
          {part}
        </span>
      );
    }
    // Regular dialogue text - style with yellow for AI characters
    return (
      <span key={index} className={!isUser ? "character-dialogue" : ""}>
        {part}
      </span>
    );
  });
};

interface MessageBubbleProps {
  message: ChatMessage;
  girlfriendName: string;
  girlfriendAvatar?: string;
}

export function MessageBubble({ message, girlfriendName, girlfriendAvatar }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  return (
    <div className={cn(
      "flex gap-3 max-w-[80%] animate-in slide-in-from-bottom-2 duration-300",
      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        ) : (
          <GirlfriendAvatar 
            src={girlfriendAvatar}
            name={girlfriendName}
            size="sm"
            isOnline={true}
          />
        )}
      </div>
      
      <div className={cn(
        "px-4 py-3 text-sm leading-relaxed transition-all duration-300",
        isUser 
          ? "chat-bubble-user text-foreground" 
          : "chat-bubble-ai text-foreground"
      )}>
        <p className="whitespace-pre-wrap">{formatMessage(message.content, isUser)}</p>
        
        {/* Display images if present */}
        {message.images && message.images.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className={cn(
              "grid gap-3",
              message.images.length === 1 ? "grid-cols-1 max-w-sm" :
              message.images.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-lg" :
              "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-xl"
            )}>
              {message.images.map((image, index) => (
                <div 
                  key={index}
                  className="relative group cursor-pointer overflow-hidden rounded-lg border border-border/50"
                  onClick={() => setSelectedImage(image)}
                >
                  <img 
                    src={image} 
                    alt={`Photo ${index + 1}`}
                    className="w-full h-60 sm:h-72 md:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Image failed to load:', image);
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://cdn.pixabay.com/photo/2020/12/15/16/25/woman-5834052_960_720.jpg'; // Fallback image
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic">
              Click photos to view full size
            </p>
          </div>
        )}
        
        <time className="text-xs text-muted-foreground mt-1 block">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </time>
      </div>

      {/* Full-screen image modal using Portal */}
      {selectedImage && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            {/* Back button - positioned on the left */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="absolute -top-12 left-0 md:-top-10 bg-black/50 rounded-full p-2 text-white hover:text-gray-300 hover:bg-black/70 transition-all z-10"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            {/* Close button - positioned better for mobile */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="absolute -top-12 right-0 md:-top-10 bg-black/50 rounded-full p-2 text-white hover:text-gray-300 hover:bg-black/70 transition-all z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            {/* Image container */}
            <img 
              src={selectedImage} 
              alt="Enlarged photo"
              className="max-w-full max-h-[85vh] md:max-h-[90vh] object-contain rounded-lg select-none"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
              onError={(e) => {
                console.error("Failed to load image:", selectedImage);
                setSelectedImage(null);
              }}
            />
          </div>
          {/* Tap anywhere to close hint for mobile */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm md:hidden">
            Tap anywhere to close
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}