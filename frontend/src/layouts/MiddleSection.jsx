import React, { useEffect, useState } from 'react'
import LeftSidebar from '../components/LeftSidebar'
import MainContent from '../components/MainContent'
import RightSidebar from '../components/RightSidebar'
import axios from 'axios'
import { useAudio } from '../context/AudioContext'

const MiddleSection = () => {


    const { currentSong } = useAudio();

    const [lastSong, setLastSong] = useState(null);


    useEffect(() => {
        const savedSong = localStorage.getItem("lastSong");

        if (savedSong) {
            try {
                const parsedSong = JSON.parse(savedSong);
                setLastSong(parsedSong);
            } catch (err) {
                console.error("Error parsing saved song:", err);
            }
        }
    }, []);

    const song = currentSong || lastSong;

    return (
        <div className='flex h-full bg-black text-white overflow-hidden'>
            <LeftSidebar />
            <MainContent />
            {song && (
                <RightSidebar />
            )}
        </div>
    )
}

export default MiddleSection