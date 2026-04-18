import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Vibrant } from "node-vibrant/browser";

export default function FullScreenPlayer({ isOpen, onClose, song }) {
  const containerRef = useRef(null);
  const [bg, setBg] = useState("");
  const [prevBg, setPrevBg] = useState("");
  const imageRef = useRef(null);

  // 👉 FULLSCREEN
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const el = containerRef.current;
      el.requestFullscreen?.();
    }
  }, [isOpen]);

  // 👉 ESC CLOSE
  useEffect(() => {
    const handle = () => {
      if (!document.fullscreenElement) onClose();
    };
    document.addEventListener("fullscreenchange", handle);
    return () => document.removeEventListener("fullscreenchange", handle);
  }, []);

  // 👉 COLOR EXTRACTION ON SONG CHANGE
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

  // 👉 CLOSE
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

          {/* CLOSE */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 z-50 cursor-pointer"
          >
            <X className="text-white" />
          </button>

          {/* 🔥 IMAGE ANIMATION ON SONG CHANGE */}
          <AnimatePresence mode="wait">
            <motion.img
              key={song?.id} // 🔥 important
              src={song.image?.[2]?.url}
              ref={imageRef}
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-96 h-96 rounded-xl shadow-2xl object-cover z-10"
              draggable={false}
            />
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