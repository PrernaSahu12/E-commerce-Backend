const express = require("express");
const router = express.Router();
const razorpay = require("../config/razorpay");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    const options = {
      amount: amount * 100,
      currency,
      receipt: receipt || "receipt_" + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Payment order creation failed", error: err.message });
  }
});

module.exports = router;
