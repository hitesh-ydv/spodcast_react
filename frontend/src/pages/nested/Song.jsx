import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../components/Loader';
import DefaultCover from "../../assets/artist.jpg"
import PlayBtn from "../../assets/playbtn.svg";
import PauseBtn from "../../assets/pause.svg";
import PlayWhite from "../../assets/play-white.svg";
import PauseWhite from "../../assets/pause-white.svg";
import Like from "../../assets/like.svg";
import Download from "../../assets/download.svg";
import { LazyLoadImage } from '@tjoskar/react-lazyload-img';
import ScrollContainer from '../../layouts/ScrollContainer';
import fallbackImg from "../../assets/playlist_cover.jpg"; // 👈 your default image path
import axios from 'axios';
import { useAudio } from '../../context/AudioContext';
import { Button, Tooltip } from "flowbite-react";

const Song = () => {
    const { id } = useParams();
    const [song, setSong] = useState(null);
    const [recommendedSongs, setRecommendedSongs] = useState([]);
    const [backgroundColor, setBackgroundColor] = useState('');
    const [scrollContainerBg, setScrollContainerBg] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const imageRef2 = useRef(null);
    const [lyrics, setLyrics] = useState("");
    const [showMore, setShowMore] = useState(false);
    const [loading, setLoading] = useState(true);

    const { playSong, currentSong, isPlaying, togglePlayPause } = useAudio();

    const navigate = useNavigate();

    useEffect(() => {
        const fetchSongData = async () => {
            try {
                setIsLoading(true);
                const { data } = await axios.get(
                    `https://jiosavan-api-with-playlist.vercel.app/api/songs/${id}`
                );
                setSong(data.data);
            } catch (err) {
                console.error("Error fetching song data:", err);
                setError(err.response?.data?.message || "Failed to fetch song data");
            } finally {
                //setIsLoading(false);
            }
        };

        const fetchLyrics = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(
                    `https://jiosavan-api-with-playlist.vercel.app/api/songs/${id}/lyrics`
                );
                setLyrics(data.data?.lyrics || "Lyrics not available");
            } catch (err) {
                console.error("Error fetching lyrics:", err);
                setLyrics("Lyrics not found.");
            } finally {
                setLoading(false);
            }
        };

        const fetchRecommendedSongs = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(
                    `https://jiosavan-api-with-playlist.vercel.app/api/songs/${id}/suggestions?limit=5`
                );
                setRecommendedSongs(data.data);
            } catch (err) {
                console.error("Error fetching recommendations:", err);
                setRecommendedSongs([]);
            } finally {
                //setLoading(false);
            }
        };

        if (id) {
            fetchSongData();
            fetchLyrics();
            fetchRecommendedSongs();
        }
    }, [id]);

    const extractColorFromImage = () => {
        if (!imageRef2.current) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = imageRef2.current;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        let r = 0, g = 0, b = 0, count = 0;

        // Sample every 10th pixel for performance
        for (let i = 0; i < pixels.length; i += 40) {
            r += pixels[i];
            g += pixels[i + 1];
            b += pixels[i + 2];
            count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        // Much darker tone for scroll container (Spotify-style deep look)
        const deepR = Math.max(0, r - 70);
        const deepG = Math.max(0, g - 70);
        const deepB = Math.max(0, b - 70);

        // For main hero section (less dark)
        const mainGradient = `linear-gradient(0deg, rgb(${deepR - 20}, ${deepG - 20}, ${deepB - 20}), rgb(${r - 20}, ${g - 20}, ${b - 20}))`;
        setBackgroundColor(mainGradient);

        // 🖤 Scroll container gradient — deep top to dark theme bottom
        const scrollGradient = `
    linear-gradient(
      to bottom,
      rgba(${deepR}, ${deepG}, ${deepB}, 0.9) 0%,
      rgba(${deepR}, ${deepG}, ${deepB}, 0.75) 1%,
      rgba(18, 18, 18, 1) 20%,
      #121212 100%
    )
  `;

        setScrollContainerBg(scrollGradient);
        console.log(mainGradient, scrollGradient)
    };




    // Split lyrics by <br> to handle HTML format
    const lines = lyrics.split(/<br\s*\/?>/i).filter((line) => line.trim() !== "");
    const MAX_LINES = 8;
    const displayedLyrics = showMore ? lines : lines.slice(0, MAX_LINES);

    if (loading) {
        return (
            <Loader />
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-xl">Error: {error}</div>
            </div>
        );
    }

    if (!song) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-xl">Song not found</div>
            </div>
        );
    }

    const handleError = (e) => {
        e.target.onerror = null; // prevent infinite loop
        e.target.src = fallbackImg; // set default image
    };

    const isCurrent = currentSong?.id === song[0]?.id;
    const isCurrentPlaying = isCurrent && isPlaying;   // check if current song is playing

    const handleClick = () => {
        if (isCurrent) {
            // same song → toggle play/pause
            togglePlayPause();
        } else {
            // different song → play new song
            playSong(song[0]?.id);
        }
    };

    const handleRecommendedSongClick = (song) => {
        const id = song?.id;
        if (!id) return;

        if (currentSong?.id === id) {
            togglePlayPause();
        } else {
            playSong(id);
        }
    };


    return (
        <div className="text-white transition-all duration-500 w-full">

            <div className="relative flex items-end gap-8 px-7 py-7 bg-opacity-30 w-full max-w-full" style={{ background: backgroundColor }}>
                <div className="flex-shrink-0">
                    <img
                        ref={imageRef2}
                        src={song[0].image[2].url || fallbackImg}
                        //alt={artist.name}
                        className="w-50 h-50 rounded-sm object-cover shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
                        onLoad={extractColorFromImage}
                        onError={handleError}
                        crossOrigin='anoymous'
                    />
                </div>

                {/* Artist Info */}
                <div className="max-w-full">

                    <span className="text-md font-bold">
                        {song[0].type.charAt(0).toUpperCase() + song[0].type.slice(1)}
                    </span>

                    {/* Artist Name */}
                    <h1 className="text-6xl font-black mb-6 mt-3 line-clamp-1 leading-none">
                        {song[0].name}
                    </h1>


                    <div className="mb-0 flex flex-row items-center gap-1">
                        <img
                            src={song[0].artists.primary[0].image[0]?.url || DefaultCover}
                            //alt={artist.name}
                            className="w-6 h-6 rounded-full object-cover shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
                            crossOrigin="anonymous"
                        />


                        <span onClick={(e) => {
                            navigate(`/${song[0].artists.primary[0]?.type}/${song[0].artists.primary[0]?.id}`)
                            e.stopPropagation()

                        }} className="text-md ml-1 font-medium hover:underline cursor-pointer">
                            {song[0].artists.primary[0].name}
                        </span>
                        <span className="text-md text-[#adadad] font-medium">
                            •
                        </span>
                        <span onClick={(e) => {
                            navigate(`/album/${song[0].album.id}`)
                            e.stopPropagation()

                        }} className="text-md font-medium hover:underline cursor-pointer">
                            {song[0].album.name}
                        </span>
                        <span className="text-md text-[#adadad] font-medium">
                            •
                        </span>
                        <span className="text-md text-[#adadad] font-medium">
                            {song[0].year}
                        </span>

                    </div>
                </div>
            </div>

            <div
                className='w-full pt-6 min-h-screen'
                style={{
                    background: scrollContainerBg,
                    height: "100%",
                }}
            >
                <div className='px-6 py-1 flex items-center gap-4'>
                    <button onClick={handleClick} className="bg-[#1db954] rounded-full px-2.5 py-2.5 hover:bg-[#4dc075] cursor-pointer flex items-center justify-center transition-transform duration-200 hover:scale-105">
                        <img
                            src={isCurrentPlaying ? PauseBtn : PlayBtn}
                            alt={isCurrentPlaying ? "Pause" : "Play"}
                            className="h-8 w-8"
                        />
                    </button>
                    <Tooltip content="Add to Liked Songs" style="dark" placement="top" arrow={false} className='bg-[#202020]'>
                        <button className="cursor-pointer px-2.5 py-2.5 flex items-center justify-center transition-transform duration-200 hover:scale-105">
                            <img src={Like} alt="Play" className="h-8 w-8" />
                        </button>
                    </Tooltip>
                    <Tooltip content="Download Song" style="dark" placement="top" arrow={false} className='bg-[#202020]'>
                        <button className="px-2.5 py-2.5 flex items-center cursor-pointer  justify-center transition-transform duration-200 hover:scale-105">
                            <img src={Download} alt="Play" className="h-8 w-8" />
                        </button>
                    </Tooltip>
                </div>

                <div className="p-6 rounded-lg shadow-lg text-white">
                    <h2 className="text-2xl font-bold mb-4">Lyrics</h2>

                    {loading ? (
                        <p className="text-gray-400 italic">Loading lyrics...</p>
                    ) : (
                        <>
                            <div className="text-gray-200 leading-relaxed">
                                {displayedLyrics.map((line, index) => (
                                    <p key={index} className="mb-2">
                                        {line.trim()}
                                    </p>
                                ))}
                            </div>

                            {lines.length > MAX_LINES && (
                                <button
                                    onClick={() => setShowMore(!showMore)}
                                    className="mt-4 text-sm font-semibold text-gray-400 hover:text-white transition-all"
                                >
                                    {showMore ? "Show less" : "...Show more"}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {song[0].artists.primary !== 0 && (
                    <div className='p-3'>
                        {song[0].artists.primary.map((artist) => (
                            <div key={artist.id} className='flex flex-row items-center gap-4 hover:bg-[#202020] px-3 py-3 rounded-lg transition-all'>
                                <LazyLoadImage
                                    image={artist.image[2]?.url || fallbackImg}
                                    className="w-16 h-16 rounded-full"
                                    onError={handleError}
                                />
                                <div>
                                    <h1 className='text-md font-medium'>{artist.type.charAt(0).toUpperCase() + artist.type.slice(1)}</h1>
                                    <span onClick={(e) => {
                                        navigate(`/artist/${artist.id}`)
                                        e.stopPropagation()

                                    }} className="text-md font-medium hover:underline cursor-pointer">
                                        {artist.name}
                                    </span>

                                </div>
                            </div>
                        ))}

                    </div>
                )}

                {recommendedSongs.length !== 0 && (
                    <ScrollContainer title="Recommended" icons={false} direction="col">
                        {recommendedSongs.map((song) => {
                            const isCurrent = currentSong?.id === song.id;
                            const isCurrentPlaying = isCurrent && isPlaying;

                            return (
                                <div
                                    key={song.id}
                                    onClick={() => handleRecommendedSongClick(song)}
                                    className={`recommended-cont2 relative p-2.5 rounded flex items-center justify-between  cursor-pointer
    ${isCurrent ? "bg-[#303030]" : "hover:bg-[#202020]"}`}
                                >
                                    <div className='flex flex-row items-center gap-4 '>
                                        {/* Image Container */}
                                        <div className="relative">
                                            <LazyLoadImage
                                                image={song.image[1]?.url || fallbackImg}
                                                className="w-11 h-11 rounded"
                                                onError={handleError}
                                            />

                                            {/* ▶️ Play/Pause Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRecommendedSongClick(song);
                                                }}
                                                className={`play-btn ${isCurrentPlaying ? "visible" : ""}`}
                                            >

                                                <img
                                                    src={isCurrentPlaying ? PauseWhite : PlayWhite}
                                                    alt={isCurrentPlaying ? "Pause" : "Play"}
                                                    className="max-h-6 max-w-6"
                                                />
                                            </button>
                                        </div>

                                        {/* Song Info */}
                                        <div className="flex flex-col min-w-0">
                                            <h1
                                                onClick={(e) => {
                                                    navigate(`/${song.type}/${song.id}`);
                                                    e.stopPropagation();
                                                }}
                                                className={`cursor-pointer text-md font-medium truncate ${isCurrent ? "text-[#1db954]" : "text-white hover:underline"
                                                    }`}
                                            >
                                                {song.name}
                                            </h1>

                                            <p className="text-[14px] text-gray-400 truncate font-medium">
                                                {song.artists.primary.map((a, index) => (
                                                    <span key={a.id || index}>
                                                        <a
                                                            className="hover:underline cursor-pointer hover:text-white"
                                                            onClick={(e) => {
                                                                navigate(`/artist/${a.id}`);
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
                                    </div>
                                    <Tooltip animation="duration-600" content="Add to Liked Songs" style="dark" placement="top" arrow={false} className='bg-[#202020] '>
                                        <button className="transition-all like-btn  cursor-pointer px-2.5 py-2.5 flex items-center justify-center">
                                            <img src={Like} alt="Play" className="w-6" />
                                        </button>
                                    </Tooltip>
                                </div>

                            );
                        })}
                    </ScrollContainer>
                )}

            </div>

        </div >
    )
}

export default Song