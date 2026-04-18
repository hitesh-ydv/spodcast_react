import ScrollContainer from "../../layouts/ScrollContainer";
import Loader from "../../components/Loader"; // make sure this path is correct
import { LazyLoadImage } from '@tjoskar/react-lazyload-img'
import { useState, useEffect, use } from "react";
import LoadImage from "../../assets/afterload.png"; // 👈 your default image path
import PlayBtn from "../../assets/playbtn.svg";
import PauseBtn from "../../assets/pause.svg";
import { useAudio } from "@/context/AudioContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;
import { useRecent } from "../../context/RecentContext";
import fallbackImg from "../../assets/playlist_cover.jpg"; // 👈 your default image path
import { Vibrant } from "node-vibrant/browser";
import { motion } from "framer-motion";

export default function Home({ data, loading, homePlaylists }) {

  const { playSong, currentSong, isPlaying, togglePlayPause, setPlaylistSongs } = useAudio();

  const [currentSongId, setCurrentSongId] = useState("");
  const [backgroundColor, setBackgroundColor] = useState('');
  const [scrollContainerBg, setScrollContainerBg] = useState('');

  const { recentPlayed, saveToRecent } = useRecent(); // Home

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

  useEffect(() => {
    const extractColorFromImage = async () => {
      //if (!imageRef2.current) return;

      try {
        const palette = await Vibrant
          .from(currentSong?.image?.[2]?.url || fallbackImg)
          .getPalette();

        // Spotify-style priority
        const swatch =
          palette.DarkVibrant ||
          palette.Muted ||
          palette.DarkMuted;

        if (!swatch) return;

        const [r, g, b] = swatch.rgb;

        const gradient = `
    linear-gradient(
      180deg,
      rgba(${r + 20}, ${g + 20}, ${b + 20}, 0.95) 0%,
      rgba(${r}, ${g}, ${b}, 0.8) 50%,
      rgba(${r}, ${g}, ${b}, 0.5) 100%
    )
  `;

        const scrollGradient = `
      linear-gradient(
        to bottom,
        rgba(${r}, ${g}, ${b}, 0.35) 0px,
        rgba(18,18,18,0.7) 150px,
        #12121A 100%
      )
    `;

        setBackgroundColor(gradient);
        setScrollContainerBg(scrollGradient);

      } catch (err) {
        console.error("Vibrant error:", err);
      }
    };
    extractColorFromImage();
  }, [currentSong]);


  return (
    <motion.div
      className="scroll-container h-full w-full"
      animate={{
        background: scrollContainerBg,
      }}
      transition={{
        duration: 0.8,
        ease: "easeInOut",
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-full">
          <Loader />
        </div>
      ) : (
        <>
          {data && data.length > 0 && (
            <ScrollContainer title="Made for you">
              {data.map((song) => {
                const isCurrent = currentSongId === song?.id;
                const isCurrentPlaying = isCurrent && isPlaying;   // check if current song is playing

                return (
                  <div
                    key={song.id}
                    className="flex-shrink-0 w-46 rounded-lg p-2.5 hover:bg-[rgba(124,77,255,0.1)] transition-all cursor-pointer snap-start"
                    onClick={(e) => {
                      navigate(`/${song.type}/${song.id}`)
                      e.stopPropagation();
                    }}
                  >
                    <div className="image-wrapper mb-2">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }} // ✅ animate only first time it appears
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                          <LazyLoadImage
                            defaultImage={LoadImage}
                            image={song.image?.[2]?.url || fallbackImg}
                            className="song-image"
                            onError={handleError}
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                          />
                        </motion.div>
                      </motion.div>
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
                          saveToRecent(song);
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
                    }} className={`text-base font-semibold truncate hover:underline ${isCurrentPlaying ? "bg-gradient-to-br from-purple-500 to-blue-500 bg-clip-text text-transparent" : "text-white"} `}>{song.name}</h3>
                    <p className="text-sm text-[#A0A0B2] line-clamp-2 font-medium">
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
          {recentPlayed.length > 0 && (
            <ScrollContainer title="Recent Played">
              {recentPlayed.map((song) => {
                const isCurrent = currentSongId === song?.id;
                const isCurrentPlaying = isCurrent && isPlaying;   // check if current song is playing

                return (
                  <div
                    key={song.id}
                    className="flex-shrink-0 w-46 rounded-lg p-2.5 hover:bg-[rgba(124,77,255,0.1)] transition-all cursor-pointer snap-start"
                    onClick={(e) => {
                      navigate(`/${song.type}/${song.id}`)
                      e.stopPropagation();
                    }}
                  >
                    <div className="image-wrapper mb-2">
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }} // ✅ animate only first time it appears
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <LazyLoadImage
                          defaultImage={LoadImage}
                          image={song.image?.[2]?.url || fallbackImg}
                          className={`${song.type === "artist" ? "rounded-full" : `song-image`}`}
                          onError={handleError}
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                        />
                      </motion.div>
                      {song.type === "song" && (
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
                      )}
                    </div>

                    <h3 onClick={(e) => {
                      navigate(`/${song.type}/${song.id}`)
                      e.stopPropagation();
                    }} className={`text-base font-semibold line-clamp-2 hover:underline ${isCurrentPlaying ? "bg-gradient-to-br from-purple-500 to-blue-500 bg-clip-text text-transparent" : "text-white"} `}>{song.name || song.title}</h3>
                    {/* <p className="text-sm text-[#A0A0B2] line-clamp-2 font-medium">
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
                  </p> */}

                  </div>

                )

              })}
            </ScrollContainer>
          )}


          <ScrollContainer title="Punjabi Hits">
            {homePlaylists.punjabi.map((song) => {
              const isCurrent = currentSongId === song?.id;
              const isCurrentPlaying = isCurrent && isPlaying;   // check if current song is playing

              return (
                <div
                  key={song.id}
                  className="flex-shrink-0 w-46 rounded-lg p-2.5 hover:bg-[rgba(124,77,255,0.1)] transition-all cursor-pointer snap-start"
                  onClick={(e) => {
                    navigate(`/${song.type}/${song.id}`)
                    e.stopPropagation();
                  }}
                >
                  <div className="image-wrapper mb-2">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }} // ✅ animate only first time it appears
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <LazyLoadImage
                        defaultImage={LoadImage}
                        image={song.image?.[2]?.url || fallbackImg}
                        className="song-image"
                        onError={handleError}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    </motion.div>
                    {/* <button className={`play-button ${isCurrentPlaying ? "active" : ""}`}
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
                        saveToRecent(song);
                      }}
                    >
                      <img
                        src={isCurrentPlaying ? PauseBtn : PlayBtn}
                        alt={isCurrentPlaying ? "Pause" : "Play"}
                        className="h-8 w-8"
                      />
                    </button> */}
                  </div>

                  <h3 onClick={(e) => {
                    navigate(`/${song.type}/${song.id}`)
                    e.stopPropagation();
                  }} className={`text-base font-semibold truncate hover:underline ${isCurrentPlaying ? "bg-gradient-to-br from-purple-500 to-blue-500 bg-clip-text text-transparent" : "text-white"} `}>{song.name}</h3>
                  <p className="text-sm text-[#A0A0B2] line-clamp-2 font-medium">
                    {song.type?.charAt(0).toUpperCase() + song.type?.slice(1)}
                  </p>

                </div>

              )

            })}
          </ScrollContainer>
          <ScrollContainer title="Haryanvi Trends">
            {homePlaylists.haryanvi.map((song) => {
              const isCurrent = currentSongId === song?.id;
              const isCurrentPlaying = isCurrent && isPlaying;   // check if current song is playing

              return (
                <div
                  key={song.id}
                  className="flex-shrink-0 w-46 rounded-lg p-2.5 hover:bg-[rgba(124,77,255,0.1)] transition-all cursor-pointer snap-start"
                  onClick={(e) => {
                    navigate(`/${song.type}/${song.id}`)
                    e.stopPropagation();
                  }}
                >
                  <div className="image-wrapper mb-2">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }} // ✅ animate only first time it appears
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <LazyLoadImage
                        defaultImage={LoadImage}
                        image={song.image?.[2]?.url || fallbackImg}
                        className="song-image"
                        onError={handleError}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    </motion.div>
                    {/* <button className={`play-button ${isCurrentPlaying ? "active" : ""}`}
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
                        saveToRecent(song);
                      }}
                    >
                      <img
                        src={isCurrentPlaying ? PauseBtn : PlayBtn}
                        alt={isCurrentPlaying ? "Pause" : "Play"}
                        className="h-8 w-8"
                      />
                    </button> */}
                  </div>

                  <h3 onClick={(e) => {
                    navigate(`/${song.type}/${song.id}`)
                    e.stopPropagation();
                  }} className={`text-base font-semibold truncate hover:underline ${isCurrentPlaying ? "bg-gradient-to-br from-purple-500 to-blue-500 bg-clip-text text-transparent" : "text-white"} `}>{song.name}</h3>
                  <p className="text-sm text-[#A0A0B2] line-clamp-2 font-medium">
                    {song.type?.charAt(0).toUpperCase() + song.type?.slice(1)}
                  </p>

                </div>

              )

            })}
          </ScrollContainer>
          <ScrollContainer title="Bollywood Vibes">
            {homePlaylists.hindi.map((song) => {
              const isCurrent = currentSongId === song?.id;
              const isCurrentPlaying = isCurrent && isPlaying;   // check if current song is playing

              return (
                <div
                  key={song.id}
                  className="flex-shrink-0 w-46 rounded-lg p-2.5 hover:bg-[rgba(124,77,255,0.1)] transition-all cursor-pointer snap-start"
                  onClick={(e) => {
                    navigate(`/${song.type}/${song.id}`)
                    e.stopPropagation();
                  }}
                >
                  <div className="image-wrapper mb-2">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }} // ✅ animate only first time it appears
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <LazyLoadImage
                        defaultImage={LoadImage}
                        image={song.image?.[2]?.url || fallbackImg}
                        className="song-image"
                        onError={handleError}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    </motion.div>
                    {/* <button className={`play-button ${isCurrentPlaying ? "active" : ""}`}
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
                        saveToRecent(song);
                      }}
                    >
                      <img
                        src={isCurrentPlaying ? PauseBtn : PlayBtn}
                        alt={isCurrentPlaying ? "Pause" : "Play"}
                        className="h-8 w-8"
                      />
                    </button> */}
                  </div>

                  <h3 onClick={(e) => {
                    navigate(`/${song.type}/${song.id}`)
                    e.stopPropagation();
                  }} className={`text-base font-semibold truncate hover:underline ${isCurrentPlaying ? "bg-gradient-to-br from-purple-500 to-blue-500 bg-clip-text text-transparent" : "text-white"} `}>{song.name}</h3>
                  <p className="text-sm text-[#A0A0B2] line-clamp-2 font-medium">
                    {song.type?.charAt(0).toUpperCase() + song.type?.slice(1)}
                  </p>

                </div>

              )

            })}
          </ScrollContainer>

        </>
      )}
    </motion.div>
  );
}