import { useState, useEffect } from "react";

const LibrarySidebar = () => {
  const [collapsed, setCollapsed] = useState(false); // manual control
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  

  const artists = [
    "Karan Aujla",
    "Shree Ram songs",
    "Navaan Sandhu",
    "Sidhu Moose Wala",
  ];

  // 📱 Detect screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🧠 Final state (auto OR manual)
  const finalCollapsed = isMobile || collapsed;

  const [showContent, setShowContent] = useState(!finalCollapsed);

useEffect(() => {
  if (!finalCollapsed) {
    setTimeout(() => setShowContent(true), 150);
  } else {
    setShowContent(false);
  }
}, [finalCollapsed]);

  return (
    <aside
      className={`bg-[#12121A] p-3 md:p-3 overflow-y-auto mr-2 rounded-md
      transition-all duration-300 ease-in-out
      ${finalCollapsed ? "w-20" : "w-72"}`}
    >
      {/* 🔘 Header */}
      <div className="flex justify-between items-center mb-4 px-2 py-1">
       {showContent && !finalCollapsed && (
          <h2 onClick={() => setCollapsed(!collapsed)} className="text-lg font-semibold cursor-pointer">Your Library</h2>
        )}

        {/* hide toggle on mobile (optional) */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`text-white text-sm bg-[#222231] ${finalCollapsed ? "ml-2" : ""}  px-1 py-1 rounded hover:bg-[#2b2b3e] font-bold`}
          >
            {finalCollapsed ?
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>

              </>
              :

              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>

              </>
            }


          </button>
        )}
      </div>

      {/* 🎵 Filters */}
      {showContent && !finalCollapsed && (
        <div className="flex gap-2 mb-4">
          <button className="bg-[#222231] px-3 py-1 rounded-full text-sm hover:bg-[#2b2b3e]">
            Playlists
          </button>
          <button className="bg-[#222231] px-3 py-1 rounded-full text-sm hover:bg-[#2b2b3e]">
            Artists
          </button>
        </div>
      )}

      {/* 🎧 Artist List */}
      <ul className="space-y-3">
        {artists.map((artist, index) => (
          <li
            key={index}
            className={`flex items-center
            ${finalCollapsed ? "justify-center" : "justify-start"}
            gap-3 p-2 rounded cursor-pointer
            hover:bg-[rgba(124,77,255,0.1)] transition`}
          >
            {/* 🎨 Image */}
            <div className="w-10 h-10 bg-[#C09AE3] rounded-full flex-shrink-0"></div>

            {/* 📝 Text */}
            {showContent && !finalCollapsed && (
              <div>
                <p className="font-medium text-sm">{artist}</p>
                <p className="text-xs text-[#A0A0B2]">Artist</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default LibrarySidebar;