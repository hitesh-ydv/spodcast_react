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


// 🎤 TOGGLE ARTIST
const toggleArtist = (artist) => {
  const newArtist = Array.isArray(artist) ? artist[0] : artist;

  setLibrary((prev) => {
    const exists = prev.artists.some((a) => a.id === newArtist.id);

    return {
      ...prev,
      artists: exists
        ? prev.artists.filter((a) => a.id !== newArtist.id)
        : [newArtist, ...prev.artists],
    };
  });
};

// 💿 TOGGLE ALBUM
const toggleAlbum = (album) => {
  const newAlbum = Array.isArray(album) ? album[0] : album;

  setLibrary((prev) => {
    const exists = prev.albums.some((a) => a.id === newAlbum.id);

    return {
      ...prev,
      albums: exists
        ? prev.albums.filter((a) => a.id !== newAlbum.id)
        : [newAlbum, ...prev.albums],
    };
  });
};

// 📂 TOGGLE PLAYLIST
const togglePlaylist = (playlist) => {
  const newPlaylist = Array.isArray(playlist) ? playlist[0] : playlist;

  setLibrary((prev) => {
    const exists = prev.playlists.some((p) => p.id === newPlaylist.id);

    return {
      ...prev,
      playlists: exists
        ? prev.playlists.filter((p) => p.id !== newPlaylist.id)
        : [newPlaylist, ...prev.playlists],
    };
  });
};

const artistSet = useMemo(() => {
  return new Set(library.artists.map((a) => a.id));
}, [library.artists]);

const albumSet = useMemo(() => {
  return new Set(library.albums.map((a) => a.id));
}, [library.albums]);

const playlistSet = useMemo(() => {
  return new Set(library.playlists.map((p) => p.id));
}, [library.playlists]);

const isArtistSaved = (id) => artistSet.has(id);
const isAlbumSaved = (id) => albumSet.has(id);
const isPlaylistSaved = (id) => playlistSet.has(id);



  return (
    <LibraryContext.Provider
      value={{
        library,
        toggleLike,
        isLiked,

    toggleArtist,
    toggleAlbum,
    togglePlaylist,

    isArtistSaved,
  isAlbumSaved,
  isPlaylistSaved,

      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => useContext(LibraryContext);