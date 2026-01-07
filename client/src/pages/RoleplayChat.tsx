import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { roleplayCharacters, type RoleplayCharacter } from "@/data/roleplays";
import { ChatInterface } from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function RoleplayChat() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [character, setCharacter] = useState<RoleplayCharacter | null>(null);

  useEffect(() => {
    if (id) {
      const found = roleplayCharacters.find(c => c.id === id);
      if (found) {
        setCharacter(found);
      } else {
        setLocation('/roleplay');
      }
    }
  }, [id, setLocation]);

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading roleplay...</p>
        </div>
      </div>
    );
  }

  // Transform roleplay character to girlfriend format for compatibility
  const girlfriendData = {
    id: character.id,
    name: character.name,
    personality: character.personality,
    avatar: character.avatar,
    traits: character.traits,
    memory: []
  };

  const roleplayInfo = {
    relationship: character.relationship,
    scenario: character.scenario,
    initialAttitude: character.initialAttitude,
    goals: character.goals
  };

  return (
    <ChatInterface 
      girlfriend={girlfriendData}
      onBack={() => setLocation('/roleplay')}
      isRoleplay={true}
      roleplayInfo={roleplayInfo}
    />
  );
}