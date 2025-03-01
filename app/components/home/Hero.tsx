import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <div className="relative mb-8 h-[30vh] min-h-[300px] overflow-hidden rounded-xl bg-[#1a0612]">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-purple-600/10" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.1), transparent 70%)",
          filter: "blur(40px)"
        }}
      />
      <div
        className="absolute right-0 bottom-0 w-1/3 h-2/3"
        style={{
          background:
            "radial-gradient(circle at bottom right, rgba(255, 0, 128, 0.3), transparent 70%), radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.2), transparent 60%)",
          filter: "blur(40px)"
        }}
      />
      <div className="flex h-full flex-row items-center">
        <div className="w-2/3 pl-8">
          <Badge
            variant="outline"
            className="bg-pink-950/50 text-pink-300 border-pink-500/50 mb-3"
          >
            <Heart className="w-3 h-3 mr-2" />
            Your New Girlfriend
          </Badge>
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
            Nami's Been Waiting For You
          </h1>
          <p className="text-pink-100/70 mb-4 text-sm">
            Discover an intimate connection with Nami, your personal AI
            girlfriend of your dreams.
          </p>
          <div className="flex gap-3">
            <Button
              asChild
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 group px-6 py-5 text-sm text-white"
            >
              <Link href="/chat/nami">
                <Heart className="w-3 h-3 mr-2 fill-white" />
                Talk to Nami
              </Link>
            </Button>
          </div>
        </div>
        <div className="w-1/2 relative h-full">
          <Image
            src="/nami.png"
            alt="Nami"
            fill
            className="object-contain object-right scale-125"
            priority
          />
        </div>
      </div>
    </div>
  )
}
