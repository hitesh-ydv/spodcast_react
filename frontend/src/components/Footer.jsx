import { useEffect, useState } from "react";
import { LazyLoadImage } from "@tjoskar/react-lazyload-img";
import { useAudio } from "../context/AudioContext";
import { useNavigate } from "react-router-dom";
import PlayBtn from "../assets/playbtn.svg";
import PauseBtn from "../assets/pause.svg";
import LoadImage from "../assets/afterload.png"; // 👈 your default image path

export default function FooterPlayer() {
  const {
    audioUrl,
    currentSong,
    audioRef,
    isPlaying,
    togglePlayPause,
    playSong,
    playlistSongs,
  } = useAudio();

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if spacebar is pressed
      if (e.code === "Space") {
        // If user is typing in an input or textarea → do nothing
        const activeEl = document.activeElement;
        if (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.isContentEditable) {
          return;
        }

        e.preventDefault(); // prevent page scrolling
        togglePlayPause(); // call your play/pause toggle function
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      // Set metadata for lockscreen / Bluetooth display
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong?.name || "Unknown",
        artist: currentSong?.artists.primary.map(a => a.name).join(", "),
        artwork: [
          { src: currentSong?.image[2].url || "/default-cover.png", sizes: "512x512", type: "image/png" }
        ]
      });

      // Register play/pause handlers for Bluetooth & hardware buttons
      navigator.mediaSession.setActionHandler("play", () => {
        togglePlayPause(true);
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        togglePlayPause(false);
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        // optional: previous track logic
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        // optional: next track logic
      });
    }
  }, [currentSong, togglePlayPause]);

  // Toggle shuffle → turn off repeat
  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
    if (!isShuffle) setIsRepeat(false);
  };

  // Toggle repeat → turn off shuffle
  const toggleRepeat = () => {
    setIsRepeat(prev => !prev);
    if (!isRepeat) setIsShuffle(false);
  };

  const playNext = () => {
    if (!playlistSongs || !currentSong) return;

    const currentIndex = playlistSongs.findIndex((s) => s.id === currentSong.id);

    if (isShuffle) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * playlistSongs.length);
      } while (playlistSongs.length > 1 && randomIndex === currentIndex);
      const nextSong = playlistSongs[randomIndex];
      playSong(nextSong.id, playlistSongs, {
        artist: nextSong?.artists?.primary?.map((a) => a.name).join(", ") || "Unknown Artist",
      });
    } else if (currentIndex < playlistSongs.length - 1) {
      const nextSong = playlistSongs[currentIndex + 1];
      playSong(nextSong.id, playlistSongs, {
        artist: nextSong?.artists?.primary?.map((a) => a.name).join(", ") || "Unknown Artist",
      });
    } else {
      const nextSong = playlistSongs[0];
      playSong(nextSong.id, playlistSongs, {
        artist: nextSong?.artists?.primary?.map((a) => a.name).join(", ") || "Unknown Artist",
      });
    }
  };

  const playPrevious = () => {
    if (!playlistSongs || !currentSong) return;

    const currentIndex = playlistSongs.findIndex((s) => s.id === currentSong.id);

    if (currentIndex > 0) {
      const prevSong = playlistSongs[currentIndex - 1];
      playSong(prevSong.id, playlistSongs, {
        artist: prevSong?.artists?.primary?.map((a) => a.name).join(", ") || "Unknown Artist",
      });
    } else {
      const prevSong = playlistSongs[playlistSongs.length - 1];
      playSong(prevSong.id, playlistSongs, {
        artist: prevSong?.artists?.primary?.map((a) => a.name).join(", ") || "Unknown Artist",
      });
    }
  };

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const handleSongEnd = () => {
      if (isRepeat) {
        // Repeat the same song
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
        });
      } else {
        playNext(); // next or shuffle
      }
    };

    const audioEl = audioRef.current;
    audioEl.addEventListener("ended", handleSongEnd);

    return () => audioEl.removeEventListener("ended", handleSongEnd);
  }, [currentSong, playlistSongs, isRepeat, playNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    // Update immediately in case metadata is already loaded
    updateTime();

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateTime);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateTime);
    };
  }, [audioRef, currentSong]);


  // 🎚 Seek song
  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const seekTime = percent * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // 🕒 Format time
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <footer className="py-2.5 w-full flex flex-col text-white">
      {currentSong ? (
        <>
          {/* 🎧 Song Info + Controls */}
          <div className="flex items-center justify-between w-full">
            {/* Left - Song info */}
            <div className="flex items-center gap-3 w-1/3">
              <LazyLoadImage
                defaultImage={LoadImage}
                image={currentSong.image?.[1]?.url}
                className="w-12 h-12 rounded"
              />
              <div className="w-full max-w-66 flex flex-col">
                <p
                  className="text-sm inline-block font-medium truncate line-clamp-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/${currentSong.type}/${currentSong.id}`);
                  }}
                >
                  <a className="inline-block hover:underline cursor-pointer">{currentSong.name}</a>
                </p>
                <p className="inline-block text-sm font-medium text-gray-400 truncate line-clamp-1">
                  {currentSong.artists.primary.map((a, i) => (
                    <span key={a.id || i}>
                      <a
                        className="hover:underline hover:text-white cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/artist/${a.id}`);
                        }}
                      >
                        {a.name}
                      </a>
                      {i < currentSong.artists.primary.length - 1 && ", "}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            {/* Center - Controls */}
            <div className="flex flex-col items-center w-1/3">
              <div className="flex items-center gap-3 justify-center pt-1 ">
                <button
                  onClick={toggleShuffle}
                  className={`p-2 rounded-full transition ${isShuffle ? "text-[#1db954]" : "text-gray-300 hover:text-white"
                    }`}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-6 h-6 ${isShuffle ? "fill-[#1db954] hover:fill-[#1db954]" : "fill-[#adadad] hover:fill-white"}  transition-colors cursor-pointer`}
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M24.2071 5.29289C23.8166 4.90237 23.1834 4.90237 22.7929 5.29289C22.4024 5.68342 22.4024 6.31658 22.7929 6.70711L24.5858 8.5H22.4345C20.2744 8.5 18.2352 9.49731 16.909 11.2024L10.0123 20.0697C9.06498 21.2876 7.60845 22 6.0655 22H5V24H6.0655C8.22563 24 10.2648 23.0027 11.591 21.2976L18.4877 12.4303C19.435 11.2124 20.8916 10.5 22.4345 10.5H24.5858L22.7929 12.2929C22.4024 12.6834 22.4024 13.3166 22.7929 13.7071C23.1834 14.0976 23.8166 14.0976 24.2071 13.7071L27.7071 10.2071L28.4142 9.5L27.7071 8.79289L24.2071 5.29289ZM16.909 19.7976L15.8907 18.4883L17.2198 16.9395L18.4877 18.5697C19.435 19.7876 20.8916 20.5 22.4345 20.5H24.5858L22.7929 18.7071C22.4024 18.3166 22.4024 17.6834 22.7929 17.2929C23.1834 16.9024 23.8166 16.9024 24.2071 17.2929L27.7071 20.7929L28.4142 21.5L27.7071 22.2071L24.2071 25.7071C23.8166 26.0976 23.1834 26.0976 22.7929 25.7071C22.4024 25.3166 22.4024 24.6834 22.7929 24.2929L24.5858 22.5H22.4345C20.2744 22.5 18.2352 21.5027 16.909 19.7976ZM11.591 9.70241L13.5265 12.1909L12.1973 13.7397L10.0123 10.9303C9.06498 9.71236 7.60845 9 6.0655 9H5V7H6.0655C8.22563 7 10.2648 7.99731 11.591 9.70241Z"
                    />
                  </svg>

                </button>

                <button
                  onClick={playPrevious}
                  className="p-2 rounded-full hover:text-white text-gray-300 transition"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 fill-[#adadad] hover:fill-white transition-colors cursor-pointer"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8 28C8.55228 28 9 27.5523 9 27L9 17.8L24.4855 27.0913C25.152 27.4912 26 27.0111 26 26.2338L26 5.76619C26 4.9889 25.152 4.50878 24.4855 4.9087L9 14.2L9 5C9 4.44771 8.55229 4 8 4L6 4C5.44772 4 5 4.44771 5 5L5 27C5 27.5523 5.44772 28 6 28L8 28Z"
                    />
                  </svg>


                </button>

                <button
                  onClick={togglePlayPause}
                  className="bg-white cursor-pointer text-black p-1 rounded-full flex items-center justify-center"
                >
                  <img src={isPlaying ? PauseBtn : PlayBtn} alt="Play" className="h-6.5 w-6.5" />
                </button>

                <button
                  onClick={playNext}
                  className="p-2 rounded-full hover:text-white text-gray-300 transition"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 fill-[#adadad] hover:fill-white transition-colors cursor-pointer"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M23 4C22.4477 4 22 4.44772 22 5V14.2L6.5145 4.9087C5.84797 4.50878 5 4.9889 5 5.76619V26.2338C5 27.0111 5.84797 27.4912 6.5145 27.0913L22 17.8V27C22 27.5523 22.4477 28 23 28H25C25.5523 28 26 27.5523 26 27V5C26 4.44772 25.5523 4 25 4H23Z"
                    />
                  </svg>

                </button>

                <button
                  onClick={toggleRepeat}
                  className={`p-2 rounded-full transition ${isRepeat ? "text-[#1db954]" : "text-gray-300 hover:text-white"
                    }`}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-6 h-6 ${isRepeat ? "fill-[#1db954] hover:fill-[#1db954]" : "fill-[#adadad] hover:fill-white"} transition-colors cursor-pointer`}
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10 6C7.23858 6 5 8.23858 5 11V19C5 21.7614 7.23858 24 10 24H11.5V22H10C8.34315 22 7 20.6569 7 19V11C7 9.34315 8.34315 8 10 8H22C23.6569 8 25 9.34315 25 11V19C25 20.6569 23.6569 22 22 22H17.9142L19.2071 20.7071C19.5976 20.3166 19.5976 19.6834 19.2071 19.2929C18.8166 18.9024 18.1834 18.9024 17.7929 19.2929L14.7929 22.2929L14.0858 23L14.7929 23.7071L17.7929 26.7071C18.1834 27.0976 18.8166 27.0976 19.2071 26.7071C19.5976 26.3166 19.5976 25.6834 19.2071 25.2929L17.9142 24H22C24.7614 24 27 21.7614 27 19V11C27 8.23858 24.7614 6 22 6H10Z"
                    />
                  </svg>


                </button>
              </div>

              {/* Progress Bar */}
              {/* Progress Bar */}
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs font-medium text-gray-400">{formatTime(currentTime)}</span>

                <div
                  className="relative flex-1 h-6 group cursor-pointer" // taller container for easier click
                  onClick={handleSeek}
                >
                  {/* Visible progress bar */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-[#2a2a2a] rounded -translate-y-1/2"></div>

                  {/* Filled portion */}
                  <div
                    className="absolute top-1/2 left-0 h-1 bg-white rounded -translate-y-1/2 transition-all"
                    style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                  ></div>

                  {/* Thumb - hidden by default, visible on hover */}
                  <div
                    className="absolute top-1/2 w-3 h-3 bg-white rounded-full -translate-y-1/2 transform transition-all opacity-0 group-hover:opacity-100"
                    style={{ left: `calc(${(currentTime / duration) * 100 || 0}% - 6px)` }}
                  ></div>
                </div>

                <span className="text-xs font-medium text-gray-400">{formatTime(duration)}</span>
              </div>


            </div>

            {/* Right - filler or extra icons */}
            <div className="w-1/3 flex justify-end font-medium text-gray-400 text-xs">
              <span>Now Playing</span>
            </div>
          </div>

          {/* Hidden Audio */}
          <audio ref={audioRef} src={audioUrl} className="hidden" />
        </>
      ) : (
        <div className="text-gray-400 text-sm text-center py-3">
          No song playing
        </div>
      )}
    </footer>
  );
}
