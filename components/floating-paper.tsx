"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

interface PaperItem {
  id: number;
  initialX: number;
  initialY: number;
  animateX: [number, number, number];
  animateY: [number, number, number];
  duration: number;
}

export function FloatingPaper({ count = 5 }) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [papers, setPapers] = useState<PaperItem[]>([]);

  useEffect(() => {
    // Set initial dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Generate random positions only on client
    const generatedPapers: PaperItem[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      initialX: Math.random() * window.innerWidth,
      initialY: Math.random() * window.innerHeight,
      animateX: [
        Math.random() * window.innerWidth,
        Math.random() * window.innerWidth,
        Math.random() * window.innerWidth,
      ],
      animateY: [
        Math.random() * window.innerHeight,
        Math.random() * window.innerHeight,
        Math.random() * window.innerHeight,
      ],
      duration: 20 + Math.random() * 10,
    }));

    setPapers(generatedPapers);

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [count]);

  // Don't render until papers are generated on client
  if (papers.length === 0) {
    return <div className="relative w-full h-full" />;
  }

  return (
    <div className="relative w-full h-full">
      {papers.map((paper) => (
        <motion.div
          key={paper.id}
          className="absolute"
          initial={{
            x: paper.initialX,
            y: paper.initialY,
          }}
          animate={{
            x: paper.animateX,
            y: paper.animateY,
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: paper.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <div className="relative w-16 h-20 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-100 shadow-sm flex items-center justify-center transform hover:scale-110 transition-transform">
            <FileText className="w-8 h-8 text-primary/50" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
