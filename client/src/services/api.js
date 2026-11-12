const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('kosis_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async sendOTP(email) {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
    return data;
  },

  async verifyOTP(email, otp) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'OTP verification failed');
    return data;
  },

  async googleAuth(credential, profile) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, profile }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Google Auth failed');
    return data;
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
  },

  async toggleWishlist(productId) {
    const res = await fetch(`${API_BASE}/auth/wishlist/${productId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update wishlist');
    return data;
  },

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.sort && params.sort !== 'featured') query.append('sort', params.sort);
    if (params.season) query.append('season', params.season);
    if (params.ecoOnly) query.append('ecoOnly', 'true');
    if (params.minPrice !== undefined && params.minPrice > 0) query.append('minPrice', params.minPrice);
    if (params.maxPrice !== undefined && params.maxPrice < 100000) query.append('maxPrice', params.maxPrice);
    if (params.sizes?.length) query.append('size', params.sizes.join(','));
    if (params.colors?.length) query.append('color', params.colors.join(','));
    if (params.brands?.length) query.append('brand', params.brands.join(','));
    if (params.rating) query.append('rating', params.rating);
    if (params.inStock !== undefined) query.append('inStock', params.inStock);
    if (params.page && params.page > 1) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
    return data;
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Product not found');
    return data;
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create product');
    return data;
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update product');
    return data;
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete product');
    return data;
  },

  // Orders
  async createOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create order');
    return data;
  },

  async getOrderById(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch order');
    return data;
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE}/orders/myorders`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user orders');
    return data;
  },

  async getAllOrders() {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch all orders');
    return data;
  },

  async updateOrderToDelivered(id) {
    const res = await fetch(`${API_BASE}/orders/${id}/deliver`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update delivery');
    return data;
  },

  // Payment (Razorpay)
  async getPaymentConfig() {
    const res = await fetch(`${API_BASE}/payment/config`);
    return await res.json();
  },

  async createPaymentOrder(amount, currency = 'INR', receipt) {
    const res = await fetch(`${API_BASE}/payment/create-order`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, currency, receipt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create payment order');
    return data;
  },

  async verifyPayment(paymentPayload) {
    const res = await fetch(`${API_BASE}/payment/verify-payment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentPayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Payment verification failed');
    return data;
  },

  // System
  async getSystemStatus() {
    try {
      const res = await fetch(`${API_BASE}/system/status`);
      return await res.json();
    } catch {
      return null;
    }
  }
};

