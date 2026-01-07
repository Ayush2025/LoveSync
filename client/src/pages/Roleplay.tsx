import { RoleplaySelector } from "@/components/RoleplaySelector";
import { RoleplayCharacter } from "@/data/roleplays";
import { useLocation } from "wouter";

export default function Roleplay() {
  const [, setLocation] = useLocation();

  const handleSelectCharacter = (character: RoleplayCharacter) => {
    setLocation(`/roleplay/${character.id}`);
  };

  return <RoleplaySelector onSelect={handleSelectCharacter} />;
}