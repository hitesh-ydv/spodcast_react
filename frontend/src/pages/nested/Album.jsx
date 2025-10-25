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
import LoadImage from "../../assets/afterload.png"; // 👈 your default image path
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
const API_URL = import.meta.env.VITE_API_URL;


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

    const { playSong, currentSong, isPlaying, togglePlayPause, setPlaylistSongs } = useAudio();

    const navigate = useNavigate();

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
                setPlaylistSongs(data.data.songs);
                console.log(data.data.data)
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
      rgba(${deepR}, ${deepG}, ${deepB}, 0.6) 0px,
      rgba(${deepR}, ${deepG}, ${deepB}, 0.4) 30px,
      rgba(18, 18, 18, 0.8) 130px,
      #121212 100%
    )
  `;

        setScrollContainerBg(scrollGradient);
        console.log(mainGradient, scrollGradient)
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






    return (
        <div className="text-white transition-all duration-500 w-full">

            <div className="relative flex items-end gap-8 px-7 py-7 bg-opacity-30 w-full max-w-full" style={{ background: backgroundColor }}>
                <div className="flex-shrink-0">
                    <img
                        ref={imageRef2}
                        src={details.image[2]?.url || fallbackImg}
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
                        {details.type.charAt(0).toUpperCase() + details.type.slice(1)}
                    </span>

                    {/* Artist Name */}
                    <h1 className="text-6xl font-black mb-3 mt-3 line-clamp-1 leading-none">
                        {details.name}
                    </h1>

                    <span className="text-sm text-[#adadad] font-medium">
                        {details.description}
                    </span>


                    <div className="mb-0 flex flex-row items-center gap-2 mt-1">


                        <span className="text-sm text-[#adadad] font-medium">
                            SongCount
                        </span>
                        <span className="text-sm text-[#adadad] font-medium">
                            •
                        </span>
                        <span className="text-sm text-[#adadad] font-medium">
                            {details.songCount} Songs
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
                        className="bg-[#1db954] rounded-full px-2.5 py-2.5 hover:bg-[#4dc075] cursor-pointer flex items-center justify-center transition-transform duration-200 hover:scale-105"
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
                        content="Save to Your Library"
                        placement="top"
                        style={{ backgroundColor: '#242424', color: 'white', padding: 6, borderRadius: 5, fontSize: 15, fontWeight: 550 }}
                    >
                        <button
                            className="custom-target-icon cursor-pointer px-2.5 py-2.5 flex items-center justify-center transition-transform duration-200 hover:scale-105"
                        >
                            <img src={Like} alt="Play" className="h-8 w-8" />
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

                            return (
                                <div
                                    key={song.id}
                                    onClick={() => handleRecommendedSongClick(song)}
                                    className={`recommended-cont2 relative p-2.5 rounded flex items-center justify-between  cursor-pointer
                    ${isCurrent ? "bg-[#303030]" : "hover:bg-[#202020]"}`}
                                >

                                    <div className='flex flex-row items-center gap-4 '>
                                        <p className='text-[16px] ml-1 text-gray-400 truncate font-medium z-20'>{index + 1}.</p>
                                        {/* Image Container */}
                                        <div className="relative">
                                            <LazyLoadImage
                                            defaultImage={LoadImage}
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
                                                className={`inline-block cursor-pointer text-md font-medium truncate ${isCurrent ? "text-[#1db954]" : "text-white hover:underline"
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

                                    <CTooltip
                                        content="Add to Liked Songs"
                                        placement="top"
                                        style={{
                                            backgroundColor: '#242424',
                                            color: 'white',
                                            padding: 6,
                                            borderRadius: 5,
                                            fontSize: 15,
                                            fontWeight: 550,
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)', // 👈 add this line
                                        }}
                                    >
                                        <button className="transition-all like-btn  cursor-pointer px-2.5 py-2.5 flex items-center justify-center">
                                            <img src={Like} alt="Play" className="w-6" />
                                        </button>
                                    </CTooltip>
                                </div>

                            );
                        })}
                    </ScrollContainer>
                )}

            </div>

        </div >
    )
}

export default Album