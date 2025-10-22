import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

// Create a Spotify-like user ID: 8 characters alphanumeric
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 8);

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
  photo: { type: Buffer }, // store image as binary
  photoContentType: { type: String }, // store MIME type

});

export default mongoose.model("User", userSchema);
