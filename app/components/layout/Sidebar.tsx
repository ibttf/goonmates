"use client"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createContext, useContext, useEffect, useState } from "react"
import { FaCommentAlt, FaCompass, FaHeart } from "react-icons/fa"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

// Sidebar Context
const SidebarContext = createContext<{
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
}>({
  isExpanded: true,
  setIsExpanded: () => {}
})

export function useSidebar() {
  return useContext(SidebarContext)
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarExpanded")
      return saved ? JSON.parse(saved) : true
    }
    return true
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarExpanded", JSON.stringify(isExpanded))
    }
  }, [isExpanded])

  return (
    <SidebarContext.Provider value={{ isExpanded, setIsExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}

const sidebarVariants = {
  base: "fixed left-0 flex h-[calc(100vh)] flex-col bg-[#111111] transition-all duration-300",
  collapsed: "w-[72px] border-r border-[#222222]",
  expanded: "w-[240px] border-r border-[#222222]"
}

function NavItem({
  icon: Icon,
  label,
  href,
  variant = "ghost",
  expanded,
  active = false,
  onClick
}: {
  icon: React.ElementType
  label: string
  href: string
  variant?: "ghost" | "premium"
  expanded?: boolean
  active?: boolean
  onClick?: (e: React.MouseEvent) => void
}) {
  const iconSize = "w-5 h-5"

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href}>
            <Button
              variant={variant === "premium" ? "default" : "ghost"}
              className={cn(
                "w-full flex items-center gap-x-4 bg-transparent hover:bg-[#1A1A1A] text-white hover:text-white rounded-md cursor-pointer px-3 h-11",
                variant === "premium" &&
                  "bg-pink-500 hover:bg-pink-600 text-white hover:text-white",
                !expanded && "justify-center px-0"
              )}
              onClick={onClick}
            >
              <Icon className={cn(iconSize, "shrink-0")} />
              {expanded && (
                <span className="flex-1 text-sm text-left">{label}</span>
              )}
            </Button>
          </Link>
        </TooltipTrigger>
        {!expanded && (
          <TooltipContent
            side="right"
            sideOffset={10}
            className="select-none bg-black text-white border-[#333333]"
          >
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

export function Sidebar() {
  const { isExpanded, setIsExpanded } = useSidebar()
  const [session, setSession] = useState<any>(null)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        // Fetch user's premium status
        supabase
          .from("users")
          .select("status, plan")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data, error }) => {
            // If no data or error, user is not premium
            setIsPremium(data?.status === "active" && data?.plan === "premium")
          })
      }
    })

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        // Fetch user's premium status
        const { data, error } = await supabase
          .from("users")
          .select("status, plan")
          .eq("user_id", session.user.id)
          .single()
        // If no data or error, user is not premium
        setIsPremium(data?.status === "active" && data?.plan === "premium")
      } else {
        setIsPremium(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error("Error signing in:", error)
    }
  }

  return (
    <aside
      className={cn(
        sidebarVariants.base,
        isExpanded ? sidebarVariants.expanded : sidebarVariants.collapsed
      )}
    >
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center justify-between px-4 mt-2">
          {isExpanded ? (
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 text-transparent bg-clip-text">
              goonmates
            </span>
          ) : (
            <div className="w-full flex justify-center">
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 text-transparent bg-clip-text">
                g
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 text-gray-400 hover:text-white",
              !isExpanded && "absolute right-0"
            )}
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="h-[1px] bg-[#222222] mb-4" />

        <div className="px-3 space-y-2">
          <NavItem
            icon={FaCompass}
            label="Explore Models"
            href="/explore"
            expanded={isExpanded}
            active={true}
          />
          <NavItem
            icon={FaCommentAlt}
            label="Chat"
            href="/chat"
            expanded={isExpanded}
          />
        </div>

        <div className="mt-auto px-3 pb-4 flex flex-col gap-4">
          {session && !isPremium && (
            <>
              {isExpanded ? (
                <Link href="/upgrade" className="block">
                  <div className="pl-4 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-sm hover:from-pink-600 hover:to-pink-700 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FaHeart className="h-4 w-4" />
                      <div className="text-sm font-bold relative">
                        Unlock Goonmates
                        <span className="absolute -top-1 -right-2 text-xs">
                          +
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/upgrade">
                        <Button className="w-full h-11 bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700">
                          <FaHeart className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={10}
                      className="select-none bg-black text-white border-[#333333]"
                    >
                      Upgrade to Premium
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </>
          )}

          {/* Sign In Button - Only show when not signed in */}
          {!session && (
            <Button
              variant="outline"
              className="w-full h-11 border-[#333333] bg-transparent text-white hover:bg-[#222222] hover:text-white"
              onClick={handleSignIn}
            >
              {isExpanded ? (
                <div className="flex items-center justify-center gap-2 w-full">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in
                </div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
            </Button>
          )}

          {/* Footer Links */}
          {isExpanded && (
            <div className="flex items-center justify-center text-xs gap-0.5 text-gray-400">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <span>•</span>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
