import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Vibrant } from "node-vibrant/browser";

export default function FullScreenPlayer({ isOpen, onClose, song }) {
    const containerRef = useRef(null);
    const [backgroundColor, setBackgroundColor] = useState('');
    const imageRef2 = useRef(null);

    // 👉 ENTER FULLSCREEN
    useEffect(() => {
        if (isOpen && containerRef.current) {
            const el = containerRef.current;

            if (el.requestFullscreen) el.requestFullscreen();
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); // Safari
            else if (el.msRequestFullscreen) el.msRequestFullscreen(); // IE
        }
    }, [isOpen]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            // If user exited fullscreen (ESC or browser UI)
            if (!document.fullscreenElement) {
                onClose();
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    const extractColorFromImage = async () => {
        if (!imageRef2.current) return;

        try {
            const palette = await Vibrant
                .from(imageRef2.current.src)
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
      rgba(${r}, ${g}, ${b}, 0.9) 50%,
      rgba(${r}, ${g}, ${b}, 0.5) 100%
    )
  `;

            setBackgroundColor(gradient);

        } catch (err) {
            console.error("Vibrant error:", err);
        }
    };


    // 👉 EXIT FULLSCREEN
    const handleClose = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
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
                    style={{
                        background: backgroundColor,
                        userSelect: "none",
                        WebkitUserSelect: "none",
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center"
                >
                    {/* CLOSE BUTTON */}
                    <button
                        onClick={handleClose}
                        className="absolute top-5 right-5 cursor-pointer p-2"
                    >
                        <X
                            strokeWidth={3}
                            size={24}
                            className="text-gray-300 hover:text-white transition-all 
               drop-shadow-[0_0_6px_rgba(0,0,0,1)]"
                        />
                    </button>

                    {/* CENTER IMAGE */}
                    <div className="flex flex-col items-center justify-center">
                        <img
                            src={song.image?.[2]?.url}
                            alt="cover"
                            className="w-100 h-100 object-cover rounded-xl shadow-2xl"
                            ref={imageRef2}
                            onLoad={extractColorFromImage}
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                        />
                    </div>

                    {/* LEFT BOTTOM INFO */}
                    <div className="absolute bottom-10 left-10">
                        <h2 className="text-white text-xl font-semibold">
                            {song.name?.replace(/&quot;/g, '"')}
                        </h2>
                        <p className="text-[#A0A0B2] text-sm">
                            {song.artists?.primary?.map((a, i) => (
                                <span key={a.id || i}>
                                    {a.name}
                                    {i < song.artists.primary.length - 1 && ", "}
                                </span>
                            ))}
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}