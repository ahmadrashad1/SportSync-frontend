"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Hero from "@/components/hero"
import Navbar from "@/components/navbar"
import { FloatingPaper } from "@/components/floating-paper"

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId")
    if (userId) {
      setIsLoggedIn(true)
    }
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 antialiased bg-grid-blue/[0.02] relative overflow-hidden">
      {/* Floating papers background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <FloatingPaper count={6} />
      </div>

      <div className="relative z-10">
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <Hero isLoggedIn={isLoggedIn} />
      </div>

      {/* Features Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What You Can Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="dark-card rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Events</h3>
              <p className="text-gray-400">Host your own sporting events and manage participants with ease.</p>
            </div>

            <div className="dark-card rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Join Events</h3>
              <p className="text-gray-400">Discover and participate in events created by other sports enthusiasts.</p>
            </div>

            <div className="dark-card rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Grounds</h3>
              <p className="text-gray-400">Reserve sports grounds for your events or personal activities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-gradient text-white relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join SportSync today and connect with other sports enthusiasts in your area.
          </p>
          <Button
            onClick={() => router.push("/register")}
            className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-md font-medium"
          >
            Sign Up Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-100 text-center text-gray-600 relative z-10">
        <p>© 2023 SportSync. All rights reserved.</p>
      </footer>
    </main>
  )
}

function Button({ children, className, onClick }) {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  )
}
