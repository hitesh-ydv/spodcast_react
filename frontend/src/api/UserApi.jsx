import axios from "axios";

const URL = import.meta.env.VITE_API_URL2;

const API_BASE = URL; // replace with your actual backend URL

// Like/unlike song
export const toggleLikeSong = async (token, songId) => {
  const res = await axios.post(
    `${API_BASE}/like`,
    { songId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Get all liked songs
export const getLikedSongs = async (token) => {
  const res = await axios.get(`${API_BASE}/likes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
