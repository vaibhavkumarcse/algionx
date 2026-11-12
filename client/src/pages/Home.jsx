import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import BentoGrid from '../components/BentoGrid';
import FuturisticSection from '../components/FuturisticSection';
import BrandPartners from '../components/BrandPartners';
import CreativePeopleBanner from '../components/CreativePeopleBanner';
import { api } from '../services/api';
import { fallbackProducts } from '../data/fallbackProducts';

export default function Home() {
  const [products, setProducts] = useState(fallbackProducts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const data = await api.getProducts({ category: selectedCategory });
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      } catch (err) {
        console.warn('Using client fallback products:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen">
      {/* 1. Cinematic Hero matching editorial design */}
      <Hero />

      {/* 2. Signature Bento Grid Product Collage matching screenshot */}
      <BentoGrid
        products={products}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 3. Futuristic Designs Inspired by Technology */}
      <FuturisticSection />

      {/* 4. Brand Partners (ZARA, ADIDAS, BALENCIAGA, PRADA) */}
      <BrandPartners />

      {/* 5. The Choice of Creative People Editorial Showcase */}
      <CreativePeopleBanner />
    </div>
  );
}
