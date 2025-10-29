import ScrollContainer from "../../layouts/ScrollContainer";
import Loader from "../../components/Loader"; // make sure this path is correct
import { LazyLoadImage } from '@tjoskar/react-lazyload-img'
import { useState } from "react";
import LoadImage from "../../assets/afterload.png"; // 👈 your default image path
import PlayBtn from "../../assets/playbtn.svg";
import PauseBtn from "../../assets/pause.svg";
import { useAudio } from "@/context/AudioContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

export default function Home({ data, loading }) {

  const { playSong, currentSong, isPlaying, togglePlayPause, setPlaylistSongs } = useAudio();

  const [currentSongId, setCurrentSongId] = useState("");
  const navigate = useNavigate()

  const handleError = (e) => {
    e.target.onerror = null; // prevent infinite loop
    e.target.src = fallbackImg; // set default image
  };

  const fetchRecommendedSongs = async (id, song) => {
    try {
      const { data } = await axios.get(`${API_URL}/api/songs/${id}/suggestions?limit=10`);
      setPlaylistSongs([song, ...data.data])

    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
    }
  };

  return (
    <div className="h-full">
      {loading ? (
        <div className="flex items-center justify-center min-h-full">
          <Loader />
        </div>
      ) : (
        <ScrollContainer title="Made for you">
          {data.map((song) => {
            const isCurrent = currentSongId === song?.id;
            const isCurrentPlaying = isCurrent && isPlaying;   // check if current song is playing

            return (
              <div
                key={song.id}
                className="flex-shrink-0 w-46 rounded-lg p-2.5 hover:bg-[#191919] transition-all cursor-pointer snap-start"
                onClick={(e) => {
                  navigate(`/${song.type}/${song.id}`)
                  e.stopPropagation();
                }}
              >
                <div className="image-wrapper mb-2">
                  <LazyLoadImage
                    defaultImage={LoadImage}
                    image={song.image[2]?.url || fallbackImg}
                    className="song-image"
                    onError={handleError}
                  />
                  <button className={`play-button ${isCurrentPlaying ? "active" : ""}`}
                    onClick={(e) => {
                      setCurrentSongId(song.id)
                      e.stopPropagation()
                      fetchRecommendedSongs(song.id, song)
                      if (isCurrent) {
                        // same song → toggle play/pause
                        togglePlayPause();
                      } else {
                        // different song → play new song
                        playSong(song.id);
                      }
                    }}
                  >
                    <img
                      src={isCurrentPlaying ? PauseBtn : PlayBtn}
                      alt={isCurrentPlaying ? "Pause" : "Play"}
                      className="h-8 w-8"
                    />
                  </button>
                </div>

                <h3 onClick={(e) => {
                  navigate(`/${song.type}/${song.id}`)
                  e.stopPropagation();
                }} className={`text-base font-semibold truncate hover:underline ${isCurrentPlaying ? "text-[#1db954]" : "text-white"} `}>{song.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 font-medium">
                  {song.artists.primary.map((a, index) => (
                    <span key={a.id || index}>
                      <a
                        className="hover:underline hover:text-white"
                        onClick={(e) => {
                          navigate(`/artist/${a.id}`)
                          e.stopPropagation();
                        }}
                      >
                        {a.name}
                      </a>
                      {index < song.artists.primary.length - 1 && ", "}
                    </span>
                  ))}
                </p>

              </div>

            )

          })}
        </ScrollContainer>
      )}
    </div>
  );
}