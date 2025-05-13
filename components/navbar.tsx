"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { LogOut, Menu, User } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="flex items-center justify-between px-6 py-4 bg-white shadow-sm"
    >
      <Link href="/" className="flex items-center space-x-2">
        <span className="text-primary font-bold text-2xl">SportSync</span>
      </Link>

      <div className="hidden md:flex items-center space-x-8">
        <NavLink href="/features">Features</NavLink>
        <NavLink href="/news">News</NavLink>
        {isLoggedIn && (
          <>
            <NavLink href="/events/create">Create Event</NavLink>
            <NavLink href="/events/my-events">My Events</NavLink>
            <NavLink href="/events/participate">Participate</NavLink>
            <NavLink href="/grounds/book">Book Ground</NavLink>
          </>
        )}
      </div>

      <div className="hidden md:flex items-center space-x-4">
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-primary"
              >
                <User className="w-5 h-5 mr-2" />
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-primary"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
            <Button
              className="bg-primary hover:bg-blue-700 text-white"
              onClick={() => router.push("/register")}
            >
              Register
            </Button>
          </>
        )}
      </div>

      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white p-4 z-50 border-b border-gray-200 md:hidden shadow-md">
          <div className="flex flex-col space-y-4">
            <Link
              href="/features"
              className="text-gray-700 hover:text-primary py-2"
            >
              Features
            </Link>
            <Link
              href="/news"
              className="text-gray-700 hover:text-primary py-2"
            >
              News
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  href="/events/create"
                  className="text-gray-700 hover:text-primary py-2"
                >
                  Create Event
                </Link>
                <Link
                  href="/events/my-events"
                  className="text-gray-700 hover:text-primary py-2"
                >
                  My Events
                </Link>
                <Link
                  href="/events/participate"
                  className="text-gray-700 hover:text-primary py-2"
                >
                  Participate
                </Link>
                <Link
                  href="/grounds/book"
                  className="text-gray-700 hover:text-primary py-2"
                >
                  Book Ground
                </Link>
              </>
            )}
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-primary py-2"
                >
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  className="justify-start p-0 text-gray-700 hover:text-primary"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary py-2"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-gray-700 hover:text-primary py-2"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </motion.nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-gray-700 hover:text-primary transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
    </Link>
  );
}
