import React, { useEffect, useState } from 'react'
import LeftSidebar from '../components/LeftSidebar'
import MainContent from '../components/MainContent'
import RightSidebar from '../components/RightSidebar'
import axios from 'axios'
import { useAudio } from '../context/AudioContext'

const MiddleSection = () => {


    const { currentSong } = useAudio();

    return (
        <div className='flex h-full bg-black text-white overflow-hidden'>
            <div className="hidden min-[600px]:block">
                <LeftSidebar />
            </div>
            <MainContent />
            {currentSong && (
                <div className="hidden min-[850px]:block">
                    <RightSidebar />
                </div>
            )}
        </div>
    )
}

export default MiddleSection