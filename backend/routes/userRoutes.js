import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";


const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.put(
  "/update-photo",
  authMiddleware,
  upload.single("photo"),
  async (req, res) => {
    try {
      const user = await User.findOne({ userId: req.user.userId });
      if (!user) return res.status(404).json({ msg: "User not found" });
      if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "user_photos" },
        async (error, uploadResult) => {
          if (error) return res.status(500).json({ msg: "Upload failed" });

          user.photoUrl = uploadResult.secure_url;
          await user.save();

          res.json({
            msg: "Profile photo updated successfully",
            user: {
              userId: user.userId,
              name: user.name,
              email: user.email,
              photoUrl: user.photoUrl,
            },
          });
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// Update name
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

// 1️⃣ Get logged-in user info
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select(
      "-password -verificationToken"
    );
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 2️⃣ Get user photo (specific route)
router.get("/:userId/photo", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user || !user.photoUrl)
      return res.status(404).send("No photo found");

    // if using Cloudinary URL:
    res.json({ photoUrl: user.photoUrl });

    // if serving binary photo from DB:
    // res.set("Content-Type", user.photoContentType);
    // res.send(user.photo);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// 3️⃣ Get any user's public info (generic, placed last)
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).select(
      "userId name email verified photoUrl"
    );
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});


/* ===========================
    🎧 RECENT PLAYS
=========================== */

// Add a song to recent plays (keep max 20)
router.post("/recent", authMiddleware, async (req, res) => {
  const { songId } = req.body;
  if (!songId) return res.status(400).json({ msg: "songId required" });

  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Remove if exists, then add to top
    user.recentPlays = [songId, ...user.recentPlays.filter(id => id !== songId)].slice(0, 20);
    await user.save();

    res.json({ msg: "Added to recent plays", recentPlays: user.recentPlays });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get recent plays
router.get("/recent", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    res.json({ recentPlays: user.recentPlays });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* ===========================
    ❤️ LIKED SONGS
=========================== */

// Toggle like/unlike
router.post("/like", authMiddleware, async (req, res) => {
  const { songId } = req.body;
  if (!songId) return res.status(400).json({ msg: "songId required" });

  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const index = user.likedSongs.indexOf(songId);
    if (index > -1) {
      user.likedSongs.splice(index, 1);
      await user.save();
      return res.json({ msg: "Song unliked", likedSongs: user.likedSongs });
    }

    user.likedSongs.unshift(songId);
    await user.save();
    res.json({ msg: "Song liked", likedSongs: user.likedSongs });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get liked songs
router.get("/likes", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ likedSongs: user.likedSongs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ===========================
    🎵 LIBRARY
=========================== */

// Follow / Unfollow (artist, album, playlist)
router.post("/library/:type", authMiddleware, async (req, res) => {
  const { type } = req.params; // artist | album | playlist
  const { id } = req.body;

  if (!["artists", "albums", "playlists"].includes(type))
    return res.status(400).json({ msg: "Invalid library type" });
  if (!id) return res.status(400).json({ msg: "ID required" });

  try {
    const user = await User.findOne({ userId: req.user.userId });
    const list = user.library[type];
    const index = list.indexOf(id);

    if (index > -1) {
      list.splice(index, 1);
      await user.save();
      return res.json({ msg: `Removed from ${type}`, library: user.library });
    }

    list.push(id);
    await user.save();
    res.json({ msg: `Added to ${type}`, library: user.library });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get full library
router.get("/library", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    res.json({ library: user.library });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
