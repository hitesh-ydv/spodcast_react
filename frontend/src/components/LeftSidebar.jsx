import { useState, useEffect } from "react";
import { useLibrary } from "../context/LibraryContext";
import { LazyLoadImage } from "@tjoskar/react-lazyload-img";
import LoadImage from "../assets/afterload.png";
import fallbackImg from "../assets/playlist_cover.jpg";
import { useNavigate } from "react-router-dom";
import { TextWrap } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { motion } from "framer-motion";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const LibrarySidebar = () => {
  const {
    likedSongs,
    loadingLikes,
    library,
    loadingLibrary,
    toggleLibrary,
  } = useLibrary();
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

  const getItems = () => {
    let items = [...library];

    // Filter
    if (filter) {
      const map = {
        artists: "artist",
        albums: "album",
        playlists: "playlist",
      };

      items = items.filter(
        (item) => item.itemType === map[filter]
      );
    }

    // Search
    if (search) {
      items = items.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    if (sort === "az") {
      items.sort((a, b) => a.title.localeCompare(b.title));
    }

    return items;
  };

  const items = getItems();

  return (
    <aside
      className={`bg-[#12121A] p-1 rounded-md transition-all duration-300 mr-2 pl-2 flex flex-col h-full 
  ${finalCollapsed ? "w-20" : "w-72 [@media(min-height:1000px)]:w-100"}`}
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

      <div className="flex gap-3 items-center">
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

        {!finalCollapsed && (
          <Menu as="div" className="mb-3">

            {/* 🔘 BUTTON (same look as your old one) */}
            <MenuButton
              className="w-full flex items-center gap-2 px-3 py-2.5 
                 bg-[#1d1d2f] rounded text-sm 
                 hover:bg-[#2a2a40] transition-all"
            >
              <TextWrap strokeWidth={2.5} size={16} />
            </MenuButton>

            {/* 📂 DROPDOWN */}
            <MenuItems
              anchor="bottom start"
              className="w-32 gap-1 flex flex-col mt-2 origin-top rounded-md border border-white/10 
                 bg-[#282828] p-2 text-sm text-white shadow-lg border-none outline-none
                 transition duration-100 ease-out 
                 data-[closed]:scale-95 data-[closed]:opacity-0"
            >

              <MenuItem>
                <button
                  onClick={() => setSort("recent")}
                  className={`w-full text-left px-3 py-2 rounded 
            ${sort === "recent" ? "bg-white/10 text-white" : "text-gray-300"} 
            hover:bg-white/10`}
                >
                  Recent
                </button>
              </MenuItem>

              <MenuItem>
                <button
                  onClick={() => setSort("az")}
                  className={`w-full text-left px-3 py-2 rounded 
            ${sort === "az" ? "bg-white/10 text-white" : "text-gray-300"} 
            hover:bg-white/10`}
                >
                  A–Z
                </button>
              </MenuItem>

            </MenuItems>
          </Menu>
        )}

      </div>

      {/* ❤️ LIKED SONGS */}
      {loadingLikes ? (
        <div className="mb-2 px-1">
          <div className="flex items-center gap-3 p-2">
            {/* Cover */}
            <div className="w-12 h-12 rounded bg-[#1d1d2f] animate-pulse" />

            {!finalCollapsed && (
              <div className="flex-1">
                <div className="h-4 w-28 rounded-full bg-[#1d1d2f] animate-pulse mb-2" />
                <div className="h-3 w-16 rounded-full bg-[#1d1d2f] animate-pulse" />
              </div>
            )}
          </div>
        </div>
      ) : likedSongs.length > 0 && (
        <div className="mb-1" onClick={() => navigate("/liked")}>
          <div className="flex items-center gap-3 p-2 rounded hover:bg-[#1d1d2f] cursor-pointer">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded flex items-center justify-center text-white font-bold">
                ♥
              </div>
            </motion.div>

            {!finalCollapsed && (
              <div>
                <p className="text-sm font-medium">Liked Songs</p>
                <p className="text-sm text-[#A0A0B2]">
                  {likedSongs.length} songs
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIBRARY */}
      {loadingLibrary ? (
        <ul className="space-y-1 mt-0">
          {[...Array(8)].map((_, i) => (
            <li
              key={i}
              className={`flex items-center ${finalCollapsed ? "justify-center" : "gap-3"
                } p-2`}
            >
              {/* Image */}
              <div
                className={`w-12 h-12 ${i % 3 === 0 ? "rounded-full" : "rounded"
                  } bg-[#1d1d2f] animate-pulse`}
              />

              {!finalCollapsed && (
                <div className="flex-1">
                  <div className="h-4 w-3/4 rounded-full bg-[#1d1d2f] animate-pulse mb-2" />
                  <div className="h-3 w-20 rounded-full bg-[#1d1d2f] animate-pulse" />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        items.length > 0 && (
          <ul className="space-y-0">
            {items.map((item) => (
              <>
                <ContextMenu key={item.id}>
                  <ContextMenuTrigger>
                    <li
                      key={item.itemId}
                      onClick={() =>
                        navigate(`/${item.itemType}/${item.itemId}`)
                      }
                      className={`flex items-center ${finalCollapsed ? "justify-center" : "gap-3"
                        } p-2 rounded hover:bg-[#1d1d2f] cursor-pointer`}
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                      >
                        <LazyLoadImage
                          defaultImage={LoadImage}
                          image={item.image || fallbackImg}
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                          className={`w-12 h-12 ${item.itemType === "artist"
                            ? "rounded-full"
                            : "rounded"
                            }`}
                        />
                      </motion.div>

                      {!finalCollapsed && (
                        <div>
                          <p className="text-sm font-medium line-clamp-1 hover:underline">
                            {item.title}
                          </p>
                          <p className="text-sm text-[#A0A0B2] capitalize">
                            {item.itemType}
                          </p>
                        </div>
                      )}
                    </li>
                  </ContextMenuTrigger>

                  <ContextMenuContent className="w-56 bg-[#12121A] border border-white/10 text-white p-2 rounded-sm">
                    <ContextMenuItem className="focus:bg-[#f4000024] text-red-600 focus:text-red-600 rounded-sm p-2 font-semibold">
                      <button onClick={() => toggleLibrary(item, item.itemType || item.item_type || item.type)}>
                        Remove from Recent
                      </button>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </>
            ))}
          </ul>
        )
      )}
    </aside>
  );
};

export default LibrarySidebar;