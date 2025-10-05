
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const razorpay = require("./src/config/razorpay")
const connectDB = require('./src/config/db');
const productRoutes = require("./src/routes/product.routes");
const authRoutes = require("./src/routes/auth.routes");
const cartRoutes = require("./src/routes/cart.Routes");
const orderRoutes = require("./src/routes/order.Routes")

const app = express();

// middleware
app.use(cors());
app.use(express.json());


connectDB();

// Routes
app.use("/api/auth",authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders",orderRoutes)


const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Server running pn port ${PORT}`))