import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../components/Loader';
import DefaultCover from "../../assets/artist.jpg"
import PlayBtn from "../../assets/playbtn.svg";
import PauseBtn from "../../assets/pause.svg";
import PlayWhite from "../../assets/play-white.svg";
import PauseWhite from "../../assets/pause-white.svg";
import Like from "../../assets/like.svg";
import Unlike from "../../assets/unlike.svg";
import Download from "../../assets/download.svg";
import { LazyLoadImage } from '@tjoskar/react-lazyload-img';
import ScrollContainer from '../../layouts/ScrollContainer';
import fallbackImg from "../../assets/playlist_cover.jpg"; // 👈 your default image path
import axios from 'axios';
import { useAudio } from '../../context/AudioContext';
import { CButton, CTooltip } from '@coreui/react'
import Bullet from "../../assets/bullet.svg";
import LoadImage from "../../assets/afterload.png"; // 👈 your default image path
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
const API_URL = import.meta.env.VITE_API_URL;
import { Vibrant } from "node-vibrant/browser";
import MusicGif from "../../assets/music.gif";
import { useRecent } from "../../context/RecentContext";
import { useLibrary } from "../../context/LibraryContext";
import { motion, AnimatePresence } from "framer-motion";


const Album = () => {
    const { id } = useParams();
    const [songs, setSongs] = useState([]);
    const [details, setDetails] = useState([]);
    const [backgroundColor, setBackgroundColor] = useState('');
    const [scrollContainerBg, setScrollContainerBg] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const imageRef2 = useRef(null);
    const [loading, setLoading] = useState(true);
    const { recentPlayed, saveToRecent } = useRecent(); // Home
    const { toggleLike, toggleAlbum, isAlbumSaved, isLiked } = useLibrary();

    const { playSong, currentSong, isPlaying, togglePlayPause, setPlaylistSongs } = useAudio();

    const navigate = useNavigate();



    const handleLikeToggle = (e) => {
        e.stopPropagation();
        toggleLike(currentSong);
    };

    useEffect(() => {
        setLoading(true)
        const fetchPlaylistData = async () => {
            try {
                setIsLoading(true);
                const { data } = await axios.get(
                    `${API_URL}/api/albums?id=${id}`
                );
                setDetails(data.data)
                setSongs(data.data.songs);
                // setPlaylistSongs(data.data.songs);
            } catch (err) {
                console.error("Error fetching song data:", err);
                setError(err.response?.data?.message || "Failed to fetch song data");
            } finally {
                setLoading(false)
            }
        };

        if (id) {
            fetchPlaylistData();
        }
    }, [id]);

    const extractColorFromImage = async () => {
        if (!imageRef2.current) return;

        try {
            const palette = await Vibrant
                .from(imageRef2.current.src)
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

    if (!songs) {
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

    const handleRecommendedSongClick = (song) => {
        if (currentSong?.id === song.id) {
            togglePlayPause(); // ✅ pause/resume same song
        } else {
            playSong(song.id); // ✅ play new song
        }
    };


    const saved = isAlbumSaved(details.id);



    const container = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: 0.12,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };




    return (
        <div className="text-white transition-all duration-500 w-full">

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{
                    background: backgroundColor,
                    transition: "background 1.5s ease", // ✅ smooth gradient change
                }}
                className="relative flex items-end gap-8 px-7 py-7 bg-opacity-30 w-full max-w-full"
            >
                {/* 🎵 IMAGE */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex-shrink-0"
                >
                    <img
                        ref={imageRef2}
                        src={details.image?.[2]?.url || fallbackImg}
                        className="w-50 h-50 rounded-sm object-cover shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
                        onLoad={extractColorFromImage}
                        onError={handleError}
                        crossOrigin="anonymous"
                    />
                </motion.div>

                {/* 📝 TEXT */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="max-w-full"
                >
                    <motion.span variants={item} className="text-md font-bold">
                        {details.type.charAt(0).toUpperCase() + details.type.slice(1)}
                    </motion.span>

                    <motion.h1
                        variants={item}
                        className="text-6xl font-black mb-3 mt-3 line-clamp-1 leading-none"
                    >
                        {details.name}
                    </motion.h1>

                    <motion.span
                        variants={item}
                        className="text-sm text-[#adadad] font-medium"
                    >
                        {details.description}
                    </motion.span>

                    <motion.div
                        variants={item}
                        className="mb-0 flex flex-row items-center gap-2 mt-1"
                    >
                        <span className="text-sm text-[#adadad] font-medium">SongCount</span>
                        <span className="text-sm text-[#adadad] font-medium">•</span>
                        <span className="text-sm text-[#adadad] font-medium">
                            {details.songCount} Songs
                        </span>
                    </motion.div>
                </motion.div>
            </motion.div>

            <motion.div
                className="w-full pt-6 min-h-screen"
                style={{
                    background: scrollContainerBg,
                    height: "100%",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.6,
                    ease: "easeOut",
                }}
            >
                <div className='px-6 py-1 flex items-center gap-4'>
                    <button
                        onClick={() => {
                            saveToRecent(details)
                            setPlaylistSongs(songs); // update context with current playlist songs
                            // If no song is playing or the current song is not in this playlist
                            const isCurrentInPlaylist = songs.some(s => s.id === currentSong?.id);

                            if (!currentSong || !isCurrentInPlaylist) {
                                // Play first song of this playlist
                                if (songs.length > 0) {
                                    playSong(songs[0].id, songs); // pass playlist songs to context
                                }
                            } else {
                                // Toggle play/pause of current song
                                togglePlayPause();
                            }
                        }}
                        className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-full px-2.5 py-2.5 hover:brightness-150 cursor-pointer flex items-center justify-center transition-transform duration-200 hover:scale-105"
                    >
                        <img
                            src={
                                songs.some(s => s.id === currentSong?.id) && isPlaying
                                    ? PauseBtn
                                    : PlayBtn
                            }
                            alt={
                                songs.some(s => s.id === currentSong?.id) && isPlaying
                                    ? "Pause"
                                    : "Play"
                            }
                            className="h-8 w-8"
                        />
                    </button>

                    <CTooltip
                        content={saved ? "Remove from Your Library" : "Save to Your Library"}
                        placement="top"
                        style={{
                            backgroundColor: "#242424",
                            color: "white",
                            padding: 6,
                            borderRadius: 5,
                            fontSize: 15,
                            fontWeight: 550,
                        }}
                    >
                        <button
                            onClick={() => toggleAlbum(details)}
                            className="custom-target-icon cursor-pointer px-2.5 py-2.5 flex items-center justify-center transition-transform duration-200 hover:scale-105"
                        >
                            <img
                                src={saved ? Unlike : Like}   // 👈 CHANGE ICON
                                alt="like"
                                className={`h-8 w-8 transition-all duration-200 ${saved ? "scale-110" : ""
                                    }`}
                            />
                        </button>
                    </CTooltip>

                    <Menu>
                        <MenuButton
                            className="rounded-full px-2 py-2 cursor-pointer flex items-center justify-center"
                        >
                            <img src={Bullet} alt="Bullet" className="h-9 w-9" />
                        </MenuButton>

                        <MenuItems
                            anchor="right end"
                            className="w-48 origin-top-right rounded-sm border border-white/5 bg-[#282828] p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95"
                        >
                            <MenuItem>
                                <button className="group flex w-full font-semibold text-base items-center gap-2 rounded-sm px-3 py-1.5 data-focus:bg-white/10">
                                    Add to Library
                                </button>
                            </MenuItem>
                            <MenuItem>
                                <button className="group flex w-full font-semibold text-base items-center gap-2 rounded-sm px-3 py-1.5 data-focus:bg-white/10">
                                    Share
                                </button>
                            </MenuItem>

                        </MenuItems>
                    </Menu>
                </div>

                {songs.length !== 0 && (
                    <ScrollContainer title={false} icons={false} direction="col">
                        {songs.map((song, index) => {
                            const isCurrent = currentSong?.id === song.id;
                            const isCurrentPlaying = isCurrent && isPlaying;

                            // ✅ FIX: per-song liked state
                            const liked = isLiked(song.id);

                            return (
                                <div
                                    key={song.id}
                                    onClick={() => {
                                        handleRecommendedSongClick(song);
                                        setPlaylistSongs(songs);
                                    }}
                                    className={`recommended-cont2 relative p-2.5 rounded flex items-center justify-between cursor-pointer
          ${isCurrent ? "bg-[rgba(124,77,255,0.2)]" : "hover:bg-[rgba(124,77,255,0.1)]"}`}
                                >
                                    <div className="flex flex-row items-center gap-4">
                                        <p className="text-[16px] ml-1 text-[#A0A0B2] truncate font-medium z-20">
                                            {index + 1}.
                                        </p>

                                        <div className="relative">
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                whileInView={{ opacity: 1 }}
                                                viewport={{ once: true }} // ✅ animate only first time it appears
                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                            >
                                            <LazyLoadImage
                                                defaultImage={LoadImage}
                                                image={song.image[1]?.url || fallbackImg}
                                                className="w-11 h-11 rounded"
                                                onError={handleError}
                                                draggable={false}
                                                onDragStart={(e) => e.preventDefault()}
                                            />
                                            </motion.div>

                                            {isCurrentPlaying && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                                                    <img src={MusicGif} alt="playing" className="w-4 h-4" />
                                                </div>
                                            )}

                                            {/* ▶️ Play Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRecommendedSongClick(song);
                                                    setPlaylistSongs(songs);
                                                    saveToRecent(song);
                                                }}
                                                className={`play-btn rounded ${isCurrentPlaying ? "visible" : ""}`}
                                            >
                                                <img
                                                    src={isCurrentPlaying ? PauseWhite : PlayWhite}
                                                    alt="Play"
                                                    className="max-h-6 max-w-6"
                                                />
                                            </button>
                                        </div>

                                        {/* Song Info */}
                                        <div className="flex flex-col min-w-0">
                                            <h1
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/${song.type}/${song.id}`);
                                                }}
                                                className={`cursor-pointer text-md font-medium truncate ${isCurrent
                                                    ? "text-[#7C4DFF]"
                                                    : "text-white hover:underline"
                                                    }`}
                                            >
                                                {song.name}
                                            </h1>

                                            <p className="text-[14px] text-[#A0A0B2] truncate font-medium">
                                                {song.artists.primary.map((a, i) => (
                                                    <span key={a.id || i}>
                                                        <a
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/artist/${a.id}`);
                                                            }}
                                                            className="hover:underline cursor-pointer hover:text-white"
                                                        >
                                                            {a.name}
                                                        </a>
                                                        {i < song.artists.primary.length - 1 && ", "}
                                                    </span>
                                                ))}
                                            </p>
                                        </div>
                                    </div>

                                    {/* ❤️ LIKE BUTTON */}
                                    <CTooltip
                                        content={
                                            liked
                                                ? "Remove from Liked Songs"
                                                : "Save to Your Library"
                                        }
                                        placement="top"
                                        style={{
                                            backgroundColor: "#242424",
                                            color: "white",
                                            padding: 6,
                                            borderRadius: 5,
                                            fontSize: 12,
                                            fontWeight: 550,
                                        }}
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.button
                                                key={song.id + "-like"} // ✅ FIXED
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // ✅ prevent parent click
                                                    toggleLike(song);     // ✅ pass correct song
                                                }}
                                                className="transition-all like-btn cursor-pointer px-2.5 py-2.5 flex items-center justify-center"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 1.05 }}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <img
                                                    src={liked ? Unlike : Like}
                                                    alt="Like"
                                                    draggable={false}
                                                    onDragStart={(e) => e.preventDefault()}
                                                    className={`w-6 h-6 object-contain transition-transform duration-200 
                  ${liked ? "scale-110" : "scale-100"}`}
                                                />
                                            </motion.button>
                                        </AnimatePresence>
                                    </CTooltip>
                                </div>
                            );
                        })}
                    </ScrollContainer>
                )}

            </motion.div>

        </div >
    )
}

export default Album