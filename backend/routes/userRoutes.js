import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(), // store file in memory
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

router.put(
  "/update-photo",
  authMiddleware,
  upload.single("photo"), // field name "photo"
  async (req, res) => {
    try {
      const user = await User.findOne({ userId: req.user.userId });
      if (!user) return res.status(404).json({ msg: "User not found" });

      if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

      user.photo = req.file.buffer; // store binary
      user.photoContentType = req.file.mimetype;
      await user.save();

      res.json({
        msg: "Profile photo updated successfully",
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);


router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select(
      "name email userId"
    );
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get full user data by userId
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Return all user data except password and verification token
    res.json({
      userId: user.userId,
      name: user.name,
      email: user.email,
      verified: user.verified,
      photo: user.photo ? `/api/user/${user.userId}/photo` : null, // use the photo route
      // Add any other fields you want to expose
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// Update user name
router.put("/update", authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ msg: "Name is required" });

  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.name = name;
    await user.save();

    res.json({
      msg: "Name updated successfully",
      user: { userId: user.userId, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/:userId/photo", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user || !user.photo) return res.status(404).send("No photo");

    res.set("Content-Type", user.photoContentType);
    res.send(user.photo);
  } catch (err) {
    res.status(500).send("Server error");
  }
});


export default router;
