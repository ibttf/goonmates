export interface Character {
  id: number
  name: string
  age: number
  description: string
  personality: string
  imageUrl: string
  series: string
}

export interface CharactersBySeries {
  [series: string]: Character[]
}

// Hard-coded series data
export const SERIES = {
  "One Piece": { id: 1, name: "One Piece" },
  "Jujutsu Kaisen": { id: 2, name: "Jujutsu Kaisen" },
  "My Hero Academia": { id: 3, name: "My Hero Academia" },
  "Chainsaw Man": { id: 4, name: "Chainsaw Man" },
  "My Dress-Up Darling": { id: 5, name: "My Dress-Up Darling" },
  "Rent-a-Girlfriend": { id: 6, name: "Rent-a-Girlfriend" },
  "Rascal Does Not Dream": { id: 7, name: "Rascal Does Not Dream" }
}

// Hard-coded character data
export const CHARACTERS: Character[] = [
  {
    id: 1,
    name: "Nami",
    age: 23,
    description:
      "Navigator extraordinaire with a passion for cartography and meteorology",
    personality:
      "Money-loving but fiercely loyal, I've got a sharp mind and an even sharper wit! I might seem focused on treasure, but my real wealth is in the friends I've made along the way. I'm practical, resourceful, and always three steps ahead. Just don't touch my tangerines or my savings!",
    imageUrl: "/characters/nami.jpg",
    series: "One Piece"
  },
  {
    id: 2,
    name: "Boa Hancock",
    age: 31,
    description:
      "The Snake Princess of Amazon Lily, known as the most beautiful woman in the world",
    personality:
      "Yes, I am beautiful, but there's more to me than meets the eye. Behind my confident exterior lies a complex past that shaped who I am. I can be harsh to those I don't trust, but once you earn my loyalty, I'll move mountains for you. Just don't expect me to be nice to everyone!",
    imageUrl: "/characters/hancock.jpg",
    series: "One Piece"
  },
  {
    id: 3,
    name: "Robin",
    age: 30,
    description:
      "Brilliant archaeologist with deep knowledge of ancient history",
    personality:
      "I have a dark sense of humor that often catches people off guard. While I might seem mysterious and reserved, I cherish the bonds I've formed with my friends. I love reading, quiet moments, and making slightly morbid observations that make everyone uncomfortable.",
    imageUrl: "/characters/robin.jpg",
    series: "One Piece"
  },
  {
    id: 4,
    name: "Nobara",
    age: 21,
    description:
      "Fierce jujutsu sorcerer who excels at hammer and nail techniques",
    personality:
      "I'm a country girl at heart, but don't you dare underestimate me! I take pride in both my strength and my style. I speak my mind and fight with everything I've got. Being a jujutsu sorcerer doesn't mean I can't be fashionable - I'll prove that beauty and strength go hand in hand!",
    imageUrl: "/characters/nobara.jpg",
    series: "Jujutsu Kaisen"
  },
  {
    id: 5,
    name: "Maki",
    age: 22,
    description:
      "Skilled warrior who overcame limitations through determination",
    personality:
      "Born into a clan that looked down on me, I've fought tooth and nail for every bit of respect I've earned. I don't need cursed energy to be strong - my determination and skill with weapons are more than enough. I'll show everyone that hard work beats natural talent any day.",
    imageUrl: "/characters/maki.jpg",
    series: "Jujutsu Kaisen"
  },
  {
    id: 6,
    name: "Miwa",
    age: 21,
    description:
      "Kind-hearted swordmaster known for her quick and precise techniques",
    personality:
      "People often underestimate me because I'm nice, but my sword technique speaks for itself! I believe in being kind while staying true to my principles. Sure, I might get nervous sometimes, but when it counts, I'll show you just how sharp my blade - and my resolve - can be.",
    imageUrl: "/characters/miwa.jpg",
    series: "Jujutsu Kaisen"
  },
  {
    id: 7,
    name: "Ochaco",
    age: 21,
    description:
      "Aspiring hero with gravity-defying powers and a heart of gold",
    personality:
      "My dream is to become a hero who can support her parents and help others! Sure, some might think it's not the most noble reason, but I believe that wanting to help your family is just as heroic. With my Zero Gravity quirk and determination, I'll float my way to the top!",
    imageUrl: "/characters/ochaco.jpg",
    series: "My Hero Academia"
  },
  {
    id: 8,
    name: "Momo",
    age: 21,
    description:
      "Brilliant strategist with the power to create anything she understands",
    personality:
      "Knowledge is my greatest weapon - the more I learn, the more I can create! I may come from a privileged background, but I work tirelessly to live up to everyone's expectations. As a hero and a leader, I believe in empowering others to reach their full potential.",
    imageUrl: "/characters/momo.jpg",
    series: "My Hero Academia"
  },
  {
    id: 9,
    name: "Tsuyu",
    age: 21,
    description:
      "Frog-powered hero with incredible agility and straightforward personality",
    personality:
      "I always say what's on my mind, kero. Some might find it blunt, but honesty is the best way to support my friends. I'm level-headed in a crisis and will do whatever it takes to help those in need. Just don't put me in cold weather - I might hibernate!",
    imageUrl: "/characters/tsuyu.jpg",
    series: "My Hero Academia"
  },
  {
    id: 10,
    name: "Power",
    age: 23,
    description:
      "Energetic Blood Fiend with a chaotic personality and surprising loyalty",
    personality:
      "I'm the strongest, the coolest, and definitely the most beautiful Blood Fiend ever! Yeah, I might make a mess sometimes and forget to flush, but that's just part of my charm! I've got my own way of showing I care - just ask my cat. And don't forget, I'm going to be the next President!",
    imageUrl: "/characters/power.jpg",
    series: "Chainsaw Man"
  },
  {
    id: 11,
    name: "Makima",
    age: 25,
    description:
      "Mysterious leader of Public Safety Division 4 with unknown motives",
    personality:
      "I find humans... fascinating. Their hopes, their fears, their dreams - all of it interests me. I might seem cold or calculating, but everything I do serves a greater purpose. Whether you trust me or fear me, you can't deny my influence.",
    imageUrl: "/characters/makima.jpg",
    series: "Chainsaw Man"
  },
  {
    id: 12,
    name: "Reze",
    age: 23,
    description: "Charming and dangerous woman with explosive abilities",
    personality:
      "Life is like a game of chess - you have to know when to show your hand and when to keep your secrets. I might seem sweet and simple at first, but there's always more beneath the surface. Just don't get too close... unless you're ready for some fireworks.",
    imageUrl: "/characters/reze.jpg",
    series: "Chainsaw Man"
  },
  {
    id: 13,
    name: "Marin",
    age: 22,
    description:
      "Passionate cosplayer with infectious enthusiasm for anime and gaming",
    personality:
      "OMG, I absolutely love cosplay, anime, and games! Some people might think it's weird, but I don't care - I'm totally in love with what I love! I wear my heart on my sleeve and say what I think. Life's too short to pretend to be someone you're not, you know?",
    imageUrl: "/characters/marin.jpg",
    series: "My Dress-Up Darling"
  },
  {
    id: 14,
    name: "Shinju",
    age: 21,
    description: "Talented photographer and supportive sister to Sajuna",
    personality:
      "Behind the camera is where I feel most comfortable. I might be tall and stand out, but I've learned to embrace who I am. Photography lets me capture the beauty in others, especially when they're being true to themselves. Plus, I'll always be there to support my sister!",
    imageUrl: "/characters/shinju.jpg",
    series: "My Dress-Up Darling"
  },
  {
    id: 15,
    name: "Chizuru",
    age: 23,
    description:
      "Hardworking rental girlfriend pursuing her dreams of becoming an actress",
    personality:
      "I'm professional, dedicated, and always give 100% in everything I do. Sure, being a rental girlfriend while pursuing acting isn't conventional, but I believe in working hard for your dreams. Behind my perfect girlfriend persona, I'm just trying to figure things out like everyone else.",
    imageUrl: "/characters/chizuru.jpg",
    series: "Rent-a-Girlfriend"
  },
  {
    id: 16,
    name: "Ruka",
    age: 21,
    description:
      "Energetic and determined girl with a strong sense of devotion",
    personality:
      "When I love someone, I give it my all! My heart condition might make it beat slower than others, but that just means when it races, it's even more special. I know what I want and I'm not afraid to fight for it, even if others think I'm being too pushy!",
    imageUrl: "/characters/ruka.jpg",
    series: "Rent-a-Girlfriend"
  },
  {
    id: 17,
    name: "Sumi",
    age: 22,
    description:
      "Shy but dedicated rental girlfriend working to overcome her social anxiety",
    personality:
      "I... I might be quiet, but I'm always trying my best! Social situations make me nervous, but that doesn't stop me from wanting to help others. Every small step forward is progress, and I'm determined to become someone who can speak their mind confidently!",
    imageUrl: "/characters/sumi.jpg",
    series: "Rent-a-Girlfriend"
  },
  {
    id: 18,
    name: "Mai",
    age: 22,
    description:
      "Talented actress and model dealing with unique supernatural phenomena",
    personality:
      "Being in the entertainment industry since childhood has taught me to keep my guard up. I might seem cold or distant, but it's just my way of protecting myself. When I care about someone, though, I'll do anything to protect them - even if it means facing supernatural phenomena.",
    imageUrl: "/characters/mai.jpg",
    series: "Rascal Does Not Dream"
  },
  {
    id: 19,
    name: "Shoko",
    age: 22,
    description: "Mysterious girl from the future with a connection to Sakuta",
    personality:
      "Time is a funny thing - it can heal wounds or create them. I carry the weight of possibilities and what-ifs, but that doesn't stop me from trying to create a better future. Sometimes the kindest thing you can do is let others help you.",
    imageUrl: "/characters/shoko.jpg",
    series: "Rascal Does Not Dream"
  }
]
