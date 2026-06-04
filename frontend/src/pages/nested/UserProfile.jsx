import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Loader from "../../components/Loader";
import { motion } from "framer-motion";
import { Vibrant } from "node-vibrant/browser";

const API_URL = import.meta.env.VITE_API_URL2; // renamed from URL

const UserProfile = () => {
  const { userid } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('');
  const [scrollContainerBg, setScrollContainerBg] = useState('');
  const imageRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await axios.get(`${API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userid && res.data.user && res.data.user.google_id !== userid) {
          // you used setError earlier but error state wasn't defined — keep simple:
          console.error("You are not allowed to view this profile.");
          setUser(null);
        } else {
          setUser(res.data.user);
          if (res.data.user.googleId) {
            setProfileImage(res.data.user.avatar);
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userid]);

  const extractColorFromImage = async () => {
    if (!imageRef.current) return;

    try {
      const palette = await Vibrant
        .from(imageRef.current.src)
        .getPalette();

      // Spotify-style priority
      const swatch =
        palette.DarkVibrant ||
        palette.Muted ||
        palette.DarkMuted;

      if (!swatch) return;

      const [r, g, b] = swatch.rgb;

      const gradient = `
    linear-gradient(
      180deg,
      rgba(${r + 20}, ${g + 20}, ${b + 20}, 0.95) 0%,
      rgba(${r}, ${g}, ${b}, 0.8) 50%,
      rgba(${r}, ${g}, ${b}, 0.5) 100%
    )
  `;

      const scrollGradient = `
      linear-gradient(
        to bottom,
        rgba(${r}, ${g}, ${b}, 0.35) 0px,
        rgba(18,18,18,0.7) 150px,
        #12121A 100%
      )
    `;

      setBackgroundColor(gradient);
      setScrollContainerBg(scrollGradient);

    } catch (err) {
      console.error("Vibrant error:", err);
    }
  };


  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-lg">
        User not found.
      </div>
    );
  }

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="text-white transition-all duration-500 w-full relative top-0 left-0 ">



      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          background: backgroundColor,
          transition: "background 1.5s ease", // ✅ smooth gradient change
        }}
        className="relative flex items-end gap-8 px-7 py-7 bg-opacity-30 w-full max-w-full"
      >
        {/* 🎵 IMAGE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          className="flex-shrink-0"
        >
          <img
          ref={imageRef}
            src="https://lh3.googleusercontent.com/a/ACg8ocIwy6GOQo35146RWJ56jd3rIH8J_4qow6Vk5Aqk8QxRsEWgC50=s96-c"
            className="w-50 h-50 rounded-full object-cover shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
            onLoad={extractColorFromImage}
            //crossOrigin="anonymous"
          />
        </motion.div>

        {/* 📝 TEXT */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-full"
        >
          <motion.span variants={item} className="text-sm font-bold">
            Profile
          </motion.span>

          <motion.h1
            variants={item}
            className="text-6xl font-black mb-6 mt-3 line-clamp-1 leading-none"
          >
            {user.name}
          </motion.h1>

          <motion.div
            variants={item}
            className="mb-0 flex flex-row items-center gap-1"
          >
            <span className="text-sm text-[#adadad] font-medium">•</span>

            <span
              onClick={(e) => {
                e.preventDefault();
              }}
              className="text-md font-medium hover:underline cursor-pointer"
            >
              Following
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="w-full pt-6 min-h-screen"
        style={{
          background: scrollContainerBg,
          height: "100%",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
      >

      </motion.div>

    </div >
  );
};

export default UserProfile;
