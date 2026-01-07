export interface RandomGirl {
  id: string;
  name: string;
  age: number;
  location: string;
  occupation: string;
  personality: string;
  interests: string[];
  lookingFor: string;
  avatar: string;
  bio: string;
  relationship_status: 'Single' | 'It\'s Complicated' | 'Recently Single';
  openness: 'Very Open' | 'Somewhat Open' | 'Cautious' | 'Very Selective';
  first_impression: string;
}

// Import your provided local images - NEW BATCH 2025
import img1 from "@assets/1_1753173971094.jpg";
import img4 from "@assets/4_1753173971093.jpg";
import img7 from "@assets/7_1753173971093.jpg";
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

// Function to get custom random girl avatar or fallback to default
const getRandomGirlAvatar = (name: string, defaultAvatar: string) => {
  const customAvatar = localStorage.getItem(`random_girl_avatar_${name}`);
  return customAvatar || defaultAvatar;
};

// Pool of random girls that users can encounter
export const getRandomGirlsPool = (): RandomGirl[] => [
  {
    id: "rg1",
    name: "Alexis",
    age: 23,
    location: "Coffee Shop Downtown",
    occupation: "Graphic Designer", 
    personality: "creative and slightly introverted, loves art and design. She's usually buried in her laptop at cafes, working on freelance projects. Friendly but takes time to open up to strangers",
    interests: ["Digital Art", "Coffee", "Photography", "Indie Music"],
    lookingFor: "Someone who appreciates creativity and can hold deep conversations",
    avatar: getRandomGirlAvatar("Alexis", img16),
    bio: "Always sketching something new. Looking for genuine connections over superficial small talk.",
    relationship_status: "Single",
    openness: "Cautious",
    first_impression: "She glances up from her laptop when you approach, giving a polite but slightly guarded smile"
  },
  {
    id: "rg2", 
    name: "Savannah",
    age: 25,
    location: "Gym",
    occupation: "Personal Trainer",
    personality: "energetic fitness enthusiast who's confident and outgoing. She loves helping people achieve their goals but can be a bit intimidating at first due to her dedication and intensity",
    interests: ["Fitness", "Nutrition", "Hiking", "Yoga"],
    lookingFor: "Someone who values health and has their life together",
    avatar: getRandomGirlAvatar("Savannah", img17),
    bio: "Pushing limits every day. Sweat is just weakness leaving the body!",
    relationship_status: "Single",
    openness: "Somewhat Open", 
    first_impression: "She's doing deadlifts and notices you watching. She nods with a confident smile"
  },
  {
    id: "rg3",
    name: "Taylor",
    age: 22,
    location: "University Library",
    occupation: "Music Student",
    personality: "passionate music student who's a bit shy but lights up when talking about music. She spends most of her time practicing or studying, making her hard to approach but worth the effort",
    interests: ["Classical Music", "Piano", "Composing", "Reading"],
    lookingFor: "Someone who understands the beauty of music and art",
    avatar: getRandomGirlAvatar("Taylor", img18),
    bio: "Music is my language. Currently working on my composition degree.",
    relationship_status: "Single", 
    openness: "Very Selective",
    first_impression: "She's reading sheet music, humming softly. She seems completely absorbed in her work"
  },
  {
    id: "rg4",
    name: "Brooklyn",
    age: 24,
    location: "Bookstore",
    occupation: "Writer/Barista",
    personality: "aspiring novelist who works part-time at a bookstore. She's witty, intelligent, and loves deep conversations about books and life. A bit of a hopeless romantic but tries to hide it",
    interests: ["Writing", "Literature", "Poetry", "Philosophy"],
    lookingFor: "A muse, someone who inspires her creativity",
    avatar: getRandomGirlAvatar("Brooklyn", img19),
    bio: "Living between the lines of stories yet to be written.",
    relationship_status: "Recently Single",
    openness: "Somewhat Open",
    first_impression: "She's organizing books and drops one when she sees you. She blushes slightly while picking it up"
  },
  {
    id: "rg5",
    name: "Jasmine",
    age: 26,
    location: "Art Gallery",
    occupation: "Curator",
    personality: "sophisticated art curator who's passionate about contemporary art. She can seem intimidating due to her knowledge and elegance, but she's actually quite down-to-earth once you get past her professional demeanor",
    interests: ["Modern Art", "Wine", "Travel", "Architecture"],
    lookingFor: "Someone cultured who can appreciate the finer things in life",
    avatar: getRandomGirlAvatar("Jasmine", img20),
    bio: "Curating beauty in a chaotic world. Art is life, life is art.",
    relationship_status: "It's Complicated",
    openness: "Cautious",
    first_impression: "She's explaining a painting to visitors, speaking with passion and authority"
  },

  {
    id: "rg7",
    name: "Melody",
    age: 22,
    location: "Music Hall",
    occupation: "Musician",
    personality: "talented singer-songwriter who performs at local venues. She's emotional, creative, and pours her heart into her music. A bit moody but incredibly passionate",
    interests: ["Music", "Singing", "Songwriting", "Poetry"],
    lookingFor: "Someone who understands her artistic soul",
    avatar: getRandomGirlAvatar("Melody", img22),
    bio: "Music is my language. Currently working on my debut album.",
    relationship_status: "Single", 
    openness: "Very Selective",
    first_impression: "She's tuning her guitar backstage, completely absorbed in preparing for her performance"
  }
];

// Function to get random selection of girls for discovery
export const getRandomEncounters = (count: number = 6): RandomGirl[] => {
  const pool = getRandomGirlsPool();
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};