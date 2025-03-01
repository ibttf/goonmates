import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  FaCompass,
  FaCommentAlt,
  FaHeadset,
  FaChevronLeft,
  FaFileAlt,
  FaShieldAlt,
  FaHeart
} from "react-icons/fa"
import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Tooltip
} from "@/components/ui/tooltip"
import { useState, useEffect, createContext, useContext } from "react"

// Sidebar Context
const SidebarContext = createContext<{
  isLocked: boolean
  setIsLocked: (locked: boolean) => void
}>({
  isLocked: false,
  setIsLocked: () => {}
})

export function useSidebar() {
  return useContext(SidebarContext)
}

function SidebarButton({
  icon: Icon,
  label,
  href,
  variant = "ghost",
  expanded,
  size = "default",
  className
}: {
  icon: React.ElementType
  label: string
  href: string
  variant?: "ghost" | "premium"
  expanded: boolean
  size?: "default" | "sm" | "lg"
  className?: string
}) {
  const sizeStyles = {
    sm: "h-8 text-xs",
    default: "h-12 text-sm",
    lg: "h-14 text-sm"
  }

  const iconSize = cn(
    "transition-transform",
    size === "sm" && "w-4 h-4",
    size === "default" && "w-6 h-6",
    size === "lg" && variant === "premium" ? "w-8 h-8" : "w-6 h-6"
  )

  return expanded ? (
    <Link href={href}>
      <Button
        variant={variant === "premium" ? "default" : "ghost"}
        className={cn(
          "w-full flex items-center gap-x-4 bg-transparent hover:bg-[#1A1A1A] text-white hover:text-white rounded-md cursor-pointer px-3",
          variant === "premium" &&
            "bg-pink-500 hover:bg-pink-600 text-white hover:text-white",
          sizeStyles[size],
          className
        )}
      >
        <Icon className={iconSize} />
        <span className="flex-1 text-left">{label}</span>
      </Button>
    </Link>
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href}>
          <Button
            variant={variant === "premium" ? "default" : "ghost"}
            className={cn(
              "w-full flex justify-center bg-transparent hover:bg-[#1A1A1A] text-white hover:text-white rounded-md cursor-pointer",
              variant === "premium" &&
                "bg-pink-500 hover:bg-pink-600 text-white hover:text-white",
              sizeStyles[size]
            )}
          >
            <Icon className={iconSize} />
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export function Sidebar({
  className,
  isSignedIn = false
}: {
  className?: string
  isSignedIn?: boolean
}) {
  return (
    <TooltipProvider>
      <aside
        className={cn(
          "bg-[#111111] border-r border-[#222222] hidden md:flex flex-col h-[calc(100vh-64px)] mt-16 w-56",
          className
        )}
      >
        {/* Main Navigation */}
        <div className="px-2 pt-6 space-y-2">
          <SidebarButton
            icon={FaCompass}
            label="Explore Models"
            href="/explore"
            expanded={true}
          />
          <SidebarButton
            icon={FaCommentAlt}
            label="Chat"
            href="/chat"
            expanded={true}
          />
        </div>

        {/* Premium Button */}
        <div className="px-2 mt-4">
          <SidebarButton
            icon={FaHeart}
            label="Unlock Premium"
            href="/premium"
            variant="premium"
            expanded={true}
            size="lg"
          />
        </div>

        {/* Bottom Links */}
        <div className="mt-auto px-2 pb-4 space-y-4">
          <div>
            <SidebarButton
              icon={FaHeadset}
              label="Contact Support"
              href="/support"
              expanded={true}
              size="lg"
              className="mb-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SidebarButton
              icon={FaFileAlt}
              label="Terms"
              href="/terms"
              expanded={true}
              size="sm"
            />
            <SidebarButton
              icon={FaShieldAlt}
              label="Privacy"
              href="/privacy"
              expanded={true}
              size="sm"
            />
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
