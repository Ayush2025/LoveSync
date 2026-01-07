import { RandomGirlsSelector } from "@/components/RandomGirlsSelector";
import { type RandomGirl } from "@/data/randomGirls";

interface RandomGirlsPageProps {
  onSelectGirl: (girl: RandomGirl) => void;
  onBack?: () => void;
}

export function RandomGirlsPage({ onSelectGirl, onBack }: RandomGirlsPageProps) {
  const handleSelectGirl = (girl: RandomGirl) => {
    console.log('RandomGirlsPage - handleSelectGirl called with:', girl.name);
    onSelectGirl(girl);
  };

  return <RandomGirlsSelector onSelect={handleSelectGirl} onBack={onBack} />;
}