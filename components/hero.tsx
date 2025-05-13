"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Calendar, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Hero({ isLoggedIn }) {
  const router = useRouter()

  return (
    <div className="relative min-h-[70vh] flex items-center">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-primary">SportSync</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto"
          >
            The ultimate platform for sports enthusiasts to create, manage, and participate in sporting events.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {isLoggedIn ? (
              <>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-blue-700 text-white px-8"
                  onClick={() => router.push("/events/create")}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Create Event
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-100"
                  onClick={() => router.push("/events/participate")}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Participate
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-blue-700 text-white px-8"
                  onClick={() => router.push("/register")}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-100"
                  onClick={() => router.push("/login")}
                >
                  Login
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
