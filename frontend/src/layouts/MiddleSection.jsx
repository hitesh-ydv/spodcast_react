import React, { useEffect, useState } from 'react'
import LeftSidebar from '../components/LeftSidebar'
import MainContent from '../components/MainContent'
import RightSidebar from '../components/RightSidebar'
import axios from 'axios'
import { useAudio } from '../context/AudioContext'

const MiddleSection = () => {


        const {currentSong} = useAudio();

    return (
        <div className='flex h-full bg-black text-white overflow-hidden'>
            <LeftSidebar />
            <MainContent />
            {currentSong && (
                <RightSidebar />
            )}
        </div>
    )
}

export default MiddleSection