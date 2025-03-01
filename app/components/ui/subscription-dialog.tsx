import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { FaHeart } from "react-icons/fa"
import { useState } from "react"

interface SubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubscribe: () => Promise<void>
}

export function SubscriptionDialog({
  open,
  onOpenChange,
  onSubscribe
}: SubscriptionDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[#222222] text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Unlock Full Access
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Subscribe to Goonmates+ to continue chatting with your favorite
            characters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-pink-500">
              <FaHeart className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Goonmates+</h3>
            </div>
            <p className="text-sm text-gray-400">
              Enjoy unlimited conversations with all characters
            </p>
          </div>

          <div className="bg-[#222222] p-4 rounded-lg space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold">Weekly</span>
              <div className="text-right">
                <span className="text-2xl font-bold">$9.99</span>
                <span className="text-gray-400 ml-1">/week</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Full access to all characters and features
            </p>
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700"
          >
            {loading ? "Processing..." : "Subscribe Now"}
          </Button>

          <p className="text-xs text-center text-gray-400">
            You can cancel your subscription at any time.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
