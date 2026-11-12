import Order from '../models/Order.js';
import { getDBStatus } from '../config/db.js';

// In-memory fallback orders store
export let inMemoryOrders = [
  {
    _id: 'ord_mock_1001',
    user: '66f100000000000000000001',
    orderItems: [
      {
        title: 'Silk Whisper Camp Shirt',
        qty: 1,
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
        price: 120,
        product: '66f101a01100000000000001',
        size: 'L',
        color: 'Olive'
      }
    ],
    shippingAddress: {
      fullName: 'Eleanor Vance',
      address: '742 Evergreen Terrace',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      phone: '+33 1 40 20 50 50'
    },
    paymentMethod: 'Razorpay',
    paymentResult: {
      razorpay_order_id: 'order_live_99421',
      razorpay_payment_id: 'pay_live_449102',
      status: 'authorized',
      email_address: 'admin@kosis.luxury'
    },
    itemsPrice: 120,
    shippingPrice: 0,
    taxPrice: 12,
    totalPrice: 132,
    isPaid: true,
    paidAt: new Date(Date.now() - 86400000 * 2),
    isDelivered: true,
    deliveredAt: new Date(Date.now() - 86400000),
    status: 'Delivered',
    createdAt: new Date(Date.now() - 86400000 * 2)
  }
];

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
export const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items in payload' });
    }

    const { connected } = getDBStatus();

    if (connected) {
      const order = new Order({
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'Razorpay',
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();
      return res.status(201).json(createdOrder);
    } else {
      // In-memory fallback
      const createdOrder = {
        _id: 'ord_' + Date.now().toString(),
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'Razorpay',
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: false,
        isDelivered: false,
        status: 'Pending',
        createdAt: new Date(),
      };

      inMemoryOrders.unshift(createdOrder);
      return res.status(201).json(createdOrder);
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message || 'Error creating order' });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res) => {
  try {
    const { connected } = getDBStatus();

    if (connected) {
      const order = await Order.findById(req.params.id).populate('user', 'name email');

      if (order) {
        if (req.user.role === 'admin' || order.user._id.toString() === req.user._id.toString()) {
          return res.json(order);
        }
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      return res.status(404).json({ message: 'Order not found' });
    } else {
      const order = inMemoryOrders.find((o) => o._id.toString() === req.params.id.toString());
      if (order) {
        if (req.user.role === 'admin' || order.user.toString() === req.user._id.toString()) {
          return res.json(order);
        }
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      return res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const { connected } = getDBStatus();

    if (connected) {
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      const orders = inMemoryOrders.filter((o) => o.user.toString() === req.user._id.toString());
      return res.json(orders);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getOrders = async (req, res) => {
  try {
    const { connected } = getDBStatus();

    if (connected) {
      const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      return res.json(inMemoryOrders);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update order status to delivered
 * @route   PUT /api/orders/:id/deliver
 * @access  Private/Admin
 */
export const updateOrderToDelivered = async (req, res) => {
  try {
    const { connected } = getDBStatus();

    if (connected) {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.status = 'Delivered';

      const updated = await order.save();
      return res.json(updated);
    } else {
      const order = inMemoryOrders.find((o) => o._id.toString() === req.params.id.toString());
      if (!order) return res.status(404).json({ message: 'Order not found' });

      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.status = 'Delivered';

      return res.json(order);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

