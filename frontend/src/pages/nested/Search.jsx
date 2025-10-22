import { useEffect, useState } from "react";
import { useLocation, useNavigate, useNavigation } from "react-router-dom";
import axios from "axios";
import { useSearch } from "../../context/SearchContext";
import ScrollContainer from "../../layouts/ScrollContainer";
import { LazyLoadImage } from "@tjoskar/react-lazyload-img";
import Loader from "../../components/Loader"; // Make sure you have a Loader component
import fallbackImg from "../../assets/playlist_cover.jpg"; // 👈 your default image path
import PlayBtn from "../../assets/playbtn.svg";

export default function Search({ topResults, songs, playlists, albums, artists, loading2, query }) {

  const location = useLocation();

  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("All");

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
  


  return (
    <section className="flex flex-col w-full bg-[#121212] h-full text-white">


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
                    image={song.image[2]?.url || fallbackImg}
                    className={`rounded-${song.type == "artist" ? "full" : "lg"} mb-3 w-30 max-h-30 object-cover`}
                    placeholder={
                      <div className="song-placeholder" />
                    }
                    onError={handleError}
                  />

                  {song.type == "song" && (
                    <button className="play-button-topresults">
                      <img src={PlayBtn} alt="Play" className="h-8 w-8" />
                    </button>
                  )}


                  <h3 onClick={(e) => {
                    navigate(`/${song.type}/${song.id}`)
                    e.stopPropagation();
                  }} className="text-2xl font-bold truncate hover:underline">{song.title}</h3>
                  <p className="text-sm text-gray-400 truncate font-medium">
                    {song.type.charAt(0).toUpperCase() + song.type.slice(1)} {song.type == "song" ? "•" : ""} {song.primaryArtists}

                  </p>

                </div>
              ))}
            </ScrollContainer>
          )}

          {songs.length > 0 && (
            (shouldShow("All") || shouldShow("Songs") ? (
              <ScrollContainer title="Songs">
                {songs.map((song) => (
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
                        image={song.image[2]?.url || fallbackImg}
                        className="song-image"
                        placeholder={
                          <div className="song-placeholder" />
                        }
                        onError={handleError}
                      />
                      <button className="play-button ">
                        <img src={PlayBtn} alt="Play" className="h-8 w-8" />
                      </button>
                    </div>

                    <h3 onClick={(e) => {
                      navigate(`/${song.type}/${song.id}`)
                      e.stopPropagation();
                    }} className="text-base font-semibold truncate hover:underline">{song.name}</h3>
                    <p className="text-sm text-gray-400 truncate font-medium">
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
                ))}
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
                      image={song.image[2]?.url || fallbackImg}
                      className="rounded-lg mb-3 w-full max-h-43 object-cover"
                      placeholder={
                        <div className="rounded-lg mb-3 w-full max-h-43 bg-[#2a2a2a] animate-pulse" />
                      }
                      onError={handleError}
                    />

                    <h3 onClick={(e) => {
                      navigate(`/${song.type}/${song.id}`)
                      e.stopPropagation();
                    }} className="text-base font-semibold truncate hover:underline">{song.name}</h3>
                    <p className="text-sm text-gray-400 truncate font-medium">
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
                      image={album.image[2].url || fallbackImg}
                      onError={handleError}
                      className="rounded-lg mb-3 w-full max-h-43 object-cover"
                      placeholder={
                        <div className="rounded-lg mb-3 w-full max-h-43 bg-[#2a2a2a] animate-pulse" />
                      }
                      
                    />
                    <h3 onClick={(e) => {
                      navigate(`/${album.type}/${album.id}`)
                      e.stopPropagation();
                    }} className="text-base font-semibold truncate hover:underline">
                      {album.name}
                    </h3>
                    <p className="text-sm text-gray-400 truncate font-medium">
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
                      image={artist.image?.[2]?.url || fallbackImg}
                      onError={handleError}
                      className="rounded-full mb-3 w-full max-h-43 object-cover"
                      placeholder={
                        <div className="rounded-full mb-3 w-full max-h-43 bg-[#2a2a2a] animate-pulse" />
                      }
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
