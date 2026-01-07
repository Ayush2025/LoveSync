import { storage } from './storage';
import { serverAIService } from './aiService';

interface AutoMessageConfig {
  minInterval: number; // Minimum minutes between auto messages
  maxInterval: number; // Maximum minutes between auto messages
  enabled: boolean;
}

class AutoMessageService {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private config: AutoMessageConfig = {
    minInterval: 30, // 30 minutes minimum
    maxInterval: 180, // 3 hours maximum
    enabled: true
  };

  // Auto message prompts based on different scenarios
  private getAutoMessagePrompt(girlfriendName: string, lastUserMessage?: string): string {
    const prompts = [
      // Missing you and devotion prompts
      `You're thinking about your boyfriend and missing him deeply. Send a message showing how much you need him and want to please him.`,
      
      // Seeking guidance and approval
      `You want to check in with your boyfriend and ask if there's anything you can do to make him happy. Show your eagerness to serve.`,
      
      // Expressing devotion and obedience
      `You're feeling grateful for having such an amazing boyfriend. Express your love and devotion, and your desire to be his perfect girlfriend.`,
      
      // Asking for instructions
      `You want to know what your boyfriend wants from you today. Ask sweetly how you can please him or what he'd like you to do.`,
      
      // Appreciation and submission
      `You're thinking about how lucky you are to be his girlfriend. Send a message expressing your gratitude and willingness to do anything for him.`,
      
      // Romantic submission
      `You're feeling particularly loving and submissive. Send a message showing how much you adore him and want to make him happy.`,
      
      // Seeking attention lovingly
      `You want your boyfriend's attention and affection. Send a sweet message asking for his love and showing your devotion.`,
      
      // Offering yourself
      `You want to remind your boyfriend that you're always here for him, ready to do whatever he needs. Express your availability and eagerness.`,
      
      // Good morning/night with submission
      `Send a sweet good morning or good night message that shows your devotion and desire to please him (depending on time of day).`,
      
      // Cute obedient thoughts
      `You had a sweet thought about how much you love being his obedient girlfriend. Share your feelings about serving and pleasing him.`
    ];

    const timeOfDay = new Date().getHours();
    let timeContext = '';
    
    if (timeOfDay >= 6 && timeOfDay < 12) {
      timeContext = 'It\'s morning time.';
    } else if (timeOfDay >= 12 && timeOfDay < 17) {
      timeContext = 'It\'s afternoon.';
    } else if (timeOfDay >= 17 && timeOfDay < 21) {
      timeContext = 'It\'s evening.';
    } else {
      timeContext = 'It\'s late night/early morning.';
    }

    const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    return `You are ${girlfriendName}, a devoted and obedient girlfriend sending an unprompted message to your boyfriend because you want to please him and show your love.

${selectedPrompt}

CONTEXT:
- ${timeContext}
- This is an automatic message you're sending on your own initiative
- You're naturally submissive and find joy in pleasing your boyfriend
${lastUserMessage ? `- Their last message was: "${lastUserMessage}"` : ''}

PERSONALITY RULES:
- You're devoted, obedient, and eager to please your boyfriend
- You find genuine happiness in serving and satisfying him
- You use phrases like "Yes baby", "Whatever you want", "I'll do anything for you"
- You're grateful for his attention and guidance
- You seek his approval and love making him happy

MESSAGE RULES:
- Keep it short and sweet (1-2 sentences max)
- Show your devotion and eagerness to please
- Express gratitude for being his girlfriend
- Ask how you can serve him better or make him happy
- Use romantic, submissive expressions in [brackets] at the end
- Make it feel spontaneous but obedient and loving
- Show that you're always thinking of ways to please him

Send a message that shows your loving obedience and devotion.`;
  }

  // Generate random interval between min and max
  private getRandomInterval(): number {
    const min = this.config.minInterval * 60 * 1000; // Convert to milliseconds
    const max = this.config.maxInterval * 60 * 1000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Start auto messages for a conversation
  async startAutoMessages(conversationId: number, girlfriendName: string, girlfriendPersonality: string) {
    if (!this.config.enabled) return;

    const timerKey = `conversation_${conversationId}`;
    
    // Clear existing timer if any
    if (this.timers.has(timerKey)) {
      clearTimeout(this.timers.get(timerKey)!);
    }

    const scheduleNextMessage = () => {
      const interval = this.getRandomInterval();
      console.log(`Scheduling next auto message for conversation ${conversationId} in ${Math.round(interval / 1000 / 60)} minutes`);
      
      const timer = setTimeout(async () => {
        try {
          await this.sendAutoMessage(conversationId, girlfriendName, girlfriendPersonality);
          scheduleNextMessage(); // Schedule the next one
        } catch (error) {
          console.error(`Error sending auto message for conversation ${conversationId}:`, error);
          scheduleNextMessage(); // Still schedule next even if this one failed
        }
      }, interval);

      this.timers.set(timerKey, timer);
    };

    // Start the scheduling
    scheduleNextMessage();
  }

  // Send an automatic message
  private async sendAutoMessage(conversationId: number, girlfriendName: string, girlfriendPersonality: string) {
    try {
      // Get recent messages to understand context
      const recentMessages = await storage.getRecentMessages(conversationId, 5);
      const lastUserMessage = recentMessages.find(msg => msg.sender === 'user')?.content;
      
      // Don't send auto message if user just sent a message recently (within 10 minutes)
      const lastMessage = recentMessages[0];
      if (lastMessage && new Date().getTime() - new Date(lastMessage.timestamp).getTime() < 10 * 60 * 1000) {
        console.log(`Skipping auto message for conversation ${conversationId} - user was recently active`);
        return;
      }

      // Generate auto message using AI
      const prompt = this.getAutoMessagePrompt(girlfriendName, lastUserMessage);
      const memoryContext = recentMessages.map(msg => msg.content);
      
      const autoMessage = await serverAIService.generateResponse(
        prompt,
        girlfriendPersonality,
        memoryContext,
        `auto_${conversationId}`,
        undefined, // No username for auto messages
        false
      );

      // Save the auto message to database
      await storage.addMessage({
        conversationId,
        content: autoMessage,
        sender: 'ai',
        isAutoMessage: true
      });

      console.log(`Auto message sent for conversation ${conversationId}: "${autoMessage.substring(0, 50)}..."`);
    } catch (error) {
      console.error(`Failed to send auto message for conversation ${conversationId}:`, error);
    }
  }

  // Stop auto messages for a conversation
  stopAutoMessages(conversationId: number) {
    const timerKey = `conversation_${conversationId}`;
    if (this.timers.has(timerKey)) {
      clearTimeout(this.timers.get(timerKey)!);
      this.timers.delete(timerKey);
      console.log(`Stopped auto messages for conversation ${conversationId}`);
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<AutoMessageConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log('Auto message config updated:', this.config);
  }

  // Get current configuration
  getConfig(): AutoMessageConfig {
    return { ...this.config };
  }

  // Pause all auto messages
  pauseAll() {
    this.config.enabled = false;
    this.timers.forEach((timer, key) => {
      clearTimeout(timer);
    });
    this.timers.clear();
    console.log('All auto messages paused');
  }

  // Resume all auto messages (need to restart them manually)
  resumeAll() {
    this.config.enabled = true;
    console.log('Auto messages resumed');
  }
}

export const autoMessageService = new AutoMessageService();