// Artist.jsx
import { useState, useEffect, useRef } from 'react';
import { data, useNavigate, useParams } from 'react-router-dom';
import Loader from '../../components/Loader';
import Verify from "../../assets/verify.svg";
import axios, { all } from 'axios';
import ScrollContainer from '../../layouts/ScrollContainer';
import { LazyLoadImage } from '@tjoskar/react-lazyload-img';
import DefaultCover from "../../assets/artist.jpg"
import fallbackImg from "../../assets/playlist_cover.jpg"; // 👈 your default image path
import PlayBtn from "../../assets/playbtn.svg";
import Like from "../../assets/like.svg";
import Download from "../../assets/download.svg";
import Bullet from "../../assets/bullet.svg";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

const Artist = () => {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [backgroundColor, setBackgroundColor] = useState('');
    const [scrollContainerBg, setScrollContainerBg] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const imageRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchArtistData = async () => {
            try {
                setIsLoading(true);
                const { data } = await axios.get(
                    `https://jiosavan-api-with-playlist.vercel.app/api/artists/${id}`
                );

                setArtist(data.data);
                console.log(data.data);
            } catch (err) {
                console.error("Error fetching artist data:", err);
                setError(err.response?.data?.message || err.message || "Failed to fetch artist data");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchArtistData();
    }, [id]);

    const extractColorFromImage = () => {
        if (!imageRef.current) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = imageRef.current;

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
        const mainGradient = `linear-gradient(135deg, rgb(${deepR - 20}, ${deepG - 20}, ${deepB - 20}), rgb(${r - 20}, ${g - 20}, ${b - 20}))`;
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
    
    return (
        <div
            className="max-h-screen text-white transition-all duration-500 w-full"

        >

            <div className="relative flex items-end gap-8 px-10 pt-16 pb-10 bg-opacity-30 w-full max-w-full" style={{ background: backgroundColor, transition: all }}>
                {/* <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "linear-gradient(to top, #121212 10%, rgba(18,18,18,0) 20%)",
                        opacity: 1
                    }}
                /> */}
                {/* Artist Image */}
                <div className="flex-shrink-0">
                    <img
                        ref={imageRef}
                        src={artist.image[2].url || fallbackImg}
                        //alt={artist.name}
                        className="w-58 h-58 rounded-full object-cover shadow-2xl"
                        onLoad={extractColorFromImage}
                        crossOrigin="anonymous"
                        onError={handleError}
                    />
                </div>

                {/* Artist Info */}
                <div className="pb-5 max-w-full">

                    <div className='flex flex-row gap-2 items-center mb-4'>
                        <img src={Verify} alt="Verify" className="h-8 w-8" />
                        {/* Artist Name */}
                        <h1 className="text-md font-medium">
                            Verified Artist
                        </h1>
                    </div>

                    <h1 className="text-6xl font-black mb-6 line-clamp-1">
                        {artist.name}
                    </h1>

                    {/* Monthly Listeners */}
                    <div className="mb-6">
                        <span className="text-lg font-medium">
                            {formatNumber(artist.followerCount)} followers
                        </span>
                    </div>


                </div>
            </div>

            <div
                className='w-full pt-6'
                style={{
                    background: scrollContainerBg,
                    height: "100%",
                }}
            >
                <div className='px-6 py-1 flex items-center gap-6'>
                    <button className="bg-[#1db954] rounded-full px-2.5 py-2.5 hover:bg-[#4dc075] cursor-pointer flex items-center justify-center transition-transform duration-200 hover:scale-105">
                        <img src={PlayBtn} alt="Play" className="h-8 w-8" />
                    </button>
                    {/* Follow Button */}
                    <button className="bg-transparent border-[#adadad] hover:border-white transition-all border-1 cursor-pointer text-white px-6 py-1.5 rounded-full font-semibold hover:scale-105 transform transition-transform duration-200">
                        Follow
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
                                <button onClick={() => navigate(`/user/${user.userId}`)} className="group flex w-full font-semibold text-base items-center gap-2 rounded-sm px-3 py-1.5 data-focus:bg-white/10">
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
                        {artist?.topSongs?.map((song) => (
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
                                }}
                                    className="text-base font-semibold truncate hover:underline">{song.name}</h3>
                                <p className="text-sm text-gray-400 truncate font-medium">
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

                {artist.topAlbums.length !== 0 && (
                    <ScrollContainer title="Top Albums">
                        {artist?.topAlbums?.map((song) => (
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
                                    {song.artists.primary.map((a, index) => (
                                        <span key={a.id || index}>
                                            <a
                                                className="hover:underline hover:text-white"
                                                onClick={() => navigate(`/artist/${a.id}`)}
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
                                className="flex-shrink-0 w-46 rounded-lg p-2.5 hover:bg-[#191919] transition-all cursor-pointer snap-start"
                                onClick={(e) => {
                                    navigate(`/${song.type}/${song.id}`)
                                    e.stopPropagation();
                                }}
                            >
                                <LazyLoadImage
                                    image={song.image[2]?.url || fallbackImg}
                                    className="rounded-full mb-3 w-full max-h-43 object-cover"
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
                                    {song.type.toUpperCase()}
                                </p>

                            </div>
                        ))}
                    </ScrollContainer>
                )}


            </div>


        </div>
    );
};

export default Artist;