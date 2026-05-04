import React from "react";
import { useActivity } from "../context/ActivityContext";
import { useNavigate } from "react-router-dom";
import { useAudio } from "@/context/AudioContext";
import PlayBtn from "../assets/playbtn.svg";
import PauseBtn from "../assets/pause.svg";
import { motion } from "framer-motion";
import axios from "axios";

const ActivityGrid = () => {
    const navigate = useNavigate();

    const { playSong, currentSong, isPlaying, togglePlayPause, setPlaylistSongs } = useAudio();
    const { topActivity } = useActivity();

    const [currentSongId, setCurrentSongId] = React.useState("");

    const fetchRecommendedSongs = async (id, song) => {
        try {
            const { data } = await axios.get(`${API_URL}/api/songs/${id}/suggestions?limit=10`);
            setPlaylistSongs([song, ...data.data]);
        } catch (err) {
            console.error("Error fetching recommendations:", err);
        }
    };

    const handleClick = (item) => {
        navigate(`/${item.type}/${item.id}`);
    };

    // ❌ no items → hide
    if (!topActivity?.length) return null;

    return (
        <div className="px-4 md:px-6 py-6">
            <div className={`
                grid gap-3
                grid-cols-2
                [@media(min-width:1200px)]:grid-cols-3
                ${topActivity.length === 2 
                    ? "[@media(min-width:1400px)]:grid-cols-2" 
                    : "[@media(min-width:1400px)]:grid-cols-4"
                }
            `}>
                {topActivity.map((item) => {

                    const isCurrent = currentSong?.id === item.id;
                    const isCurrentPlaying = isCurrent && isPlaying;

                    return (
                        <div
                            key={item.id}
                            onClick={() => handleClick(item)}
                            className="group flex items-center gap-3 rounded bg-white/10 hover:bg-white/15 backdrop-blur-md transition-all duration-200 cursor-pointer overflow-hidden w-full"
                        >
                            {/* IMAGE */}
                            <div className="w-8 h-8 md:w-12 md:h-12 flex-shrink-0">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <img
                                        src={
                                            item.type === "liked"
                                                ? "https://misc.scdn.co/liked-songs/liked-songs-640.jpg"
                                                : item.image
                                        }
                                        alt={item.title}
                                        className="w-full h-full rounded-tl rounded-bl object-cover"
                                        draggable={false}
                                        loading="lazy"
                                    />
                                </motion.div>
                            </div>

                            {/* TEXT */}
                            <div className="w-full min-w-0">
                                <p className="text-sm md:text-[15px] font-semibold text-white line-clamp-2">
                                    {item.title}
                                </p>
                            </div>

                            {/* PLAY BUTTON */}
                            {item.type === "song" && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        setCurrentSongId(item.id);

                                        fetchRecommendedSongs(item.id, item);

                                        if (isCurrent) {
                                            togglePlayPause();
                                        } else {
                                            playSong(item.id);
                                        }
                                    }}
                                    className={`
                                        ${isCurrentPlaying
                                            ? "opacity-100"
                                            : "opacity-0 group-hover:opacity-100"
                                        }
                                        bg-gradient-to-br from-purple-500 to-blue-500
                                        rounded-full p-1
                                        transition duration-200
                                        mr-2 cursor-pointer
                                        hover:brightness-150
                                    `}
                                >
                                    <img
                                        src={isCurrentPlaying ? PauseBtn : PlayBtn}
                                        alt="play"
                                        className="min-h-7 min-w-7"
                                    />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivityGrid;