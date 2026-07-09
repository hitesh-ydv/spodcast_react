import React, { useRef, useState, useCallback } from 'react'
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
import fallbackImg from "../../assets/playlist_cover.jpg";
import { useAudio } from '../../context/AudioContext';
import { CButton, CTooltip } from '@coreui/react'
import LoadImage from "../../assets/afterload.png";
import { Vibrant } from "node-vibrant/browser";
import MusicGif from "../../assets/music.gif";
import { useRecent } from "../../context/RecentContext";
import { useLibrary } from "../../context/LibraryContext";
import Unlike from "../../assets/unlike.svg";
import { motion } from "framer-motion";
import { useSong } from "../../hooks/service";
import DownloadModal from '@/components/DownloadModal';


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

const Song = () => {
    const { id } = useParams();
    const [backgroundColor, setBackgroundColor] = useState(null);
    const [scrollContainerBg, setScrollContainerBg] = useState(null);
    const imageRef2 = useRef(null);
    const [showMore, setShowMore] = useState(false);
    const { toggleLike, isLiked, } = useLibrary();
    const [showDownload, setShowDownload] = useState(false);
    const {
        songQuery,
        lyricsQuery,
        recommendationsQuery,
    } = useSong(id);

    const { saveToRecent } = useRecent();
    const { playSong, currentSong, isPlaying, togglePlayPause, setPlaylistSongs } = useAudio();

    const navigate = useNavigate();

    const song = songQuery.data;
    const lyrics = lyricsQuery.data;
    const recommendedSongs = recommendationsQuery.data || [];

    console.log("song", song);

    const isLoading =
        songQuery.isLoading

    const error =
        songQuery.error

    const liked = isLiked(id)

    const handleLikeToggle = (e, song) => {
        e.stopPropagation();
        toggleLike(song);
    };

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
    }

    const lines = lyrics?.split(/<br\s*\/?>/i).filter((line) => line.trim() !== "");
    const MAX_LINES = 8;
    const displayedLyrics = showMore ? lines : lines?.slice(0, MAX_LINES);

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-xl">Error</div>
            </div>
        );
    }

    if (!song) {
        return null;
    }

    const handleError = (e) => {
        e.target.onerror = null; // prevent infinite loop
        e.target.src = fallbackImg; // set default image
    };

    const isCurrent = currentSong?.id === song?.[0]?.id;
    const isCurrentPlaying = isCurrent && isPlaying;

    const handleClick = () => {
        saveToRecent({
            id: song[0].id,
            type: song[0].type,
            name: song[0].title || song[0].name,
            image: song[0].image?.[2]?.url || song[0].image?.[1]?.url || song[0].image?.[0]?.url || fallbackImg,
        });
        if (isCurrent) {
            // same song → toggle play/pause
            togglePlayPause();
        } else {
            // different song → play new song
            playSong(song[0]?.id);
        }
        if (song && song.length > 0 && recommendedSongs.length > 0) {
            setPlaylistSongs([song[0], ...recommendedSongs]);
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
        if (recommendedSongs.length > 0) {
            setPlaylistSongs(recommendedSongs);
        }
    }

    const downloadSong = ({ fileName, quality }) => {
        const url =
            song[0].downloadUrl?.[quality]?.url ||
            song[0].downloadUrl?.[quality - 1]?.url;

        if (!url) return;

        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.m4a`; // Works only if the server allows it
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        a.remove();
    };



    return (
        <div className="text-white transition-all duration-500 w-full relative top-0 left-0 ">



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
                        src={song[0].image[2].url || fallbackImg}
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
                        {song[0].type.charAt(0).toUpperCase() + song[0].type.slice(1)}
                    </motion.span>

                    <motion.h1
                        variants={item}
                        className="text-6xl font-black mb-6 mt-3 line-clamp-1 leading-none"
                    >
                        {song[0].name}
                    </motion.h1>

                    <motion.div
                        variants={item}
                        className="mb-0 flex flex-row items-center gap-1"
                    >
                        <img
                            src={song[0].artists.primary[0].image[0]?.url || DefaultCover}
                            className="w-6 h-6 rounded-full object-cover shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
                            crossOrigin="anonymous"
                        />

                        <span
                            onClick={(e) => {
                                navigate(`/${song[0].artists.primary[0]?.type}/${song[0].artists.primary[0]?.id}`);
                                e.stopPropagation();
                            }}
                            className="text-md ml-1 font-medium hover:underline cursor-pointer"
                        >
                            {song[0].artists.primary[0].name}
                        </span>

                        <span className="text-md text-[#adadad] font-medium">•</span>

                        <span
                            onClick={(e) => {
                                navigate(`/album/${song[0].album.id}`);
                                e.stopPropagation();
                            }}
                            className="text-md font-medium hover:underline cursor-pointer"
                        >
                            {song[0].album.name}
                        </span>

                        <span className="text-md text-[#adadad] font-medium">•</span>

                        <span className="text-md text-[#adadad] font-medium">
                            {song[0].year}
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
                <div className='px-6 py-1 flex items-center gap-5'>
                    <button onClick={handleClick} className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-full px-2.5 py-2.5 hover:brightness-150 cursor-pointer flex items-center justify-center transition-transform duration-200 hover:scale-105">
                        <img
                            src={isCurrentPlaying ? PauseBtn : PlayBtn}
                            alt={isCurrentPlaying ? "Pause" : "Play"}
                            className="h-8 w-8"
                        />
                    </button>

                    <CTooltip
                        content={liked ? "Remove from Liked Songs" : "Add to Liked Songs"}
                        placement="top"
                        style={{
                            backgroundColor: "#1D1D2F",
                            color: "white",
                            padding: 6,
                            borderRadius: 5,
                            fontSize: 15,
                            fontWeight: 550,
                        }}
                    >
                        <button
                            type="button"
                            onClick={(e) => handleLikeToggle(e, song[0])}
                            className="flex items-center justify- cursor-pointer"
                        >
                            <img
                                src={liked ? Unlike : Like}
                                alt="Like"
                                className={`w-8 h-8 object-contain transition-transform duration-200 
        ${liked ? "scale-110" : "scale-100"}`}
                            />
                        </button>
                    </CTooltip>

                    <CTooltip
                        content="Download Song"
                        placement="top"
                        style={{
                            backgroundColor: "#1D1D2F",
                            color: "white",
                            padding: 6,
                            borderRadius: 5,
                            fontSize: 15,
                            fontWeight: 550,
                        }}
                    >
                        <button
                            onClick={() => setShowDownload(true)}
                            className="px-2.5 py-2.5 flex items-center cursor-pointer justify-center transition-transform duration-200 hover:scale-105"
                        >
                            <img src={Download} alt="Download" className="h-8 w-8" />
                        </button>
                    </CTooltip>
                </div>


                {lyrics && (
                    <div className="p-6 rounded-lg shadow-lg text-white">
                        <h2 className="text-2xl font-bold mb-4">Lyrics</h2>

                        {isLoading ? (
                            <p className="text-[#A0A0B2] italic">Loading lyrics...</p>
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
                                        className="mt-4 text-sm font-semibold text-[#A0A0B2] hover:text-white transition-all"
                                    >
                                        {showMore ? "Show less" : "...Show more"}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}


                {song[0].artists.primary !== 0 && (
                    <div className='p-3'>
                        {song[0].artists.primary.map((artist) => (
                            <div key={artist.id} className='flex flex-row items-center gap-4 hover:bg-[rgba(124,77,255,0.1)] px-3 py-3 rounded-lg transition-all'>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }} // ✅ animate only first time it appears
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                >
                                    <LazyLoadImage
                                        defaultImage={LoadImage}
                                        image={artist.image?.[2]?.url || fallbackImg}
                                        className="w-16 h-16 rounded-full"
                                        onError={handleError}
                                        draggable={false}
                                        onDragStart={(e) => e.preventDefault()}
                                    />
                                </motion.div>
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
                                    className={`recommended-cont2 group relative p-2.5 rounded flex items-center justify-between cursor-pointer
  ${isCurrent ? "bg-[rgba(124,77,255,0.2)]" : "hover:bg-[rgba(124,77,255,0.1)]"}`}
                                >
                                    <div className='flex flex-row items-center gap-4'>

                                        {/* Image Container */}
                                        <div className="relative">
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                whileInView={{ opacity: 1 }}
                                                viewport={{ once: true }} // ✅ animate only first time it appears
                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                            >

                                                {/* Song Image */}
                                                <LazyLoadImage
                                                    defaultImage={LoadImage}
                                                    image={song.image[1]?.url || fallbackImg}
                                                    className="w-11 h-11 rounded"
                                                    onError={handleError}
                                                    draggable={false}
                                                    onDragStart={(e) => e.preventDefault()}
                                                />
                                            </motion.div>

                                            {/* GIF Overlay (visible when NOT hovered & song playing) */}
                                            {isCurrentPlaying && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                                                    <img
                                                        src={MusicGif}
                                                        alt="playing"
                                                        className="w-4 h-4 object-contain"
                                                    />
                                                </div>
                                            )}

                                            {/* Play/Pause Button (visible on hover) */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRecommendedSongClick(song);
                                                }}
                                                className={`play-btn absolute inset-0 flex items-center justify-center
        bg-black/40 rounded opacity-0 group-hover:opacity-100 transition`}
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
                                                className={`inline-block cursor-pointer text-md font-medium truncate 
        ${isCurrent ? "text-[#7C4DFF]" : "text-white hover:underline"}`}
                                            >
                                                {song.name}
                                            </h1>

                                            <p className="text-[14px] text-[#A0A0B2] truncate font-medium">
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
                                </div>

                            );
                        })}
                    </ScrollContainer>
                )}

            </motion.div>

            <DownloadModal
                open={showDownload}
                onClose={() => setShowDownload(false)}
                song={song[0]}
                onDownload={downloadSong}
            />

        </div >
    )
}

export default Song