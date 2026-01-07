import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, Globe } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { toast } from 'sonner';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();

  const languages: { value: Language; label: string; flag: string }[] = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { value: 'hinglish', label: 'Hinglish', flag: '🇮🇳' }
  ];

  const currentLanguage = languages.find(l => l.value === language);

  const handleLanguageChange = async (newLanguage: Language) => {
    console.log('LanguageSelector - Changing language to:', newLanguage);
    setLanguage(newLanguage);
    
    if (user?.id) {
      try {
        await apiRequest('/api/users/language', {
          method: 'PATCH',
          body: JSON.stringify({ language: newLanguage })
        });
        toast.success(`Language changed to ${newLanguage === 'en' ? 'English' : newLanguage === 'hi' ? 'Hindi' : 'Hinglish'}`);
        console.log('LanguageSelector - Language updated successfully');
      } catch (error) {
        console.error('Failed to update language preference:', error);
        toast.error('Failed to save language preference');
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          data-testid="language-selector-trigger"
        >
          <Globe className="w-4 h-4 mr-2" />
          {currentLanguage?.flag} {currentLanguage?.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white/95 backdrop-blur-sm border-white/20">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => handleLanguageChange(lang.value)}
            className={`cursor-pointer ${
              language === lang.value ? 'bg-pink-100 dark:bg-pink-900' : ''
            }`}
            data-testid={`language-option-${lang.value}`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}