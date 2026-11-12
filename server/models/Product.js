import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: 'Eco-friendly material',
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ['Men', 'Women', 'Kids', 'Accessories', 'Collections', 'Footwear', 'Bags'],
      default: 'Men',
    },
    season: {
      type: String,
      default: '2024 Collections',
    },
    image: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    isEcoFriendly: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isHeroBento: {
      type: Boolean,
      default: false,
    },
    bentoSpan: {
      type: String,
      default: 'col-span-1 row-span-1', // e.g. 'col-span-1 row-span-2' for tall model portraits
    },
    stock: {
      type: Number,
      required: true,
      default: 15,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewsCount: {
      type: Number,
      default: 12,
    },
    reviews: [reviewSchema],
    sizes: {
      type: [String],
      default: ['S', 'M', 'L', 'XL'],
    },
    colors: {
      type: [String],
      default: ['Olive', 'Sand', 'Noir'],
    },
    tags: {
      type: [String],
      default: ['silk', 'eco', 'sustainable', 'new'],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;

