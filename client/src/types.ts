export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  images?: string[]; // Optional array of image URLs
}

export interface Girlfriend {
  id: string;
  name: string;
  personality: string;
  avatar: string;
  traits: string[];
}