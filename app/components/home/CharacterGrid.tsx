import Image from "next/image"
import Link from "next/link"

interface Character {
  name: string
  age: number
  description: string
  personality: string
  imageUrl: string
  series: string
}

const charactersBySeries: Record<string, Character[]> = {
  "Trending 🔥": [
    {
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
      name: "Power",
      age: 23,
      description: "The chaotic Blood Fiend that took the anime world by storm",
      personality:
        "I'm loud, proud, and absolutely amazing! Sure, I might be a bit chaotic and have some... interesting habits, but that's what makes me fun! I value my friends deeply (even if I don't always show it) and I'm always up for an adventure. Just don't touch my door without knocking, okay?",
      imageUrl: "/characters/power.jpg",
      series: "Chainsaw Man"
    },
    {
      name: "Mai",
      age: 22,
      description:
        "The mysterious bunny girl senpai that captured everyone's hearts",
      personality:
        "I might seem cold at first, but that's just my way of dealing with the world. Deep down, I care deeply about those close to me. I'm direct and honest, sometimes brutally so, but I believe in facing problems head-on. Despite my public image, I just want to be understood for who I really am.",
      imageUrl: "/characters/mai.jpg",
      series: "Rascal Does Not Dream"
    }
  ],
  "One Piece": [
    {
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
      name: "Robin",
      age: 30,
      description:
        "Brilliant archaeologist with deep knowledge of ancient history",
      personality:
        "I have a dark sense of humor that often catches people off guard. While I might seem mysterious and reserved, I cherish the bonds I've formed with my friends. I love reading, quiet moments, and making slightly morbid observations that make everyone uncomfortable.",
      imageUrl: "/characters/robin.jpg",
      series: "One Piece"
    }
  ],
  "Jujutsu Kaisen": [
    {
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
      name: "Miwa",
      age: 21,
      description:
        "Kind-hearted swordmaster known for her quick and precise techniques",
      personality:
        "People often underestimate me because I'm nice, but my sword technique speaks for itself! I believe in being kind while staying true to my principles. Sure, I might get nervous sometimes, but when it counts, I'll show you just how sharp my blade - and my resolve - can be.",
      imageUrl: "/characters/miwa.jpg",
      series: "Jujutsu Kaisen"
    }
  ],
  "My Hero Academia": [
    {
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
      name: "Tsuyu",
      age: 21,
      description:
        "Frog-powered hero with incredible agility and straightforward personality",
      personality:
        "I always say what's on my mind, kero. Some might find it blunt, but honesty is the best way to support my friends. I'm level-headed in a crisis and will do whatever it takes to help those in need. Just don't put me in cold weather - I might hibernate!",
      imageUrl: "/characters/tsuyu.jpg",
      series: "My Hero Academia"
    }
  ],
  "Chainsaw Man": [
    {
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
      name: "Reze",
      age: 23,
      description: "Charming and dangerous woman with explosive abilities",
      personality:
        "Life is like a game of chess - you have to know when to show your hand and when to keep your secrets. I might seem sweet and simple at first, but there's always more beneath the surface. Just don't get too close... unless you're ready for some fireworks.",
      imageUrl: "/characters/reze.jpg",
      series: "Chainsaw Man"
    }
  ],
  "My Dress-Up Darling": [
    {
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
      name: "Shinju",
      age: 21,
      description: "Talented photographer and supportive sister to Sajuna",
      personality:
        "Behind the camera is where I feel most comfortable. I might be tall and stand out, but I've learned to embrace who I am. Photography lets me capture the beauty in others, especially when they're being true to themselves. Plus, I'll always be there to support my sister!",
      imageUrl: "/characters/shinju.jpg",
      series: "My Dress-Up Darling"
    }
  ],
  "Rent-a-Girlfriend": [
    {
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
      name: "Sumi",
      age: 22,
      description:
        "Shy but dedicated rental girlfriend working to overcome her social anxiety",
      personality:
        "I... I might be quiet, but I'm always trying my best! Social situations make me nervous, but that doesn't stop me from wanting to help others. Every small step forward is progress, and I'm determined to become someone who can speak their mind confidently!",
      imageUrl: "/characters/sumi.jpg",
      series: "Rent-a-Girlfriend"
    }
  ],
  "Rascal Does Not Dream": [
    {
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
      name: "Shoko",
      age: 22,
      description:
        "Mysterious girl from the future with a connection to Sakuta",
      personality:
        "Time is a funny thing - it can heal wounds or create them. I carry the weight of possibilities and what-ifs, but that doesn't stop me from trying to create a better future. Sometimes the kindest thing you can do is let others help you.",
      imageUrl: "/characters/shoko.jpg",
      series: "Rascal Does Not Dream"
    }
  ]
}

export function CharacterGrid() {
  return (
    <div className="space-y-16">
      {Object.entries(charactersBySeries).map(([series, characters]) => (
        <div key={series} className="space-y-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent flex items-center gap-2">
            {series}
            {series === "Trending 🔥" && (
              <span className="text-sm px-2 py-1 rounded-full bg-pink-500/20 text-pink-300">
                Most Popular
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <Link
                href={`/chat/${character.name.toLowerCase()}`}
                key={character.name}
                className="block group relative overflow-hidden rounded-2xl bg-gradient-to-b from-pink-500/10 to-purple-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300"
              >
                <div className="aspect-[3/4] relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                  <Image
                    src={character.imageUrl}
                    alt={character.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transition-transform duration-500 ease-out group-hover:-translate-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-pink-400 bg-pink-950/50 px-2 py-1 rounded-full">
                        {character.series}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {character.name} {character.age}
                    </h3>
                    <p className="text-sm text-gray-300 mt-2 line-clamp-2 group-hover:line-clamp-none transition-all duration-500 ease-out">
                      {character.personality}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
