import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FuturisticSection() {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-zinc-200/60">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          City & Future
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif text-zinc-950 font-normal">
          Futuristic designs inspired by technology
        </h2>
      </div>

      {/* 3 Panels Collage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Panel 1: Electric Cobalt Track Jacket Editorial */}
        <div
          onClick={() => navigate('/shop?category=Men')}
          className="group relative rounded-3xl overflow-hidden bg-zinc-900 cursor-pointer h-[460px] shadow-sm hover:shadow-xl transition-all"
        >
          <img
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80"
            alt="Cobalt Neo Track"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          <div className="absolute top-6 left-6">
            <span className="text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full bg-white/90 text-zinc-900 backdrop-blur-sm">
              Cobalt Atelier
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
            <div>
              <p className="text-xs text-zinc-300">Technical Articulation</p>
              <h3 className="text-xl font-serif font-medium">Cobalt Neo Shell</h3>
            </div>
            <span className="w-10 h-10 rounded-full bg-white text-zinc-950 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300 shadow-md">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Panel 2: Midnight Nostalgic Women Card */}
        <div
          onClick={() => navigate('/shop?category=Women')}
          className="group relative rounded-3xl bg-[#0F1015] text-white p-8 flex flex-col justify-between cursor-pointer border border-zinc-800 hover:border-zinc-700 shadow-sm hover:shadow-xl transition-all h-[460px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-zinc-400">
              Autumn Capsule
            </span>
            <div className="flex -space-x-1">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            </div>
          </div>

          {/* Central Stylized Motif & Headline */}
          <div className="space-y-4 my-auto py-6">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-orange-400 shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>

            <h3 className="text-3xl sm:text-4xl font-serif font-medium leading-snug">
              Our <span className="italic text-zinc-300">nostalgic</span> women collection
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs font-light">
              Echoes of late-90s minimalism fused with contemporary biometric fabric sculpting.
            </p>
          </div>

          {/* Bottom Button */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide text-zinc-300 group-hover:text-white">
              Explore Capsule
            </span>
            <span className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Panel 3: Lookbook Editorial Card */}
        <div
          onClick={() => navigate('/shop?season=2024')}
          className="group relative rounded-3xl bg-[#F6F5F2] hover:bg-[#EFECE6] p-8 flex flex-col justify-between cursor-pointer border border-zinc-200 shadow-sm hover:shadow-xl transition-all h-[460px]"
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="tracking-widest uppercase font-mono text-[10px]">Lookbook 04</span>
            <span>June 2024 - Jan 2025</span>
          </div>

          <div className="text-center my-auto space-y-4">
            <span className="text-4xl sm:text-5xl font-serif italic text-zinc-900 block font-normal">
              New Seasons
            </span>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              Curated styling looks captured on 35mm film across Milan, Tokyo, and Copenhagen.
            </p>
            <div className="pt-2">
              <span className="inline-block px-4 py-2 rounded-full bg-zinc-950 text-white text-xs font-semibold group-hover:scale-105 transition-transform">
                Read Lookbook ↗
              </span>
            </div>
          </div>

          <div className="text-center text-[11px] text-zinc-400 tracking-wider uppercase">
            Limited Print Available
          </div>
        </div>
      </div>
    </section>
  );
}

