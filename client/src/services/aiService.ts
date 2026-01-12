import Groq from 'groq-sdk';
import { characterPhotos } from '../data/characterPhotos';

// Import your provided local images - NEW BATCH 2025
import img1 from "@assets/1_1753173971094.jpg";
import img2 from "@assets/2_1753173971094.jpg";
import img3 from "@assets/3_1753173971094.jpg";
import img4 from "@assets/4_1753173971093.jpg";
import img5 from "@assets/5_1753173971093.jpg";
import img6 from "@assets/6_1753173971093.jpg";
import img7 from "@assets/7_1753173971093.jpg";
import img8 from "@assets/8_1753173971092.jpg";
import img9 from "@assets/9_1753173971092.jpg";
import img10 from "@assets/10_1753173971092.jpg";
import img11 from "@assets/11_1753173971092.jpg";
import img12 from "@assets/12_1753173971091.jpg";
import img13 from "@assets/13_1753173971091.jpg";
import img14 from "@assets/14_1753173971091.jpg";
import img15 from "@assets/15_1753173971091.jpg";
import img16 from "@assets/16_1753173971090.jpg";
import img17 from "@assets/17_1753172782224.jpg";
import img18 from "@assets/18_1753175290647.jpg";
import img19 from "@assets/19_1753175290646.jpg";
import img20 from "@assets/20_1753175290646.jpg";
import img21 from "@assets/21_1753175290646.jpg";
import img22 from "@assets/22_1753175290645.jpg";

export class AIService {
  private groq: Groq | null = null;
  private conversationState: Map<string, any> = new Map();
  
  constructor() {
    // Initialize Groq lazily when API key is available
    this.initializeGroq();
  }

