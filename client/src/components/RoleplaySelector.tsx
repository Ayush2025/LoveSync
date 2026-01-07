import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Target, User, ArrowLeft } from "lucide-react";
import { roleplayCharacters, type RoleplayCharacter } from "@/data/roleplays";

interface RoleplaySelectorProps {
  onSelect: (character: RoleplayCharacter) => void;
  onBack?: () => void;
}

// Function to get fresh roleplay characters with updated avatars
const getFreshRoleplayCharacters = (): RoleplayCharacter[] => {
  // Use the actual roleplay characters from the data file with fresh avatars
  return roleplayCharacters.map(character => ({
    ...character,
    avatar: localStorage.getItem(`roleplay_avatar_${character.name}`) || character.avatar
  }));
};

export function RoleplaySelector({ onSelect, onBack }: RoleplaySelectorProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<RoleplayCharacter | null>(null);
  const [characters, setCharacters] = useState<RoleplayCharacter[]>(() => getFreshRoleplayCharacters());

  // Refresh characters when component mounts or when localStorage changes
  useEffect(() => {
    const refreshCharacters = () => {
      setCharacters(getFreshRoleplayCharacters());
    };
    
    // Listen for storage changes from other windows/tabs
    window.addEventListener('storage', refreshCharacters);
    
    return () => {
      window.removeEventListener('storage', refreshCharacters);
    };
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';  
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getAttitudeColor = (attitude: string) => {
    switch (attitude) {
      case 'Friendly': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Neutral': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'Cold': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Hostile': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        {onBack && (
          <div className="mb-6">
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
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Roleplay Adventures</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Challenge yourself with realistic scenarios where you need to earn their affection
          </p>
          <p className="text-sm text-muted-foreground">
            These characters aren't your girlfriend yet - you'll need to work to win them over!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Card 
              key={character.id} 
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-pink-200 dark:hover:border-pink-700"
              onClick={() => setSelectedCharacter(character)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={character.avatar} 
                    alt={character.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-pink-200 dark:border-pink-700"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-xl text-foreground">{character.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-sm">
                      <User className="w-3 h-3" />
                      {character.relationship}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Badge className={getDifficultyColor(character.difficulty)}>
                    {character.difficulty}
                  </Badge>
                  <Badge className={getAttitudeColor(character.initialAttitude)}>
                    {character.initialAttitude}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {character.scenario}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      PERSONALITY
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {character.traits.slice(0, 3).map((trait) => (
                        <span key={trait} className="text-xs bg-secondary px-2 py-1 rounded-full">
                          {trait}
                        </span>
                      ))}
                      {character.traits.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{character.traits.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      YOUR GOALS
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {character.goals.slice(0, 2).map((goal, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-pink-500 mt-0.5">•</span>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedCharacter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedCharacter(null)}>
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={selectedCharacter.avatar} 
                    alt={selectedCharacter.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-pink-200 dark:border-pink-700"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{selectedCharacter.name}</CardTitle>
                    <CardDescription className="text-lg">{selectedCharacter.relationship}</CardDescription>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getDifficultyColor(selectedCharacter.difficulty)}>
                        {selectedCharacter.difficulty}
                      </Badge>
                      <Badge className={getAttitudeColor(selectedCharacter.initialAttitude)}>
                        {selectedCharacter.initialAttitude}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Scenario</h3>
                  <p className="text-muted-foreground">{selectedCharacter.scenario}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Personality</h3>
                  <p className="text-muted-foreground mb-3">{selectedCharacter.personality}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacter.traits.map((trait) => (
                      <Badge key={trait} variant="secondary">{trait}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Your Goals
                  </h3>
                  <ul className="space-y-2">
                    {selectedCharacter.goals.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-pink-500 mt-1">•</span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={() => onSelect(selectedCharacter)}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    Start Roleplay
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCharacter(null)}
                    className="flex-1"
                  >
                    Back to Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}