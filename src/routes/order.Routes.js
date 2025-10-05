const express = require("express");
// const Order = require("../models/Order");
const Cart = require("../models/Cart");
const authMiddleware = require("../middleware/auth.middleware");
const razorpay = require("../config/razorpay");

const router = express.Router();

// Place Order
router.post("/place", authMiddleware, async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    // get cart of logged-in user
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is Empty" });
    }

    // total price calculate
    let totalPrice = 0;
    cart.items.forEach((item) => {
      totalPrice += item.product.price * item.quantity;
    });

    // order create
    const order = await Order.create({
      user: req.user.id,
      items: cart.items,
      totalPrice,
      paymentMethod: paymentMethod || "COD",
    });

    // clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    if (!cart) return res.json(404).json({ message: "Cart not found" });
    const totalAmount = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // order in db
    const order = new order({
      user: req.user.id,
      orderItems: cart.items.map((i) => ({
        prodcut: i.product._id,
        quantity: i.quantity,
      })),
      totalAmount,
      paymentInfo: { razorpay_order_id: razorpayOrder.id },
    });
    await order.save();
    res.json({ order, razorpayOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post("/create-online", authMiddleware, async(req,res)=>{
  try {
    const cart = await Cart.findOne({user: req.user.id}).populate("items.product");
    if(!cart || cart.items.length === 0){
      return res.status(400).json({message: "Cart is empty"})
    }
    // calculate total
    let totalPrice =0;
    cart.items.forEach((item)=>{
      totalPrice += item.product.price * item.quantity;
    });
    // create razorpay order
    const options = {
      amount: totalPrice * 100,
      cuurency:"INR",
      receipt:"receipt_" + Date.now(),
    };
    const razorpayOrder = await razorpay.orders.create(options)

    // save oredr in db
    const order = await Order.create({
      user: req.user.id,
      items:cart.items,
      totalPrice,
      paymentMethod:"ONLINE",
      paymentInfo:{
        razorpay_order_id: razorpayOrder.id
      },
    });
    res.json({razorpayOrder, order})
  } catch (error) {
    res.status(500).json({message:error.message})
  }
})
// Get User Orders
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

// Get All Orders (Admin Only)
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

// Update Order Status (Admin Only)
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