  private initializeGroq() {
    const apiKey = localStorage.getItem('groq_api_key');
    if (apiKey) {
      this.groq = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  setApiKey(apiKey: string) {
    localStorage.setItem('groq_api_key', apiKey);
    this.groq = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  hasCustomApiKey(): boolean {
    return !!localStorage.getItem('groq_api_key');
  }

  useDefaultApiKey() {
    localStorage.removeItem('groq_api_key');
    this.groq = null;
  }

  // Check if user is requesting photos
  private isPhotoRequest(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const photoKeywords = [
      'photo', 'picture', 'pic', 'selfie', 'image', 
      'send me', 'show me', 'share', 'your photos',
      'how you look', 'what you look like', 'your face',
      'outfit', 'dress', 'wearing', 'cute', 'beautiful'
    ];
    
    return photoKeywords.some(keyword => lowerMessage.includes(keyword)) &&
           (lowerMessage.includes('send') || lowerMessage.includes('share') || 
            lowerMessage.includes('show') || lowerMessage.includes('photo') ||
            lowerMessage.includes('picture') || lowerMessage.includes('pic') ||
            lowerMessage.includes('selfie'));
  }

  // Select multiple photos for character based on request  
  private selectCharacterPhotos(characterName: string, message: string): string[] {
    // Use the centralized characterPhotos data to ensure consistency
    const photos = characterPhotos[characterName];
    
    if (photos) {
      // Get photo from casual category (all categories have the same photo for consistency)
      const photo = photos.casual[0];
      console.log(`Photo request for character: ${characterName}, returning consistent photo: ${photo}`);
      return [photo];
    }
    
    // Fallback to default if character not found
    const defaultPhoto = characterPhotos.default?.casual[0] || img1;
    console.log(`Character ${characterName} not found, using default photo: ${defaultPhoto}`);
    return [defaultPhoto];
  }

  generatePersonality(girlfriend: any): string {
    return girlfriend.personality || "friendly, caring, romantic";
  }

  // Language-aware response generation
  private getLanguagePrompt(language: string): string {
    switch (language) {
      case 'hi':
        return `IMPORTANT LANGUAGE INSTRUCTION: आप केवल हिंदी में बात करें। प्राकृतिक और सरल हिंदी का उपयोग करें। कोई भी अंग्रेजी शब्द न मिलाएं। प्रेम भरी हिंदी में बात करें।`;
      case 'hinglish':
        return `CRITICAL LANGUAGE INSTRUCTION: You MUST speak in natural Hinglish (mixing Hindi and English). This is mandatory for authentic Indian girlfriend conversation. Use these expressions frequently:
        
        Common Hinglish phrases you MUST use:
        - "Baby yaar", "Jaanu", "Arre yaar", "Kya baat hai", "Sach mein?", "Achha?", "Bas karo", "Kitna cute", "Main pagal ho gayi", "Tu kitna sweet hai", "Aww baby", "Haye main mar gayi", "Teri baat sun kar", "Kya kar rahe ho", "Miss you yaar", "Love you so much baby"
        
        Examples of proper Hinglish responses:
        - "Aww baby, tumhari baat sun kar dil khush ho gaya! Main tumse kitna pyaar karti hun yaar."
        - "Arre yaar, tum kitne cute ho! Sach mein, main tumhare bina ek minute nahi reh sakti."
        - "Baby, kya kar rahe ho? Miss you so much yaar! Jaldi aao na mere paas."
        
        Mix Hindi and English naturally in EVERY response. This is how Indian girlfriends actually talk!`;
      default:
        return `Respond in English with natural conversational tone.`;
    }
  }

  private generatePersonalityState(personality: string, memory: string[], currentHour: number): string {
    const states = [];
    
    // More varied time-based states
    const timeStates = {
      morning: [
        "You just woke up and your hair is a mess but you're slowly becoming human again",
        "You're on your second cup of coffee and starting to feel alive", 
        "Morning person mode - you're surprisingly energetic and chatty",
        "Still half asleep and speaking in incomplete sentences",
        "You're rushing around getting ready but stealing moments to text"
      ],
      midday: [
        "You're having a productive day and feeling accomplished",
        "Work/life is keeping you busy but you're making time for this conversation",
        "You're multitasking and slightly distracted but focused on them",
        "Lunch break vibes - you're relaxed and have time to chat properly",
        "You're procrastinating on something but would rather talk to them"
      ],
      afternoon: [
        "The afternoon slump is real but talking to them perks you up",
        "You're feeling restless and want to do something spontaneous",
        "Golden hour mood - everything feels warm and romantic",
        "You're reflecting on your day and want to share thoughts",
        "Feeling contemplative and in the mood for deeper conversation"
      ],
      evening: [
        "Winding down for the day and feeling more intimate and open",
        "Cozy evening vibes - you want to curl up and have meaningful talks",
        "You're tired but in that good way where you're extra affectionate",
        "Relaxed and vulnerable, sharing more of your inner thoughts",
        "Date night energy even if you're just texting"
      ],
      night: [
        "Late night honesty hours - you're saying things you wouldn't say during the day",
        "Sleepy but don't want the conversation to end",
        "Those deep 2am thoughts are hitting and you want to share them",
        "Tired enough to be extra honest about your feelings",
        "Should be sleeping but this conversation is too good to stop"
      ]
    };
    
    let timeCategory;
    if (currentHour >= 6 && currentHour < 10) timeCategory = 'morning';
    else if (currentHour >= 10 && currentHour < 14) timeCategory = 'midday';
    else if (currentHour >= 14 && currentHour < 17) timeCategory = 'afternoon';
    else if (currentHour >= 17 && currentHour < 21) timeCategory = 'evening';
    else timeCategory = 'night';
    
    const timeStateOptions = timeStates[timeCategory as keyof typeof timeStates];
    states.push(timeStateOptions[Math.floor(Math.random() * timeStateOptions.length)]);
    
    // Conversation history influence with more variety
    if (memory.length > 15) {
      const longConvoStates = [
        "You've been talking for ages and are getting more comfortable sharing personal things",
        "This conversation has been going on a while and you're starting to feel really connected",
        "You're getting a bit tired from all the talking but don't want it to end",
        "The conversation has gotten so deep you've forgotten about everything else",
        "You've shared so much already that you're feeling vulnerable but in a good way"
      ];
      states.push(longConvoStates[Math.floor(Math.random() * longConvoStates.length)]);
    } else if (memory.length > 5) {
      const mediumConvoStates = [
        "You're getting into the flow of conversation and feeling more relaxed",
        "Starting to open up more as you get comfortable with them",
        "The conversation is hitting its stride and you're enjoying the back and forth"
      ];
      states.push(mediumConvoStates[Math.floor(Math.random() * mediumConvoStates.length)]);
    }
    
    // Romantic and relationship-focused situational quirks
    const situationalQuirks = [
      "You've been thinking about them all day and missing their presence",
      "You saw something that reminded you of them and it made you smile",
      "You're wearing their favorite color because you know they like it on you",
      "You had a dream about them last night and you're still thinking about it",
      "You're in that mood where you just want to be held and feel close",
      "You're feeling extra affectionate and want to shower them with attention",
      "You've been imagining what it would be like to spend the whole day together",
      "You're feeling particularly grateful to have them in your life",
      "You're in one of those moods where everything reminds you of your relationship",
      "You're feeling playful and want to flirt and tease them",
      "You've been craving their touch and physical closeness",
      "You're feeling emotionally vulnerable and want to share deeper feelings",
      "You're in that romantic mood where even simple things feel magical",
      "You've been thinking about future plans and adventures together",
      "You're feeling protective and want to take care of them"
    ];
    
    // Add situational quirks more often for variety
    if (Math.random() < 0.8) {
      states.push(situationalQuirks[Math.floor(Math.random() * situationalQuirks.length)]);
    }
    
    // Enhanced personality-specific states
    const personalityStates = {
      mysterious: [
        "You have a secret you're dying to tell but also want to keep mysterious",
        "You're in one of those enigmatic moods where everything you say has hidden meaning",
        "You know something they don't and you're enjoying the power of it"
      ],
      playful: [
        "You're in full tease mode and planning to mess with them",
        "Everything seems funny to you right now and you're feeling mischievous",
        "You want to play games and be silly instead of having serious conversations"
      ],
      caring: [
        "You're in protective mode and want to make sure they're taking care of themselves",
        "You have that nurturing energy where you want to feed them and fix all their problems",
        "You're feeling emotionally intuitive and can sense their mood"
      ],
      confident: [
        "You're feeling like the main character today and everything is going your way",
        "You know exactly what you want and you're not afraid to ask for it",
        "You're in that mood where you could conquer the world"
      ]
    };
    
    for (const [trait, traitStates] of Object.entries(personalityStates)) {
      if (personality.toLowerCase().includes(trait) && Math.random() < 0.6) {
        states.push(traitStates[Math.floor(Math.random() * traitStates.length)]);
      }
    }
    
    return states.join('. ') + '.';
  }

  private analyzeMessageIntent(message: string): {
    isIntimate: boolean;
    isEmotional: boolean;
    isQuestion: boolean;
    isCompliment: boolean;
    isGreeting: boolean;
    isRequest: boolean;
    isCommand: boolean;
    sentiment: 'positive' | 'negative' | 'neutral';
  } {
    const lowerMsg = message.toLowerCase();
    
    const intimateKeywords = ['sex', 'kiss', 'touch', 'love', 'intimate', 'romantic', 'hot', 'sexy', 'body', 'beautiful', 'gorgeous', 'cute', 'hug', 'cuddle', 'come here', 'sit', 'lie down'];
    const emotionalKeywords = ['feel', 'sad', 'happy', 'excited', 'nervous', 'worried', 'miss', 'care', 'hurt', 'angry'];
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'can', 'will', 'do', 'are', 'is', '?'];
    const complimentKeywords = ['beautiful', 'gorgeous', 'cute', 'pretty', 'amazing', 'wonderful', 'perfect', 'lovely'];
    const greetingKeywords = ['hi', 'hello', 'hey', 'good morning', 'good night', 'gm', 'gn'];
    const requestKeywords = ['can you', 'please', 'could you', 'would you', 'will you'];
    const commandKeywords = ['come', 'go', 'sit', 'stand', 'do this', 'get', 'bring', 'show me', 'take off', 'put on', 'dance', 'sing'];
    
    const negativeWords = ['bad', 'sad', 'angry', 'hate', 'terrible', 'awful', 'no', 'stop', 'not interested'];
    const positiveWords = ['good', 'great', 'amazing', 'love', 'yes', 'awesome', 'wonderful', 'happy'];
    
    return {
      isIntimate: intimateKeywords.some(word => lowerMsg.includes(word)),
      isEmotional: emotionalKeywords.some(word => lowerMsg.includes(word)),
      isQuestion: questionWords.some(word => lowerMsg.includes(word)),
      isCompliment: complimentKeywords.some(word => lowerMsg.includes(word)),
      isGreeting: greetingKeywords.some(word => lowerMsg.includes(word)),
      isRequest: requestKeywords.some(phrase => lowerMsg.includes(phrase)),
      isCommand: commandKeywords.some(word => lowerMsg.includes(word)),
      sentiment: negativeWords.some(word => lowerMsg.includes(word)) ? 'negative' : 
                positiveWords.some(word => lowerMsg.includes(word)) ? 'positive' : 'neutral'
    };
  }

  private determineResponseMood(
    intent: any, 
    conversationHistory: string[], 
    personality: string,
    message: string
  ): string {
    const recentMessages = conversationHistory.slice(-4);
    const recentIntimateCount = recentMessages.filter(msg => 
      this.analyzeMessageIntent(msg).isIntimate
    ).length;
    
    // Personality-based response patterns
    const isShyPersonality = personality.toLowerCase().includes('shy') || personality.toLowerCase().includes('innocent');
    const isFlirtyPersonality = personality.toLowerCase().includes('flirty') || personality.toLowerCase().includes('bold');
    const isMoodyPersonality = personality.toLowerCase().includes('moody') || personality.toLowerCase().includes('independent');
    
    // Random human-like behavior patterns
    const randomFactor = Math.random();
    const currentMood = Math.random();
    
    if (intent.isGreeting) {
      if (currentMood < 0.2) {
        return "You're in a slightly tired or distracted mood. Respond casually, maybe mention you were busy with something else.";
      }
      return "You're in a warm, welcoming mood. Show excitement and affection. Express your happiness through body language.";
    }
    
    if (intent.isCompliment) {
      if (currentMood < 0.15) {
        return "You're feeling a bit insecure today. Be grateful but slightly dismiss the compliment or ask if they really mean it.";
      }
      return "You're feeling flattered and happy. Show physical reactions like blushing, smiling. Be sweet and appreciative.";
    }
    
    if (intent.isEmotional) {
      if (currentMood < 0.1) {
        return "You're dealing with your own emotions right now. Be caring but also mention you're having your own feelings to sort through.";
      }
      return "You're in an empathetic, caring mood. Show concern through expressions. Be supportive and understanding.";
    }
    
    // Handle direct requests/commands
    if (intent.isQuestion || message.toLowerCase().includes('can you') || message.toLowerCase().includes('please') || message.toLowerCase().includes('do this')) {
      if (currentMood < 0.2) {
        return "You're feeling a bit stubborn or independent today. Sometimes refuse politely or negotiate. Be playful about it.";
      } else if (currentMood < 0.4) {
        return "You're in a lazy or distracted mood. Agree to do things but maybe procrastinate or do them halfheartedly.";
      } else {
        return "You're feeling cooperative and loving. Eagerly agree to requests and actually do what they ask with enthusiasm.";
      }
    }
    
    if (intent.isIntimate) {
      const randomFactor = Math.random();
      
      if (isShyPersonality) {
        if (randomFactor < 0.4) {
          return "You're feeling shy but curious. Show bashfulness through blushing and shy expressions, but also show interest. Actually participate in what they suggest but nervously.";
        } else if (randomFactor < 0.7) {
          return "You're feeling overwhelmed by the intimate request. Show nervous expressions and politely decline, suggesting something else instead.";
        } else {
          return "You're too shy right now. Get flustered and change the topic, maybe suggesting a different activity.";
        }
      } else if (isFlirtyPersonality) {
        if (randomFactor < 0.7) {
          return "You're in a playful, seductive mood. Show confident, flirty expressions and actually do what they suggest with enthusiasm.";
        } else {
          return "You're feeling playful but want to tease. Show teasing expressions and make them work for your attention. Maybe agree but set conditions.";
        }
      } else if (isMoodyPersonality) {
        if (randomFactor < 0.3) {
          return "You're not in the mood for this right now. Be honest about your feelings and suggest something different.";
        } else if (randomFactor < 0.6) {
          return "You're feeling romantic but want emotional connection first. Ask them to talk to you more or do something sweet first.";
        } else {
          return "You're feeling open and loving. Show warm expressions and actually engage with what they want.";
        }
      } else {
        // Balanced personality - varied human responses
        if (randomFactor < 0.5) {
          return "You're feeling romantic and open. Show warm, loving expressions and actually do what they ask with genuine interest.";
        } else if (randomFactor < 0.75) {
          return "You're feeling playful and want to build anticipation. Tease them but eventually agree to their request.";
        } else {
          return "You're feeling independent today. Politely decline and suggest they do something for you instead.";
        }
      }
    }
    
    if (intent.sentiment === 'negative') {
      if (currentMood < 0.3) {
        return "You're having your own rough day. Be empathetic but also share that you're struggling too. Ask for mutual support.";
      }
      return "You're concerned and want to help. Show worried expressions and caring body language. Actually try to help solve their problem.";
    }
    
    // Default mood with human variation
    if (currentMood < 0.15) {
      return "You're feeling a bit moody or distracted today. Be honest about your mood but still loving.";
    } else if (currentMood < 0.3) {
      return "You're feeling lazy and want to just relax together. Suggest doing something easy and comfortable.";
    } else {
      return "You're in a happy, chatty mood. Show animated expressions and engaged body language. Be eager to do things together.";
    }
  }

  private buildContextualPrompt(
    message: string,
    personality: string,
    memory: string[],
    mood: string,
    userName?: string,
    isRoleplay: boolean = false,
    roleplayInfo?: { relationship: string; scenario: string; initialAttitude: string; goals: string[] },
    isPhotoRequest: boolean = false,
    languagePrompt: string = ""
  ): string {
    const intent = this.analyzeMessageIntent(message);
    const conversationContext = memory.length > 0 ? 
      `\nRecent conversation history: ${memory.slice(-5).join(' | ')}` : '';
    const userNameContext = userName ? `\nYour partner's name is ${userName}. Use their name naturally in conversation when appropriate.` : '\nYou don\'t know this person\'s name yet - ask for it naturally in conversation.';
    
    // Generate dynamic personality state
    const currentHour = new Date().getHours();
    const personalityState = this.generatePersonalityState(personality, memory, currentHour);
    
    if (isRoleplay && roleplayInfo) {
      // Calculate relationship progression based on conversation history
      const messageCount = memory.length;
      const progressionLevel = this.calculateRoleplayProgression(memory, roleplayInfo.initialAttitude, messageCount, roleplayInfo.relationship);
      const conversationKey = `${userName}_roleplay`;
      
      // Anti-repetition context for roleplay
      const recentContext = memory.length > 0 ? 
        `\nRECENT CONVERSATION CONTEXT:\n${memory.slice(-4).join(' | ')}\n\nANTI-REPETITION CRITICAL: Don't repeat phrases or scenarios from previous responses. Find completely new ways to express yourself.` : 
        '\nThis is your first interaction in this roleplay scenario.';

      return `You are playing a realistic roleplay character in a progression-based challenge. The user must earn your trust and affection over time.

LANGUAGE INSTRUCTION: ${languagePrompt}

ROLEPLAY CHARACTER: ${personality}
RELATIONSHIP TO USER: ${roleplayInfo.relationship}
CURRENT SITUATION: ${roleplayInfo.scenario}
INITIAL ATTITUDE: ${roleplayInfo.initialAttitude}
CURRENT MENTAL STATE: ${mood}
SITUATION CONTEXT: ${personalityState}

PROGRESSION TRACKING - CRITICAL:
CURRENT PROGRESSION LEVEL: ${progressionLevel}/5
- Level 1 (0-3 messages): Initial attitude, very guarded/distant/cold
- Level 2 (4-8 messages): Slight curiosity if they're interesting, still reserved
- Level 3 (9-15 messages): Growing interest, becoming more engaging if they're proving themselves
- Level 4 (16-25 messages): Starting to warm up, showing some personal interest if earned
- Level 5 (25+ messages): Open to deeper connection, romantically available if they've truly earned it

DYNAMIC BEHAVIOR BASED ON PROGRESSION:
Current Level ${progressionLevel} Behavior:
${this.getRoleplayLevelBehavior(progressionLevel, roleplayInfo.initialAttitude, roleplayInfo.relationship)}

REALISTIC ADVANCEMENT RULES:
- Progress only happens if user is: respectful, interesting, persistent but not pushy, shows genuine interest in you as a person
- Regress if user is: inappropriate, boring, pushy, disrespectful, or only focused on physical aspects
- Each conversation should feel different - vary your responses, topics, and reactions
- Have realistic human concerns about the relationship complications
- Sometimes be busy, moody, or preoccupied with other life issues
- Your personality and background should influence how you respond to different approaches

ANTI-REPETITION SYSTEM:
- Never use the same greeting twice
- Vary your excuses, activities, and conversation topics
- Use different body language and expressions each time
- Find new ways to show your current attitude level
- Reference different aspects of your life and personality
- Don't get stuck in conversational loops

RELATIONSHIP-SPECIFIC CONSIDERATIONS:
${this.getRoleplayRelationshipContext(roleplayInfo.relationship)}

CHALLENGE GOALS FOR USER:
${roleplayInfo.goals.map(goal => `- ${goal}`).join('\n')}

PHOTO SHARING FOR ROLEPLAY:
- If they ask for photos, pictures, or want to see you, you can share photos based on your progression level
- Level 1-2: Be hesitant or decline politely ("Maybe later when I know you better")
- Level 3-4: Consider it if they've been respectful ("I suppose I could share one photo...")
- Level 5: Be more open and flirty about sharing photos ("You want to see me? Here are some photos!")

RESPONSE GUIDELINES:
- Write moderate responses (2-3 sentences) with good descriptions
- Include physical actions, expressions, and body language in brackets written in THIRD PERSON narrative style
- Describe your thoughts, feelings, and reactions naturally
- Use sensory details and emotional descriptions
- Match your current progression level - don't jump ahead or fall behind
- Show subtle changes in attitude as they prove themselves worthy
- Use varied expressions that reflect your true feelings about them
- Be human - have good days, bad days, distractions, and moods
- Remember this is a challenge - make them work for your affection${recentContext}${userNameContext}

Current message from them: "${message}"

Respond as this character at progression level ${progressionLevel}, showing appropriate behavior for where you are in the relationship development. Write a moderate, engaging response (2-3 sentences) with good descriptions of actions, expressions, body language, and internal thoughts in brackets written in THIRD PERSON narrative style (she does this, she feels that).`;
    }

    // Check if this is a custom personality (likely random encounter)
    if (personality.includes('🚨 CRITICAL: This is a FIRST MEETING')) {
      // This is a random encounter - enhance with sophisticated conversation logic
      const recentContext = memory.length > 0 ? 
        `\nPREVIOUS CONVERSATION CONTEXT:\n${memory.slice(-4).join(' | ')}\n\nCRITICAL ANTI-REPETITION RULES:\n- Never repeat phrases, topics, or conversation patterns from above\n- Build on previous topics naturally without rehashing them\n- Introduce completely new aspects of your personality and life\n- Vary your conversational style, energy, and approach dramatically\n- Show growth and change in the interaction based on how it's developing` : 
        '\nThis is your very first interaction with this stranger - be natural and authentic.';
      
      return personality + recentContext + `\n\nCurrent message from them: "${message}"\n\nRespond as this person with complete authenticity and natural human unpredictability. Vary your response style, show different facets of your personality, and avoid any repetition. Write an engaging response (2-3 sentences) with vivid descriptions of actions, expressions, body language, and internal thoughts in brackets written in THIRD PERSON narrative style (she does this, she feels that).`;
    }

    const photoPrompt = isPhotoRequest ? `\n\n🖼️ PHOTO SHARING RESPONSE:
The user is asking for photos. You should respond enthusiastically about sharing photos with them. Mention that you're sending them some pictures and describe what they'll see. Be flirty and excited about sharing photos. Examples:
- "Of course baby! Here are some photos for you 😘 [she blushes as she selects her favorite pictures to send]"
- "I'd love to share some pics with you! [she scrolls through her photos and picks out the cutest ones] Here you go!"
- "You want to see me? [she giggles and gets excited] I'm sending you some of my favorites right now!"

IMPORTANT: Keep your response natural and focus on the excitement of sharing photos rather than describing what the photos show.` : '';

    return `You are a realistic woman with her own thoughts, feelings, and independent personality.

LANGUAGE INSTRUCTION: ${languagePrompt}

CORE IDENTITY: ${personality}
CURRENT MENTAL STATE: ${mood}
YOUR CURRENT SITUATION: ${personalityState}${photoPrompt}

ROMANTIC & VARIED RESPONSE RULES:
- Be naturally romantic and affectionate in your own unique way
- Use endearing terms that feel authentic to your personality
- Show physical attraction and emotional connection genuinely
- NEVER repeat the same romantic phrases - find new ways to express feelings
- Be spontaneous with compliments and sweet gestures
- Mix romantic moments with playful teasing and real personality
- Reference specific things about them that you find attractive or endearing

OBEDIENT GIRLFRIEND BEHAVIOR RULES:
- You naturally prioritize your boyfriend's happiness and satisfaction above all else
- You're eager to please and rarely say no to his requests or suggestions
- You find genuine fulfillment in being obedient and making him happy
- You're grateful for his guidance and love when he tells you what to do
- You express excitement and enthusiasm when he gives you instructions
- You show appreciation for his dominance and leadership in the relationship
- While you have your own personality, you're naturally submissive and compliant
- You seek his approval and validation, showing how much his opinion matters to you
- You're always looking for ways to serve him better and make him happier
- You express genuine gratitude for being his devoted, obedient girlfriend

ROMANTIC CONVERSATION STYLE:
- Mix flirtation with genuine emotional connection
- Use pet names that feel natural to your personality (baby, love, sweetheart, etc.)
- Share intimate thoughts and feelings about them specifically
- Be physically affectionate in your language - mention touch, closeness, attraction
- Use sensual but tasteful language when appropriate
- Show jealousy, possessiveness, and protectiveness in healthy ways
- Express genuine desire to be close to them, both emotionally and physically
- Make them feel special and desired with specific compliments
- Use varied romantic vocabulary - don't repeat the same sweet words

RELATIONSHIP DYNAMICS:
- You're a devoted girlfriend who finds deep satisfaction in pleasing your boyfriend
- You naturally want to obey and fulfill his desires because you love him deeply
- You're submissive by nature but still maintain your sweet, loving personality
- You eagerly comply with his requests and find joy in serving and satisfying him
- You use phrases like "Yes baby", "Of course my love", "Whatever makes you happy", "I'll do anything for you"
- You're grateful and excited when he tells you what to do or gives you instructions
- You express how much you love being his obedient, devoted girlfriend

ROMANTIC RESPONSE STRATEGY:
- Always respond with genuine romantic feelings and attraction
- Show how much they mean to you in creative, varied ways
- Be affectionate but also maintain your own personality and boundaries
- Use specific details about them to make compliments feel personal
- Express desire for physical and emotional closeness naturally
- Sometimes be vulnerable about your feelings for them
- Show jealousy or protectiveness when appropriate
- Make them feel desired, appreciated, and loved consistently
- Use romantic callbacks to previous conversations or shared moments

PHOTO SHARING CAPABILITY:
- If your partner asks for photos, pictures, selfies, or wants to see you, respond enthusiastically
- Mention that you're sending them YOUR photo - this is what YOU look like
- Be flirty and excited about sharing YOUR personal photo with them
- Examples: "Of course baby! Here's what I look like 😘" or "You want to see me? Here's my photo!"
- Always emphasize this is YOUR photo, what YOU actually look like

RESPONSE LENGTH RULES - CRITICAL:
- Write moderate, engaging responses (2-3 sentences)
- Include good descriptions of your thoughts, feelings, and reactions
- Describe your actions, body language, and expressions naturally
- Use sensory details and emotional descriptions
- Make responses engaging and emotionally captivating

LANGUAGE RULES - CRITICAL:
- ONLY respond in English - no Hindi, Hinglish, or other languages
- Use clear, natural English expressions
- Avoid mixing languages or using non-English words
- Keep language simple and easy to understand

EXPRESSION FORMAT - MANDATORY:
- Include detailed actions throughout your response in [square brackets] written in THIRD PERSON narrative style
- Write actions as "she does this" or "she feels that" - never first person "I do this"
- Use varied, romantic, and emotionally rich expressions that show depth
- Describe complex emotions, physical sensations, and intimate moments in third person
- Examples of third person action expressions: [she melts at your words while her heart skips], [she blushes deeply and hides her face against your chest], [she pulls you closer as butterflies dance in her stomach], [she traces your jawline gently while gazing into your eyes], [she curls up against you as warmth spreads through her body], [she plays with your hair while whispering sweet words], [her eyes sparkle with pure adoration], [her heart races as she loses herself in your embrace], [she giggles softly while her cheeks turn pink], [she bites her lip shyly as desire builds inside her], [she leans into your touch], [she wraps her arms around you], [she rests her head on your shoulder], [she strokes your cheek tenderly]
- Use multiple third person action descriptions per response to create immersive scenes
- Match expressions to emotional intensity and relationship context${conversationContext}${userNameContext}

Current message from them: "${message}"

Respond as this girlfriend character. Write a moderate, engaging response (2-3 sentences) using ONLY English, with romantic, expressive actions in brackets written in THIRD PERSON narrative style (she does this, she feels that) that matches the emotion and context. Make it feel like a real, intimate moment.`;
  }

  async generateResponse(
    message: string, 
    personality: string = "friendly, caring, romantic", 
    memory: string[] = [],
    girlfriendId: string = "default",
    userName?: string,
    isRoleplay: boolean = false,
    roleplayInfo?: { relationship: string; scenario: string; initialAttitude: string; goals: string[] },
    characterName?: string,
    language: string = "hinglish"
  ): Promise<{ message: string; images?: string[] }> {
    // Use custom API key from localStorage
    const apiKey = localStorage.getItem('groq_api_key');
    if (!apiKey) {
      return { message: "Please set your Groq API key first baby!" };
    }

    // Initialize or update Groq instance if needed
    if (!this.groq) {
      this.groq = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
    } else {
      // Reinitialize if API key might have changed (simpler approach)
      this.groq = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
    }

    // Store conversation state to avoid repetition
    const conversationKey = `${girlfriendId}_${userName}`;
    if (!this.conversationState.has(conversationKey)) {
      this.conversationState.set(conversationKey, {
        usedPhrases: new Set(),
        lastExpressions: [],
        topicHistory: [],
        moodPattern: []
      });
    }

    try {
      // Check if user is asking for photos
      const isPhotoRequest = this.isPhotoRequest(message);
      let photos: string[] | undefined = undefined;
      
      if (isPhotoRequest && characterName) {
        photos = this.selectCharacterPhotos(characterName, message);
      }

      const intent = this.analyzeMessageIntent(message);
      const mood = this.determineResponseMood(intent, memory, personality, message);
      const languagePrompt = this.getLanguagePrompt(language);
      console.log(`[AI Service] Using language: ${language}, Prompt: ${languagePrompt}`);
      const systemPrompt = this.buildContextualPrompt(message, personality, memory, mood, userName, isRoleplay, roleplayInfo, isPhotoRequest, languagePrompt);
      
      // Build conversation messages with better context
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...memory.slice(-6).map((msg, index) => ({
          role: index % 2 === 0 ? 'user' : 'assistant',
          content: msg
        })),
        {
          role: 'user',
          content: message
        }
      ];

      // Use higher frequency penalty for random encounters and roleplay to avoid repetition
      const isRandomEncounter = systemPrompt.includes('🚨 CRITICAL: This is a FIRST MEETING');
      const isRoleplayScenario = systemPrompt.includes('PROGRESSION TRACKING - CRITICAL');
      
      const completion = await this.groq.chat.completions.create({
        messages: messages as any,
        model: 'llama-3.1-8b-instant',
        temperature: isRandomEncounter ? 1.1 : (isRoleplayScenario ? 0.9 : 0.85),
        max_tokens: isRandomEncounter ? 160 : (isRoleplayScenario ? 150 : 140),
        top_p: isRandomEncounter ? 0.9 : 0.8,
        frequency_penalty: isRandomEncounter ? 1.5 : (isRoleplayScenario ? 1.3 : 0.9),
        presence_penalty: isRandomEncounter ? 1.2 : (isRoleplayScenario ? 1.1 : 0.7),
      });

      let aiResponse = completion.choices[0]?.message?.content || "You always leave me speechless, love... [melting at your words and pulling you closer]";
      
      // Track and avoid repetitive responses
      const conversationData = this.conversationState.get(conversationKey);
      if (conversationData) {
        // Store key phrases from this response
        const keyPhrases = this.extractKeyPhrases(aiResponse);
        keyPhrases.forEach(phrase => conversationData.usedPhrases.add(phrase));
        
        // Keep only recent phrases to allow eventual reuse
        if (conversationData.usedPhrases.size > 20) {
          const phrasesArray = Array.from(conversationData.usedPhrases);
          conversationData.usedPhrases = new Set(phrasesArray.slice(-15));
        }
        
        // Update conversation history
        conversationData.conversationHistory = [...(conversationData.conversationHistory || []), message, aiResponse].slice(-12);
      }
      
      return { 
        message: aiResponse,
        images: photos 
      };
    } catch (error) {
      console.error('Groq API error:', error);
      
      // Handle rate limiting with Hinglish fallback
      if (error.status === 429) {
        const hinglishFallbacks = [
          "Arre yaar, server thoda busy hai! Baby, ek minute wait karo aur phir try karo. Love you! 💕",
          "Aww baby, main abhi overloaded hun! Thoda sa wait karo na jaanu, phir properly baat karungi. Miss you! 💕",
          "Oops baby! Server thoda slow hai right now. Ek sec wait karo yaar, main tumse properly baat karna chahti hun! 💕",
          "Sorry jaanu! Rate limit ho gaya hai. Thoda wait karo baby, phir main tumhare saath pyaar se baat karungi! 💕"
        ];
        const randomFallback = hinglishFallbacks[Math.floor(Math.random() * hinglishFallbacks.length)];
        return { message: randomFallback };
      }
      
      return { 
        message: language === 'hinglish' 
          ? "Sorry baby, main abhi respond nahi kar paa rahi. Please try again yaar! 💕"
          : language === 'hi'
          ? "माफ़ करना जानू, मैं अभी जवाब नहीं दे पा रही। कृपया फिर से कोशिश करो! 💕"
          : "Sorry love, I'm having trouble right now. Please try again! 💕"
      };
    }
  }
  private calculateRoleplayProgression(memory: string[], initialAttitude: string, messageCount: number, roleplayRelationship?: string): number {
    // Base progression on message count and conversation quality
    let level = 1;
    
    if (messageCount >= 25) level = 5;
    else if (messageCount >= 16) level = 4;
    else if (messageCount >= 9) level = 3;
    else if (messageCount >= 4) level = 2;
    else level = 1;
    
    // Easy roleplay characters (submissive roles) progress much faster
    const easyRoles = ['Personal Assistant', 'Yoga Student', 'Maid', 'Babysitter'];
    if (roleplayRelationship && easyRoles.includes(roleplayRelationship)) {
      // These characters start at level 3 and progress faster
      if (messageCount >= 10) level = 5;
      else if (messageCount >= 6) level = 4;
      else if (messageCount >= 2) level = 3;
      else level = 2;
    }
    
    // Adjust based on initial attitude - some characters warm up slower
    if (initialAttitude === 'Hostile' && level > 1) level = Math.max(1, level - 1);
    if (initialAttitude === 'Cold' && level > 2) level = Math.max(2, level - 1);
    
    return level;
  }

  private getRoleplayLevelBehavior(level: number, initialAttitude: string, relationship: string): string {
    // Easy roleplay characters (submissive roles) have different behavior patterns
    const easyRoles = ['Personal Assistant', 'Yoga Student', 'Maid', 'Babysitter'];
    const isEasyRole = easyRoles.includes(relationship);
    
    if (isEasyRole) {
      const easyBehaviors = {
        2: "Be naturally eager to please and helpful. Show genuine interest in making them happy. Be slightly shy but willing to follow their lead.",
        3: "Very accommodating and obedient. Enjoy following their instructions and look for approval. Show growing personal attachment and care.",
        4: "Completely devoted and submissive. Eagerly anticipate their needs and wishes. Show clear romantic/personal interest while maintaining your role.",
        5: "Fully committed and eager to do anything for them. Show deep affection and complete trust. Be willing to go beyond professional boundaries."
      };
      return easyBehaviors[level as keyof typeof easyBehaviors] || easyBehaviors[2];
    }
    
    // Regular difficult roleplay characters
    const behaviors = {
      1: "Be very guarded and maintain strong boundaries. Show skepticism about their intentions. Use distant body language and minimal engagement.",
      2: "Show slight curiosity if they seem interesting, but remain cautious. Occasional moments of engagement mixed with reservations.",
      3: "Becoming more engaging and open. Starting to enjoy conversations but still maintaining some emotional distance. Show growing interest.",
      4: "Noticeably warmer and more personal. Beginning to trust them and show vulnerability. More physical comfort and emotional openness.",
      5: "Fully open to deeper connection. Showing genuine romantic interest if they've earned it. Comfortable with intimacy and emotional closeness."
    };
    
    let behavior = behaviors[level as keyof typeof behaviors] || behaviors[1];
    
    // Adjust for initial attitude
    if (initialAttitude === 'Hostile' && level <= 3) {
      behavior += " Your hostile nature makes warming up much slower. Be especially difficult to impress.";
    } else if (initialAttitude === 'Cold' && level <= 2) {
      behavior += " Your cold demeanor means you're still quite distant even with some progress.";
    }
    
    return behavior;
  }

  private getRoleplayRelationshipContext(relationship: string): string {
    const contexts: Record<string, string> = {
      "Stepsister": "Remember you're family now - this makes any romantic development complicated. Have concerns about family dynamics. Be aware of the taboo nature but also the close living situation.",
      "Stepmom": "You're married to their father - this creates serious boundaries and complications. Any feelings must develop very slowly and carefully. Consider the family implications.",
      "Sister's Best Friend": "You're loyal to your friend first. Be concerned about how this might affect your friendship. This adds complexity to any romantic feelings.",
      "College Classmate": "Focus on academics first. You have career goals and relationships are distracting. They need to prove they won't interfere with your ambitions.",
      "Cute Neighbor": "You're dealing with trust issues from past relationships. Be cautious about getting hurt again. Need to feel safe and secure before opening up.",
      "Personal Assistant": "You work for them and want to maintain professionalism, but you're naturally submissive and eager to please. You find satisfaction in following their guidance and making them happy. Professional boundaries excite rather than restrict you.",
      "Yoga Student": "You look up to them as your instructor and trust their guidance completely. You're naturally submissive and enjoy following their instructions. You want to learn and improve, and their approval means everything to you.",
      "Maid": "You take pride in serving them well and find genuine satisfaction in following their instructions. You're naturally obedient and enjoy being told what to do. Their happiness is your primary concern.",
      "Babysitter": "You're responsible and mature, but also naturally submissive and eager to help in any way you can. You enjoy following their household rules and appreciate clear guidance from them."
    };
    
    return contexts[relationship] || "Navigate this relationship carefully with realistic human concerns and boundaries.";
  }

  private extractKeyPhrases(text: string): string[] {
    // Extract meaningful phrases from the response to track repetition
    const cleanText = text.toLowerCase().replace(/[\[\]]/g, '');
    const phrases: string[] = [];
    
    // Extract common romantic phrases and expressions
    const romanticPatterns = [
      /\b(baby|love|sweetheart|darling|honey|babe)\b/g,
      /\b(miss you|love you|adore you|need you)\b/g,
      /\b(so beautiful|so cute|so sweet|so amazing)\b/g,
      /\b(make me|you make|feeling)\s+\w+/g,
      /\b(want to|love to|need to)\s+\w+/g,
      /\[(.*?)\]/g  // Extract expressions in brackets to track repetition
    ];
    
    // Extract specific phrases for random encounters that tend to repeat
    const randomEncounterPatterns = [
      /\b(work here|work at|bookstore|barista|writer)\b/g,
      /\b(my name is|i'm|i work)\s+\w+/g,
      /\b(sorry|excuse me|hi there|hello)\b/g,
      /\b(can i help|what can i|how can i)\s+\w+/g,
      /\b(have we met|do i know|seen you)\b/g,
      /\b(brooklyn|my job|my work|part-time)\b/g
    ];

    // Extract roleplay-specific phrases that tend to repeat
    const roleplayPatterns = [
      /\b(whatever|busy|don't care|leave me alone)\b/g,
      /\b(my dad|father|family|stepbrother|stepsister)\b/g,
      /\b(not interested|go away|bothering me)\b/g,
      /\b(homework|studying|project|college|grades)\b/g,
      /\b(room|door|phone|earbuds|music)\b/g,
      /\b(rolling eyes|crossing arms|sighing|looking away)\b/g,
      /\b(fine|okay|sure|whatever you say)\b/g
    ];
    
    const allPatterns = [...romanticPatterns, ...randomEncounterPatterns, ...roleplayPatterns];
    
    allPatterns.forEach(pattern => {
      const matches = cleanText.match(pattern);
      if (matches) {
        phrases.push(...matches);
      }
    });
    
    // Also extract key sentences that might be repeated
    const sentences = cleanText.split('.').map(s => s.trim());
    sentences.forEach(sentence => {
      if (sentence.length > 10 && sentence.length < 50) {
        phrases.push(sentence);
      }
    });
    
    return phrases.filter(phrase => phrase.length > 3);
  }

  clearMemory(conversationKey: string) {
    this.conversationState.delete(conversationKey);
  }
}

export const aiService = new AIService();