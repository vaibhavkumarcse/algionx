import Product from '../models/Product.js';
import { sampleProducts } from '../data/seedProducts.js';
import { getDBStatus } from '../config/db.js';

// In-memory fallback products initialized with the editorial catalog
export let inMemoryProducts = JSON.parse(JSON.stringify(sampleProducts));

/**
 * @desc    Fetch all products with filtering, search, and sorting
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res) => {
  try {
    const {
      category, search, sort, season, ecoOnly,
      minPrice, maxPrice, size, color, brand, rating,
      inStock, page = 1, limit = 24
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 24);
    const skip = (pageNum - 1) * limitNum;

    const { connected } = getDBStatus();

    if (connected) {
      let query = {};

      if (category && category !== 'All') query.category = { $regex: new RegExp(`^${category}$`, 'i') };
      if (season && season !== 'All') query.season = { $regex: new RegExp(season, 'i') };
      if (ecoOnly === 'true') query.isEcoFriendly = true;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      if (size) {
        const sizes = size.split(',').map(s => s.trim()).filter(Boolean);
        if (sizes.length) query.sizes = { $in: sizes };
      }
      if (color) {
        const colors = color.split(',').map(c => c.trim()).filter(Boolean);
        if (colors.length) query.colors = { $in: colors };
      }
      if (brand) {
        const brands = brand.split(',').map(b => b.trim()).filter(Boolean);
        if (brands.length) query.brand = { $in: brands };
      }
      if (rating) query.rating = { $gte: Number(rating) };
      if (inStock === 'true') query.stock = { $gt: 0 };
      if (inStock === 'false') query.stock = { $lte: 0 };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { subtitle: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      let sortOptions = { isFeatured: -1, createdAt: -1 };
      if (sort === 'price-low') sortOptions = { price: 1 };
      else if (sort === 'price-high') sortOptions = { price: -1 };
      else if (sort === 'rating') sortOptions = { rating: -1 };
      else if (sort === 'newest') sortOptions = { createdAt: -1 };
      else if (sort === 'best-selling') sortOptions = { reviewsCount: -1 };

      const total = await Product.countDocuments(query);
      const products = await Product.find(query).sort(sortOptions).skip(skip).limit(limitNum);
      return res.json({ products, total, page: pageNum, pages: Math.ceil(total / limitNum) });

    } else {
      // ---- In-memory filter ----
      let filtered = [...inMemoryProducts];

      if (category && category !== 'All') {
        filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (season && season !== 'All') {
        filtered = filtered.filter(p => p.season?.toLowerCase().includes(season.toLowerCase()));
      }
      if (ecoOnly === 'true') filtered = filtered.filter(p => p.isEcoFriendly);

      if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
      if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));

      if (size) {
        const sizes = size.split(',').map(s => s.trim()).filter(Boolean);
        if (sizes.length) filtered = filtered.filter(p => p.sizes?.some(s => sizes.includes(s)));
      }
      if (color) {
        const colors = color.split(',').map(c => c.trim()).filter(Boolean);
        if (colors.length) filtered = filtered.filter(p => p.colors?.some(c => colors.includes(c)));
      }
      if (brand) {
        const brands = brand.split(',').map(b => b.trim()).filter(Boolean);
        if (brands.length) filtered = filtered.filter(p => brands.includes(p.brand));
      }
      if (rating) filtered = filtered.filter(p => (p.rating || 0) >= Number(rating));
      if (inStock === 'true') filtered = filtered.filter(p => (p.stock || 0) > 0);
      if (inStock === 'false') filtered = filtered.filter(p => (p.stock || 0) <= 0);

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s) ||
          p.subtitle?.toLowerCase().includes(s) ||
          p.brand?.toLowerCase().includes(s) ||
          p.tags?.some(t => t.toLowerCase().includes(s))
        );
      }

      if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
      else if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
      else if (sort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      else if (sort === 'newest') filtered.sort((a, b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
      else if (sort === 'best-selling') filtered.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
      else filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limitNum);
      return res.json({ products: paginated, total, page: pageNum, pages: Math.ceil(total / limitNum) });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message || 'Error fetching products' });
  }
};

/**
 * @desc    Fetch single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res) => {
  try {
    const { connected } = getDBStatus();

    if (connected) {
      const product = await Product.findById(req.params.id);
      if (product) {
        return res.json(product);
      }
      return res.status(404).json({ message: 'Product not found' });
    } else {
      const product = inMemoryProducts.find((p) => p._id.toString() === req.params.id.toString());
      if (product) {
        return res.json(product);
      }
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const { connected } = getDBStatus();

    if (connected) {
      const created = await Product.create(productData);
      return res.status(201).json(created);
    } else {
      const newProduct = {
        _id: 'prd_' + Date.now().toString(),
        ...productData,
        rating: 5.0,
        reviewsCount: 0,
        createdAt: new Date(),
      };
      inMemoryProducts.unshift(newProduct);
      return res.status(201).json(newProduct);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res) => {
  try {
    const { connected } = getDBStatus();

    if (connected) {
      const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (updated) return res.json(updated);
      return res.status(404).json({ message: 'Product not found' });
    } else {
      const idx = inMemoryProducts.findIndex((p) => p._id.toString() === req.params.id.toString());
      if (idx !== -1) {
        inMemoryProducts[idx] = { ...inMemoryProducts[idx], ...req.body };
        return res.json(inMemoryProducts[idx]);
      }
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res) => {
  try {
    const { connected } = getDBStatus();

    if (connected) {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (product) return res.json({ message: 'Product removed' });
      return res.status(404).json({ message: 'Product not found' });
    } else {
      const idx = inMemoryProducts.findIndex((p) => p._id.toString() === req.params.id.toString());
      if (idx !== -1) {
        inMemoryProducts.splice(idx, 1);
        return res.json({ message: 'Product removed' });
      }
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create new product review
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { connected } = getDBStatus();

    if (connected) {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.reviewsCount = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      return res.status(201).json({ message: 'Review added', product });
    } else {
      const product = inMemoryProducts.find((p) => p._id.toString() === req.params.id.toString());
      if (!product) return res.status(404).json({ message: 'Product not found' });

      product.reviews = product.reviews || [];
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
        createdAt: new Date(),
      };

      product.reviews.push(review);
      product.reviewsCount = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      return res.status(201).json({ message: 'Review added', product });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

