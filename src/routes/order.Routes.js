const express = require("express");
const Order = require("../models/Order"); 
const Cart = require("../models/Cart");
const authMiddleware = require("../middleware/auth.middleware");
const razorpay = require("../config/razorpay");

const router = express.Router();

router.post("/place", authMiddleware, async (req, res) => {
  try {
    const { paymentMethod, cartItems, totalAmount, shippingAddress } = req.body;

    // If cartItems are provided in the body (frontend-sent), use them.
    // Otherwise fallback to server-side stored cart for the user.
    let items = [];
    let totalPrice = 0;

    if (Array.isArray(cartItems) && cartItems.length > 0) {
      // Expect cartItems to be objects: { productId, quantity }
      // Convert into the same shape as stored cart.items (product ref + quantity)
      items = await Promise.all(
        cartItems.map(async (ci) => {
          const product = await require("../models/Product").findById(ci.productId);
          return { product: product._id, quantity: ci.quantity || 1, price: product.price };
        })
      );
      totalPrice = Number(totalAmount) || items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
    } else {
      const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      items = cart.items.map((it) => ({ product: it.product._id, quantity: it.quantity, price: it.product.price }));
      totalPrice = items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);

      // Clear server cart after placing order
      cart.items = [];
      await cart.save();
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      totalPrice,
      paymentMethod: paymentMethod || "COD",
      shippingAddress: shippingAddress || "",
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /orders/create-online
router.post("/create-online", authMiddleware, async (req, res) => {
  try {
    const { cartItems, totalAmount, shippingAddress } = req.body;
    console.log(req.body);
    

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const order = await Order.create({
      user: req.user.id,
      items: cartItems.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
      totalPrice: totalAmount,
      shippingAddress: shippingAddress || "Default Address",
      paymentMethod: "ONLINE",
      paymentInfo: {
        razorpay_order_id: razorpayOrder.id,
      },
    });

    return res.status(201).json({
      success: true,
      order,
      razorpayOrder,
    });
  } catch (error) {
    console.error("Error creating online order:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});




router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate(
      "items.product"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const orders = await Order.find().populate("items.product user");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
