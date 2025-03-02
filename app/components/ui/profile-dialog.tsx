"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { FaHeart } from "react-icons/fa"
import { User } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignOut: () => void
  onSubscribe: () => Promise<void>
  onCancelSubscription?: () => Promise<void>
  isSubscribed: boolean
  email: string
}

export function ProfileDialog({
  open,
  onOpenChange,
  onSignOut,
  onSubscribe,
  onCancelSubscription,
  isSubscribed,
  email
}: ProfileDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      await onSubscribe()
    } catch (error) {
      console.error("Error subscribing:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!onCancelSubscription) return
    try {
      setLoading(true)
      await onCancelSubscription()
      toast.success("Successfully cancelled subscription")
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast.error("Failed to cancel subscription. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[#222222] text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#222222] flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">{email}</p>
            </div>
          </div>

          {!isSubscribed ? (
            <>
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700"
              >
                {loading ? "Processing..." : "Subscribe Now ($9.99/week)"}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleCancelSubscription}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Processing..." : "Cancel Subscription"}
            </Button>
          )}

          <Button
            onClick={onSignOut}
            variant="outline"
            className="w-full border-red-600 text-red-600 hover:bg-red-600/10"
          >
            Sign Out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
