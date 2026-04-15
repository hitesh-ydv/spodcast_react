import { createContext, useContext, useEffect, useState } from "react";

const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
  const [library, setLibrary] = useState({
    likedSongs: [],
    artists: [],
    albums: [],
    playlists: [],
  });

  // ✅ LOAD + FIX OLD DATA
  useEffect(() => {
    const stored = localStorage.getItem("library");

    if (stored) {
      const parsed = JSON.parse(stored);

      // 🔥 Fix nested arrays issue (VERY IMPORTANT)
      const fixedLiked = (parsed.likedSongs || []).flat();

      setLibrary({
        likedSongs: fixedLiked,
        artists: parsed.artists || [],
        albums: parsed.albums || [],
        playlists: parsed.playlists || [],
      });
    }
  }, []);

  // ✅ SAVE
  useEffect(() => {
    localStorage.setItem("library", JSON.stringify(library));
  }, [library]);

  // ❤️ TOGGLE LIKE (BEST PRACTICE)
  const toggleLike = (song) => {
    const newSong = Array.isArray(song) ? song[0] : song;

    setLibrary((prev) => {
      const exists = prev.likedSongs.some((s) => s.id === newSong.id);

      return {
        ...prev,
        likedSongs: exists
          ? prev.likedSongs.filter((s) => s.id !== newSong.id) // ❌ remove
          : [newSong, ...prev.likedSongs], // ✅ add
      };
    });
  };

  // ❤️ OPTIONAL: ONLY ADD (if you still want separate)
  const addToLiked = (song) => {
    const newSong = Array.isArray(song) ? song[0] : song;

    setLibrary((prev) => {
      if (prev.likedSongs.some((s) => s.id === newSong.id)) return prev;

      return {
        ...prev,
        likedSongs: [newSong, ...prev.likedSongs],
      };
    });
  };

  // ❌ REMOVE LIKE
  const removeFromLiked = (id) => {
    setLibrary((prev) => ({
      ...prev,
      likedSongs: prev.likedSongs.filter((s) => s.id !== id),
    }));
  };

  // 🎤 Artist
  const addArtist = (artist) => {
    const newArtist = Array.isArray(artist) ? artist[0] : artist;

    setLibrary((prev) => {
      if (prev.artists.some((a) => a.id === newArtist.id)) return prev;

      return {
        ...prev,
        artists: [newArtist, ...prev.artists],
      };
    });
  };

  // 💿 Album
  const addAlbum = (album) => {
    const newAlbum = Array.isArray(album) ? album[0] : album;

    setLibrary((prev) => {
      if (prev.albums.some((a) => a.id === newAlbum.id)) return prev;

      return {
        ...prev,
        albums: [newAlbum, ...prev.albums],
      };
    });
  };

  // 📂 Playlist
  const addPlaylist = (playlist) => {
    const newPlaylist = Array.isArray(playlist) ? playlist[0] : playlist;

    setLibrary((prev) => {
      if (prev.playlists.some((p) => p.id === newPlaylist.id)) return prev;

      return {
        ...prev,
        playlists: [newPlaylist, ...prev.playlists],
      };
    });
  };

  return (
    <LibraryContext.Provider
      value={{
        library,
        toggleLike,
        addToLiked,
        removeFromLiked,
        addArtist,
        addAlbum,
        addPlaylist,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => useContext(LibraryContext);