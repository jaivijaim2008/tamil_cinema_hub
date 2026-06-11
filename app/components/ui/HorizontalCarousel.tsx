import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalCarouselProps {
  children: React.ReactNode;
  className?: string;
}

export default function HorizontalCarousel({ children, className = '' }: HorizontalCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: containerRef });
  const x = useSpring(scrollXProgress, { stiffness: 100, damping: 30 });

  const scrollBy = (offset: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        ref={containerRef}
        className="flex overflow-x-auto gap-4 py-2 scrollbar-hide snap-x"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {React.Children.map(children, (child) => (
          <div className="snap-start flex-shrink-0 min-w-[200px]">{child}</div>
        ))}
      </motion.div>
      {/* Left Arrow */}
      <button
        onClick={() => scrollBy(-300)}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-bg-card bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 transition"
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} className="text-text-primary" />
      </button>
      {/* Right Arrow */}
      <button
        onClick={() => scrollBy(300)}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-bg-card bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 transition"
        aria-label="Scroll right"
      >
        <ChevronRight size={20} className="text-text-primary" />
      </button>
      {/* Progress indicator (optional) */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-accent-gold"
        style={{ scaleX: x, originX: 0 }}
      />
    </div>
  );
}
