import { useState } from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";

export default function VolumeControl({ audioRef }) {
  const [volume, setVolume] = useState(80);

  const handleVolumeChange = (e) => {
    const value = e.target.value;
    setVolume(value);

    if (audioRef.current) {
      audioRef.current.volume = value / 100;
    }
  };

  const getIcon = () => {
    if (volume == 0) return <VolumeX size={20} />;
    if (volume < 50) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  return (
    <div className="flex items-center gap-2">
      
      {/* 🔊 Icon */}
      <button
        onClick={() => {
          const newVol = volume === 0 ? 100 : 0;
          setVolume(newVol);
          if (audioRef.current) {
            audioRef.current.volume = newVol / 100;
          }
        }}
        className="text-gray-300 hover:text-white p-2 cursor-pointer"
      >
        {getIcon()}
      </button>

      {/* 🎚 ALWAYS VISIBLE SLIDER */}
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={handleVolumeChange}
        className="w-24 h-1 accent-white cursor-pointer ml-[-8px] "
      />
    </div>
  );
}