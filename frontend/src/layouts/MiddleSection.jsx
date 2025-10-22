import React, { useEffect, useState } from 'react'
import LeftSidebar from '../components/LeftSidebar'
import MainContent from '../components/MainContent'
import RightSidebar from '../components/RightSidebar'
import axios from 'axios'

const MiddleSection = () => {


    return (
        <div className='flex h-full bg-black text-white overflow-hidden'>
            <LeftSidebar />
            <MainContent />
            <RightSidebar />
        </div>
    )
}

export default MiddleSection