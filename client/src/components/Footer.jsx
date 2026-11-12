import React, { useState } from 'react';
import { ArrowUpRight, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#0E0E10] text-[#FCFCFA] pt-20 pb-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Manifesto Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-16 border-b border-zinc-800/80 items-center">
          <div className="space-y-4">
            <span className="font-serif tracking-widest text-3xl sm:text-4xl font-bold uppercase text-white block">
              ALGIONX
            </span>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-md font-light leading-relaxed">
              An atelier dedicated to modern luxury streetwear crafted exclusively from certified organic silk, regenerative cotton, and recycled technical polymers.
            </p>
          </div>

          <div className="bg-zinc-900/80 p-6 sm:p-8 rounded-3xl border border-zinc-800">
            <h4 className="text-base font-medium text-white mb-1">
              Private Preview Access
            </h4>
            <p className="text-xs text-zinc-400 mb-4">
              Subscribe to receive private preview invitations, lookbooks, and 15% off your initial order.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium py-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>You have been added to our private atelier registry. Welcome.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full bg-zinc-950/80 border border-zinc-700/80 rounded-full pl-10 pr-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-all shadow-md flex-shrink-0"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Links Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 text-xs text-zinc-400 border-b border-zinc-800/80">
          <div className="space-y-3">
            <h5 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Collections
            </h5>
            <ul className="space-y-2">
              <li><Link to="/shop?category=Men" className="hover:text-white transition-colors">Men's Wardrobe</Link></li>
              <li><Link to="/shop?category=Women" className="hover:text-white transition-colors">Women's Atelier</Link></li>
              <li><Link to="/shop?category=Kids" className="hover:text-white transition-colors">Kids Capsule</Link></li>
              <li><Link to="/shop?category=Footwear" className="hover:text-white transition-colors">Sustainable Footwear</Link></li>
              <li><Link to="/shop?category=Bags" className="hover:text-white transition-colors">Leathergoods & Totes</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Flagship Boutiques
            </h5>
            <ul className="space-y-2">
              <li>Paris — 14 Rue du Faubourg Saint-Honoré</li>
              <li>London — 28 Bond Street, Mayfair</li>
              <li>New York — 92 Mercer Street, SoHo</li>
              <li>Tokyo — 6 Chome Ginza, Chuo City</li>
              <li>Milan — Via Montenapoleone 12</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Client Care
            </h5>
            <ul className="space-y-2">
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Consignment</Link></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Complimentary Global Returns</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Garment Care & Longevity</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Bespoke Atelier Appointments</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Razorpay Payment Security</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Sustainability
            </h5>
            <ul className="space-y-2">
              <li><span className="hover:text-white transition-colors cursor-pointer">100% Organic Silk & Cotton</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Zero Plastic Biodegradable Packaging</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Carbon Offset Logistics</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Ethical Artisan Cooperatives</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Payment Badges & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Razorpay Payment Gateway Verified · 256-Bit SSL Encryption</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px]">RAZORPAY</span>
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px]">UPI / GPAY</span>
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px]">VISA / MC</span>
          </div>

          <div>
            © {new Date().getFullYear()} ALGIONX Luxury Platform. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

