// src/context/AudioContext.js
import { createContext, useState, useContext, useRef, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL;
import { useOffline } from "../context/OfflineProvider";
import { useActivity } from "../context/ActivityContext";


const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlistSongs, setPlaylistSongs] = useState([]); // ✅ clearer naming

  const audioRef = useRef(null);

  const { triggerSlowNetwork } = useOffline();
  const { recordActivity } = useActivity();



  useEffect(() => {
    if (currentSong) {
      localStorage.setItem("lastSong", JSON.stringify(currentSong));
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioUrl) {
      localStorage.setItem("lastAudioUrl", audioUrl);

      console.log("Audio URL updated:", audioUrl);
    }
  }, [audioUrl]);

  useEffect(() => {
    const savedSong = localStorage.getItem("lastSong");
    const savedUrl = localStorage.getItem("lastAudioUrl");

    if (savedSong) {
      try {
        const parsedSong = JSON.parse(savedSong);
        setCurrentSong(parsedSong);
      } catch (err) {
        console.error("Error parsing lastSong:", err);
      }
    }

    if (savedUrl) {
      setAudioUrl(savedUrl);
    }
  }, []);

  const playSong = async (songId, playlist = playlistSongs) => {
    let slowTimer;

    try {

      if (playlist && playlist.length > 0) {
        setPlaylistSongs(playlist);
      }

      if (currentSong?.id === songId && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
        return;
      }

      // ⏱️ detect slow network (5 sec)
      slowTimer = setTimeout(() => {
        triggerSlowNetwork(); // 🔥 just call context
      }, 5000);

      const response = await fetch(`${API_URL}/api/songs/${songId || song_id}`,{
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      const data = await response.json();

      clearTimeout(slowTimer);

      const url = data?.data[0]?.downloadUrl?.[4]?.url;
      if (!url) throw new Error("No audio URL found");

      setAudioUrl(url);
      setCurrentSong(data.data[0]);

      recordActivity({
        id: currentSong?.id,
        type: "song",
        title: currentSong?.name,
        image: currentSong?.image?.[2]?.url ,
      });

      console.log("Playing song:", currentSong?.name, "image:", currentSong?.image?.[2]?.url, currentSong?.id);

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }, 200);

    } catch (err) {
      console.error("Error fetching audio:", err);

      clearTimeout(slowTimer);
      triggerSlowNetwork(); // also show on error
    }
  };

  useEffect(() => {
    if (currentSong?.name && currentSong?.artists.primary[0].name) {
      document.title = `${currentSong.name} · ${currentSong.artists.primary[0].name}`;
    } else {
      document.title = "Spodcast";
    }
  }, [currentSong]);


  // ✅ Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // ✅ Automatically play next song when current ends
  useEffect(() => {
    if (!audioRef.current) return;

    const handleSongEnd = () => {
      if (!playlistSongs || playlistSongs.length === 0 || !currentSong) return;

      const currentIndex = playlistSongs.findIndex((s) => s.id === currentSong.id);
      const nextIndex = currentIndex + 1;

      if (nextIndex < playlistSongs.length) {
        // play next song
        playSong(playlistSongs[nextIndex].id, playlistSongs);
      } else {
        // reached end of playlist
        setIsPlaying(false);
        // Optionally loop: playSong(playlistSongs[0].id, playlistSongs);
      }
    };

    const audioEl = audioRef.current;
    audioEl.addEventListener("ended", handleSongEnd);
    return () => audioEl.removeEventListener("ended", handleSongEnd);
  }, [currentSong, playlistSongs]);

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        playSong,
        togglePlayPause,
        audioUrl,
        audioRef,
        playlistSongs, // ✅ renamed here
        setPlaylistSongs, // ✅ cleaner naming
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
