export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface Girlfriend {
  id: string;
  name: string;
  personality: string;
  avatar: string;
  traits: string[];
  memory?: string[];
}

export interface ChatSettings {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}