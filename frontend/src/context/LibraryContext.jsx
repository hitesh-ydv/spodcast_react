import { createContext, useContext, useEffect, useState } from "react";

const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
  const [library, setLibrary] = useState({
    likedSongs: [],
    artists: [],
    albums: [],
    playlists: [],
  });

  // Load
  useEffect(() => {
    const stored = localStorage.getItem("library");
    if (stored) setLibrary(JSON.parse(stored));
  }, []);

  // Save
  useEffect(() => {
    localStorage.setItem("library", JSON.stringify(library));
  }, [library]);

  // ❤️ Like
  const addToLiked = (song) => {
    setLibrary((prev) => {
      if (prev.likedSongs.some((s) => s.id === song.id)) return prev;
      return { ...prev, likedSongs: [song, ...prev.likedSongs] };
    });
  };

  // 🎤 Artist
  const addArtist = (artist) => {
    setLibrary((prev) => {
      if (prev.artists.some((a) => a.id === artist.id)) return prev;
      return { ...prev, artists: [artist, ...prev.artists] };
    });
  };

  // 💿 Album
  const addAlbum = (album) => {
    setLibrary((prev) => {
      if (prev.albums.some((a) => a.id === album.id)) return prev;
      return { ...prev, albums: [album, ...prev.albums] };
    });
  };

  // 📂 Playlist
  const addPlaylist = (playlist) => {
    setLibrary((prev) => {
      if (prev.playlists.some((p) => p.id === playlist.id)) return prev;
      return { ...prev, playlists: [playlist, ...prev.playlists] };
    });
  };

  return (
    <LibraryContext.Provider
      value={{ library, addToLiked, addArtist, addAlbum, addPlaylist }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => useContext(LibraryContext);