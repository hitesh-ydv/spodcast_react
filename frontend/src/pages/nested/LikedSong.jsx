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
import { CButton, CTooltip } from '@coreui/react'
import Bullet from "../../assets/bullet.svg";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import LoadImage from "../../assets/afterload.png"; // 👈 your default image path
const API_URL = import.meta.env.VITE_API_URL;
import { Vibrant } from "node-vibrant/browser";
import MusicGif from "../../assets/music.gif";
import { useRecent } from "../../context/RecentContext";
import { useLibrary } from "../../context/LibraryContext";
import Artist from './Artist';

const LikedSong = () => {
    const { id } = useParams();
    const [songs, setSongs] = useState([]);
    const [details, setDetails] = useState([]);
    const [backgroundColor, setBackgroundColor] = useState('');
    const [scrollContainerBg, setScrollContainerBg] = useState('');
    const [error, setError] = useState(null);
    const imageRef2 = useRef(null);
    const [loading, setLoading] = useState(true);

    const { library } = useLibrary();

    const { recentPlayed, saveToRecent } = useRecent(); // Home

    const { playSong, currentSong, isPlaying, togglePlayPause, setPlaylistSongs } = useAudio();

    const navigate = useNavigate();

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

    if (library.likedSongs.length === 0) {
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




    return (
        <div className="text-white transition-all duration-500 w-full">

            <div className="relative flex items-end gap-8 px-7 py-7 bg-opacity-30 w-full max-w-full" style={{ background: backgroundColor }}>
                <div className="flex-shrink-0">
                    <img
                        ref={imageRef2}
                        src={`https://misc.scdn.co/liked-songs/liked-songs-640.jpg` || fallbackImg}
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
                        Playlist
                    </span>

                    {/* Artist Name */}
                    <h1 className="text-6xl font-black mb-3 mt-3 line-clamp-1 leading-none">
                        Liked Songs
                    </h1>

                    <span className="text-sm text-[#adadad] font-medium">
                        {/* {details.description} */}
                    </span>


                    <div className="mb-0 flex flex-row items-center gap-2 mt-1">


                        {/* <span className="text-sm text-[#adadad] font-medium">
                            SongCount
                        </span>
                        <span className="text-sm text-[#adadad] font-medium">
                            •
                        </span> */}
                        <span className="text-sm text-[#adadad] font-medium">
                            {library.likedSongs.length} {   library.likedSongs.length === 1 ? "song" : "songs"}
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
                    <button
                        onClick={() => {
                            saveToRecent(details)
                            // If no song is playing or the current song is not in this playlist
                            const isCurrentInPlaylist = songs.some(s => s.id === currentSong?.id);
                            setPlaylistSongs(songs); // update context with current playlist songs

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

                {library.likedSongs.length !== 0 && (
                    <ScrollContainer title={false} icons={false} direction="col">
                        {library.likedSongs.map((song, index) => {
                            const isCurrent = currentSong?.id === song.id;
                            const isCurrentPlaying = isCurrent && isPlaying;

                            return (
                                <div
                                    key={song.id}
                                    onClick={() => { handleRecommendedSongClick(song); saveToRecent(details); setPlaylistSongs(songs); }}
                                    className={`recommended-cont2 relative p-2.5 rounded flex items-center justify-between  cursor-pointer
                    ${isCurrent ? "bg-[rgba(124,77,255,0.2)]" : "hover:bg-[rgba(124,77,255,0.1)]"}`}
                                >

                                    <div className='flex flex-row items-center gap-4 '>
                                        <p className='text-[16px] ml-1 text-[#A0A0B2] truncate font-medium z-20'>{index + 1}.</p>
                                        {/* Image Container */}
                                        <div className="relative">
                                            <LazyLoadImage
                                                defaultImage={LoadImage}
                                                image={song.image[1]?.url || fallbackImg}
                                                className="w-11 h-11 rounded"
                                                onError={handleError}
                                            />

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



                                            {/* ▶️ Play/Pause Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRecommendedSongClick(song);
                                                    setPlaylistSongs(songs);
                                                }}
                                                className={`play-btn rounded ${isCurrentPlaying ? "visible" : ""}`}
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
                                                className={`inline-block cursor-pointer text-md font-medium truncate ${isCurrent ? "text-[#7C4DFF]" : "text-white hover:underline"
                                                    }`}
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

            </div>

        </div >
    )
}

export default LikedSong;