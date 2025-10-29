import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "../context/AudioContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RightSidebar() {
  const { currentSong, isPlaying } = useAudio();

  const navigate = useNavigate();

  // Static canvas video (Spotify style)
  const [canvasUrl, setCanvasUrl] = useState("");

  const songImage = currentSong?.image?.[2]?.url;
  const videoRef = useRef(null);

  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const clientId = "61469e91d2a84c7f9ad2bbe093042906";
  const clientSecret = "5f14c431be714b0e9de2adedd86af848";
  const authString = btoa(`${clientId}:${clientSecret}`);


  const getSpotifyToken = async () => {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await res.json();
    return data.access_token;
  };

  const searchSong = async (songName, token) => {
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(songName)}&type=track&limit=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    return data.tracks.items[0]?.id;
  };

  const getCanvasUrl = async (trackId) => {
    const res = await fetch(`https://api.paxsenix.org/spotify/canvas?id=${trackId}`);
    const data = await res.json();
    console.log(data)
    return data.data.canvasesList?.[0]?.canvasUrl;
  };


  useEffect(() => {
    setCanvasUrl(""); // reset first

    const fetchCanvas = async () => {
      try {
        // 1️⃣ Get token
        const token = await getSpotifyToken();

        // 2️⃣ Search track ID
        const trackId = await searchSong(`${currentSong.name} ${currentSong.artists.primary[0].name}`, token);
        if (!trackId) return;

        // 3️⃣ Fetch canvas URL
        const url = await getCanvasUrl(trackId);
        console.log(url);

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
    <aside className="right-section relative w-77 bg-[#121212] rounded-md ml-2 overflow-hidden">
      {/* ===== Background Layer (fixed height 500px) ===== */}
      <div className="absolute top-0 left-0 right-0 h-[500px] rounded-md overflow-hidden z-10">
        {/* Background image */}
        {songImage && (
          <img
            src={songImage}
            alt={currentSong?.name || "Song artwork"}
            className={`w-full h-full object-cover transition-opacity duration-700 ${canvasUrl ? "opacity-0" : "opacity-100"
              }`}
          />
        )}

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

        <div className="absolute inset-0 bg-gradient-to-b from-transparentt via-transparent to-[#121212]" />

        {/* Scroll depth overlay — darkens progressively */}
        <motion.div
          className="absolute inset-0 bg-[#121212]"
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="p-1.5 w-11 h-11 rounded-full cursor-pointer fill-[#adadad] hover:fill-white hover:bg-[#202020] transition-all" > <mask id="path-1-inside-1_4_354"> <path fillRule="evenodd" clipRule="evenodd" d="M5.5 12C5.5 12.8284 4.82843 13.5 4 13.5C3.17157 13.5 2.5 12.8284 2.5 12C2.5 11.1716 3.17157 10.5 4 10.5C4.82843 10.5 5.5 11.1716 5.5 12ZM13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12ZM20 13.5C20.8284 13.5 21.5 12.8284 21.5 12C21.5 11.1716 20.8284 10.5 20 10.5C19.1716 10.5 18.5 11.1716 18.5 12C18.5 12.8284 19.1716 13.5 20 13.5Z" /> </mask> <path fillRule="evenodd" clipRule="evenodd" d="M5.5 12C5.5 12.8284 4.82843 13.5 4 13.5C3.17157 13.5 2.5 12.8284 2.5 12C2.5 11.1716 3.17157 10.5 4 10.5C4.82843 10.5 5.5 11.1716 5.5 12ZM13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12ZM20 13.5C20.8284 13.5 21.5 12.8284 21.5 12C21.5 11.1716 20.8284 10.5 20 10.5C19.1716 10.5 18.5 11.1716 18.5 12C18.5 12.8284 19.1716 13.5 20 13.5Z" /> <path d="M4 14.5C5.38071 14.5 6.5 13.3807 6.5 12H4.5C4.5 12.2761 4.27614 12.5 4 12.5V14.5ZM1.5 12C1.5 13.3807 2.61929 14.5 4 14.5V12.5C3.72386 12.5 3.5 12.2761 3.5 12H1.5ZM4 9.5C2.61929 9.5 1.5 10.6193 1.5 12H3.5C3.5 11.7239 3.72386 11.5 4 11.5V9.5ZM6.5 12C6.5 10.6193 5.38071 9.5 4 9.5V11.5C4.27614 11.5 4.5 11.7239 4.5 12H6.5ZM12 14.5C13.3807 14.5 14.5 13.3807 14.5 12H12.5C12.5 12.2761 12.2761 12.5 12 12.5V14.5ZM9.5 12C9.5 13.3807 10.6193 14.5 12 14.5V12.5C11.7239 12.5 11.5 12.2761 11.5 12H9.5ZM12 9.5C10.6193 9.5 9.5 10.6193 9.5 12H11.5C11.5 11.7239 11.7239 11.5 12 11.5V9.5ZM14.5 12C14.5 10.6193 13.3807 9.5 12 9.5V11.5C12.2761 11.5 12.5 11.7239 12.5 12H14.5ZM20.5 12C20.5 12.2761 20.2761 12.5 20 12.5V14.5C21.3807 14.5 22.5 13.3807 22.5 12H20.5ZM20 11.5C20.2761 11.5 20.5 11.7239 20.5 12H22.5C22.5 10.6193 21.3807 9.5 20 9.5V11.5ZM19.5 12C19.5 11.7239 19.7239 11.5 20 11.5V9.5C18.6193 9.5 17.5 10.6193 17.5 12H19.5ZM20 12.5C19.7239 12.5 19.5 12.2761 19.5 12H17.5C17.5 13.3807 18.6193 14.5 20 14.5V12.5Z" mask="url(#path-1-inside-1_4_354)" /> </svg>
        </div>

        {/* Song Info */}
        {currentSong && (
          <div className="mb-6 mt-[400px]"> {/* Push content below canvas */}
            <h3
              className="text-2xl font-black text-white truncate cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${currentSong.type}/${currentSong.id}`);
              }}
            >
              {currentSong.name}
            </h3>
            <p className="font-semibold text-md text-gray-300">
              {currentSong.artists.primary.map((a, i) => (
                <span key={a.id || i}>
                  <a
                    className="hover:underline hover:text-white cursor-pointer"
                    onClick={(e) => {
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
        )}

        {/* Artist Info Card */}
        {currentSong && (
          <div className="bg-[#181818]/90 text-white rounded-lg shadow-md hover:bg-[#202020]/90 transition-all duration-300">
            <div className=" overflow-hidden mb-3">
              <img
                src={currentSong.artists.primary[0]?.image[2]?.url}
                alt="Artist"
                className="w-full h-40 object-cover rounded-tr-lg rounded-tl-lg "
              />
            </div>

            <div className="p-1 px-3">
              <p className="text-[#b3b3b3] text-sm font-semibold mb-1">About the artist</p>
              <h2 className="text-xl font-bold leading-tight mb-4">
                {currentSong.artists.primary[0].name}
              </h2>

              <div className="flex flex-col gap-4 pb-3">
                <button className="border border-[#b3b3b3] text-white text-sm px-4 py-1 rounded-full hover:border-white hover:scale-105 transition-all duration-300">
                  Follow
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>

  );
}
