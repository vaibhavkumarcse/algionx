import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck, Truck, PackageCheck, Copy } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { formatPrice } = useCart();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.warn('Could not fetch order data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const copyOrderId = () => {
    if (order?._id) {
      navigator.clipboard.writeText(order._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Celebratory Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md animate-scale-up">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Razorpay Payment Authorized & Confirmed
        </span>

        <h1 className="text-3xl sm:text-5xl font-serif text-zinc-950 font-normal">
          Thank you for your patronage.
        </h1>

        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          Your order has been recorded in our atelier ledger and will be packaged in biodegradable zero-plastic encasing.
        </p>

        {order && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F6F5F2] border border-zinc-200 text-xs text-zinc-700 font-mono">
            <span>Order Reference: #{order._id}</span>
            <button onClick={copyOrderId} className="text-zinc-400 hover:text-black">
              <Copy className="w-3.5 h-3.5" />
            </button>
            {copied && <span className="text-[10px] text-emerald-600 font-sans font-bold">Copied!</span>}
          </div>
        )}
      </div>

      {order && (
        <div className="bg-[#F6F5F2] rounded-3xl p-6 sm:p-10 border border-zinc-200/80 space-y-8">
          {/* Status Tracker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">Payment Verified</p>
                <p className="text-[10px] text-zinc-500">Razorpay ID: {order.paymentResult?.razorpay_payment_id || 'pay_verified'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center">
                <PackageCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">Atelier Tailoring</p>
                <p className="text-[10px] text-zinc-500">Preparing luxury parcel</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500">Worldwide Dispatch</p>
                <p className="text-[10px] text-zinc-400">Carbon-neutral transit</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 mb-4">
              Consignment Pieces
            </h3>
            <div className="space-y-3">
              {order.orderItems?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-zinc-200/60"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900">{item.title}</h4>
                      <p className="text-[11px] text-zinc-500">
                        Size: {item.size} · Color: {item.color} · Qty: {item.qty}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-zinc-950">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Financial Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-200 text-xs">
            <div>
              <h4 className="font-bold text-zinc-900 mb-1">Destination Address</h4>
              <p className="text-zinc-600">{order.shippingAddress?.fullName}</p>
              <p className="text-zinc-600">{order.shippingAddress?.address}</p>
              <p className="text-zinc-600">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              <p className="text-zinc-600">{order.shippingAddress?.country}</p>
            </div>

            <div className="space-y-1.5 sm:text-right">
              <div className="flex sm:justify-end gap-6 text-zinc-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-zinc-900">{formatPrice(order.itemsPrice)}</span>
              </div>
              <div className="flex sm:justify-end gap-6 text-zinc-600">
                <span>Shipping:</span>
                <span className="font-semibold text-zinc-900">{order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}</span>
              </div>
              <div className="flex sm:justify-end gap-6 text-zinc-600">
                <span>Tax:</span>
                <span className="font-semibold text-zinc-900">{formatPrice(order.taxPrice)}</span>
              </div>
              <div className="flex sm:justify-end gap-6 text-base font-bold text-zinc-950 pt-2 border-t border-zinc-200">
                <span>Total Paid:</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <Link
          to="/orders"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-zinc-950 text-white font-semibold text-xs tracking-wider uppercase hover:bg-black transition-all shadow-md text-center"
        >
          View All Orders
        </Link>
        <Link
          to="/shop"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white border border-zinc-300 text-zinc-800 font-semibold text-xs tracking-wider uppercase hover:border-black transition-all text-center"
        >
          Explore New Drops
        </Link>
      </div>
    </div>
  );
}

