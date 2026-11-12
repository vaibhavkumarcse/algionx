import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const brands = [
  {
    name: 'ZARA',
    since: 'Since 1975',
    category: 'Contemporary Streetwear',
    link: '/shop?search=zara',
    font: 'font-serif tracking-widest text-2xl font-bold',
  },
  {
    name: 'adidas',
    since: 'Since 1949',
    category: 'Performance Footwear',
    link: '/shop?category=Footwear',
    font: 'font-sans tracking-tight text-2xl font-black lowercase',
  },
  {
    name: 'BALENCIAGA',
    since: 'Since 1917',
    category: 'Haute Couture Avant-Garde',
    link: '/shop?category=Men',
    font: 'font-sans tracking-[0.25em] text-lg font-bold',
  },
  {
    name: 'PRADA',
    since: 'Since 1913',
    category: 'Milano Luxury Leathergoods',
    link: '/shop?category=Bags',
    font: 'font-serif tracking-[0.2em] text-xl font-bold',
  },
];

export default function BrandPartners() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-zinc-200/60">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 block mb-1">
            Next Generation
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif text-zinc-950 font-normal">
            We work with known brands
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-sm">
          Collaborative capsules co-engineered with world-renowned heritage houses.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {brands.map((brand) => (
          <Link
            key={brand.name}
            to={brand.link}
            className="group relative bg-[#F6F5F2] hover:bg-white rounded-3xl p-8 flex flex-col justify-between h-48 border border-zinc-200/70 hover:border-zinc-400 transition-all shadow-xs hover:shadow-md"
          >
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>{brand.since}</span>
              <span className="w-7 h-7 rounded-full bg-zinc-200/60 text-zinc-700 flex items-center justify-center group-hover:bg-zinc-950 group-hover:text-white transition-all">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="my-auto py-2">
              <span className={`${brand.font} text-zinc-900 group-hover:text-black block`}>
                {brand.name}
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block font-sans">
                {brand.category}
              </span>
            </div>

            <div className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors flex items-center gap-1">
              <span>View Brand</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

