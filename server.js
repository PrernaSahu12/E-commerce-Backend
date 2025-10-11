const dotenv = require("dotenv");
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


const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:5173"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: This origin is not allowed'));
  },
  credentials: true,
}));


app.use(express.json());

connectDB();


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running pn port ${PORT}`));
