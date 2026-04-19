// Artist.jsx
import { useState, useEffect, useRef } from 'react';
import { data, useNavigate, useParams } from 'react-router-dom';
import Loader from '../../components/Loader';
import Verify from "../../assets/verify.svg";
import axios, { all } from 'axios';
import ScrollContainer from '../../layouts/ScrollContainer';
import { LazyLoadImage } from '@tjoskar/react-lazyload-img';
import fallbackImg from "../../assets/playlist_cover.jpg"; // 👈 your default image path
import PlayBtn from "../../assets/playbtn.svg";
import PauseBtn from "../../assets/pause.svg";
import Bullet from "../../assets/bullet.svg";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { useAudio } from '../../context/AudioContext';
import LoadImage from "../../assets/afterload.png"; // 👈 your default image path
import { useRecent } from "../../context/RecentContext";
const API_URL = import.meta.env.VITE_API_URL;
import { Vibrant } from "node-vibrant/browser";
import { useLibrary } from "../../context/LibraryContext";
import { motion } from "framer-motion";
import { useActivity } from "../../context/ActivityContext";

const Artist = () => {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [backgroundColor, setBackgroundColor] = useState('');
    const [scrollContainerBg, setScrollContainerBg] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const imageRef = useRef(null);

    const { toggleArtist, isArtistSaved } = useLibrary();

    const { recentPlayed, saveToRecent } = useRecent(); // Home

    const { recordActivity } = useActivity();

    const [localCurrentSongId, setLocalCurrentSongId] = useState(null);

    const { playSong, currentSong, isPlaying, togglePlayPause, setPlaylistSongs } = useAudio();

    const navigate = useNavigate();

    useEffect(() => {
        const fetchArtistData = async () => {
            try {
                setIsLoading(true);
                const { data } = await axios.get(
                    `${API_URL}/api/artists/${id}`
                );

                setArtist(data.data);
                recordActivity({
                    id: data.data?.id,
                    type: "artist",
                    title: data.data?.name,
                    image: data.data?.image?.[2]?.url,
                });
            } catch (err) {
                console.error("Error fetching artist data:", err);
                setError(err.response?.data?.message || err.message || "Failed to fetch artist data");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchArtistData();
    }, [id]);

    const extractColorFromImage = async () => {
        if (!imageRef.current) return;

        try {
            const palette = await Vibrant
                .from(imageRef.current.src)
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



    const formatNumber = (num) => {
        if (!num) return '0';
        return parseInt(num).toLocaleString();
    };

    if (isLoading) {
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

    if (!artist) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-xl">Artist not found</div>
            </div>
        );
    }

    const handleError = (e) => {
        e.target.onerror = null; // prevent infinite loop
        e.target.src = fallbackImg; // set default image
    };

    const handleMainPlayButton = () => {
        const isCurrentInPlaylist = artist.topSongs.some(
            (s) => s.id === localCurrentSongId
        );

        // set this playlist globally
        setPlaylistSongs(artist.topSongs);
        saveToRecent(artist);

        if (!localCurrentSongId || !isCurrentInPlaylist) {
            if (artist.topSongs.length > 0) {
                const firstSong = artist.topSongs[0];
                setLocalCurrentSongId(firstSong.id);
                playSong(firstSong.id, artist.topSongs); // play first song
            }
        } else {
            togglePlayPause();
        }
    };

    const isCurrentPlaying =
        artist.topSongs.some((s) => s.id === localCurrentSongId) && isPlaying;

    const saved = isArtistSaved(artist.id);

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
        <div
            className="max-h-screen text-white transition-all duration-500 w-full"

        >

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{
                    background: backgroundColor,
                    transition: "background 1.5s ease",
                }}
                className="relative flex items-end gap-8 px-10 pt-16 pb-10 bg-opacity-30 w-full max-w-full"
            >
                {/* 🎵 IMAGE */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex-shrink-0"
                >
                    <img
                        ref={imageRef}
                        src={artist.image[2].url || fallbackImg}
                        className="w-58 h-58 rounded-full object-cover shadow-2xl"
                        onLoad={extractColorFromImage}
                        crossOrigin="anonymous"
                        onError={handleError}
                    />
                </motion.div>

                {/* 📝 TEXT */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="pb-5 max-w-full"
                >
                    <motion.div
                        variants={item}
                        className="flex flex-row gap-2 items-center mb-4"
                    >
                        <img src={Verify} alt="Verify" className="h-8 w-8" />
                        <h1 className="text-md font-medium">Verified Artist</h1>
                    </motion.div>

                    <motion.h1
                        variants={item}
                        className="text-6xl font-black mb-6 line-clamp-1"
                    >
                        {artist.name}
                    </motion.h1>

                    <motion.div variants={item} className="mb-6">
                        <span className="text-lg font-medium">
                            {formatNumber(artist.followerCount)} followers
                        </span>
                    </motion.div>
                </motion.div>
            </motion.div>

            <motion.div
                className="w-full pt-6"
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
                <div className='px-6 py-1 flex items-center gap-6'>
                    <button
                        onClick={handleMainPlayButton}
                        className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-full px-2.5 py-2.5 hover:brightness-150 cursor-pointer flex items-center justify-center transition-transform duration-200 hover:scale-105"
                    >
                        <LazyLoadImage
                            defaultImage={LoadImage}
                            image={isCurrentPlaying ? PauseBtn : PlayBtn}
                            alt={isCurrentPlaying ? "Pause" : "Play"}
                            className="h-8 w-8"
                            onError={handleError}
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                        />
                    </button>
                    <button
                        onClick={() => toggleArtist(artist)}
                        className="bg-transparent border-[#adadad] hover:border-white transition-all border cursor-pointer text-white px-6 py-1.5 rounded-full font-semibold hover:scale-105 transform duration-200"
                    >
                        {saved ? "Unfollow" : "Follow"}
                    </button>

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
                                    Follow
                                </button>
                            </MenuItem>
                            <MenuItem>
                                <button onClick={() => navigate(`/user/${user.userId}`)} className="group flex w-full font-semibold text-base items-center gap-2 rounded-sm px-3 py-1.5 data-focus:bg-white/10">
                                    Share
                                </button>
                            </MenuItem>

                        </MenuItems>
                    </Menu>
                </div>

                {artist.topSongs.length !== 0 && (
                    <ScrollContainer title="Top Songs">
                        {artist?.topSongs?.map((song) => {
                            const isCurrent = localCurrentSongId === song.id;
                            const isCurrentPlaying = isCurrent && isPlaying;
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
                                        <button className={`play-button ${isCurrentPlaying ? "active" : ""}`}
                                            onClick={(e) => {
                                                setPlaylistSongs(artist.topSongs)
                                                e.stopPropagation()
                                                if (isCurrent) {
                                                    // same song → toggle play/pause
                                                    togglePlayPause();
                                                } else {
                                                    // different song → play new song
                                                    playSong(song.id);
                                                }
                                                saveToRecent(artist)

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
                                    }}
                                        className="text-base font-semibold truncate hover:underline">{song.name}</h3>
                                    <p className="text-sm text-[#A0A0B2] line-clamp-2 font-medium">
                                        {song.artists.primary.map((a, index) => (
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
                                                {index < song.artists.primary.length - 1 && ", "}
                                            </span>
                                        ))}
                                    </p>

                                </div>
                            )
                        })}
                    </ScrollContainer>
                )}

                {artist.topAlbums.length !== 0 && (
                    <ScrollContainer title="Top Albums">
                        {artist?.topAlbums?.map((song) => (
                            <div
                                key={song.id}
                                className="flex-shrink-0 w-46 rounded-lg p-2.5 hover:bg-[rgba(124,77,255,0.1)] transition-all cursor-pointer snap-start"
                                onClick={(e) => {
                                    navigate(`/${song.type}/${song.id}`)
                                    e.stopPropagation();
                                }}
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
                                        className="rounded-lg mb-3 w-full max-h-43 object-cover"
                                        onError={handleError}
                                        draggable={false}
                                        onDragStart={(e) => e.preventDefault()}

                                    />
                                </motion.div>

                                <h3 onClick={(e) => {
                                    navigate(`/${song.type}/${song.id}`)
                                    e.stopPropagation();
                                }} className="text-base font-semibold truncate hover:underline">{song.name}</h3>
                                <p className="text-sm text-[#A0A0B2] truncate font-medium">
                                    {song.artists.primary.map((a, index) => (
                                        <span key={a.id || index} onClick={(e) => e.stopPropagation()}>
                                            <a
                                                className="hover:underline hover:text-white"
                                                onClick={() => {
                                                    navigate(`/artist/${a.id}`)


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
                )}

                {artist.singles.length !== 0 && (
                    <ScrollContainer title="Singles">
                        {artist?.singles?.map((song) => (
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
                                    <button className="play-button ">
                                        <img src={PlayBtn} alt="Play" className="h-8 w-8" />
                                    </button>
                                </div>

                                <h3 onClick={(e) => {
                                    navigate(`/${song.type}/${song.id}`)
                                    e.stopPropagation();
                                }} className="text-base font-semibold truncate hover:underline">{song.name}</h3>
                                <p className="text-sm text-[#A0A0B2] truncate font-medium">
                                    {song.artists.primary.map((a, index) => (
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
                                            {index < song.artists.primary.length - 1 && ", "}
                                        </span>
                                    ))}
                                </p>

                            </div>
                        ))}
                    </ScrollContainer>
                )}

                {artist.similarArtists.length !== 0 && (
                    <ScrollContainer title="Similar Artists">
                        {artist?.similarArtists?.map((song) => (
                            <div
                                key={song.id}
                                className="flex-shrink-0 w-46 rounded-lg p-2.5 hover:bg-[rgba(124,77,255,0.1)] transition-all cursor-pointer snap-start"
                                onClick={(e) => {
                                    navigate(`/${song.type}/${song.id}`)
                                    e.stopPropagation();
                                }}
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
                                        className="rounded-full mb-3 w-full max-h-43 object-cover"
                                        onError={handleError}
                                        draggable={false}
                                        onDragStart={(e) => e.preventDefault()}
                                    />
                                </motion.div>

                                <h3 onClick={(e) => {
                                    navigate(`/${song.type}/${song.id}`)
                                    e.stopPropagation();
                                }} className="text-base font-semibold truncate hover:underline">{song.name}</h3>
                                <p className="text-sm text-[#A0A0B2] truncate font-medium">
                                    {song.type.toUpperCase()}
                                </p>

                            </div>
                        ))}
                    </ScrollContainer>
                )}


            </motion.div>


        </div>
    );
};

export default Artist;