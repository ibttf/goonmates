"use client"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  ChevronRightIcon,
  User
} from "lucide-react"
import { createContext, useContext, useEffect, useState } from "react"
import { FaCommentAlt, FaCompass, FaHeart } from "react-icons/fa"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthContext } from "@/app/providers"
import { useIsMobile } from "@/lib/hooks/use-mobile"
import { ProfileDialog } from "../ui/profile-dialog"
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
  base: "flex flex-col bg-[#111111] transition-all duration-300 overflow-hidden",
  collapsed: "w-[72px] border-r border-[#222222]",
  expanded: "w-[240px] border-r border-[#222222]",
  mobile:
    "fixed top-0 left-0 w-screen h-16 border-b border-[#222222] px-4 z-50",
  mobileExpanded:
    "fixed inset-0 z-50 bg-[#111111] w-screen h-screen overflow-hidden"
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
                !expanded && "justify-center px-0",
                active && "bg-[#1A1A1A] text-white"
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

function NavItemSkeleton({ expanded }: { expanded: boolean }) {
  return (
    <div
      className={cn(
        "w-full flex items-center gap-x-4 bg-transparent rounded-md px-3 h-11",
        !expanded && "justify-center px-0"
      )}
    >
      <div className="h-5 w-5 rounded-md bg-gray-800 animate-pulse shrink-0" />
      {expanded && (
        <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
      )}
    </div>
  )
}

