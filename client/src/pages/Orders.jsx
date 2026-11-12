import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, CheckCircle2, Clock, ShieldCheck, Truck, Package, MapPin, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useCart();

  useEffect(() => {
    if (isAuthenticated) {
      api.getMyOrders()
        .then((data) => setOrders(data))
        .catch((err) => console.warn('Could not fetch user orders:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="text-2xl font-serif">Sign in to view orders</h2>
        <p className="text-xs text-zinc-500">Access your historical purchases and track active deliveries.</p>
        <Link
          to="/signin?redirect=/orders"
          className="inline-block px-6 py-3 rounded-full bg-zinc-950 text-white font-semibold text-xs tracking-wider uppercase"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 space-y-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Client Ledger
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-zinc-950 font-normal">
          Your Purchases & Consignments
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-zinc-400">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-[#F6F5F2] rounded-3xl p-12 text-center space-y-4 border border-zinc-200">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto text-zinc-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-medium text-zinc-900">No orders placed yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Your wardrobe acquisitions will appear here once confirmed with Razorpay payment.
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-semibold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-[#F6F5F2] rounded-3xl p-6 sm:p-8 border border-zinc-200/80 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 text-xs">
                <div>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase">
                    Order Ref: #{ord._id}
                  </span>
                  <p className="text-zinc-600 mt-0.5">
                    Placed on {new Date(ord.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      ord.isPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{ord.isPaid ? 'Paid via Razorpay' : 'Pending Payment'}</span>
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      ord.isDelivered
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-200 text-zinc-800'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{ord.isDelivered ? 'Delivered' : 'In Preparation'}</span>
                  </span>
                </div>
              </div>

              {/* Items in this order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ord.orderItems?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-zinc-200/60"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-zinc-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Size: {item.size} · Color: {item.color} · Qty: {item.qty}
                      </p>
                      <span className="text-xs font-bold text-zinc-950">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <div className="text-zinc-500">
                  <span>Shipped to: </span>
                  <strong className="text-zinc-800 font-medium">{ord.shippingAddress?.city}, {ord.shippingAddress?.country}</strong>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-zinc-400 text-[11px] block">Total Amount</span>
                    <span className="text-base font-bold text-zinc-950">{formatPrice(ord.totalPrice)}</span>
                  </div>
                  <button
                    onClick={() => setTrackingOrder(ord)}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-zinc-950 text-white font-semibold text-xs hover:bg-black transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track</span>
                  </button>
                  <Link
                    to={`/order/${ord._id}`}
                    className="px-4 py-2 rounded-full bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-900 font-semibold text-xs transition-colors"
                  >
                    Receipt ↗
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setTrackingOrder(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl z-10 border border-zinc-200 animate-slide-up space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  Global Consignment Tracking
                </span>
                <h3 className="text-lg font-serif font-bold text-zinc-950">
                  Track Consignment #{trackingOrder._id.slice(-6).toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setTrackingOrder(null)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Carrier info */}
            <div className="bg-[#F6F5F2] p-4 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-500 block text-[11px]">Carrier Service</span>
                <strong className="text-zinc-900 font-semibold">ALGIONX Carbon-Neutral Express</strong>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block text-[11px]">Estimated Delivery</span>
                <strong className="text-emerald-700 font-semibold">In 2 business days</strong>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 pl-2 text-xs">
              <div className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 z-10">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900">Payment Confirmed via Razorpay</h4>
                  <p className="text-[11px] text-zinc-500">Ref: {trackingOrder.paymentResult?.razorpay_payment_id || 'pay_authorized'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 z-10">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900">Tailoring & Eco-Packaging</h4>
                  <p className="text-[11px] text-zinc-500">Prepared in biodegradable zero-plastic encasing</p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-zinc-950 text-white flex items-center justify-center flex-shrink-0 z-10">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900">In International Transit</h4>
                  <p className="text-[11px] text-zinc-500">En route to {trackingOrder.shippingAddress?.city}, {trackingOrder.shippingAddress?.country}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative opacity-50">
                <div className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center flex-shrink-0 z-10">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900">Final Handover</h4>
                  <p className="text-[11px] text-zinc-500">Recipient signature required upon handover</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setTrackingOrder(null)}
              className="w-full py-3 rounded-full bg-zinc-950 text-white font-semibold text-xs tracking-wider uppercase"
            >
              Close Tracker
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

