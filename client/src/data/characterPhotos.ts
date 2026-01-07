// Import all your provided local images - NEW BATCH 2025
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

export type PhotoCategory = 'casual' | 'selfie' | 'outfit' | 'lifestyle' | 'cute';

// Character Photos Mapping - COMPLETELY UNIQUE ASSIGNMENTS
export const characterPhotos: Record<string, Record<PhotoCategory, string[]>> = {
  // AI GIRLFRIENDS (1-10) - EXACTLY 10 CHARACTERS
  Luna: {
    casual: [img1],
    selfie: [img1],
    outfit: [img1],
    lifestyle: [img1],
    cute: [img1]
  },
  
  Aria: {
    casual: [img2],
    selfie: [img2],
    outfit: [img2],
    lifestyle: [img2],
    cute: [img2]
  },
  
  Sophia: {
    casual: [img3],
    selfie: [img3],
    outfit: [img3],
    lifestyle: [img3],
    cute: [img3]
  },
  
  Isabella: {
    casual: [img4],
    selfie: [img4],
    outfit: [img4],
    lifestyle: [img4],
    cute: [img4]
  },
  
  Maya: {
    casual: [img5],
    selfie: [img5],
    outfit: [img5],
    lifestyle: [img5],
    cute: [img5]
  },
  
  Zara: {
    casual: [img6],
    selfie: [img6],
    outfit: [img6],
    lifestyle: [img6],
    cute: [img6]
  },
  
  Raven: {
    casual: [img7],
    selfie: [img7],
    outfit: [img7],
    lifestyle: [img7],
    cute: [img7]
  },
  
  Scarlett: {
    casual: [img8],
    selfie: [img8],
    outfit: [img8],
    lifestyle: [img8],
    cute: [img8]
  },
  
  Violet: {
    casual: [img9],
    selfie: [img9],
    outfit: [img9],
    lifestyle: [img9],
    cute: [img9]
  },
  
  Phoenix: {
    casual: [img10],
    selfie: [img10],
    outfit: [img10],
    lifestyle: [img10],
    cute: [img10]
  },

  // ROLEPLAY CHARACTERS (11-15) - EXACTLY 5 CHARACTERS
  Victoria: {
    casual: [img11],
    selfie: [img11],
    outfit: [img11],
    lifestyle: [img11],
    cute: [img11]
  },
  
  Madison: {
    casual: [img12],
    selfie: [img12],
    outfit: [img12],
    lifestyle: [img12],
    cute: [img12]
  },
  
  Chloe: {
    casual: [img13],
    selfie: [img13],
    outfit: [img13],
    lifestyle: [img13],
    cute: [img13]
  },
  
  Jessica: {
    casual: [img14],
    selfie: [img14],
    outfit: [img14],
    lifestyle: [img14],
    cute: [img14]
  },
  
  Sophie: {
    casual: [img15],
    selfie: [img15],
    outfit: [img15],
    lifestyle: [img15],
    cute: [img15]
  },

  // RANDOM GIRLS (16-22) - EXACTLY 7 CHARACTERS
  Alexis: {
    casual: [img16],
    selfie: [img16],
    outfit: [img16],
    lifestyle: [img16],
    cute: [img16]
  },
  
  Savannah: {
    casual: [img17],
    selfie: [img17],
    outfit: [img17],
    lifestyle: [img17],
    cute: [img17]
  },
  
  Taylor: {
    casual: [img18],
    selfie: [img18],
    outfit: [img18],
    lifestyle: [img18],
    cute: [img18]
  },
  
  Brooklyn: {
    casual: [img19],
    selfie: [img19],
    outfit: [img19],
    lifestyle: [img19],
    cute: [img19]
  },
  
  Jasmine: {
    casual: [img20],
    selfie: [img20],
    outfit: [img20],
    lifestyle: [img20],
    cute: [img20]
  },
  
  Natasha: {
    casual: [img21],
    selfie: [img21],
    outfit: [img21],
    lifestyle: [img21],
    cute: [img21]
  },
  
  Melody: {
    casual: [img22],
    selfie: [img22],
    outfit: [img22],
    lifestyle: [img22],
    cute: [img22]
  },

  // Default fallback
  default: {
    casual: [img1],
    selfie: [img1],
    outfit: [img1],
    lifestyle: [img1],
    cute: [img1]
  }
};

// Get photos for a character - returns only ONE photo consistently
export const getCharacterPhotos = (characterName: string, category?: 'casual' | 'selfie' | 'outfit' | 'lifestyle' | 'cute', count: number = 1): string[] => {
  const photos = characterPhotos[characterName] || characterPhotos.default;
  
  if (category) {
    const categoryPhotos = photos[category] || photos.casual;
    // Return only the first photo to ensure consistency
    return categoryPhotos.slice(0, 1);
  }
  
  // Return only one photo from casual category by default
  return photos.casual.slice(0, 1);
};

export const detectPhotoCategory = (message: string): 'casual' | 'selfie' | 'outfit' | 'lifestyle' | 'cute' | 'random' => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('selfie') || lowerMessage.includes('your face') || lowerMessage.includes('close up')) {
    return 'selfie';
  }
  if (lowerMessage.includes('outfit') || lowerMessage.includes('dress') || lowerMessage.includes('wearing') || lowerMessage.includes('clothes')) {
    return 'outfit';
  }
  if (lowerMessage.includes('cute') || lowerMessage.includes('adorable') || lowerMessage.includes('sweet')) {
    return 'cute';
  }
  if (lowerMessage.includes('casual') || lowerMessage.includes('relaxed') || lowerMessage.includes('everyday')) {
    return 'casual';
  }
  if (lowerMessage.includes('lifestyle') || lowerMessage.includes('life') || lowerMessage.includes('daily')) {
    return 'lifestyle';
  }
  
  return 'casual'; // Default to casual instead of random
};