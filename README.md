# KOSIS | Luxury Fashion Editorial E-Commerce Platform (MERN Stack)

A high-fashion, editorial e-commerce platform built with the **MERN Stack** (MongoDB, Express, React, Node.js), featuring a bespoke aesthetic modeled after luxury fashion houses, **Google Sign-In / Authentication**, and **Razorpay Payment Gateway** integration.

---

## 🌟 Key Highlights & Design Matching

- **Editorial Luxury UI/UX**:
  - **Cinematic Hero**: Warm editorial visual with typography pairing (*Cormorant Garamond* serif & *Plus Jakarta Sans*) with interactive slide timeline indicator.
  - **Asymmetric Bento Grid Collage**: Signature collage matching the design reference, featuring cutout product cards, tall lifestyle model portraits spanning multiple rows, wishlist hearts, eco-friendly badges, and quick-add actions.
  - **Futuristic Designs Inspired by Technology**: 3-panel showcase including the cobalt track jacket editorial, midnight capsule card with floral motif, and seasonal lookbook teaser.
  - **Heritage Brand Partners**: Collaborations with Zara, Adidas, Balenciaga, and Prada.
  - **"The Choice of Creative People" Showcase**: Atmospheric visual banner featuring avatar community badges and luxury ivory tailoring.
- **Google Sign-In & Authentication**:
  - Official Google Identity Services integration with ID Token verification using `google-auth-library`.
  - Seamless "Continue with Google" button with automatic profile extraction (name, email, avatar).
  - One-click **Demo Google Login** for instant evaluation without requiring Google Cloud API keys.
  - Standard email/password registration with password hashing (`bcryptjs`) & JWT session management.
  - Pre-seeded Demo Accounts for instant testing:
    - **Customer**: `user@kosis.luxury` (password: `password123`)
    - **Admin**: `admin@kosis.luxury` (password: `password123`)
- **Razorpay Payment Gateway**:
  - Integrated official Razorpay Checkout SDK (`checkout.razorpay.com/v1/checkout.js`).
  - Secure backend order creation (`/api/payment/create-order`).
  - SHA-256 HMAC cryptographic signature verification (`/api/payment/verify-payment`).
  - Built-in **Sandbox / Test Simulator Mode** allowing immediate testing of the full checkout flow even before setting up live Razorpay keys.
- **Complete Shopping Experience**:
  - Slide-over Bag / Cart drawer with a real-time **Free Shipping Progress Bar** (threshold: $150).
  - Quick View Modal with multi-angle image gallery, size selector (S, M, L, XL), color swatches, stock availability, and eco-friendly composition breakdown.
  - Interactive Wishlist Drawer with one-click "Move to Bag".
  - Instant live keyword search modal with trending searches.
  - Multi-step checkout with delivery address capture.
  - Post-purchase Order Confirmation page with order tracking status and Razorpay payment reference ID.
  - User Order History page (`/orders`).
  - Full-featured **Admin Control Console** (`/admin`) to manage products, view customer orders, and update delivery statuses.

---

## 🚀 Quick Start Guide

### 1. Access the Running Application
The platform is currently running live at:
👉 **[http://localhost:5000](http://localhost:5000)**

### 2. Available Scripts (From Project Root)
```bash
# Run the complete application (Backend API + Built React Client on port 5000)
npm run server

# Run React frontend in Vite Hot-Reload dev mode (on port 5173 with API proxy)
npm run client

# Re-build client for production
npm --prefix client run build
```

---

## ⚙️ Environment Configuration (`server/.env`)

Configure your keys in `server/.env` to connect live credentials:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | API server listening port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/kosis_ecommerce` |
| `JWT_SECRET` | Secret key for JWT session tokens | `kosis_luxury_super_secret_jwt_key_2026_fashion` |
| `GOOGLE_CLIENT_ID` | Google OAuth Web Client ID | `your-id.apps.googleusercontent.com` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_test_YourTestKeyHere` |
| `RAZORPAY_KEY_SECRET`| Razorpay Key Secret | `YourTestKeySecretHere` |
| `RAZORPAY_CURRENCY` | Transaction currency | `INR` |

> **Note on MongoDB**: If a local or remote MongoDB instance is not currently running, the server automatically boots into **High-Performance In-Memory Store Mode** so you can test all features (browsing, authentication, cart, checkout, admin, orders) out of the box with zero setup hurdles!

---

## 📁 Project Architecture

```
d:\ALGIONX\
├── client\                  # React 18 + Vite + Tailwind CSS
│   ├── src\
│   │   ├── components\      # Navbar, Hero, BentoGrid, ProductCard, CartDrawer, etc.
│   │   ├── context\         # AuthContext, CartContext
│   │   ├── pages\           # Home, Shop, SignIn, SignUp, Checkout, OrderSuccess, Orders, Admin
│   │   ├── services\        # api.js (Fetch client for all endpoints)
│   │   ├── data\            # fallbackProducts.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server\                  # Express.js + Mongoose + Razorpay
│   ├── config\              # db.js (MongoDB / in-memory hybrid), razorpay.js
│   ├── controllers\         # authController, productController, orderController, paymentController
│   ├── models\              # User.js, Product.js, Order.js
│   ├── routes\              # authRoutes, productRoutes, orderRoutes, paymentRoutes
│   ├── data\                # seedProducts.js (Editorial fashion catalog)
│   ├── server.js            # Express server & API routes
│   └── package.json
└── README.md
```

