import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Vibrant } from "node-vibrant/browser";
import { X, Video } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

export default function FullScreenPlayer({ isOpen, onClose, song }) {
  const containerRef = useRef(null);
  const [bg, setBg] = useState("");
  const [prevBg, setPrevBg] = useState("");
  const imageRef = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);
  const { canvasUrl, isPlaying } = useAudio();

  useEffect(() => {
    if (song) {
      setShowVideo(false); // Every new song starts with Artwork
    }
  }, [song?.id]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const el = containerRef.current;
      el.requestFullscreen?.();
    }
  }, [isOpen]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !showVideo) return;

    if (isPlaying) {
      video.play().catch(() => { });
    } else {
      video.pause();
    }
  }, [isPlaying, showVideo, canvasUrl]);


  useEffect(() => {
    let timer;

    const handleMove = () => {
      setShowControls(true);

      clearTimeout(timer);

      timer = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    };

    window.addEventListener("mousemove", handleMove);

    handleMove();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  useEffect(() => {
    const handle = () => {
      if (!document.fullscreenElement) onClose();
    };
    document.addEventListener("fullscreenchange", handle);
    return () => document.removeEventListener("fullscreenchange", handle);
  }, []);

  useEffect(() => {
    if (!song) return;

    const extract = async () => {
      try {
        const palette = await Vibrant.from(song.image?.[2]?.url).getPalette();

        const swatch =
          palette.DarkVibrant || palette.Muted || palette.DarkMuted;

        if (!swatch) return;

        const [r, g, b] = swatch.rgb;

        const gradient = `
          linear-gradient(
            180deg,
            rgba(${r + 20}, ${g + 20}, ${b + 20}, 0.95) 0%,
            rgba(${r}, ${g}, ${b}, 0.9) 50%,
            rgba(${r}, ${g}, ${b}, 0.5) 100%
          )
        `;

        setPrevBg(bg);     // keep old bg
        setBg(gradient);   // set new bg
      } catch (e) {
        console.log(e);
      }
    };

    extract();
  }, [song]);

  const handleClose = () => {
    document.exitFullscreen?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          {/* 🔥 BACKGROUND CROSSFADE */}
          <div className="absolute inset-0">
            <motion.div
              key={prevBg}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1 }}
              style={{ background: prevBg }}
              className="absolute inset-0"
            />

            <motion.div
              key={bg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              style={{ background: bg }}
              className="absolute inset-0"
            />
          </div>

          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-7 right-7 z-50 flex items-start gap-7"
              >
                {showControls && (
                  <>
                    {/* Artwork - only if a song exists */}
                    {song && (
                      <button
                        onClick={() => setShowVideo(false)}
                        className="flex flex-col items-center cursor-pointer"
                      >
                        {showVideo ? (
                          <svg
                            viewBox="0 0 16 16"
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <circle cx="8" cy="8" r="7" />
                            <circle cx="8" cy="8" r="2" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 16 16"
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                          >
                            <path d="M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                          </svg>
                        )}

                        <span
                          className={`mt-2 h-[4px] w-[4px] rounded-full bg-white transition-opacity ${showVideo ? "opacity-0" : "opacity-100"
                            }`}
                        />
                      </button>
                    )}

                    {/* Canvas - only if canvasUrl exists */}
                    {canvasUrl && (
                      <button
                        onClick={() => setShowVideo(true)}
                        className="flex flex-col items-center cursor-pointer"
                      >
                        {showVideo ? (
                          <svg
                            viewBox="0 0 16 16"
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                          >
                            <path d="M14.49.513c.328.328.512.773.512 1.237v12.5a1.75 1.75 0 0 1-1.75 1.75h-10.5a1.75 1.75 0 0 1-1.75-1.75V1.75A1.75 1.75 0 0 1 2.752 0h10.5c.464 0 .91.184 1.237.513ZM6 5v6l5.196-3z" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 16 16"
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                          >
                            <path d="M11.196 8 6 5v6z" />
                            <path d="M15.002 1.75A1.75 1.75 0 0 0 13.252 0h-10.5a1.75 1.75 0 0 0-1.75 1.75v12.5c0 .966.783 1.75 1.75 1.75h10.5a1.75 1.75 0 0 0 1.75-1.75zm-1.75-.25a.25.25 0 0 1 .25.25v12.5a.25.25 0 0 1-.25.25h-10.5a.25.25 0 0 1-.25-.25V1.75a.25.25 0 0 1 .25-.25z" />
                          </svg>
                        )}

                        <span
                          className={`mt-2 h-[4px] w-[4px] rounded-full bg-white transition-opacity ${showVideo ? "opacity-100" : "opacity-0"
                            }`}
                        />
                      </button>
                    )}
                  </>
                )}

                {/* Close */}
                <button
                  onClick={handleClose}
                  className="cursor-pointer pt-[1px]"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {showVideo ? (
              <motion.video
                key={song?.id + "-video"}
                ref={videoRef}
                src={canvasUrl}
                autoPlay
                playsInline
                loop
                controls={false}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="w-[22vw] max-w-6xl rounded-xl shadow-2xl z-10"
              />
            ) : (
              <motion.img
                key={song?.id + "-image"}
                src={song.image?.[2]?.url}
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-100 h-100 rounded-xl shadow-2xl object-cover z-10"
                draggable={false}
              />
            )}
          </AnimatePresence>

          {/* 🔥 TEXT ANIMATION */}
          <AnimatePresence mode="wait">
            <motion.div
              key={song?.id + "-text"}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-10 left-10 z-10"
            >
              <h2 className="text-white text-2xl font-semibold">
                {song.name}
              </h2>

              <p className="text-gray-300 text-sm">
                {song.artists?.primary?.map((a) => a.name).join(", ")}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}