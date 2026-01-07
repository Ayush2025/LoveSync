import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, User, Shuffle, MessageCircle, ArrowLeft } from "lucide-react";
import { getRandomEncounters, type RandomGirl } from "@/data/randomGirls";

interface RandomGirlsSelectorProps {
  onSelect: (girl: RandomGirl) => void;
  onBack?: () => void;
}

export function RandomGirlsSelector({ onSelect, onBack }: RandomGirlsSelectorProps) {
  const [currentGirls, setCurrentGirls] = useState<RandomGirl[]>(() => getRandomEncounters(6));
  const [isShuffling, setIsShuffling] = useState(false);

  const getOpennessColor = (openness: string) => {
    switch (openness) {
      case 'Very Open': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Somewhat Open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Cautious': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Very Selective': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Single': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Recently Single': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'It\'s Complicated': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setCurrentGirls(getRandomEncounters(6));
      setIsShuffling(false);
    }, 1000);
  };

  const handleApproach = (girl: RandomGirl) => {
    console.log('RandomGirlsSelector - handleApproach called with:', girl.name);
    console.log('RandomGirlsSelector - onSelect function:', typeof onSelect);
    onSelect(girl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 p-4">
      <div className="max-w-7xl mx-auto">
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
          <h1 className="text-4xl font-bold gradient-text mb-4">Random Encounters</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Discover new people around the city. These girls don't know you yet - you'll need to make a good first impression!
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Each encounter is a fresh start. Be charming, be yourself, and see where the conversation takes you.
          </p>
          
          <Button 
            onClick={handleShuffle}
            disabled={isShuffling}
            variant="outline"
            size="lg"
            className="border-purple-300/30 hover:bg-purple-50 dark:border-purple-700/30 dark:hover:bg-purple-900/20"
          >
            {isShuffling ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Shuffle className="w-4 h-4 mr-2" />
            )}
            {isShuffling ? 'Finding New People...' : 'Discover New Girls'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentGirls.map((girl) => (
            <Card 
              key={girl.id} 
              className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200 dark:hover:border-purple-700 overflow-hidden touch-manipulation"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <img 
                      src={girl.avatar} 
                      alt={girl.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-200 dark:border-purple-700"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-foreground">{girl.name}, {girl.age}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-sm">
                      <MapPin className="w-3 h-3" />
                      {girl.location}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap mb-3">
                  <Badge className={getStatusColor(girl.relationship_status)}>
                    {girl.relationship_status}
                  </Badge>
                  <Badge className={getOpennessColor(girl.openness)}>
                    {girl.openness}
                  </Badge>
                </div>

                <div className="text-sm">
                  <p className="font-medium text-muted-foreground mb-1">{girl.occupation}</p>
                  <p className="text-xs text-muted-foreground italic">"{girl.first_impression}"</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm">{girl.bio}</p>
                  
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">INTERESTS</p>
                    <div className="flex flex-wrap gap-1">
                      {girl.interests.slice(0, 3).map((interest) => (
                        <span key={interest} className="text-xs bg-secondary px-2 py-1 rounded-full">
                          {interest}
                        </span>
                      ))}
                      {girl.interests.length > 3 && (
                        <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                          +{girl.interests.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">LOOKING FOR</p>
                    <p className="text-xs text-muted-foreground">{girl.lookingFor}</p>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Approaching girl:', girl.name);
                    handleApproach(girl);
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Approach {girl.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-2">How Random Encounters Work</h3>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Each girl is a unique person with her own personality and interests</li>
              <li>• Your success depends on your conversation skills and compatibility</li>
              <li>• Some girls are more open to new connections than others</li>
              <li>• Be genuine, respectful, and find common ground</li>
              <li>• Every conversation is a fresh start - make it count!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}