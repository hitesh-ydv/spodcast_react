// src/context/AudioContext.js
import { createContext, useState, useContext, useRef, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL;
const API_URL2 = import.meta.env.VITE_API_URL2;
import { useOffline } from "../context/OfflineProvider";
import { useActivity } from "../context/ActivityContext";


const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlistSongs, setPlaylistSongs] = useState([]); // ✅ clearer naming
  const [canvasUrl, setCanvasUrl] = useState("");

  const audioRef = useRef(null);

  const { triggerSlowNetwork } = useOffline();
  const { recordActivity } = useActivity();

  useEffect(() => {
    loadLastSong();
  }, []);

  const loadLastSong = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`${API_URL2}/api/last-played`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.success && data.data?.song_id) {
      playSong(data.data.song_id, [], false);
    }
  };

  const token = "sk-paxsenix-4-JKEqHQQzxDQv_gKvs1SFpePsIMwO-62NQK-WiIAiZ1rbVq";

  const searchSong = async (songName, token) => {
    const res = await fetch(
      `https://api.paxsenix.org/spotify/search?q=${encodeURIComponent(songName)}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },

      }
    );

    const data = await res.json();
    return data.tracks.items[0]?.id;
  };

  const getCanvasUrl = async (trackId) => {
    try {
      const response = await fetch(
        `https://api.paxsenix.org/spotify/canvas?id=${encodeURIComponent(trackId)}`,
        {
          method: "GET",
          headers: {
            "Accept": "*/*",
            "Authorization":
              "Bearer sk-paxsenix-4-JKEqHQQzxDQv_gKvs1SFpePsIMwO-62NQK-WiIAiZ1rbVq",
          },
        }
      );

      const data = await response.json();

      return data?.data?.canvasesList?.[0]?.canvasUrl || null;

    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    setCanvasUrl(""); // reset first

    const fetchCanvas = async () => {
      try {
        // 1️⃣ Get token
        const token = "sk-paxsenix-4-JKEqHQQzxDQv_gKvs1SFpePsIMwO-62NQK-WiIAiZ1rbVq"; // Replace with your actual token

        // 2️⃣ Search track ID
        const trackId = await searchSong(`${currentSong.name} ${currentSong.artists.primary[0].name}`, token);
        if (!trackId) return;

        // 3️⃣ Fetch canvas URL
        const url = await getCanvasUrl(trackId);

        // ✅ Check if URL contains "image"
        if (url.toLowerCase().includes("image")) {
          setCanvasUrl(""); // or leave it as "" to render nothing
          return null;
        }

        setCanvasUrl(url);
      } catch (err) {
        
      }
    };

    fetchCanvas();
  }, [currentSong]);


  const playSong = async (songId, playlist = playlistSongs, autoPlay = true) => {
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

      const response = await fetch(`${API_URL}/api/songs/${songId}`, {
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


      await fetch(`${API_URL2}/api/last-played`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songId: data.data[0].id,
        }),
      });
      // recordActivity({
      //   id: currentSong?.id,
      //   type: "song",
      //   title: currentSong?.name,
      //   image: currentSong?.image?.[2]?.url ,
      // });

      if (autoPlay) {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
          }
        }, 200);
      } else {
        setIsPlaying(false);
      }

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
        canvasUrl,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
