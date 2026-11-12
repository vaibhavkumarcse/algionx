import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, ShieldCheck, Truck, RefreshCw, ChevronRight, ChevronDown, Check, ArrowLeft, Sparkles, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { fallbackProducts } from '../data/fallbackProducts';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, formatPrice } = useCart();
  const { user, isAuthenticated, isWishlisted, toggleWishlist } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Olive');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Accordion toggles
  const [openAccordions, setOpenAccordions] = useState({
    materials: true,
    fit: false,
    shipping: false,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.getProductById(id);
        if (data) {
          setProduct(data);
          setActiveImage(data.image);
          if (data.sizes?.length) setSelectedSize(data.sizes[0]);
          if (data.colors?.length) setSelectedColor(data.colors[0]);
        }
      } catch (err) {
        // Fallback to local catalog by ID or by matching slug
        const found = fallbackProducts.find(
          (p) =>
            p._id.toString() === id.toString() ||
            p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === id.toLowerCase()
        );
        if (found) {
          setProduct(found);
          setActiveImage(found.image);
          if (found.sizes?.length) setSelectedSize(found.sizes[0]);
          if (found.colors?.length) setSelectedColor(found.colors[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-zinc-400">
        Loading atelier piece details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="text-2xl font-serif">Piece Not Found</h2>
        <p className="text-xs text-zinc-500">The requested silhouette may have been archived.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-semibold">
          Return to Atelier
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product._id);
  const images = product.images?.length ? product.images : [product.image];
  const relatedProducts = fallbackProducts
    .filter((p) => p._id !== product._id && (p.category === product.category || p.isFeatured))
    .slice(0, 4);

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to submit an atelier review.');
      return;
    }
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.createProductReview ? api.createProductReview(product._id, reviewRating, reviewComment) : null;
      // Optimistic update
      const newRev = {
        name: user.name,
        rating: reviewRating,
        comment: reviewComment,
        createdAt: new Date().toISOString(),
      };
      setProduct((prev) => ({
        ...prev,
        reviews: [newRev, ...(prev.reviews || [])],
        reviewsCount: (prev.reviewsCount || 0) + 1,
      }));
      setReviewComment('');
      alert('Your review has been published. Thank you!');
    } catch (err) {
      alert('Could not submit review: ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back to Shop & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 bg-white hover:border-black text-xs font-semibold text-zinc-800 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shop</span>
        </Link>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
          <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
          <Link to={`/shop?category=${product.category}`} className="hover:text-black transition-colors">{product.category}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
          <span className="text-zinc-800 font-medium truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
        </nav>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Image Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-[#F6F5F2] border border-zinc-200/60 flex items-center justify-center relative shadow-sm">
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-cover object-center transition-all duration-500"
            />
            {product.isEcoFriendly && (
              <span className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/90 text-zinc-900 shadow-sm backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Eco-Friendly Materials
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImage === img ? 'border-zinc-950 scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-8 sticky top-28">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
              <span className="uppercase tracking-widest">{product.category} · {product.season}</span>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-zinc-900 font-sans">{product.rating || 4.9}</span>
                <span className="text-zinc-400 font-sans">({product.reviewsCount || 24} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif text-zinc-950 font-normal leading-tight">
              {product.title}
            </h1>
            <p className="text-xs text-zinc-500 mt-1 font-light">
              {product.subtitle}
            </p>

            <div className="mt-4 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-zinc-950">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-base text-zinc-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                In Atelier Stock ({product.stock || 18} pieces)
              </span>
            </div>

            <p className="text-xs text-zinc-600 mt-5 leading-relaxed font-light">
              {product.description}
            </p>
          </div>

          {/* Selectors */}
          <div className="space-y-6 pt-4 border-t border-zinc-200">
            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-800 mb-2">
                  <span>Select Size: <strong className="font-bold text-black">{selectedSize}</strong></span>
                  <span className="text-zinc-400 font-normal underline cursor-pointer hover:text-black">Fit Guide</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        selectedSize === sz
                          ? 'bg-zinc-950 text-white shadow-md'
                          : 'bg-[#F6F5F2] text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <span className="block text-xs font-semibold text-zinc-800 mb-2">
                  Color Shade: <strong className="font-bold text-black">{selectedColor}</strong>
                </span>
                <div className="flex gap-2.5">
                  {product.colors.map((col) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selectedColor === col
                          ? 'border-zinc-950 bg-zinc-950 text-white'
                          : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-950'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Modifier */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-zinc-800">Quantity</span>
              <div className="flex items-center border border-zinc-300 bg-white rounded-full px-3 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-1 text-zinc-500 hover:text-black text-sm"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-zinc-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 20, quantity + 1))}
                  className="px-1 text-zinc-500 hover:text-black text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2.5 bg-[#0E0E10] hover:bg-black text-white py-4 rounded-full font-semibold text-xs tracking-wider uppercase transition-all shadow-xl hover:scale-[1.01]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{addedNotice ? 'Added to Bag!' : `Add to Bag · ${formatPrice(product.price * quantity)}`}</span>
                </button>

                <button
                  onClick={() => {
                    if (!isAuthenticated) return alert('Please sign in to save pieces.');
                    toggleWishlist(product._id);
                  }}
                  className="w-14 h-14 rounded-full border border-zinc-300 hover:border-zinc-950 flex items-center justify-center text-zinc-700 transition-colors shadow-2xs flex-shrink-0"
                  title="Save piece"
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Instant Buy Now Button */}
              <button
                onClick={() => {
                  addToCart(product, quantity, selectedSize, selectedColor);
                  navigate('/checkout');
                }}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-full font-semibold text-xs tracking-wider uppercase transition-all shadow-md hover:scale-[1.005]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Buy Now with Razorpay</span>
              </button>
            </div>

            {/* Razorpay Guaranteed Badge */}
            <div className="p-3.5 bg-[#F6F5F2] rounded-2xl border border-zinc-200/80 flex items-center gap-3 text-xs text-zinc-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-zinc-900">Protected by Razorpay Payment Gateway</p>
                <p className="text-[11px] text-zinc-500">256-bit SSL encrypted · Cards, UPI, NetBanking supported</p>
              </div>
            </div>
          </div>

          {/* Accordions */}
          <div className="border-t border-zinc-200 divide-y divide-zinc-200 text-xs">
            {/* Composition */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion('materials')}
                className="w-full flex items-center justify-between font-semibold text-zinc-900 text-left"
              >
                <span>Ecological Composition & Craft</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openAccordions.materials ? 'rotate-180' : ''}`} />
              </button>
              {openAccordions.materials && (
                <div className="mt-3 text-zinc-600 leading-relaxed space-y-1 font-light">
                  <p>• 70% GOTS-Certified Organic Mulberry Silk, 30% Regenerative Egyptian Cotton.</p>
                  <p>• Colored with non-toxic closed-loop vegetable pigments.</p>
                  <p>• Hand-finished in our northern Italy artisan cooperative.</p>
                </div>
              )}
            </div>

            {/* Fit & Measurements */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion('fit')}
                className="w-full flex items-center justify-between font-semibold text-zinc-900 text-left"
              >
                <span>Size & Silhouette Profile</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openAccordions.fit ? 'rotate-180' : ''}`} />
              </button>
              {openAccordions.fit && (
                <div className="mt-3 text-zinc-600 leading-relaxed space-y-1 font-light">
                  <p>• Engineered for a relaxed, fluid drape.</p>
                  <p>• Male model is 6'1" (185 cm) wearing size L.</p>
                  <p>• We recommend taking your usual size for the editorial silhouette.</p>
                </div>
              )}
            </div>

            {/* Logistics */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full flex items-center justify-between font-semibold text-zinc-900 text-left"
              >
                <span>Complimentary Delivery & Returns</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openAccordions.shipping ? 'rotate-180' : ''}`} />
              </button>
              {openAccordions.shipping && (
                <div className="mt-3 text-zinc-600 leading-relaxed space-y-1 font-light">
                  <p>• Free express delivery across India on orders over ₹5,000.</p>
                  <p>• Carbon-neutral air express: 2–4 business days delivery.</p>
                  <p>• 30-day complimentary returns with doorstep collection.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mt-20 pt-16 border-t border-zinc-200">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Client Testimonials
              </span>
              <h3 className="text-2xl font-serif text-zinc-950 font-normal">
                Atelier Reviews ({product.reviews?.length || product.reviewsCount || 24})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-zinc-900">{product.rating || 4.9} out of 5.0</span>
            </div>
          </div>

          {/* Submit Review Box */}
          <div className="bg-[#F6F5F2] p-6 rounded-3xl border border-zinc-200/80 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Share Your Experience with this Piece
            </h4>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-zinc-600">Your Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setReviewRating(num)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          num <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Comment on the tailoring, silk texture, fit, or styling..."
                className="w-full p-3 rounded-2xl border border-zinc-300 text-xs bg-white focus:outline-none focus:border-black"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 rounded-full bg-zinc-950 text-white font-semibold text-xs hover:bg-black transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>

          {/* List of Reviews */}
          <div className="space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#FCFCFA] border border-zinc-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-900">{rev.name}</span>
                    <span className="text-[11px] text-zinc-400">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Verified Buyer'}
                    </span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-600 font-light leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#FCFCFA] border border-zinc-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-900">Julian Vance (Paris)</span>
                    <span className="text-[11px] text-zinc-400">Verified Buyer</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-600 font-light leading-relaxed">
                    Exceptional craftsmanship. The natural silk drape feels weightless in summer warmth, and the horn buttons add an unmistakable bespoke nuance.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FCFCFA] border border-zinc-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-900">Camille Laurent (Milano)</span>
                    <span className="text-[11px] text-zinc-400">Verified Buyer</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-600 font-light leading-relaxed">
                    The packaging was plastic-free yet felt exquisitely luxurious. Razorpay checkout was instant. Will be ordering the corduroy overshirt next.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Complete The Look / Related Products Carousel */}
      <section className="mt-20 pt-16 border-t border-zinc-200">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 block mb-1">
              Atelier Pairing
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-zinc-950 font-normal">
              You May Also Admire
            </h3>
          </div>
          <Link to="/shop" className="text-xs font-semibold text-zinc-900 underline underline-offset-4">
            View All Pieces →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

