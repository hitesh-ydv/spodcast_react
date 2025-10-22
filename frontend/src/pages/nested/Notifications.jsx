import React from 'react';

const Notifications = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">What's New</h1>
        <p className="text-gray-400 text-sm">
          The latest releases from artists, podcasts, and shows you follow.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button className="pb-3 px-4 border-b-2 border-green-500 text-white font-medium">
          Music
        </button>
        <button className="pb-3 px-4 text-gray-400 font-medium hover:text-white transition-colors">
          Podcasts & Shows
        </button>
      </div>

      {/* Earlier Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Earlier</h2>
        
        {/* Notification Item */}
        <div className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
          {/* Album Cover Placeholder */}
          <div className="w-16 h-16 bg-gray-600 rounded-lg flex-shrink-0"></div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">House Navior</h3>
            <p className="text-gray-400 text-sm truncate">
              Navaan Sandhu, Gurinder Gill, Bir
            </p>
            <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
              <span>Album</span>
              <span>·</span>
              <span>Sep 19, 2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;