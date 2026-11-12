import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreativePeopleBanner() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-[480px] sm:h-[540px] overflow-hidden bg-zinc-950 text-white my-12">
      {/* Background Cinematic Editorial Model */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=2000&q=85"
          alt="Creative People Editorial"
          className="w-full h-full object-cover object-top filter brightness-90 contrast-[1.05]"
        />
        {/* Editorial Blur & Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30"></div>
        <div className="absolute inset-0 backdrop-blur-[1px]"></div>
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col justify-end pb-16 sm:pb-20 items-center text-center">
        {/* Floating Creative Members Badge */}
        <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-6 shadow-xl animate-fade-in">
          <div className="flex -space-x-2">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              alt="Member 1"
              className="w-6 h-6 rounded-full border border-white object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
              alt="Member 2"
              className="w-6 h-6 rounded-full border border-white object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
              alt="Member 3"
              className="w-6 h-6 rounded-full border border-white object-cover"
            />
          </div>
          <span className="text-xs font-medium text-white tracking-wide">
            +12,400 creative pioneers wearing ALGIONX
          </span>
        </div>

        {/* Main Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium text-white tracking-tight max-w-2xl mb-8 leading-tight">
          The choice of <span className="italic font-light">creative</span> people
        </h2>

        {/* Action Button */}
        <div>
          <button
            onClick={() => navigate('/shop')}
            className="group inline-flex items-center gap-3 bg-white text-zinc-950 hover:bg-zinc-100 px-8 py-3.5 rounded-full font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-xl hover:scale-105"
          >
            <span>Explore Now</span>
            <span className="w-6 h-6 rounded-full bg-zinc-950 text-white flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

