import { LazyLoadImage } from "@tjoskar/react-lazyload-img";
import { useAudio } from "../context/AudioContext";

export default function RightSidebar() {
  const {
    audioUrl,
    currentSong,
    audioRef,
    isPlaying,
    togglePlayPause,
    playSong,
    playlistSongs,
  } = useAudio();
  return (
    <aside className="w-77 bg-[#121212] p-5 overflow-y-auto ml-2 rounded-md">
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Spodcast</h2>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="p-2 w-10 h-10 rounded-full cursor-pointer fill-[#adadad] hover:fill-white hover:bg-[#202020] transition-all"
        >
          <mask id="path-1-inside-1_4_354">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.5 12C5.5 12.8284 4.82843 13.5 4 13.5C3.17157 13.5 2.5 12.8284 2.5 12C2.5 11.1716 3.17157 10.5 4 10.5C4.82843 10.5 5.5 11.1716 5.5 12ZM13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12ZM20 13.5C20.8284 13.5 21.5 12.8284 21.5 12C21.5 11.1716 20.8284 10.5 20 10.5C19.1716 10.5 18.5 11.1716 18.5 12C18.5 12.8284 19.1716 13.5 20 13.5Z"
            />
          </mask>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.5 12C5.5 12.8284 4.82843 13.5 4 13.5C3.17157 13.5 2.5 12.8284 2.5 12C2.5 11.1716 3.17157 10.5 4 10.5C4.82843 10.5 5.5 11.1716 5.5 12ZM13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12ZM20 13.5C20.8284 13.5 21.5 12.8284 21.5 12C21.5 11.1716 20.8284 10.5 20 10.5C19.1716 10.5 18.5 11.1716 18.5 12C18.5 12.8284 19.1716 13.5 20 13.5Z"
          />
          <path
            d="M4 14.5C5.38071 14.5 6.5 13.3807 6.5 12H4.5C4.5 12.2761 4.27614 12.5 4 12.5V14.5ZM1.5 12C1.5 13.3807 2.61929 14.5 4 14.5V12.5C3.72386 12.5 3.5 12.2761 3.5 12H1.5ZM4 9.5C2.61929 9.5 1.5 10.6193 1.5 12H3.5C3.5 11.7239 3.72386 11.5 4 11.5V9.5ZM6.5 12C6.5 10.6193 5.38071 9.5 4 9.5V11.5C4.27614 11.5 4.5 11.7239 4.5 12H6.5ZM12 14.5C13.3807 14.5 14.5 13.3807 14.5 12H12.5C12.5 12.2761 12.2761 12.5 12 12.5V14.5ZM9.5 12C9.5 13.3807 10.6193 14.5 12 14.5V12.5C11.7239 12.5 11.5 12.2761 11.5 12H9.5ZM12 9.5C10.6193 9.5 9.5 10.6193 9.5 12H11.5C11.5 11.7239 11.7239 11.5 12 11.5V9.5ZM14.5 12C14.5 10.6193 13.3807 9.5 12 9.5V11.5C12.2761 11.5 12.5 11.7239 12.5 12H14.5ZM20.5 12C20.5 12.2761 20.2761 12.5 20 12.5V14.5C21.3807 14.5 22.5 13.3807 22.5 12H20.5ZM20 11.5C20.2761 11.5 20.5 11.7239 20.5 12H22.5C22.5 10.6193 21.3807 9.5 20 9.5V11.5ZM19.5 12C19.5 11.7239 19.7239 11.5 20 11.5V9.5C18.6193 9.5 17.5 10.6193 17.5 12H19.5ZM20 12.5C19.7239 12.5 19.5 12.2761 19.5 12H17.5C17.5 13.3807 18.6193 14.5 20 14.5V12.5Z"
            mask="url(#path-1-inside-1_4_354)"
          />
        </svg>
      </div>

      <div className="mb-5 w-full">
        <LazyLoadImage
          image={currentSong.image[2]?.url}
          alt={currentSong.name}
          className="rounded-md mb-4"
        />
        <p
          className="text-2xl font-black truncate cursor-pointer hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/${currentSong.type}/${currentSong.id}`);
          }}
        >
          {currentSong.name}
        </p>
        <p className="text-sm font-medium text-gray-400 line-clamp-2">
          {currentSong.artists.primary.map((a, i) => (
            <span key={a.id || i}>
              <a
                className="hover:underline hover:text-white cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/artist/${a.id}`);
                }}
              >
                {a.name}
              </a>
              {i < currentSong.artists.primary.length - 1 && ", "}
            </span>
          ))}
        </p>
      </div>

      <div className="bg-[#121212] text-white rounded-2xl max-w-sm shadow-md hover:bg-[#181818] transition-colors duration-300">
        {/* Image */}
        <div className="overflow-hidden rounded-lg mb-3">
          <img
            src={currentSong.artists.primary[0].image[2].url}
            alt="Artist"
            className="w-full h-40 object-cover rounded-lg"
          />
        </div>

        {/* About label */}
        <p className="text-[#b3b3b3] text-sm font-semibold mb-1">About the artist</p>

        {/* Artist name */}
        <h2 className="text-xl font-bold leading-tight">Nawab</h2>

        {/* Listeners + Follow button */}
        <div className="flex justify-between items-center mt-1 mb-3">
          <p className="text-[#b3b3b3] text-sm">
            1,683,286 <span className="text-[#b3b3b3]">monthly listeners</span>
          </p>
          <button className="border border-[#b3b3b3] text-white text-sm px-4 py-1 rounded-full hover:border-white hover:scale-105 transition-all duration-300">
            Follow
          </button>
        </div>

        {/* Description */}
        <p className="text-[#b3b3b3] text-sm leading-snug line-clamp-3">
          Expert Jatt Fame Nawab is an Indian Pop artist who belongs to the Punjabi music industry.
          His music has got his core...
        </p>
      </div>


    </aside>
  );
}
