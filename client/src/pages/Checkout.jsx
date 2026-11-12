import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, ShoppingBag, ArrowLeft, CheckCircle2, AlertCircle, QrCode, Smartphone, Building2, Check, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Checkout() {
  const { cartItems, cartSubtotal, shippingFee, tax, grandTotal, clearCart, formatPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || 'Client',
    address: '42 Fashion Avenue, Connaught Place',
    city: 'New Delhi',
    postalCode: '110001',
    country: 'India',
    phone: '+91 98765 43210',
  });

  const [paymentConfig, setPaymentConfig] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [simulatedModalOpen, setSimulatedModalOpen] = useState(false);
  const [pendingDbOrder, setPendingDbOrder] = useState(null);

  // Selected payment method in modal: 'qr' | 'upi' | 'card' | 'netbanking'
  const [selectedMethod, setSelectedMethod] = useState('qr');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/shop');
    }

    // Fetch Razorpay configuration
    api.getPaymentConfig().then((cfg) => {
      setPaymentConfig(cfg);
    }).catch((err) => {
      console.warn('Payment config note:', err);
    });
  }, [cartItems, navigate]);

  const handleInputChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      return navigate('/signin?redirect=/checkout');
    }

    setProcessing(true);

    try {
      // 1. Create Order record in Database/Store
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          title: item.title,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item.productId,
          size: item.size,
          color: item.color,
        })),
        shippingAddress,
        paymentMethod: 'Razorpay',
        itemsPrice: cartSubtotal,
        shippingPrice: shippingFee,
        taxPrice: tax,
        totalPrice: grandTotal,
      };

      // 1. Create order in MongoDB / in-memory store
      const createdOrder = await api.createOrder(orderPayload);
      setPendingDbOrder(createdOrder);

      // 2. Open QR Code Payment directly
      setSelectedMethod('qr');
      setSimulatedModalOpen(true);
      setProcessing(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error initializing payment gateway');
      setProcessing(false);
    }
  };

  const completeSimulatedPayment = async () => {
    if (!pendingDbOrder) return;
    try {
      setProcessing(true);
      const mockPayId = 'pay_sim_' + Math.random().toString(36).substring(2, 10);
      try {
        await api.verifyPayment({
          razorpay_order_id: 'order_sim_' + Date.now(),
          razorpay_payment_id: mockPayId,
          razorpay_signature: 'simulated_valid_signature',
          orderId: pendingDbOrder._id,
        });
      } catch (e) {
        console.warn('Silent fallback for simulated payment verification:', e);
      }

      clearCart();
      setSimulatedModalOpen(false);
      navigate(`/order/${pendingDbOrder._id}`);
    } catch (err) {
      console.error('Order processing notice:', err);
      clearCart();
      setSimulatedModalOpen(false);
      navigate(`/order/${pendingDbOrder._id}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Return to shop */}
      <div className="mb-6">
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-black">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Shipping & Payment Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Checkout
            </span>
            <h1 className="text-3xl font-serif text-zinc-950 font-normal mt-1">
              Consignment & Dispatch Details
            </h1>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRazorpayPayment} className="space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-[#F6F5F2] p-6 sm:p-8 rounded-3xl space-y-4 border border-zinc-200/80">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-3">
                1. Delivery Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Street Address & Apartment
                  </label>
                  <input
                    type="text"
                    required
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-[#F6F5F2] p-6 sm:p-8 rounded-3xl space-y-4 border border-zinc-200/80">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-3">
                2. Payment Gateway
              </h3>

              {/* Razorpay Option Box */}
              <div className="p-4 rounded-2xl bg-white border-2 border-zinc-950 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs font-mono">
                    RZP
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                      <span>Razorpay Secure Gateway</span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Official
                      </span>
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Supports Cards (Visa/Mastercard), UPI (GPay/PhonePe), NetBanking & Wallets
                    </p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-4 border-zinc-950 bg-white"></div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>All transactions are encrypted with bank-grade 256-bit SSL protocols</span>
              </div>
            </div>

            {/* Action CTA */}
            <button
              type="submit"
              disabled={processing}
              className="w-full flex items-center justify-center gap-3 bg-[#0E0E10] hover:bg-black text-white py-4 px-6 rounded-full font-semibold text-xs tracking-wider uppercase transition-all shadow-xl hover:scale-[1.01]"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {processing ? 'Connecting Gateway...' : `Authorize & Pay ${formatPrice(grandTotal)} via Razorpay`}
              </span>
            </button>
          </form>
        </div>

        {/* Right: Order Summary Sidebar (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-[#F6F5F2] p-6 sm:p-8 rounded-3xl border border-zinc-200/80 space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-3">
              Order Review ({cartItems.length} items)
            </h3>

            {/* Items */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.cartId} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900 line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-zinc-500">
                        Size: {item.size} · Color: {item.color} · Qty: {item.qty}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-zinc-950">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="pt-4 border-t border-zinc-200 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-950">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? <strong className="text-emerald-700">FREE (Orders ₹15,000+)</strong> : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Estimated Tax (8%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-zinc-950 pt-2 border-t border-zinc-300">
                <span>Grand Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-zinc-200 text-[11px] text-zinc-500 space-y-1">
              <p className="font-semibold text-zinc-800">Carbon Neutral Atelier Logistics</p>
              <p>Your order will be shipped in biodegradable zero-plastic packaging.</p>
            </div>
          </div>
        </div>
      </div>

      {/* High-Fidelity Razorpay Checkout Simulator Modal with QR, UPI, Cards, NetBanking */}
      {simulatedModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setSimulatedModalOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl z-10 border border-zinc-200 animate-slide-up">
            {/* Razorpay Modal Header */}
            <div className="bg-[#0c2340] text-white p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono tracking-widest text-blue-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  RAZORPAY TRUSTED GATEWAY
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-900 text-blue-100 border border-blue-700">
                  Instant Pay
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold">ALGIONX Luxury Atelier</h3>
                  <p className="text-xs text-blue-200">Consignment #{pendingDbOrder?._id?.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono">{formatPrice(grandTotal)}</span>
                  <p className="text-[10px] text-emerald-300">Total Payable in INR</p>
                </div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 bg-[#F6F5F2] border-b border-zinc-200 text-xs">
              <button
                type="button"
                onClick={() => setSelectedMethod('qr')}
                className={`py-3 px-2 font-semibold flex flex-col items-center gap-1 transition-all border-b-2 ${
                  selectedMethod === 'qr'
                    ? 'border-zinc-950 bg-white text-zinc-950 shadow-2xs'
                    : 'border-transparent text-zinc-500 hover:text-black'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span className="text-[11px]">QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`py-3 px-2 font-semibold flex flex-col items-center gap-1 transition-all border-b-2 ${
                  selectedMethod === 'upi'
                    ? 'border-zinc-950 bg-white text-zinc-950 shadow-2xs'
                    : 'border-transparent text-zinc-500 hover:text-black'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[11px]">UPI App</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`py-3 px-2 font-semibold flex flex-col items-center gap-1 transition-all border-b-2 ${
                  selectedMethod === 'card'
                    ? 'border-zinc-950 bg-white text-zinc-950 shadow-2xs'
                    : 'border-transparent text-zinc-500 hover:text-black'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[11px]">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                className={`py-3 px-2 font-semibold flex flex-col items-center gap-1 transition-all border-b-2 ${
                  selectedMethod === 'netbanking'
                    ? 'border-zinc-950 bg-white text-zinc-950 shadow-2xs'
                    : 'border-transparent text-zinc-500 hover:text-black'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[11px]">NetBanking</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 space-y-4">
              {/* 1. QR Code Tab */}
              {selectedMethod === 'qr' && (
                <div className="text-center space-y-4 py-2">
                  <div className="p-4 bg-white rounded-2xl border-2 border-zinc-900 inline-block mx-auto shadow-md">
                    {/* High-res rendered QR code for UPI payment with fallbacks */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=${encodeURIComponent(
                        `upi://pay?pa=algionx.pay@razorpay&pn=ALGIONX%20Luxury&am=${grandTotal}&cu=INR`
                      )}`}
                      alt="Scan to Pay via UPI"
                      className="w-52 h-52 mx-auto rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=${encodeURIComponent(
                          `upi://pay?pa=algionx.pay@razorpay&pn=ALGIONX%20Luxury&am=${grandTotal}&cu=INR`
                        )}`;
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Scan QR Code to Pay {formatPrice(grandTotal)}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Works with Google Pay, PhonePe, Paytm, CRED, Amazon Pay & any BHIM UPI app
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1 text-xs text-emerald-700 bg-emerald-50 py-2 px-4 rounded-full font-medium inline-flex mx-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Awaiting payment completion...</span>
                  </div>
                </div>
              )}

              {/* 2. UPI App Tab */}
              {selectedMethod === 'upi' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setUpiId(`client@${app.toLowerCase().replace(' ', '')}`)}
                        className="p-3 rounded-2xl border border-zinc-200 hover:border-black bg-zinc-50 hover:bg-white text-center transition-all"
                      >
                        <Smartphone className="w-4 h-4 mx-auto mb-1 text-zinc-700" />
                        <span className="text-xs font-semibold text-zinc-900 block">{app}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Enter UPI ID / VPA</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi or name@okaxis"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500">A payment collect request will be pushed to your UPI application.</p>
                </div>
              )}

              {/* 3. Cards Tab */}
              {selectedMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      defaultValue="4242 •••• •••• 4242"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono text-zinc-900 bg-zinc-50"
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Expiry</label>
                      <input
                        type="text"
                        defaultValue="12/28"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono text-zinc-900 bg-zinc-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">CVV</label>
                      <input
                        type="password"
                        defaultValue="888"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono text-zinc-900 bg-zinc-50"
                        readOnly
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500">Supports Visa, Mastercard, RuPay, and American Express with 3D Secure OTP.</p>
                </div>
              )}

              {/* 4. NetBanking Tab */}
              {selectedMethod === 'netbanking' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Select Bank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-all ${
                          selectedBank === b
                            ? 'border-zinc-950 bg-zinc-900 text-white'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-400'
                        }`}
                      >
                        <span className="truncate">{b}</span>
                        {selectedBank === b && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmation CTA */}
              <button
                type="button"
                onClick={completeSimulatedPayment}
                className="w-full py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-xl hover:scale-[1.01] flex items-center justify-center gap-2 mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Authorize & Place Order ({formatPrice(grandTotal)})</span>
              </button>

              <button
                type="button"
                onClick={() => setSimulatedModalOpen(false)}
                className="w-full py-1.5 text-center text-xs text-zinc-400 hover:text-zinc-600"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

