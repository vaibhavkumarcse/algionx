import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    titlePre: 'Discover',
    titleItalic: 'exclusive fashion',
    titlePost: 'collections',
    subtitle: 'Fall / Winter 2024 Atelier · Handcrafted from organic silk & certified recycled fibers',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=2000&q=85',
    ctaText: 'Start shopping',
    link: '/shop',
  },
  {
    titlePre: 'Refined',
    titleItalic: 'minimalist luxury',
    titlePost: 'silhouettes',
    subtitle: 'Sustainable tailoring engineered for modern urban transit and enduring elegance',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85',
    ctaText: 'Explore Atelier',
    link: '/shop?category=Women',
  },
];

export default function Hero() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="relative w-full h-[580px] sm:h-[640px] lg:h-[720px] overflow-hidden bg-zinc-950 text-white">
      {/* Background Image with Cinematic Gradient */}
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
        <img
          src={slide.image}
          alt="Editorial Fashion"
          className="w-full h-full object-cover object-center filter brightness-90 contrast-[1.05] transform scale-100 transition-transform duration-10000"
        />
        {/* Soft vignette and luxury editorial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col justify-end pb-16 sm:pb-20">
        <div className="max-w-2xl space-y-6 animate-slide-up">
          {/* Main Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans tracking-tight font-medium text-white leading-[1.08]">
            {slide.titlePre}{' '}
            <span className="font-serif italic font-normal tracking-normal text-zinc-100">
              {slide.titleItalic}
            </span>{' '}
            <br className="hidden sm:inline" />
            {slide.titlePost}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-zinc-300 font-light tracking-wide max-w-lg leading-relaxed">
            {slide.subtitle}
          </p>

          {/* Action Button */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => navigate(slide.link)}
              className="group inline-flex items-center gap-3 bg-white text-zinc-950 hover:bg-zinc-100 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02]"
            >
              <span>{slide.ctaText}</span>
              <span className="w-7 h-7 rounded-full bg-zinc-950 text-white flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>

        {/* Slide Progress / Timeline Bar at Bottom */}
        <div className="mt-12 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-white/70">
          <div className="flex items-center space-x-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  currentSlide === idx ? 'w-12 bg-white' : 'w-4 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-4 text-[11px] tracking-widest uppercase font-mono">
            <span>0{currentSlide + 1}</span>
            <span className="opacity-40">/</span>
            <span className="opacity-40">0{slides.length}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

