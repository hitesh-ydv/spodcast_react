// src/context/AudioContext.js
import { createContext, useState, useContext, useRef, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL;

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlistSongs, setPlaylistSongs] = useState([]); // ✅ clearer naming

  const audioRef = useRef(null);

const playSong = async (songId, playlist = playlistSongs) => {
  try {
    // optional: update playlist if provided
    if (playlist && playlist.length > 0) {
      setPlaylistSongs(playlist);
    }

    // If the same song is playing, restart it directly
    if (currentSong?.id === songId && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      return; // ✅ stop here — no need to refetch
    }

    // Otherwise, fetch new song URL
    const response = await fetch(
      `${API_URL}/api/songs/${songId}`
    );
    const data = await response.json();

    const url = data?.data[0]?.downloadUrl?.[3]?.url;
    if (!url) throw new Error("No audio URL found");

    setAudioUrl(url);
    setCurrentSong(data.data[0]);

    // Wait briefly before playing
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }, 200);
  } catch (err) {
    console.error("Error fetching audio:", err);
  }
};


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
