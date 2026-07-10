import { useRef, useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useRecent } from "@/context/RecentContext";
import ConfirmModal from "@/components/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";


export default function ScrollContainer({
  title,
  children,
  icons = true,
  direction = "row",
  clear = false,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const { clearRecent } = useRecent();

  const handleClearAll = async () => {
    await clearRecent();
    setShowClearModal(false);
  };


  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;

    if (direction === "row") {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    } else {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setCanScrollLeft(scrollTop > 2);
      setCanScrollRight(scrollTop + clientHeight < scrollHeight - 2);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [children, direction]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === "row" ? el.clientWidth / 1.5 : el.clientHeight / 1.5;

    el.scrollBy({
      left: direction === "row" ? (dir === "left" ? -amount : amount) : 0,
      top: direction === "col" ? (dir === "left" ? -amount : amount) : 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative p-1 pt-6">
      <div className="flex items-center justify-between mb-2">
        {title && <h2 className="text-2xl font-bold mb-3 pl-6">{title}</h2>}
        {clear && <h2 onClick={() => setShowClearModal(true)} className="text-[13px] hover:underline cursor-pointer font-semibold mr-4 text-[#A0A0B2] pl-6">Clear All</h2>}
      </div>

      <div className="relative group">
        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className={`flex ${direction === "row" ? "flex-row overflow-x-auto" : "flex-col overflow-y-auto"
            } scroll-smooth scrollbar-hide no-scrollbar pl-4 `}
        >
          {Array.isArray(children)
            ? children.map((child, i) => (
              <div key={i} className="snap-start flex-shrink-0">
                {child}
              </div>
            ))
            : children}
        </div>

        {/* Left Scroll Button */}
        <AnimatePresence>
          {icons && direction === "row" && canScrollLeft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-y-0 left-0 hidden min-[800px]:flex items-center pointer-events-none"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55 }}
                className="absolute left-0 top-0 h-full w-22 bg-gradient-to-r from-[#12121A] to-transparent -ml-1"
              />

              <motion.button
                onClick={() => scroll("left")}
                initial={{ x: -15, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -15, opacity: 0, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 25,
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="pointer-events-auto relative z-10 bg-[#1D1D2F]/50 p-2 rounded-full hover:bg-[#1D1D2F] ml-3 shadow-md"
              >
                <ChevronLeftIcon className="h-6 w-6 text-white" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Scroll Button */}
        <AnimatePresence>
          {icons && direction === "row" && canScrollRight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-y-0 right-0 hidden min-[800px]:flex items-center justify-end pointer-events-none"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55 }}
                className="absolute right-0 top-0 h-full w-22 bg-gradient-to-l from-[#12121A] to-transparent -mr-1"
              />

              <motion.button
                onClick={() => scroll("right")}
                initial={{ x: 15, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: 15, opacity: 0, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 28,
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="pointer-events-auto relative z-10 bg-[#1D1D2F]/50 p-2 rounded-full hover:bg-[#1D1D2F] mr-3 shadow-md"
              >
                <ChevronRightIcon className="h-6 w-6 text-white" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <ConfirmModal
          open={showClearModal}
          title="Clear recent history?"
          description="Are you sure you want to clear your recently played items?"
          confirmText="Clear"
          cancelText="Cancel"
          onCancel={() => setShowClearModal(false)}
          onConfirm={handleClearAll}
        />
      </div>
    </div>
  );
}
