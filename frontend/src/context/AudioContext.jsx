// src/context/AudioContext.js
import { createContext, useState, useContext, useRef } from "react";

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef(null);

  // ✅ Play selected song
  const playSong = async (songId) => {
    try {
      // Fetch audio URL from API
      const response = await fetch(`https://jiosavan-api-with-playlist.vercel.app/api/songs/${songId}`);
      const data = await response.json();

      const url = data?.data[0]?.downloadUrl?.[3]?.url;
      console.log(data.data)

      if (!url) throw new Error("No audio URL found");

      setAudioUrl(url);
      setCurrentSong(data.data[0]);

      // wait a tick then play
      setTimeout(() => {
        audioRef.current.play();
        setIsPlaying(true);
      }, 200);
    } catch (err) {
      console.error("Error fetching audio:", err);
    }
  };

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

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        playSong,
        togglePlayPause,
        audioUrl,
        audioRef,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
