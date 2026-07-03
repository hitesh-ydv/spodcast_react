import { createContext, useContext, useEffect, useMemo, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL2;
import { useLoading } from "../context/LoadingContext";

const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
  const [library, setLibrary] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const { startLoading, finishLoading } = useLoading();


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

  const fetchLibrary = async () => {
    try {
      setLoadingLibrary(true);

      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/library`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setLibrary(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const toggleLibrary = async (item, itemType) => {
    try {
      startLoading();

      const token = localStorage.getItem("token");
      if (!token) return;

      const itemId = String(item.id);

      const exists = library.some(
        (i) =>
          String(i.itemId) === itemId &&
          i.itemType === itemType
      );

      if (exists) {
        const res = await fetch(`${API_URL}/api/library`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            itemId,
            itemType,
          }),
        });

        const data = await res.json();

        if (!data.success) return;

        setLibrary((prev) =>
          prev.filter(
            (i) =>
              !(
                String(i.itemId) === itemId &&
                i.itemType === itemType
              )
          )
        );
      } else {
        const body = {
          itemId,
          itemType,
          title: item.name || item.title || "",
          image:
            item.image?.[2]?.url ||
            item.image?.url ||
            item.image ||
            "",
        };

        const res = await fetch(`${API_URL}/api/library`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        console.log("Adding to library:", body);

        const data = await res.json();

        if (!data.success) return;

        setLibrary((prev) => [
          {
            ...body,
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      finishLoading();
    }
  };


  const toggleArtist = (artist) =>
    toggleLibrary(
      Array.isArray(artist) ? artist[0] : artist,
      "artist"
    );

  const toggleAlbum = (album) =>
    toggleLibrary(
      Array.isArray(album) ? album[0] : album,
      "album"
    );

  const togglePlaylist = (playlist) =>
    toggleLibrary(
      Array.isArray(playlist) ? playlist[0] : playlist,
      "playlist"
    );

  const artistSet = useMemo(
    () =>
      new Set(
        library
          .filter((i) => i.itemType === "artist")
          .map((i) => String(i.itemId))
      ),
    [library]
  );

  const albumSet = useMemo(
    () =>
      new Set(
        library
          .filter((i) => i.itemType === "album")
          .map((i) => String(i.itemId))
      ),
    [library]
  );

  const playlistSet = useMemo(
    () =>
      new Set(
        library
          .filter((i) => i.itemType === "playlist")
          .map((i) => String(i.itemId))
      ),
    [library]
  );

  const isArtistSaved = (id) => artistSet.has(String(id));
  const isAlbumSaved = (id) => albumSet.has(String(id));
  const isPlaylistSaved = (id) => playlistSet.has(String(id));



  return (
    <LibraryContext.Provider
      value={{
        library,
        loadingLibrary,
        fetchLibrary,

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