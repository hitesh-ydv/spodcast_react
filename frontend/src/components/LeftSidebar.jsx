export default function LeftSidebar() {
  return (
    <aside className="w-72 bg-[#121212] p-4 overflow-y-auto mr-2 rounded-md">
      <h2 className="text-lg font-semibold mb-4">Your Library</h2>
      <div className="flex gap-2 mb-4">
        <button className="bg-[#2a2a2a] px-3 py-1 rounded-full text-sm hover:bg-[#3a3a3a]">
          Playlists
        </button>
        <button className="bg-[#2a2a2a] px-3 py-1 rounded-full text-sm hover:bg-[#3a3a3a]">
          Artists
        </button>
      </div>

      <ul className="space-y-3">
        {["Karan Aujla", "Shree Ram songs", "Navaan Sandhu", "Sidhu Moose Wala"].map((artist) => (
          <li key={artist} className="flex items-center gap-3 hover:bg-[#1f1f1f] p-2 rounded cursor-pointer">
            <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
            <div>
              <p className="font-medium text-sm">{artist}</p>
              <p className="text-xs text-gray-400">Artist</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
