import { createContext, useContext, useEffect, useMemo, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL2;
import { useLoading } from "../context/LoadingContext";

const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
  const [library, setLibrary] = useState({
    artists: [],
    albums: [],
    playlists: [],
  });

  const { startLoading, finishLoading } = useLoading();

  useEffect(() => {
    const stored = localStorage.getItem("library");

    if (stored) {
      const parsed = JSON.parse(stored);

      setLibrary({
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

  const [likedSongs, setLikedSongs] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  useEffect(() => {
    fetchLikedSongs();
  }, []);

  const fetchLikedSongs = async () => {
    try {
      setLoadingLikes(true);

      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/likes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setLikedSongs(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLikes(false);
    }
  };

  const likedSet = useMemo(() => {
    return new Set(
      likedSongs.map((song) => String(song.song_id))
    );
  }, [likedSongs]);

  const isLiked = (id) => likedSet.has(String(id));

  const toggleLike = async (song) => {
    try {
      startLoading();
      const token = localStorage.getItem("token");
      if (!token) return;

      const songId = String(song.id);
      const exists = likedSet.has(songId);

      if (exists) {
        const res = await fetch(`${API_URL}/api/likes/${songId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        finishLoading();

        if (!data.success) return;

        setLikedSongs((prev) =>
          prev.filter((s) => String(s.song_id) !== songId)
        );

      } else {

        const body = {
          songId,
          name: song.name || song.title || "",
          artists: song.artists?.primary
            ?.map((artist) => artist.name)
            .join(", ") || "",
          image:
            song.image?.[1]?.url ||
            song.image?.url ||
            song.image ||
            "",
        };

        startLoading();

        const res = await fetch(`${API_URL}/api/likes`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        finishLoading();

        if (!data.success) return;

        setLikedSongs((prev) => [
          {
            song_id: songId,
            name: body.name,
            artists: body.artists,
            image: body.image,
          },
          ...prev,
        ]);
      }

    } catch (err) {
      console.error(err);
    }
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

        likedSongs,
        loadingLikes,
        fetchLikedSongs,

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