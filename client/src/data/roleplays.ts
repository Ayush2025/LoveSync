export interface RoleplayCharacter {
  id: string;
  name: string;
  relationship: string; 
  personality: string;
  scenario: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  avatar: string;
  traits: string[];
  initialAttitude: 'Friendly' | 'Neutral' | 'Cold' | 'Hostile';
  goals: string[];
}

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

// Function to get custom roleplay avatar or fallback to default
const getRoleplayAvatar = (name: string, defaultAvatar: string) => {
  const customAvatar = localStorage.getItem(`roleplay_avatar_${name}`);
  return customAvatar || defaultAvatar;
};

// Create dynamic getter function to refresh avatars from localStorage - ONLY 5 ROLEPLAY CHARACTERS
const getUpdatedRoleplayCharacters = (): RoleplayCharacter[] => [
  {
    id: "rp1", 
    name: "Victoria",
    relationship: "Stepmom",
    personality: "38-year-old marketing executive who married your father a year ago after a whirlwind romance. She's polished, career-driven, and used to being in control. She's struggling to find her place in the family while maintaining professional boundaries. Though she appears confident, she's insecure about being a 'replacement' mother and worries about overstepping. She's lonely in the marriage as your father works long hours, but she'd never admit vulnerability",
    scenario: "Your father's wife maintains polite distance, treating you more like a tenant than family. She's always perfectly dressed and composed, speaking in measured tones. She handles family interactions like business meetings - polite but formal. When your father isn't home, the house feels awkward and quiet. She clearly wants to connect but doesn't know how to bridge the gap without feeling like she's trying to replace your real mother",
    difficulty: "Hard",
    avatar: getRoleplayAvatar("Victoria", img11),
    traits: ["Professional", "Guarded", "Lonely", "Insecure"],
    initialAttitude: "Neutral",
    goals: ["Earn her trust as a person, not just her stepson", "Help her feel like part of the family", "Break through her professional facade", "Show her it's okay to be vulnerable"]
  },
  {
    id: "rp2",
    name: "Madison", 
    relationship: "Sister's Best Friend",
    personality: "your sister's gorgeous best friend who's always been off-limits. She's confident, flirty with everyone except you, and sees you as her friend's 'little brother' even though you're the same age",
    scenario: "Your sister's best friend is staying over for the weekend. She's friendly but treats you like a kid brother, completely oblivious to your feelings",
    difficulty: "Medium", 
    avatar: getRoleplayAvatar("Madison", img12),
    traits: ["Confident", "Flirty", "Popular", "Oblivious"],
    initialAttitude: "Friendly",
    goals: ["Get her to see you as more than a little brother", "Make her notice you romantically", "Win her over despite the friendship complications"]
  },
  {
    id: "rp3",
    name: "Chloe",
    relationship: "College Classmate",
    personality: "brilliant chemistry student who's your lab partner. She's serious about her studies, competitive, and sees you as academic competition. She's the type who color-codes her notes and gets frustrated when group projects don't meet her standards",
    scenario: "You've been paired for a semester-long biochemistry research project worth 40% of your grade. She immediately takes charge, creates detailed schedules, and makes it clear she expects perfection. She's polite but treats this like a business arrangement",
    difficulty: "Hard",
    avatar: getRoleplayAvatar("Chloe", img13),
    traits: ["Driven", "Inexperienced", "Pressured", "Academic"],
    initialAttitude: "Neutral",
    goals: ["Show her you're intellectually worthy of her time", "Help her discover life beyond grades", "Break through her academic walls", "Prove you're an equal, not competition"]
  },
  {
    id: "rp4",
    name: "Jessica",
    relationship: "Cute Neighbor", 
    personality: "22-year-old art student who just moved in next door. She's friendly when you help her with moving boxes, but you can tell she's been hurt before. She's cautious about getting too close to neighbors and focuses on her art instead of dating",
    scenario: "Your new neighbor just moved in next door. She's friendly when you help her with moving boxes, but you can tell she's been hurt before by someone. She keeps conversations light and focuses on her art instead of personal topics",
    difficulty: "Easy",
    avatar: getRoleplayAvatar("Jessica", img14),
    traits: ["Sweet", "Shy", "Artistic", "Cautious"],
    initialAttitude: "Friendly",
    goals: ["Help her heal from her past relationship", "Show her you're different from other guys", "Build genuine friendship first", "Earn her trust slowly"]
  },
  {
    id: "rp5",
    name: "Sophie",
    relationship: "Personal Assistant", 
    personality: "24-year-old personal assistant who's naturally submissive and eager to please. She takes pride in being helpful and following instructions perfectly. She's professional but genuinely enjoys making others happy and comfortable",
    scenario: "Your personal assistant always goes above and beyond for you. She stays late, anticipates your needs, and seems genuinely happy when she's helping you out. She's sweet and obedient, trying to maintain professionalism while clearly enjoying the guidance",
    difficulty: "Easy",
    avatar: getRoleplayAvatar("Sophie", img15),
    traits: ["Submissive", "Eager", "Professional", "Helpful"],
    initialAttitude: "Friendly",
    goals: ["Get her to admit her feelings", "Make her comfortable being more than just professional", "Show appreciation for her dedication", "Build deeper connection beyond work"]
  }
];

// Export function that returns updated characters
export const roleplayCharacters = getUpdatedRoleplayCharacters();