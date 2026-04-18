import { useState, useEffect } from "react";
import { useLibrary } from "../context/LibraryContext";
import { LazyLoadImage } from "@tjoskar/react-lazyload-img";
import LoadImage from "../assets/afterload.png";
import fallbackImg from "../assets/playlist_cover.jpg";
import { useNavigate } from "react-router-dom";

const LibrarySidebar = () => {
  const { library } = useLibrary();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1100);

  const [filter, setFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");

  // responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1100);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const finalCollapsed = isMobile || collapsed;

  // 🔁 toggle filter
  const handleFilterClick = (type) => {
    setFilter((prev) => (prev === type ? null : type));
  };

  // 🎯 FILTER LOGIC
  const getItems = () => {
    let items = [];

    // ✅ no filter = show all
    if (!filter || filter === "artists") {
      items.push(
        ...library.artists.map((a) => ({ ...a, type: "artist" }))
      );
    }

    if (!filter || filter === "albums") {
      items.push(
        ...library.albums.map((a) => ({ ...a, type: "album" }))
      );
    }

    if (!filter || filter === "playlists") {
      items.push(
        ...library.playlists.map((p) => ({ ...p, type: "playlist" }))
      );
    }

    // 🔍 search
    if (search) {
      items = items.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 🔃 sort
    if (sort === "az") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return items;
  };

  const items = getItems();

  return (
    <aside
      className={`bg-[#12121A] p-2 rounded-md transition-all duration-300 mr-2 flex flex-col h-full
  ${finalCollapsed ? "w-20" : "w-72"}`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 px-2">
        {!finalCollapsed && (
          <h2 className="text-lg font-semibold">Your Library</h2>
        )}

        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="bg-[#222231] px-2 py-1 rounded font-bold ml-2 mt-2"
          >
            {finalCollapsed ? ">" : "<"}
          </button>
        )}
      </div>

      {/* FILTERS */}
      {!finalCollapsed && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {["artists", "albums", "playlists"].map((f) => (
            <button
              key={f}
              onClick={() => handleFilterClick(f)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${filter === f
                ? "bg-white text-black"
                : "bg-[#222231] hover:bg-[#2b2b3e]"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* SEARCH */}
      {!finalCollapsed && (
        <input
          type="text"
          placeholder="Search in library"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-[#1d1d2f] text-sm outline-none"
        />
      )}

      {/* SORT */}
      {!finalCollapsed && (
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full mb-3 px-2 py-2 bg-[#1d1d2f] rounded text-sm"
        >
          <option value="recent">Recent</option>
          <option value="az">A–Z</option>
        </select>
      )}

        <>
          {/* ✅ SCROLLABLE AREA */}
          <div className="flex-1 overflow-y-auto pr-1">
            {/* ❤️ LIKED SONGS */}
            {library.likedSongs.length > 0 && (
              <div className="mb-1" onClick={() => navigate("/liked")}>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-[#1d1d2f] cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded flex items-center justify-center text-white font-bold">
                    ♥
                  </div>

                  {!finalCollapsed && (
                    <div>
                      <p className="text-sm font-medium">Liked Songs</p>
                      <p className="text-sm font-medium text-[#A0A0B2]">
                        {library.likedSongs.length} songs
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LIST */}
            <ul className="space-y-0">
              {items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => navigate(`/${item.type}/${item.id}`)}
                  className={`flex items-center ${finalCollapsed ? "justify-center" : "gap-3"
                    } p-2 rounded hover:bg-[#1d1d2f] cursor-pointer`}
                >
                  <LazyLoadImage
                    defaultImage={LoadImage}
                    image={item.image?.[2]?.url || fallbackImg}
                    className={`w-12 h-12 ${item.type === "artist" ? "rounded-full" : "rounded"
                      }`}
                  />

                  {!finalCollapsed && (
                    <div>
                      <p className="text-sm font-medium line-clamp-1 hover:underline">
                        {item.name}
                      </p>
                      <p className="text-sm font-medium text-[#A0A0B2] capitalize">
                        {item.type}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      

      {/* EMPTY */}
      {library.likedSongs.length === 0 &&
        items.length === 0 &&
        !finalCollapsed && (
          <div className="text-center mt-4 text-[#A0A0B2] text-sm">
            No items found 🎵
          </div>
        )}
    </aside>
  );
};

export default LibrarySidebar;