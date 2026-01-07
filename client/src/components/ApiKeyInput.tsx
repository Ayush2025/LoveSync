import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { aiService } from '../services/aiService';

interface ApiKeyInputProps {
  onApiKeySet: () => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useDefault, setUseDefault] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      if (useDefault) {
        aiService.useDefaultApiKey();
      } else {
        if (!apiKey.trim()) return;
        aiService.setApiKey(apiKey.trim());
      }
      onApiKeySet();
    } catch (error) {
      console.error('Error setting API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDefaultToggle = () => {
    setUseDefault(!useDefault);
    setApiKey('');
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold mb-2">API Key Setup</h2>
        <p className="text-muted-foreground mb-4">
          Choose how you'd like to use the AI service
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={useDefault}
              onChange={() => setUseDefault(true)}
              className="text-primary"
            />
            <span className="text-sm">Use provided API key (recommended)</span>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={!useDefault}
              onChange={() => setUseDefault(false)}
              className="text-primary"
            />
            <span className="text-sm">Use my own Groq API key</span>
          </label>
        </div>

        {!useDefault && (
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter your Groq API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading}
            />
            <a 
              href="https://console.groq.com/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline text-xs block"
            >
              Get your free Groq API key here
            </a>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={(!useDefault && !apiKey.trim()) || isLoading}
        >
          {isLoading ? 'Setting up...' : 'Start Chatting'}
        </Button>
      </form>
    </Card>
  );
};