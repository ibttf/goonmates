"use client";

import { useState } from 'react';

interface CheckoutHook {
  isCheckoutLoading: boolean;
  checkoutError: string | null;
  handleCheckout: (options?: { allowPromotionCodes?: boolean }) => Promise<void>;
}

export default function useCheckout(): CheckoutHook {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async (options?: { allowPromotionCodes?: boolean }) => {
    setIsCheckoutLoading(true);
    setCheckoutError(null);
    
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          allow_promotion_codes: options?.allowPromotionCodes ?? true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to start checkout. Please try again.";
      setCheckoutError(errorMessage);
      throw error;
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return {
    isCheckoutLoading,
    checkoutError,
    handleCheckout
  };
} 