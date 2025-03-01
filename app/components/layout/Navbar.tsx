import { Button } from "@/components/ui/button"
import Link from "next/link"

interface NavbarProps {
  isSignedIn?: boolean
}

export function Navbar({ isSignedIn = false }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#111111] border-b border-[#222222] z-50 mt-2">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left section with menu button and logo */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-white hover:bg-[#222222] rounded-md lg:hidden">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12H21M3 6H21M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 text-transparent bg-clip-text">
              goonmates
            </span>
          </Link>
        </div>

        {/* Right section with action buttons */}
        <div className="flex items-center">
          <Link href="/login">
            <Button className="px-4 py-2 text-white bg-pink-500 hover:bg-pink-600 font-medium flex items-center gap-2">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
