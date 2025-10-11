const express = require("express");
const Order = require("../models/Order"); 
const Cart = require("../models/Cart");
const authMiddleware = require("../middleware/auth.middleware");
const razorpay = require("../config/razorpay");

const router = express.Router();

router.post("/place", authMiddleware, async (req, res) => {
  try {
    const { paymentMethod } = req.body;

   
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

  
    let totalPrice = 0;
    cart.items.forEach((item) => {
      totalPrice += item.product.price * item.quantity;
    });

    
    const order = await Order.create({
      user: req.user.id,
      items: cart.items,
      totalPrice,
      paymentMethod: paymentMethod || "COD",
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post("/create-online", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalPrice = 0;
    cart.items.forEach((item) => {
      totalPrice += item.product.price * item.quantity;
    });

    
    const options = {
      amount: totalPrice * 100, 
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    
    const order = await Order.create({
      user: req.user.id,
      items: cart.items,
      totalPrice,
      paymentMethod: "ONLINE",
      paymentInfo: {
        razorpay_order_id: razorpayOrder.id,
      },
    });

    res.status(201).json({ order, razorpayOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