export function Sidebar() {
  const { isExpanded, setIsExpanded } = useSidebar()
  const { user, isLoading, isSubscribed, signIn, signOut } = useAuthContext()
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const isMobile = useIsMobile()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log("Auth state:", { user, isSubscribed, loading: isLoading })
  }, [user, isSubscribed, isLoading])

  // Determine active states
  const isExploreActive = pathname === "/"
  const isChatActive = pathname.startsWith("/chat")

  const handleToggle = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen)
    } else {
      setIsExpanded(!isExpanded)
    }
  }

  const handleSignIn = async () => {
    try {
      setLoading(true)
      await signIn()
      // Loading will be reset by the useEffect when user changes
    } catch (error) {
      console.error("Error signing in:", error)
      alert("Failed to sign in. Please try again.")
      setLoading(false)
    }
  }

  // Add timeout to reset loading state if stuck
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoading(false)
      }, 10000) // Reset loading after 10 seconds
      return () => clearTimeout(timeout)
    }
  }, [loading])

  // Reset local loading state when auth state changes
  useEffect(() => {
    if (!isLoading) {
      // Only reset when isLoading is false
      setLoading(false)
    }
  }, [user, isLoading])

  // Debug logging
  useEffect(() => {
    console.log("Auth state:", {
      user,
      isSubscribed,
      loading: isLoading,
      signInLoading: loading
    })
  }, [user, isSubscribed, isLoading, loading])

  const handleCheckout = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          allow_promotion_codes: true
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create checkout session")
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Error:", error)
      alert(
        error instanceof Error
          ? error.message
          : "Failed to start checkout. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  // Add handleCancelSubscription function
  const handleCancelSubscription = async () => {
    if (!user) return
    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to cancel subscription")
      }

      await response.json()
    } catch (error) {
      console.error("Error canceling subscription:", error)
      throw error
    }
  }

  if (isMobile) {
    return (
      <>
        <aside
          className={cn(
            sidebarVariants.base,
            isMobileMenuOpen
              ? sidebarVariants.mobileExpanded
              : sidebarVariants.mobile
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between h-16 w-full z-50",
              isMobileMenuOpen && "px-4"
            )}
          >
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 text-transparent bg-clip-text hover:opacity-80 transition-opacity"
            >
              goonmates
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white"
              onClick={handleToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {isMobileMenuOpen && (
            <div className="flex flex-col flex-1 px-4 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] w-full relative z-10">
              <div className="space-y-2">
                {isLoading ? (
                  <>
                    <NavItemSkeleton expanded={true} />
                    <NavItemSkeleton expanded={true} />
                  </>
                ) : (
                  <>
                    {user && (
                      <Button
                        variant="ghost"
                        className="w-full h-14 bg-transparent text-white hover:bg-[#222222] hover:text-white flex items-center justify-between mb-4"
                        onClick={() => {
                          setIsProfileOpen(true)
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-8 h-8 rounded-full bg-[#222222] flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                          <span className="text-sm truncate">{user.email}</span>
                        </div>
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    )}

                    <NavItem
                      icon={FaCompass}
                      label="Explore Models"
                      href="/"
                      expanded={true}
                      active={isExploreActive}
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <NavItem
                      icon={FaCommentAlt}
                      label="Chat"
                      href="/chat"
                      expanded={true}
                      active={isChatActive}
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                  </>
                )}
              </div>

              <div className="mt-auto relative z-10">
                {user && !isSubscribed && (
                  <Button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full pl-4 py-5 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-sm hover:from-pink-600 hover:to-pink-700 transition-all duration-200 cursor-pointer z-30"
                  >
                    <div className="flex items-center gap-2">
                      <FaHeart className="h-4 w-4" />
                      <div className="text-sm font-bold relative">
                        {loading ? "Processing..." : "Unlock Goonmates"}
                        <span className="absolute -top-1 -right-2 text-xs">
                          +
                        </span>
                      </div>
                    </div>
                  </Button>
                )}

                {!isLoading && !user && (
                  <Button
                    variant="outline"
                    className="w-full h-11 border-[#333333] bg-transparent text-white hover:bg-[#222222] hover:text-white"
                    onClick={handleSignIn}
                    disabled={loading}
                  >
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
                      {loading ? "Signing in..." : "Sign in"}
                    </div>
                  </Button>
                )}

                <div className="flex items-center justify-center text-xs gap-0.5 text-gray-400 mt-4">
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
              </div>
            </div>
          )}
        </aside>
        {user?.email && (
          <ProfileDialog
            open={isProfileOpen}
            onOpenChange={setIsProfileOpen}
            onSignOut={signOut}
            onSubscribe={handleCheckout}
            onCancelSubscription={handleCancelSubscription}
            isSubscribed={isSubscribed}
            email={user.email}
          />
        )}
      </>
    )
  }

  return (
    <>
      <aside
        className={cn(
          sidebarVariants.base,
          "fixed left-0 h-screen max-h-screen overflow-hidden hidden md:flex z-40",
          isExpanded ? sidebarVariants.expanded : sidebarVariants.collapsed
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto relative">
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
                "h-8 w-8 text-gray-400 hover:text-white z-20",
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
            {isLoading ? (
              <>
                <NavItemSkeleton expanded={isExpanded} />
                <NavItemSkeleton expanded={isExpanded} />
              </>
            ) : (
              <>
                <NavItem
                  icon={FaCompass}
                  label="Explore Models"
                  href="/"
                  expanded={isExpanded}
                  active={isExploreActive}
                />
                <NavItem
                  icon={FaCommentAlt}
                  label="Chat"
                  href="/chat"
                  expanded={isExpanded}
                  active={isChatActive}
                />
              </>
            )}
          </div>

          <div className="mt-auto px-3 pb-4 flex flex-col gap-4 relative z-10">
            {isLoading ? (
              <div
                className={cn(
                  "w-full h-11 bg-gray-800 rounded animate-pulse",
                  isExpanded ? "px-4" : "px-0"
                )}
              />
            ) : (
              <>
                {user && !isSubscribed && (
                  <>
                    {isExpanded ? (
                      <Button
                        onClick={handleCheckout}
                        disabled={loading}
                        className="w-full pl-4 py-5 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-sm hover:from-pink-600 hover:to-pink-700 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FaHeart className="h-4 w-4" />
                          <div className="text-sm font-bold relative">
                            {loading ? "Processing..." : "Unlock Goonmates"}
                            <span className="absolute -top-1 -right-2 text-xs">
                              +
                            </span>
                          </div>
                        </div>
                      </Button>
                    ) : (
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleCheckout}
                              disabled={loading}
                              className="w-full h-11 bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700"
                            >
                              <FaHeart className="h-4 w-4" />
                            </Button>
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

                {!isLoading && !user && (
                  <Button
                    variant="outline"
                    className="w-full h-11 border-[#333333] bg-transparent text-white hover:bg-[#222222] hover:text-white"
                    onClick={handleSignIn}
                    disabled={loading}
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
                        {loading ? "Signing in..." : "Sign in"}
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

                {user && (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full h-11 bg-transparent text-white hover:bg-[#222222] hover:text-white flex items-center justify-between"
                      onClick={() => setIsProfileOpen(true)}
                    >
                      {isExpanded ? (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#222222] flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="text-sm truncate">
                              {user.email}
                            </span>
                          </div>
                          <ChevronRightIcon className="h-4 w-4 -ml-1" />
                        </>
                      ) : (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-[#222222] flex items-center justify-center">
                                  <User className="w-4 h-4 text-gray-400" />
                                </div>
                                <ChevronRightIcon className="h-4 w-4 ml-1" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              sideOffset={10}
                              className="select-none bg-black text-white border-[#333333]"
                            >
                              Profile Settings
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </Button>
                  </>
                )}
              </>
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
      {user?.email && (
        <ProfileDialog
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          onSignOut={signOut}
          onSubscribe={handleCheckout}
          onCancelSubscription={handleCancelSubscription}
          isSubscribed={isSubscribed}
          email={user.email}
        />
      )}
    </>
  )
}
