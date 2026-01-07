import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'hinglish';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.girlfriends': 'AI Girlfriends',
    'nav.roleplay': 'Roleplay',
    'nav.random': 'Random Girls',
    'nav.audio_call': 'Audio Call',
    'nav.video_call': 'Video Call',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Main interface
    'title': 'LoveSync',
    'subtitle': 'Choose your perfect AI companion experience',
    'chat.typing': 'Typing...',
    'chat.send': 'Send',
    'chat.placeholder': 'Type your message...',
    
    // Audio/Video calls
    'call.audio_start': 'Start Audio Call',
    'call.video_start': 'Start Video Call',
    'call.end': 'End Call',
    'call.mute': 'Mute',
    'call.unmute': 'Unmute',
    'call.connecting': 'Connecting...',
    'call.connected': 'Connected',
    'call.duration': 'Call Duration',
    
    // Messages
    'msg.welcome': 'Welcome!',
    'msg.error': 'Something went wrong',
    'msg.success': 'Success!',
    
    // Common actions
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.back': 'Back'
  },
  
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.girlfriends': 'AI गर्लफ्रेंड',
    'nav.roleplay': 'रोलप्ले',
    'nav.random': 'रैंडम गर्ल्स',
    'nav.audio_call': 'ऑडियो कॉल',
    'nav.video_call': 'वीडियो कॉल',
    'nav.settings': 'सेटिंग्स',
    'nav.logout': 'लॉगआउट',
    
    // Main interface
    'title': 'लवसिंक',
    'subtitle': 'अपना परफेक्ट AI साथी चुनें',
    'chat.typing': 'टाइप कर रहा है...',
    'chat.send': 'भेजें',
    'chat.placeholder': 'अपना मैसेज लिखें...',
    
    // Audio/Video calls
    'call.audio_start': 'ऑडियो कॉल शुरू करें',
    'call.video_start': 'वीडियो कॉल शुरू करें',
    'call.end': 'कॉल समाप्त करें',
    'call.mute': 'म्यूट करें',
    'call.unmute': 'अनम्यूट करें',
    'call.connecting': 'कनेक्ट हो रहा है...',
    'call.connected': 'कनेक्ट हो गया',
    'call.duration': 'कॉल की अवधि',
    
    // Messages
    'msg.welcome': 'स्वागत!',
    'msg.error': 'कुछ गलत हुआ',
    'msg.success': 'सफल!',
    
    // Common actions
    'action.save': 'सेव करें',
    'action.cancel': 'रद्द करें',
    'action.delete': 'डिलीट करें',
    'action.edit': 'एडिट करें',
    'action.back': 'वापस'
  },
  
  hinglish: {
    // Navigation
    'nav.home': 'Home',
    'nav.girlfriends': 'AI Girlfriends',
    'nav.roleplay': 'Roleplay',
    'nav.random': 'Random Girls',
    'nav.audio_call': 'Audio Call',
    'nav.video_call': 'Video Call',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Main interface
    'title': 'LoveSync',
    'subtitle': 'Apna perfect AI companion choose karo',
    'chat.typing': 'Type kar raha hai...',
    'chat.send': 'Send karo',
    'chat.placeholder': 'Apna message type karo...',
    
    // Audio/Video calls
    'call.audio_start': 'Audio Call Start karo',
    'call.video_start': 'Video Call Start karo',
    'call.end': 'Call End karo',
    'call.mute': 'Mute karo',
    'call.unmute': 'Unmute karo',
    'call.connecting': 'Connect ho raha hai...',
    'call.connected': 'Connected ho gaya',
    'call.duration': 'Call ka duration',
    
    // Messages
    'msg.welcome': 'Welcome hai!',
    'msg.error': 'Kuch galat ho gaya',
    'msg.success': 'Ho gaya!',
    
    // Common actions
    'action.save': 'Save karo',
    'action.cancel': 'Cancel karo',
    'action.delete': 'Delete karo',
    'action.edit': 'Edit karo',
    'action.back': 'Wapas jao'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    console.log('Language Context - Saved language:', saved);
    
    // Force default to Hinglish if not explicitly set to another language
    if (!saved || saved === 'en') {
      localStorage.setItem('language', 'hinglish');
      console.log('Language Context - Forcing default to Hinglish');
      return 'hinglish';
    }
    
    return (saved as Language) || 'hinglish';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}