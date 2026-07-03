import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "../context/AudioContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import Like from "../assets/like.svg";
import { CButton, CTooltip } from '@coreui/react'
import Unlike from "../assets/unlike.svg";

export default function RightSidebar() {
  const { currentSong, isPlaying } = useAudio();
  const { toggleLike, toggleAlbum, isLiked } = useLibrary();

  const navigate = useNavigate();

  // Static canvas video (Spotify style)
  const [canvasUrl, setCanvasUrl] = useState("");
  const liked = currentSong ? isLiked(currentSong.id) : false;

  const songImage = currentSong?.image?.[2]?.url;
  const videoRef = useRef(null);

  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const token = "sk-paxsenix-4-JKEqHQQzxDQv_gKvs1SFpePsIMwO-62NQK-WiIAiZ1rbVq";

  const searchSong = async (songName, token) => {
    const res = await fetch(
      `https://api.paxsenix.org/spotify/search?q=${encodeURIComponent(songName)}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },

      }
    );

    const data = await res.json();
    return data.tracks.items[0]?.id;
  };



  const getCanvasUrl = async (trackId) => {
    try {
      const response = await fetch(
        `https://api.paxsenix.org/spotify/canvas?id=${encodeURIComponent(trackId)}`,
        {
          method: "GET",
          headers: {
            "Accept": "*/*",
            "Authorization":
              "Bearer sk-paxsenix-4-JKEqHQQzxDQv_gKvs1SFpePsIMwO-62NQK-WiIAiZ1rbVq",
          },
        }
      );

      const data = await response.json();

      console.log("Status:", response.status);
      console.log(data);

      return data?.data?.canvasesList?.[0]?.canvasUrl || null;

    } catch (err) {
      console.error(err);
      return null;
    }
  };


  useEffect(() => {
    setCanvasUrl(""); // reset first

    const fetchCanvas = async () => {
      try {
        // 1️⃣ Get token
        const token = "sk-paxsenix-4-JKEqHQQzxDQv_gKvs1SFpePsIMwO-62NQK-WiIAiZ1rbVq"; // Replace with your actual token

        // 2️⃣ Search track ID
        const trackId = await searchSong(`${currentSong.name} ${currentSong.artists.primary[0].name}`, token);
        if (!trackId) return;

        // 3️⃣ Fetch canvas URL
        const url = await getCanvasUrl(trackId);

        // ✅ Check if URL contains "image"
        if (url.toLowerCase().includes("image")) {
          setCanvasUrl(""); // or leave it as "" to render nothing
          return null;
        }

        setCanvasUrl(url);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCanvas();
  }, [currentSong]);


  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => { }); // silent catch if autoplay blocked
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Track scroll depth (0 → 1)
  useEffect(() => {
    const handleScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setScrollProgress(Math.min(progress, 1));
    };
    const el = scrollRef.current;
    el?.addEventListener("scroll", handleScroll);
    return () => el?.removeEventListener("scroll", handleScroll);
  }, []);

  const darkOpacity = (0.45 + scrollProgress * 0.45).toFixed(2); // 0.45 → 0.9

  return (
    <aside className="right-section relative w-77 [@media(min-height:1000px)]:w-100 bg-[#12121A] rounded-md ml-2 overflow-hidden">
      {/* ===== Background Layer (fixed height 500px) ===== */}
      <div className="absolute top-0 left-0 right-0 h-[58vh] rounded-md overflow-hidden z-10">
        {/* Background image */}
        <AnimatePresence mode="wait">
          {songImage && (
            <motion.img
              key={currentSong?.id + "-bg"} // ✅ only changes when song changes
              src={songImage}
              alt={currentSong?.name || "Song artwork"}
              initial={{ opacity: 0 }}
              animate={{ opacity: canvasUrl ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`w-full h-full object-cover transition-opacity duration-700 ${canvasUrl ? "opacity-0" : "opacity-100"
                }`}
            />
          )}
        </AnimatePresence>

        {/* Canvas video */}
        {!canvasUrl !== "" && !canvasUrl.toLowerCase().includes("image") && (
          <AnimatePresence mode="wait">
            <motion.video
              ref={videoRef}
              key={canvasUrl}
              src={canvasUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          </AnimatePresence>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-transparentt via-transparent vai-transaprent to-[#12121A] min-h-[58vh]  " />

        {/* Scroll depth overlay — darkens progressively */}
        <motion.div
          className="absolute inset-0 bg-[#12121A]"
          style={{
            opacity: darkOpacity, // 0 → 0.45 (or higher)
            transition: "opacity 0.3s ease",
          }}
        />

      </div>

      {/* ===== Foreground Content ===== */}
      <div ref={scrollRef} className="relative z-10 p-4 pt-3 overflow-y-auto container2 h-full">
        {/* Header */}
        <div className="flex flex-row items-center justify-between mb-4 sticky top-0">
          <h2 className="text-xl font-bold text-white">Spodcast</h2>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="p-1.5 w-11 h-11 rounded-full cursor-pointer fill-[#adadad] hover:fill-white hover:bg-[#202020] transition-all" > <mask id="path-1-inside-1_4_354"> <path fillRule="evenodd" clipRule="evenodd" d="M5.5 12C5.5 12.8284 4.82843 13.5 4 13.5C3.17157 13.5 2.5 12.8284 2.5 12C2.5 11.1716 3.17157 10.5 4 10.5C4.82843 10.5 5.5 11.1716 5.5 12ZM13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12ZM20 13.5C20.8284 13.5 21.5 12.8284 21.5 12C21.5 11.1716 20.8284 10.5 20 10.5C19.1716 10.5 18.5 11.1716 18.5 12C18.5 12.8284 19.1716 13.5 20 13.5Z" /> </mask> <path fillRule="evenodd" clipRule="evenodd" d="M5.5 12C5.5 12.8284 4.82843 13.5 4 13.5C3.17157 13.5 2.5 12.8284 2.5 12C2.5 11.1716 3.17157 10.5 4 10.5C4.82843 10.5 5.5 11.1716 5.5 12ZM13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12ZM20 13.5C20.8284 13.5 21.5 12.8284 21.5 12C21.5 11.1716 20.8284 10.5 20 10.5C19.1716 10.5 18.5 11.1716 18.5 12C18.5 12.8284 19.1716 13.5 20 13.5Z" /> <path d="M4 14.5C5.38071 14.5 6.5 13.3807 6.5 12H4.5C4.5 12.2761 4.27614 12.5 4 12.5V14.5ZM1.5 12C1.5 13.3807 2.61929 14.5 4 14.5V12.5C3.72386 12.5 3.5 12.2761 3.5 12H1.5ZM4 9.5C2.61929 9.5 1.5 10.6193 1.5 12H3.5C3.5 11.7239 3.72386 11.5 4 11.5V9.5ZM6.5 12C6.5 10.6193 5.38071 9.5 4 9.5V11.5C4.27614 11.5 4.5 11.7239 4.5 12H6.5ZM12 14.5C13.3807 14.5 14.5 13.3807 14.5 12H12.5C12.5 12.2761 12.2761 12.5 12 12.5V14.5ZM9.5 12C9.5 13.3807 10.6193 14.5 12 14.5V12.5C11.7239 12.5 11.5 12.2761 11.5 12H9.5ZM12 9.5C10.6193 9.5 9.5 10.6193 9.5 12H11.5C11.5 11.7239 11.7239 11.5 12 11.5V9.5ZM14.5 12C14.5 10.6193 13.3807 9.5 12 9.5V11.5C12.2761 11.5 12.5 11.7239 12.5 12H14.5ZM20.5 12C20.5 12.2761 20.2761 12.5 20 12.5V14.5C21.3807 14.5 22.5 13.3807 22.5 12H20.5ZM20 11.5C20.2761 11.5 20.5 11.7239 20.5 12H22.5C22.5 10.6193 21.3807 9.5 20 9.5V11.5ZM19.5 12C19.5 11.7239 19.7239 11.5 20 11.5V9.5C18.6193 9.5 17.5 10.6193 17.5 12H19.5ZM20 12.5C19.7239 12.5 19.5 12.2761 19.5 12H17.5C17.5 13.3807 18.6193 14.5 20 14.5V12.5Z" mask="url(#path-1-inside-1_4_354)" /> </svg>
        </div>

        <AnimatePresence mode="wait">
          {currentSong && (
            <motion.div
              key={currentSong.id} // ✅ triggers ONLY when song changes
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6 mt-[58vh] flex items-center max-mt-[1000px]"
            >

              {/* LEFT SIDE */}
              <div className="flex flex-col flex-1 min-w-0 pr-3">
                <h3
                  className="text-2xl font-black text-white truncate cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/${currentSong.type}/${currentSong.id}`);
                  }}
                >
                  {currentSong.name}
                </h3>

                <p className="font-semibold text-md text-gray-300 line-clamp-2 truncate">
                  {currentSong.artists.primary.map((a, i) => (
                    <span key={a.id || i}>
                      <a
                        className="hover:underline hover:text-white cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/artist/${a.id}`);
                        }}
                      >
                        {a.name}
                      </a>
                      {i < currentSong.artists.primary.length - 1 && ", "}
                    </span>
                  ))}
                </p>
              </div>

              {/* RIGHT SIDE (UNCHANGED) */}
              <div className="flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(currentSong);
                  }}
                  className="flex items-center justify-center w-10 h-10 cursor-pointer"
                >
                  <img
                    src={liked ? Unlike : Like}
                    alt="Like"
                    className={`w-6 h-6 object-contain transition-transform duration-200 
            ${liked ? "scale-110" : "scale-100"}`}
                  />
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {currentSong && (
            <motion.div
              key={currentSong.id} // ✅ only animate on song change
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="bg-[#181818]/80 backdrop-blur-lg text-white rounded-xl shadow-lg hover:bg-[#202020]/90 transition-all duration-300 overflow-hidden"
            >

              {/* 🎵 IMAGE WITH OVERLAY */}
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={currentSong.artists.primary[0]?.image?.[2]?.url}
                  alt="Artist"
                  className="w-full h-full object-cover"
                />

                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                {/* Artist name on image (modern touch) */}
                <div className="absolute bottom-3 left-3">
                  <h2 className="text-lg font-bold drop-shadow-md">
                    {currentSong.artists.primary[0].name}
                  </h2>
                </div>
              </div>

              {/* 📄 CONTENT */}
              <div className="p-3 px-4">
                <p className="text-[#b3b3b3] text-xs font-semibold uppercase tracking-wide mb-2">
                  About the artist
                </p>

                <div className="flex items-center justify-between">
                  {/* Artist name (secondary placement) */}
                  <h3 className="text-base font-semibold truncate">
                    {currentSong.artists.primary[0].name}
                  </h3>

                  {/* FOLLOW BUTTON */}
                  <button className="border border-[#b3b3b3] text-white text-xs px-4 py-1.5 rounded-full hover:border-white hover:bg-white hover:text-black transition-all duration-300">
                    Follow
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>

  );
}
