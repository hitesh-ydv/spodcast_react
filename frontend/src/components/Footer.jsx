// src/components/FooterPlayer.jsx

import { LazyLoadImage } from "@tjoskar/react-lazyload-img";
import { useAudio } from "../context/AudioContext";
import Song from "../pages/nested/Song";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const { audioUrl, currentSong, audioRef, isPlaying, togglePlayPause } = useAudio();

      const navigate = useNavigate();

  return (
    <footer className="py-4 h-18 max-w-full flex items-center justify-between text-white">
      {currentSong && (
        <>
          <div className="flex items-center gap-3">
            <LazyLoadImage
              image={currentSong.image?.[1]?.url}
              //alt={currentSong.name}
              className="w-12 h-12 rounded"
            />
            <div className="text-white w-52">
              <p
                className="text-sm cursor-pointer font-medium text-white hover:underline line-clamp-1"
                onClick={(e) => {
                  navigate(`/${currentSong.type}/${currentSong.id}`)
                  e.stopPropagation()
                }}
              >
                {currentSong.name}
              </p>
              <p className="text-sm text-gray-400 truncate font-medium line-clamp-1">
                {currentSong.artists.primary.map((a, index) => (
                  <span key={a.id || index}>
                    <a
                      className="hover:underline hover:text-white cursor-pointer"
                      onClick={(e) => {
                        navigate(`/artist/${a.id}`)
                        e.stopPropagation()
                      }}
                    >
                      {a.name}
                    </a>
                    {index < currentSong.artists.primary.length - 1 && ", "}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <button
            onClick={togglePlayPause}
            className="bg-[#1db954] hover:bg-[#1ed760] text-black px-4 py-2 rounded-full"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <audio ref={audioRef} src={audioUrl} onEnded={() => console.log("Song ended")} />
        </>
      )}
    </footer>
  );
}
