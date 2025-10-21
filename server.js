const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const cors = require("cors");
const razorpay = require("./src/config/razorpay");
const connectDB = require("./src/config/db");
const productRoutes = require("./src/routes/product.routes");
const authRoutes = require("./src/routes/auth.routes");
const cartRoutes = require("./src/routes/cart.Routes");
const orderRoutes = require("./src/routes/order.Routes");

dotenv.config();
const app = express();

// Allowed frontend origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://e-commerce-frontend-sqhs.vercel.app",
  "https://e-commerce-frontend-gamma-lemon.vercel.app" 
].filter(Boolean);

// Use CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
}));

// Parse JSON
app.use(express.json());

// Connect to DB
connectDB();

// Static folder
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
