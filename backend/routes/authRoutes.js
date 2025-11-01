import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a verification token for email
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
    });

    // Generate JWT using Spotify-like userId
    const token = jwt.sign(
      { userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send verification email
    const verifyUrl = `${process.env.CLIENT_URL}/api/auth/verify/${verificationToken}`;
    await sendEmail(
      email,
      "Verify your account",
      `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`
    );

    // Return token + user info
    res.json({
      token,
      user: { userId: user.userId, name: user.name, email: user.email },
      msg: "Verification email sent",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Verify Email
router.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;

    // Find user with this verification token
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ msg: "Invalid link" });

    user.verified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ msg: "Email verified successfully" });
  } catch (err) {
    res.status(400).json({ msg: "Invalid or expired token" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (!user.verified)
      return res.status(400).json({ msg: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // JWT using userId
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { userId: user.userId, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
