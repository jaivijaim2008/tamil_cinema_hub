import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  title: string;
  subtitle: string;
  backgroundUrl: string; // relative path in public folder
  ctaText: string;
  ctaHref: string;
}

export default function HeroBanner({ title, subtitle, backgroundUrl, ctaText, ctaHref }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-bg-primary border border-border mb-12 min-h-[400px]">
      {/* Background image with gradient overlay */}
      <Image
        src={backgroundUrl}
        alt="Hero background"
        fill
        priority
        className="object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-text-inverse mb-4 drop-shadow-md">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-text-inverse/90 mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 bg-accent-gold text-text-inverse px-6 py-3 rounded-xl text-sm font-medium hover:bg-accent-gold-dim transition-colors"
        >
          {ctaText}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
