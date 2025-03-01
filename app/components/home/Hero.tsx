import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Sparkles, Wand2 } from "lucide-react"

export function Hero() {
  return (
    <Card className="mb-8 overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-800/30 border-0 dark:border dark:border-gray-700">
      <div className="p-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12">
            <Badge
              variant="outline"
              className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 mb-4 animate-pulse"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              New Technology
            </Badge>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Amazing Images with AI
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              Transform your ideas into stunning visuals using our advanced AI
              image generation technology. From breathtaking landscapes to
              creative concept art - the possibilities are endless!
            </p>
            <div className="flex gap-4">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group">
                <Wand2 className="w-4 h-4 mr-2" />
                Try it now!
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500"
              >
                Learn more
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0">
            <div className="grid grid-cols-2 gap-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-lg transform rotate-3 scale-105"></div>
              <div className="relative h-48 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 animate-pulse"></div>
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-bl from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 animate-pulse delay-100"></div>
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 animate-pulse delay-200"></div>
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tl from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
