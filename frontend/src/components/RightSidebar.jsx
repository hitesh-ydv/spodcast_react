export default function RightSidebar() {
  return (
    <aside className="w-72 bg-[#121212] p-4 overflow-y-auto ml-2 rounded-md">
      <h2 className="text-lg font-semibold mb-4">Trending Valentine</h2>

      <div className="bg-[#181818] rounded-lg p-4">
        <img
          src="https://c.saavncdn.com/140/Sahiba-Hindi-2023-20231213191015-500x500.jpg"
          alt="Sahiba"
          className="rounded mb-4"
        />
        <p className="font-semibold">Sahiba</p>
        <p className="text-sm text-gray-400">Aditya Rikhari</p>
      </div>
    </aside>
  );
}
