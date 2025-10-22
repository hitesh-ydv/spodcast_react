import { useRef, useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

export default function ScrollContainer({
  title,
  children,
  icons = true,
  direction = "row", // 👈 NEW PROP — "row" (default) or "col"
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
    <div className="relative p-6">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}

      <div className="relative group">
        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className={`flex ${
            direction === "row" ? "flex-row overflow-x-auto" : "flex-col overflow-y-auto"
          } scroll-smooth scrollbar-hide no-scrollbar -mx-2`}
        >
          {Array.isArray(children)
            ? children.map((child, i) => (
                <div key={i} className="snap-start flex-shrink-0">
                  {child}
                </div>
              ))
            : children}
        </div>

        {/* Conditionally render gradients + icons */}
        {icons && direction === "row" && canScrollLeft && (
          <div className="absolute inset-y-0 left-0 -mx-2 flex items-center pointer-events-none">
            <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#121212] to-transparent" />
            <button
              onClick={() => scroll("left")}
              className="pointer-events-auto relative z-10 bg-[#1f1f1f]/80 p-2 rounded-full hover:bg-[#2a2a2a] ml-3 shadow-md transition-all"
            >
              <ChevronLeftIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        )}

        {icons && direction === "row" && canScrollRight && (
          <div className="absolute inset-y-0 right-0 -mx-2 flex items-center justify-end pointer-events-none">
            <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#121212] to-transparent" />
            <button
              onClick={() => scroll("right")}
              className="pointer-events-auto relative z-10 bg-[#1f1f1f]/80 p-2 rounded-full hover:bg-[#2a2a2a] mr-3 shadow-md transition-all"
            >
              <ChevronRightIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
