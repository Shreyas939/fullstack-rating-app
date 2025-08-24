import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import errorHandler from "./middleware/errorHandler.js";
import storesRoutes from "./routes/stores.js";
import ratingRoutes from "./routes/ratings.js";
import adminRoutes from "./routes/admin.js";
import storeOwnerRoutes from "./routes/storeOwner.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173",  // your React app
  credentials: true                 // allow cookies/headers if needed
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running ");
});

app.use("/api/auth", authRoutes);
app.use(errorHandler);
app.use("/api/stores",storesRoutes);
app.use("/api/ratings",ratingRoutes);
app.use("/api/admin",adminRoutes)
app.use("/api/store-owner", storeOwnerRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
