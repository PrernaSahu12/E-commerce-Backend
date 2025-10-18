const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
const cors = require("cors");
const express = require("express");
const razorpay = require("./src/config/razorpay");
const connectDB = require("./src/config/db");
const productRoutes = require("./src/routes/product.routes");
const authRoutes = require("./src/routes/auth.routes");
const cartRoutes = require("./src/routes/cart.Routes");
const orderRoutes = require("./src/routes/order.Routes");

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL, 
  "http://localhost:5173",
  "https://e-commerce-frontend-sqhs.vercel.app"
].filter(Boolean);


app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) {
    // no origin (curl, server-to-server) - allow
    res.header("Access-Control-Allow-Origin", "*");
  } else if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  // Handle preflight
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});


app.use(express.json());

connectDB();

app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running or port ${PORT}`));


