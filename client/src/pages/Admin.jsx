import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, ShieldCheck, CheckCircle2, PackageCheck, AlertCircle, RefreshCw, Database, DollarSign, Users } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fallbackProducts } from '../data/fallbackProducts';

export default function Admin() {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState(fallbackProducts);
  const [orders, setOrders] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // New product form state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    subtitle: 'Eco-friendly material',
    description: '',
    price: 120,
    originalPrice: 150,
    category: 'Men',
    season: '2024 Collections',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    stock: 20,
    isEcoFriendly: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodData, orderData, sysData] = await Promise.all([
        api.getProducts(),
        api.getAllOrders().catch(() => []),
        api.getSystemStatus(),
      ]);

      if (prodData.products) setProducts(prodData.products);
      if (orderData) setOrders(orderData);
      if (sysData) setSystemStatus(sysData);
    } catch (err) {
      console.warn('Admin load note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createProduct(newProduct);
      setProducts([created, ...products]);
      setIsAddingProduct(false);
      setNewProduct({
        title: '',
        subtitle: 'Eco-friendly material',
        description: '',
        price: 120,
        originalPrice: 150,
        category: 'Men',
        season: '2024 Collections',
        image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
        stock: 20,
        isEcoFriendly: true,
      });
    } catch (err) {
      alert('Error creating product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to remove this piece from the catalog?')) {
      try {
        await api.deleteProduct(id);
        setProducts(products.filter((p) => p._id !== id));
      } catch (err) {
        alert('Error removing product: ' + err.message);
      }
    }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      const updated = await api.updateOrderToDelivered(orderId);
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, isDelivered: true, status: 'Delivered' } : o)));
    } catch (err) {
      alert('Error updating delivery status: ' + err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-zinc-400 mx-auto" />
        <h2 className="text-2xl font-serif">Admin Privileges Required</h2>
        <p className="text-xs text-zinc-500">
          This atelier control console requires administrative authorization. Please sign in as an admin (e.g. <code>admin@algionx.luxury</code>).
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Control Console
          </span>
          <h1 className="text-3xl font-serif text-zinc-950 font-normal">
            Atelier Management Dashboard
          </h1>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-[#F6F5F2] p-1.5 rounded-full border border-zinc-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'products' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-black'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'orders' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-black'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'system' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-black'
            }`}
          >
            Diagnostics
          </button>
        </div>
      </div>

      {/* Tab 1: Products */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif text-zinc-900">Catalogue Management</h2>
            <button
              onClick={() => setIsAddingProduct(!isAddingProduct)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-black transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingProduct ? 'Cancel' : 'Add New Piece'}</span>
            </button>
          </div>

          {/* Add Product Modal Form */}
          {isAddingProduct && (
            <form onSubmit={handleCreateProduct} className="bg-[#F6F5F2] p-6 sm:p-8 rounded-3xl border border-zinc-200 space-y-4 animate-slide-up">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-2">
                New Atelier Product Specification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    placeholder="e.g. Silk Drape Trench"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subtitle / Material</label>
                  <input
                    type="text"
                    value={newProduct.subtitle}
                    onChange={(e) => setNewProduct({ ...newProduct, subtitle: e.target.value })}
                    placeholder="e.g. 100% Organic Silk Blend"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 bg-white"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Bags">Bags</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Price (USD)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Original Price (Strike)</label>
                  <input
                    type="number"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Season</label>
                  <input
                    type="text"
                    value={newProduct.season}
                    onChange={(e) => setNewProduct({ ...newProduct, season: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 bg-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    required
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Tailoring notes, fabric blend, fit..."
                    className="w-full p-2.5 rounded-xl border border-zinc-300 bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-5 py-2 rounded-full border border-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-black"
                >
                  Save Piece
                </button>
              </div>
            </form>
          )}

          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-3xl border border-zinc-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F5F2] text-zinc-500 uppercase tracking-wider text-[10px] border-b border-zinc-200">
                <tr>
                  <th className="p-4">Piece</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Eco</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.image} alt={p.title} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <span className="font-semibold text-zinc-900 block">{p.title}</span>
                        <span className="text-[11px] text-zinc-400">{p.subtitle}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-zinc-700">{p.category}</td>
                    <td className="p-4 font-bold text-zinc-950">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="p-4">{p.stock} units</td>
                    <td className="p-4">
                      {p.isEcoFriendly ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          Yes
                        </span>
                      ) : 'No'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        className="p-2 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-lg font-serif text-zinc-900">Customer Orders & Razorpay Verifications</h2>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-[#F6F5F2] rounded-3xl border border-zinc-200 text-xs text-zinc-500">
              No orders registered in the system yet.
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-3xl border border-zinc-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F5F2] text-zinc-500 uppercase tracking-wider text-[10px] border-b border-zinc-200">
                  <tr>
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Recipient</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Razorpay Status</th>
                    <th className="p-4">Delivery</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {orders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-zinc-900">#{ord._id.slice(-6).toUpperCase()}</td>
                      <td className="p-4">
                        <span className="font-semibold block">{ord.shippingAddress?.fullName}</span>
                        <span className="text-[11px] text-zinc-400">{ord.shippingAddress?.city}, {ord.shippingAddress?.country}</span>
                      </td>
                      <td className="p-4 font-bold text-zinc-950">₹{ord.totalPrice.toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            ord.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.isPaid ? 'Paid' : 'Pending'}
                        </span>
                        {ord.paymentResult?.razorpay_payment_id && (
                          <span className="block text-[10px] font-mono text-zinc-400 mt-0.5">
                            {ord.paymentResult.razorpay_payment_id}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            ord.isDelivered ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-800'
                          }`}
                        >
                          {ord.isDelivered ? 'Delivered' : 'Processing'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {!ord.isDelivered && (
                          <button
                            onClick={() => handleMarkDelivered(ord._id)}
                            className="px-3 py-1 rounded-full bg-zinc-950 text-white text-[11px] font-semibold hover:bg-zinc-800 transition-colors"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: System Diagnostics */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#F6F5F2] rounded-3xl border border-zinc-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-zinc-900">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-zinc-900">MongoDB Database</h3>
            <p className="text-xs text-zinc-500">
              Current Mode: <strong className="text-black">{systemStatus?.db?.mode || 'In-Memory Hybrid'}</strong>
            </p>
            <p className="text-[11px] text-zinc-400">
              {systemStatus?.db?.connected
                ? 'Connected to live MongoDB instance'
                : 'Zero-setup in-memory database engine active. Supports all operations.'}
            </p>
          </div>

          <div className="p-6 bg-[#F6F5F2] rounded-3xl border border-zinc-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-zinc-900">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-zinc-900">Razorpay Payment Gateway</h3>
            <p className="text-xs text-zinc-500">
              Status: <strong className="text-black">{systemStatus?.razorpay?.mode || 'Sandbox Ready'}</strong>
            </p>
            <p className="text-[11px] text-zinc-400">
              Key ID: <code>{systemStatus?.razorpay?.keyId || 'rzp_test_sample_key'}</code>
            </p>
          </div>

          <div className="p-6 bg-[#F6F5F2] rounded-3xl border border-zinc-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-zinc-900">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-zinc-900">Google OAuth & Identity</h3>
            <p className="text-xs text-zinc-500">
              Client ID: <strong className="text-black">{systemStatus?.googleAuth?.clientId || 'Demo Ready'}</strong>
            </p>
            <p className="text-[11px] text-zinc-400">
              One-click Google Sign-in and Google JWT verification enabled.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

