import { useEffect, useState } from "react";
import { useLocation, useNavigate, useNavigation } from "react-router-dom";
import axios from "axios";
import { useSearch } from "../../context/SearchContext";
import ScrollContainer from "../../layouts/ScrollContainer";
import { LazyLoadImage } from "@tjoskar/react-lazyload-img";
import Loader from "../../components/Loader"; // Make sure you have a Loader component
import fallbackImg from "../../assets/playlist_cover.jpg"; // 👈 your default image path
import LoadImage from "../../assets/afterload.png"; // 👈 your default image path
import PlayBtn from "../../assets/playbtn.svg";
import PauseBtn from "../../assets/pause.svg";
import { useScrollStore } from "../../context/useScrollStore";
import { useRef } from "react";
import { useAudio } from "../../context/AudioContext";
const API_URL = import.meta.env.VITE_API_URL;

export default function Search({ topResults, songs, playlists, albums, artists, loading2, query }) {
  const scrollRef = useRef(null);
  const { pathname } = useLocation();
  const { positions, setPosition } = useScrollStore();
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [currentSongId, setCurrentSongId] = useState("");

  const { playSong, currentSong, isPlaying, togglePlayPause, setPlaylistSongs } = useAudio();

  useEffect(() => {
    const container = scrollRef.current;
    if (container && positions[pathname]) {
      container.scrollTop = positions[pathname];
    }

    const handleScroll = () => {
      setPosition(pathname, container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [pathname, positions, setPosition]);

  const location = useLocation();

  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("All");


  const fetchRecommendedSongs = async (id, song) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/songs/${id}/suggestions?limit=20`
      );
      setPlaylistSongs([song, ...data.data])

    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setRecommendedSongs([]);
    } finally {
      //setLoading(false);
    }
  };


  // Clear songs if leaving search page
  useEffect(() => {
    if (location.pathname !== "/search") {
      setSongs([]);
    }
  }, [location.pathname]);

  console.log(albums)

  const handleError = (e) => {
    e.target.onerror = null; // prevent infinite loop
    e.target.src = fallbackImg; // set default image
  };

  // 🔹 Filters setup
  const filters = ["All", "Songs", "Artists", "Playlists", "Albums"];

  // 🔹 Filter logic
  const shouldShow = (type) => activeFilter === "All" || activeFilter === type;

  const isCurrent = currentSongId === topResults[0]?.id;
  const isCurrentPlaying = isCurrent && isPlaying;   // check if current song is playing

  const handleClick = (e, song) => {
    setCurrentSongId(song.id)
    fetchRecommendedSongs(song.id, song)
    e.stopPropagation()
    if (isCurrent) {
      // same song → toggle play/pause
      togglePlayPause();
    } else {
      // different song → play new song
      playSong(topResults[0].id);
    }
  };


  return (
    <section ref={scrollRef} className="flex flex-col w-full bg-[#121212] h-full text-white">


      {/* CASE 1: No query typed yet */}
      {!query && (
        <div className="flex items-center justify-center w-full min-h-full text-white text-2xl font-bold">
          What do you want to play?
        </div>
      )}

      {/* CASE 2: Query typed but loading */}
      {query && loading2 && (
        <Loader />
      )}

      {/* CASE 3: Query typed and loaded */}
      {query && !loading2 && songs.length > 0 && (
        <>
          {/* 🔹 Filter Buttons */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide w-full min-h-12 py-2 mt-3 px-4">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-0 rounded-full text-[13px] font-medium transition-all duration-200 flex items-center justify-center
        ${activeFilter === filter
                    ? "bg-white text-black"
                    : "bg-[#1f1f1f] text-white hover:bg-[#2a2a2a]"
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>


          {shouldShow("All") && topResults.length > 0 && (
            <ScrollContainer title="Top Results" icons={false}>
              {topResults.map((song) => (
                <div
                  onClick={(e) => {
                    navigate(`/${song.type}/${song.id}`)
                    e.stopPropagation();
                  }}
                  key={song.id}
                  className="relative w-112 bg-[#181818] rounded-lg p-5 hover:bg-[#191919] transition-all cursor-pointer topresult"
                >
                  <LazyLoadImage
                    defaultImage={LoadImage}
                    image={song.image[2]?.url || fallbackImg}
                    className={`rounded-${song.type == "artist" ? "full" : "lg"} mb-3 w-30 max-h-30 object-cover`}
                    onError={handleError}
                  />

                  {song.type == "song" && (
                    <button onClick={(e) => handleClick(e, song)} className={`play-button-topresults ${isCurrentPlaying ? "active" : ""}`}>
                      <img
                        src={isCurrentPlaying ? PauseBtn : PlayBtn}
                        alt={isCurrentPlaying ? "Pause" : "Play"}
                        className="h-8 w-8"
                      />
                    </button>
                  )}


                  <h3 onClick={(e) => {
                    navigate(`/${song.type}/${song.id}`)
                    e.stopPropagation();
                  }} className="text-2xl font-bold truncate hover:underline">{song.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 font-medium">
                    {song.type.charAt(0).toUpperCase() + song.type.slice(1)} {song.type == "song" ? "•" : ""} {song.primaryArtists}

                  </p>

                </div>
              ))}
            </ScrollContainer>
          )}

          {songs.length > 0 && (
            (shouldShow("All") || shouldShow("Songs") ? (
              <ScrollContainer title="Songs">
                {songs.map((song) => {
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
            ) : null)
          )}

          {playlists?.length > 0 && (  // Outer wrapper: only render if playlists exist
            (shouldShow("All") || shouldShow("Playlists")) ? (
              <ScrollContainer title="Playlists">
                {playlists.map((song) => (
                  <div
                    key={song.id}
                    className="flex-shrink-0 w-46 rounded-lg p-2.5 hover:bg-[#191919] transition-all cursor-pointer snap-start"
                    onClick={(e) => {
                      navigate(`/${song.type}/${song.id}`)
                      e.stopPropagation();
                    }}
                  >
                    <LazyLoadImage
                      defaultImage={LoadImage}
                      image={song.image[2]?.url || fallbackImg}
                      className="rounded-lg mb-3 w-full max-h-43 object-cover"
                      onError={handleError}
                    />

                    <h3 onClick={(e) => {
                      navigate(`/${song.type}/${song.id}`)
                      e.stopPropagation();
                    }} className="text-base font-semibold truncate hover:underline">{song.name}</h3>
                    <p className="text-sm text-gray-400 font-medium line-clamp-2">
                      {song.type.charAt(0).toUpperCase() + song.type.slice(1)}
                    </p>
                  </div>
                ))}
              </ScrollContainer>
            ) : null
          )}


          {albums.length > 0 && (
            (shouldShow("All") || shouldShow("Albums") ? (
              <ScrollContainer title="Albums">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="flex-shrink-0 w-46 rounded-lg p-2.5 hover:bg-[#191919] transition-all cursor-pointer snap-start"
                    onClick={(e) => {
                      navigate(`/${album.type}/${album.id}`)
                      e.stopPropagation();
                    }}
                  >
                    <LazyLoadImage
                      defaultImage={LoadImage}
                      image={album.image[2].url || fallbackImg}
                      onError={handleError}
                      className="rounded-lg mb-3 w-full max-h-43 object-cover"

                    />
                    <h3 onClick={(e) => {
                      navigate(`/${album.type}/${album.id}`)
                      e.stopPropagation();
                    }} className="text-base font-semibold truncate hover:underline">
                      {album.name}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 font-medium">
                      {album.artists.all.map((a, index) => (
                        <span key={a.id || index}>
                          <a
                            className="hover:underline hover:text-white"
                            onClick={(e) => {
                              navigate(`/artist/${a.id}`)
                              e.stopPropagation()
                            }}
                          >
                            {a.name}
                          </a>
                          {index < album.artists.all.length - 1 && ", "}
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </ScrollContainer>
            ) : null)
          )}

          {artists.length > 0 && (
            (shouldShow("All") || shouldShow("Artists") ? (
              <ScrollContainer title="Artists">
                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={(e) => {
                      navigate(`/${artist.type}/${artist.id}`)
                    }}
                    className="flex-shrink-0 w-46 rounded-lg p-2.5 hover:bg-[#191919] transition-all cursor-pointer snap-start"
                  >
                    <LazyLoadImage
                      defaultImage={LoadImage}
                      image={artist.image?.[2]?.url || fallbackImg}
                      onError={handleError}
                      className="rounded-full mb-3 w-full max-h-43 object-cover"

                    />
                    <h3 onClick={(e) => {
                      navigate(`/${artist.type}/${artist.id}`)
                      e.stopPropagation();
                    }} className="text-base font-semibold truncate hover:underline">
                      {artist.name}
                    </h3>
                    <p className="text-sm text-gray-400 truncate font-medium">
                      Artist
                    </p>
                  </div>
                ))}
              </ScrollContainer>
            ) : null)
          )}
        </>

      )}

    </section>
  );
}
