import React from 'react';
import { motion } from 'framer-motion';

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  backgroundUrl: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function HeroBanner({ title, subtitle, backgroundUrl, ctaText, ctaHref }: HeroBannerProps) {
  return (
    <section
      className="relative h-[70vh] w-full overflow-hidden rounded-xl glassmorphism"
      style={{ backgroundImage: `url(${backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />

      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="text-5xl font-display text-gradient-gold drop-shadow-lg md:text-6xl lg:text-7xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg text-text-primary md:text-xl lg:text-2xl">
            {subtitle}
          </p>
        )}
        {ctaText && ctaHref && (
          <a
            href={ctaHref}
            className="mt-6 inline-block rounded-full bg-accent-gold px-6 py-3 text-sm font-medium text-text-inverse hover:bg-accent-gold-dim transition-colors"
          >
            {ctaText}
          </a>
        )}
      </motion.div>
    </section>
  );
}
