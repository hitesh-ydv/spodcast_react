import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 8);

// const selfPlaylistSchema = new mongoose.Schema({
//   playlistId: {
//     type: String,
//     default: () => nanoid(),
//     // Remove index: false since it's not needed for subdocuments
//   },
//   name: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     default: "",
//   },
//   songs: [
//     {
//       type: String,
//     },
//   ],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

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
  verificationToken: String,
  photoUrl: String,
  photoContentType: String,

  recentPlays: [String],
  likedSongs: [String],

  library: {
    artists: [String],
    albums: [String],
    playlists: [String],
  },

  // selfPlaylists: [selfPlaylistSchema],
});

export default mongoose.model("User", userSchema);
