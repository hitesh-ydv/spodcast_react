import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
  const [library, setLibrary] = useState({
    likedSongs: [],
    artists: [],
    albums: [],
    playlists: [],
  });

  // ✅ LOAD
  useEffect(() => {
    const stored = localStorage.getItem("library");

    if (stored) {
      const parsed = JSON.parse(stored);

      setLibrary({
        likedSongs: (parsed.likedSongs || []).flat(),
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

  // 🚀 FAST LOOKUP (IMPORTANT)
  const likedSet = useMemo(() => {
    return new Set(library.likedSongs.map((s) => s.id));
  }, [library.likedSongs]);

  // ✅ CHECK FUNCTION (GLOBAL USE)
  const isLiked = (id) => likedSet.has(id);

  // ❤️ TOGGLE LIKE (CLEAN)
  const toggleLike = (song) => {
    const newSong = Array.isArray(song) ? song[0] : song;

    setLibrary((prev) => {
      const exists = prev.likedSongs.some((s) => s.id === newSong.id);

      return {
        ...prev,
        likedSongs: exists
          ? prev.likedSongs.filter((s) => s.id !== newSong.id)
          : [newSong, ...prev.likedSongs],
      };
    });
  };

  // ❌ REMOVE
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
        removeFromLiked,
        isLiked, // 🔥 IMPORTANT
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