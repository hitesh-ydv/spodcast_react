import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js"

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Root route to check server
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is working 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.listen(5000, () => console.log("Server running on port 5000"));
