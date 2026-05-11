import React from "react";

const MaintenanceModal = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/100 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] text-white w-[90%] max-w-md rounded-2xl shadow-2xl p-8 text-center border border-gray-700">
        
        {/* Logo / App Name */}
        <h1 className="text-3xl font-bold bg-gradient-to-br from-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
          Spodcast
        </h1>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-4">
          🚧 App Under Maintenance
        </h2>

        {/* Message */}
        <p className="text-[#A0A0B2] mb-6">
          We are currently experiencing a technical issue.  
          Our team is working hard to fix it.
        </p>

        <div className="text-sm text-gray-500">
          Please check back later.
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModal;