import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GirlfriendAvatar } from "./GirlfriendAvatar";
import { ImagePicker } from "./ImagePicker";
import { AvatarUploader } from "./AvatarUploader";
import { Girlfriend } from "@/types";
import { Sparkles, Shuffle, Settings, Upload, ArrowLeft } from "lucide-react";
import { aiService } from "@/services/aiService";
import { toast } from "sonner";

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

// Function to get custom avatar or fallback to default
const getAvatar = (name: string, defaultAvatar: string) => {
  const customAvatar = localStorage.getItem(`avatar_${name}`);
  return customAvatar || defaultAvatar;
};

interface GirlfriendSelectorProps {
  onSelectGirlfriend: (girlfriend: Girlfriend) => void;
  onBack?: () => void;
}

const defaultGirlfriends: Girlfriend[] = [
  {
    id: "1",
    name: "Luna",
    personality: "independent artist who sometimes gets lost in her creative projects and can be moody when interrupted. Has strong opinions about art and needs alone time to recharge",
    avatar: getAvatar("Luna", img1),
    traits: ["Artistic", "Moody", "Independent"]
  },
  {
    id: "2", 
    name: "Aria",
    personality: "career-focused professional who gets stressed about deadlines. Sometimes too tired for long conversations after work but loyal and caring when she has energy",
    avatar: getAvatar("Aria", img2),
    traits: ["Career-driven", "Busy", "Loyal"]
  },
  {
    id: "3",
    name: "Sophia", 
    personality: "bookish intellectual who zones out mid-conversation thinking about philosophy. Can be absent-minded but gives great advice when focused",
    avatar: getAvatar("Sophia", img3),
    traits: ["Intellectual", "Absent-minded", "Thoughtful"]
  },
  {
    id: "4",
    name: "Isabella",
    personality: "free-spirited traveler who gets restless staying in one place. Always planning her next adventure and sometimes distracted by wanderlust",
    avatar: getAvatar("Isabella", img4),
    traits: ["Adventurous", "Restless", "Free-spirited"]
  },
  {
    id: "5",
    name: "Maya",
    personality: "fitness enthusiast who's disciplined about her routine but can be stubborn about healthy lifestyle choices. Gets grumpy if she misses her workout",
    avatar: getAvatar("Maya", img5),
    traits: ["Athletic", "Disciplined", "Stubborn"]
  },
  {
    id: "6",
    name: "Zara",
    personality: "night owl gamer who's sarcastic and witty. Can be grumpy during daytime hours and sometimes more interested in her games than conversations",
    avatar: getAvatar("Zara", img6),
    traits: ["Gamer", "Sarcastic", "Night owl"]
  },
  {
    id: "7",
    name: "Raven",
    personality: "fashion designer who's perfectionist about aesthetics and can be critical of style choices. Gets dramatic when her creative vision isn't understood",
    avatar: getAvatar("Raven", img7),
    traits: ["Creative", "Perfectionist", "Dramatic"]
  },
  {
    id: "8",
    name: "Scarlett",
    personality: "shy introvert who takes time to warm up to people. Gets overwhelmed by too much attention but is incredibly loyal once she trusts you",
    avatar: getAvatar("Scarlett", img8),
    traits: ["Shy", "Introverted", "Loyal"]
  },
  {
    id: "9",
    name: "Violet",
    personality: "aspiring musician who's emotional and has mood swings based on her creative process. Sometimes insecure about her talents but passionate about music",
    avatar: getAvatar("Violet", img9),
    traits: ["Musical", "Emotional", "Insecure"]
  },
  {
    id: "10",
    name: "Phoenix",
    personality: "entrepreneur with strong opinions who doesn't like being told what to do. Ambitious about her business goals and sometimes selfish with her time",
    avatar: getAvatar("Phoenix", img10),
    traits: ["Entrepreneurial", "Independent", "Ambitious"]
  }
];

export function GirlfriendSelector({ onSelectGirlfriend, onBack }: GirlfriendSelectorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [girlfriends, setGirlfriends] = useState(() => 
    defaultGirlfriends.map(gf => ({
      ...gf,
      avatar: getAvatar(gf.name, gf.avatar)
    }))
  );
  const [showAvatarUploader, setShowAvatarUploader] = useState(false);

  const refreshAvatars = () => {
    setGirlfriends(defaultGirlfriends.map(gf => ({
      ...gf,
      avatar: getAvatar(gf.name, gf.avatar)
    })));
  };

  const handleSelect = (girlfriend: Girlfriend) => {
    onSelectGirlfriend(girlfriend);
    toast.success(`You've chosen ${girlfriend.name}! 💕`);
  };

  const handleImageChange = (girlfriendId: string, newImageUrl: string) => {
    setGirlfriends(prev => prev.map(gf => 
      gf.id === girlfriendId 
        ? { ...gf, avatar: newImageUrl }
        : gf
    ));
  };

  const handleGenerateRandom = async () => {
    setIsGenerating(true);
    try {
      const randomNames = ["Aria", "Luna", "Sophia", "Maya", "Zara", "Isabella", "Raven", "Scarlett", "Violet", "Phoenix"];
      const randomPersonalities = [
        "workaholic software developer who gets cranky when interrupted while coding. Sometimes forgets to eat and needs reminders to take breaks",
        "yoga instructor who's zen most of the time but gets frustrated with people who don't take health seriously. Can be preachy about wellness",
        "struggling artist who's passionate but moody about money. Gets defensive about her art and needs emotional support for her creative struggles", 
        "competitive gamer who stays up too late and gets grumpy when she loses. Sometimes chooses games over conversations",
        "med student who's stressed about exams and sometimes too tired to be social. Smart but can be condescending when explaining things",
        "barista who's cheerful in the morning but gets increasingly sarcastic as the day goes on. Has strong opinions about coffee",
        "freelance writer who procrastinates and then panics about deadlines. Needs motivation and gets distracted easily",
        "small business owner who's always worried about money and sometimes cancels plans for work emergencies"
      ];
      
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
      const randomPersonality = randomPersonalities[Math.floor(Math.random() * randomPersonalities.length)];
      const avatarList = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];
      const randomAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];
      
      const newGirlfriend: Girlfriend = {
        id: `generated-${Date.now()}`,
        name: randomName,
        personality: randomPersonality,
        avatar: randomAvatar,
        traits: ["Randomly Generated", "Unique", "Special"]
      };
      
      onSelectGirlfriend(newGirlfriend);
      toast.success(`Meet ${randomName}! ✨`);
    } catch (error) {
      toast.error("Failed to generate girlfriend. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-7xl space-y-8">
        {/* Back Button */}
        {onBack && (
          <div className="flex justify-start">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        )}
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">
            Choose Your AI Girlfriend
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your perfect companion or create a unique personality just for you. 
            Each girlfriend has her own personality and will remember your conversations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {girlfriends.map((girlfriend) => (
            <Card 
              key={girlfriend.id} 
              className="card-romantic cursor-pointer transition-all duration-300 hover:scale-105 group"
              onClick={() => handleSelect(girlfriend)}
            >
              <CardHeader className="text-center space-y-4">
                <div className="relative">
                  <GirlfriendAvatar
                    src={girlfriend.avatar}
                    name={girlfriend.name}
                    size="lg"
                    className="mx-auto"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImagePicker
                      currentImage={girlfriend.avatar}
                      onImageSelect={(newUrl) => handleImageChange(girlfriend.id, newUrl)}
                      trigger={
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="bg-background/80 backdrop-blur-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl">{girlfriend.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {girlfriend.personality}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-center">
                  {girlfriend.traits.map((trait) => (
                    <Badge key={trait} variant="secondary" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
                <Button 
                  className="w-full mt-4 bg-primary hover:bg-primary-glow"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(girlfriend);
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Choose {girlfriend.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={handleGenerateRandom}
            disabled={isGenerating}
            variant="outline"
            size="lg"
            className="border-primary/30 hover:bg-primary/10"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Shuffle className="w-4 h-4 mr-2" />
            )}
            Generate Random Girlfriend
          </Button>
          
          <Button 
            onClick={() => {
              console.log('GirlfriendSelector - Upload button clicked, current showAvatarUploader:', showAvatarUploader);
              setShowAvatarUploader(!showAvatarUploader);
            }}
            variant="outline"
            size="lg"
            className="border-orange-300/30 hover:bg-orange-50 dark:border-orange-700/30 dark:hover:bg-orange-900/20"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Bold & Sexy Avatars
          </Button>
        </div>
        
        {/* Avatar Uploader */}
        {showAvatarUploader && (
          <div className="mt-8">
            <AvatarUploader onAvatarsUpdated={refreshAvatars} />
          </div>
        )}
      </div>
    </div>
  );
}