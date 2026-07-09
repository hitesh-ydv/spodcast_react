import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";

export default function DownloadModal({
  open,
  onClose,
  song,
  onDownload,
}) {
  const qualities = [
    { label: "48 kbps", index: 1 },
    { label: "96 kbps", index: 2 },
    { label: "160 kbps", index: 3 },
    { label: "320 kbps", index: 4 },
  ];

  const [fileName, setFileName] = useState("");
  const [quality, setQuality] = useState(4);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    if (!song) return;

    setFileName(song.name || "");

    const savedQuality = localStorage.getItem("download-quality");
    if (savedQuality) {
      setQuality(Number(savedQuality));
    }
  }, [song]);

  // Close with ESC
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleDownload = () => {
    if (remember) {
      localStorage.setItem("download-quality", quality);
    }

    onDownload({
      fileName: fileName.trim(),
      quality,
    });
  };

  return (
    <AnimatePresence>
      {open && song && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 30,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#18181f] shadow-[0_20px_60px_rgba(0,0,0,.5)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="text-lg font-semibold text-white">
                Download Song
              </h2>

              <motion.button
                whileHover={{
                  rotate: 90,
                  scale: 1.08,
                }}
                whileTap={{
                  scale: 0.92,
                }}
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Song */}
            <div className="flex items-center gap-4 px-6 py-5">
              <img
                src={song.image[2].url}
                alt={song.name}
                className="h-20 w-20 rounded-sm object-cover shadow-lg"
              />

              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-white">
                  {song.name}
                </h3>

                <p className="mt-1 truncate text-sm text-gray-400">
                  {song.artists?.primary
                    ?.map((artist) => artist.name)
                    .join(", ")}
                </p>
              </div>
            </div>

            {/* Filename */}
            <div className="px-6">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                File Name
              </label>

              <input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
                className="w-full rounded-xl border border-white/10 bg-[#23232d] px-4 py-3 text-white outline-none transition focus:border-violet-500"
              />
            </div>

            {/* Quality */}
            <div className="mt-6 px-6">
              <p className="mb-3 text-sm font-medium text-gray-300">
                Audio Quality
              </p>

              <div className="grid grid-cols-2 gap-3">
                {qualities.map((q) => {
                  const active = quality === q.index;

                  return (
                    <motion.button
                      key={q.index}
                      whileHover={{
                        scale: 1.03,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      onClick={() => setQuality(q.index)}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition
                        ${
                          active
                            ? "border-violet-500 bg-violet-500/20 text-white"
                            : "border-white/10 bg-[#23232d] text-gray-400 hover:border-white/20 hover:text-white"
                        }`}
                    >
                      {q.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Remember */}
            <div className="mt-6 px-6">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-violet-500"
                />

                Remember this quality
              </label>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 px-6 py-5">
              <motion.button
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={onClose}
                className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                <Download size={18} />
                Download
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}