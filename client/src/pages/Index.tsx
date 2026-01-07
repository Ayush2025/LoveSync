import { useState } from "react";
import { GirlfriendSelector } from "@/components/GirlfriendSelector";
import { ChatInterface } from "@/components/ChatInterface";
import { RoleplaySelector } from "@/components/RoleplaySelector";
import { Girlfriend } from "@/types";
import { RoleplayCharacter } from "@/data/roleplays";
import { RandomGirlsPage } from "@/pages/RandomGirlsPage";
import { RandomGirlChat } from "@/pages/RandomGirlChat";
import { type RandomGirl } from "@/data/randomGirls";
import { Button } from "@/components/ui/button";
import { Heart, Swords, Users, Crown } from "lucide-react";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

const Index = () => {
  const { t } = useLanguage();
  const [selectedGirlfriend, setSelectedGirlfriend] = useState<Girlfriend | null>(null);
  const [selectedRoleplay, setSelectedRoleplay] = useState<RoleplayCharacter | null>(null);
  const [selectedRandomGirl, setSelectedRandomGirl] = useState<RandomGirl | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'girlfriends' | 'roleplay' | 'random'>('home');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleSelectGirlfriend = (girlfriend: Girlfriend) => {
    setSelectedGirlfriend(girlfriend);
  };

  const handleSelectRoleplay = (character: RoleplayCharacter) => {
    setSelectedRoleplay(character);
  };

  const handleSelectRandomGirl = (girl: RandomGirl) => {
    console.log('Index - handleSelectRandomGirl called with:', girl.name);
    console.log('Index - Current selectedRandomGirl:', selectedRandomGirl);
    setSelectedRandomGirl(girl);
    console.log('Index - setSelectedRandomGirl called');
  };

  const handleBack = () => {
    setSelectedGirlfriend(null);
    setSelectedRoleplay(null);
    setSelectedRandomGirl(null);
    setCurrentView('home');
  };

  // Show chat interface for girlfriend
  if (selectedGirlfriend) {
    return (
      <ChatInterface 
        girlfriend={selectedGirlfriend} 
        onBack={handleBack}
      />
    );
  }

  // Show chat interface for roleplay
  if (selectedRoleplay) {
    const girlfriendData = {
      id: selectedRoleplay.id,
      name: selectedRoleplay.name,
      personality: selectedRoleplay.personality,
      avatar: selectedRoleplay.avatar,
      traits: selectedRoleplay.traits,
      memory: []
    };

    const roleplayInfo = {
      relationship: selectedRoleplay.relationship,
      scenario: selectedRoleplay.scenario,
      initialAttitude: selectedRoleplay.initialAttitude,
      goals: selectedRoleplay.goals
    };

    return (
      <ChatInterface 
        girlfriend={girlfriendData}
        onBack={handleBack}
        isRoleplay={true}
        roleplayInfo={roleplayInfo}
      />
    );
  }

  // Show girlfriend selector
  if (currentView === 'girlfriends') {
    return <GirlfriendSelector onSelectGirlfriend={handleSelectGirlfriend} onBack={handleBack} />;
  }

  // Show roleplay selector  
  if (currentView === 'roleplay') {
    return <RoleplaySelector onSelect={handleSelectRoleplay} onBack={handleBack} />;
  }

  // Show random girl chat (check this BEFORE random girls selector)
  if (selectedRandomGirl) {
    return <RandomGirlChat girl={selectedRandomGirl} onBack={handleBack} />;
  }

  // Show random girls selector
  if (currentView === 'random') {
    return <RandomGirlsPage onSelectGirl={handleSelectRandomGirl} onBack={handleBack} />;
  }

  // Show main home screen with navigation
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <LanguageSelector />
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-6">{t('title')}</h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Girlfriend Chat Card */}
          <div 
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => setCurrentView('girlfriends')}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 border-pink-100 dark:border-pink-800 hover:border-pink-300 dark:hover:border-pink-600 transition-all">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4">AI Girlfriends</h2>
                <p className="text-muted-foreground mb-6">
                  Chat with your perfect AI girlfriend. Choose from 10 unique personalities, each with their own traits and romantic style.
                </p>
                <div className="text-sm text-pink-600 dark:text-pink-400 font-medium">
                  10 Available Characters →
                </div>
              </div>
            </div>
          </div>

          {/* Roleplay Chat Card */}
          <div 
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => setCurrentView('roleplay')}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 border-purple-100 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 transition-all">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Swords className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Roleplay Adventures</h2>
                <p className="text-muted-foreground mb-6">
                  Take on the challenge! Win over real characters like your stepsister, stepmom, or neighbor. They're not your girlfriend yet - you'll need to earn their affection.
                </p>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  5 Challenge Scenarios →
                </div>
              </div>
            </div>
          </div>

          {/* Random Girls Card */}
          <div 
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => setCurrentView('random')}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 border-blue-100 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Random Encounters</h2>
                <p className="text-muted-foreground mb-6">
                  Meet new girls around the city! Each encounter is unique - approach strangers and try to build real connections from scratch.
                </p>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Discover New People →
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Upgrade Section */}
        <div className="text-center mt-12">
          <div className="max-w-md mx-auto bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
            <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Unlock Premium Features</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Unlimited messages, all companions, photo sharing & more
            </p>
            <Button 
              onClick={() => setShowSubscriptionModal(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            Choose your adventure: romantic girlfriend chat or challenging roleplay scenarios
          </p>
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onUpgrade={(planId) => {
            console.log(`Upgrading to ${planId} plan`);
            // TODO: Integrate with Stripe payment
            alert(`Professional subscription system coming soon! You selected ${planId} plan.`);
            setShowSubscriptionModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Index;
