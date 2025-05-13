"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  MapPin,
  Shield,
  Clock,
  Award,
  UserPlus,
  Layers,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingPaper } from "@/components/floating-paper";
import { RoboAnimation } from "@/components/robo-animation";
import Navbar from "@/components/navbar";

export default function FeaturesPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId");
    if (userId) {
      setIsLoggedIn(true);
    }
  }, []);

  // Define feature sections
  const featureSections = [
    {
      title: "Event Management",
      description: "Create and manage sports events with ease",
      features: [
        {
          icon: <Calendar className="h-6 w-6 text-primary" />,
          title: "Event Creation",
          description:
            "Create custom sports events with detailed information and scheduling",
        },
        {
          icon: <Layers className="h-6 w-6 text-primary" />,
          title: "Sub-Events",
          description:
            "Organize complex tournaments with multiple sub-events and categories",
        },
        {
          icon: <Clock className="h-6 w-6 text-primary" />,
          title: "Scheduling",
          description:
            "Set precise start and end times for all events and sub-events",
        },
      ],
    },
    {
      title: "Participation",
      description: "Join events and manage your teams",
      features: [
        {
          icon: <Users className="h-6 w-6 text-primary" />,
          title: "Team Registration",
          description:
            "Register your team for team-based events with multiple members",
        },
        {
          icon: <UserPlus className="h-6 w-6 text-primary" />,
          title: "Individual Participation",
          description:
            "Join individual events with a simplified registration process",
        },
        {
          icon: <Award className="h-6 w-6 text-primary" />,
          title: "Event Discovery",
          description: "Browse and discover events created by other users",
        },
      ],
    },
    {
      title: "Venue Management",
      description: "Find and book sports grounds",
      features: [
        {
          icon: <MapPin className="h-6 w-6 text-primary" />,
          title: "Ground Booking",
          description:
            "Reserve sports grounds for your events or personal activities",
        },
        {
          icon: <Zap className="h-6 w-6 text-primary" />,
          title: "Availability Checking",
          description: "Check real-time availability of grounds before booking",
        },
        {
          icon: <Shield className="h-6 w-6 text-primary" />,
          title: "Booking Management",
          description: "View and manage all your ground bookings in one place",
        },
      ],
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 antialiased bg-grid-blue/[0.02]">
      {/* Floating papers background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <FloatingPaper count={6} />
      </div>

      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            SportSync Features
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Discover all the powerful tools and features that make SportSync the
            ultimate platform for sports event management
          </motion.p>
        </div>

        {/* Feature Sections */}
        <div className="space-y-24 mb-20">
          {featureSections.map((section, sectionIndex) => (
            <motion.div
              key={`section-${sectionIndex}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className={`grid md:grid-cols-2 gap-8 items-center ${
                sectionIndex % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Section Text */}
              <div
                className={`space-y-6 ${
                  sectionIndex % 2 === 1 ? "md:order-2" : ""
                }`}
              >
                <motion.h2
                  variants={itemVariants}
                  className="text-3xl font-bold text-gray-900"
                >
                  {section.title}
                </motion.h2>
                <motion.p
                  variants={itemVariants}
                  className="text-lg text-gray-600"
                >
                  {section.description}
                </motion.p>

                <motion.div variants={itemVariants} className="space-y-4">
                  {section.features.map((feature, featureIndex) => (
                    <div
                      key={`feature-${sectionIndex}-${featureIndex}`}
                      className="flex items-start"
                    >
                      <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg mr-4">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Section Visual */}
              <motion.div
                variants={itemVariants}
                className={`bg-white rounded-xl shadow-lg overflow-hidden h-80 flex items-center justify-center ${
                  sectionIndex % 2 === 1 ? "md:order-1" : ""
                }`}
              >
                {sectionIndex === 0 ? (
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 p-8 flex items-center justify-center">
                    <Calendar className="w-32 h-32 text-primary/40" />
                    <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                ) : sectionIndex === 1 ? (
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <div className="w-64 h-64">
                      <RoboAnimation />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 p-8 flex items-center justify-center">
                    <MapPin className="w-32 h-32 text-primary/40" />
                    <div className="absolute top-1/4 left-1/4 bg-white p-3 rounded-lg shadow-md">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div className="absolute bottom-1/4 right-1/4 bg-white p-3 rounded-lg shadow-md">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            What Our Users Say
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "SportSync has revolutionized how we organize our university sports events. The team management feature is a game-changer!",
                author: "Sarah J.",
                role: "University Sports Coordinator",
              },
              {
                quote:
                  "I've tried many sports management platforms, but SportSync stands out with its intuitive interface and comprehensive features.",
                author: "Michael T.",
                role: "Sports Club Manager",
              },
              {
                quote:
                  "The ground booking system saved us countless hours of back-and-forth communication. Highly recommended!",
                author: "Ahmed K.",
                role: "Football League Organizer",
              },
            ].map((testimonial, index) => (
              <motion.div key={`testimonial-${index}`} variants={itemVariants}>
                <Card className="h-full bg-white border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="mb-4 text-primary">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <span key={i} className="text-primary">
                            ★
                          </span>
                        ))}
                    </div>
                    <p className="text-gray-700 mb-6 flex-grow italic">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-primary rounded-2xl p-8 md:p-12 text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join SportSync today and experience the easiest way to manage sports
            events, teams, and venues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/register")}
              className="bg-white text-primary hover:bg-gray-100 px-8 py-6 text-lg font-medium rounded-md"
            >
              Sign Up Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-medium rounded-md"
            >
              Log In
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-6 bg-gray-100 text-center text-gray-600 relative z-10">
        <p>© 2023 SportSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
