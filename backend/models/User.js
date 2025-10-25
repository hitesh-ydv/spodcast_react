import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 8);

// Schema for user's self-created playlist
const selfPlaylistSchema = new mongoose.Schema({
  playlistId: {
    type: String,
    unique: true,
    default: () => nanoid(), // unique ID for user’s own playlist
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  songs: [
    {
      type: String, // Song IDs from API or DB
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    default: () => nanoid(),
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  photo: { type: Buffer },
  photoContentType: { type: String },

  // 🎧 Recent plays (comma-separated song IDs or as array)
  recentPlays: [
    {
      type: String, // song IDs from API
    },
  ],

  // ❤️ Liked songs
  likedSongs: [
    {
      type: String, // song IDs from API
    },
  ],

  // 🎵 Library (following)
  library: {
    artists: [
      {
        type: String, // artist IDs from API
      },
    ],
    albums: [
      {
        type: String, // album IDs from API
      },
    ],
    playlists: [
      {
        type: String, // public playlist IDs from API
      },
    ],
  },

  // 📀 Self-created playlists
  selfPlaylists: [selfPlaylistSchema],
});

export default mongoose.model("User", userSchema);
