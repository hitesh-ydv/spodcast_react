import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import Home from "../pages/nested/Home";
import Search from "../pages/nested/Search";
import UserProfile from "../pages/nested/UserProfile";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Notifications from "../pages/nested/Notifications";
import ErrorPage from "../pages/dashboard/ErrorPage";
import Loader from "./Loader";
import Artist from "../pages/nested/Artist";
import Track from "../pages/nested/Song";
import { useSearch } from "../context/SearchContext";
import { useScrollStore } from "../context/useScrollStore";
import Playlist from "../pages/nested/Playlist";
import Album from "../pages/nested/Album";
const API_URL = import.meta.env.VITE_API_URL;

export default function MainContent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { query } = useSearch();
  const [topResults, setTopResults] = useState([]);
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading2, setLoading2] = useState(false);

  const scrollRef = useRef(null);
  const { pathname } = useLocation();
  const { positions, setPosition } = useScrollStore();

  // ✅ Restore previous scroll position when route changes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (positions[pathname]) {
      el.scrollTop = positions[pathname];
    } else {
      el.scrollTop = 0; // default to top if no saved position
    }
  }, [pathname, positions]);

  // ✅ Save scroll position on scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      setPosition(pathname, el.scrollTop);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [pathname, setPosition]);

  // useEffect(() => {
  //   const CLIENT_ID = "61469e91d2a84c7f9ad2bbe093042906";
  //   const CLIENT_SECRET = "5f14c431be714b0e9de2adedd86af848";

  //   const fetchNewReleases = async () => {
  //     try {
  //       // Get access token from Spotify
  //       const tokenResponse = await axios.post(
  //         "https://accounts.spotify.com/api/token",
  //         new URLSearchParams({
  //           grant_type: "client_credentials",
  //         }),
  //         {
  //           headers: {
  //             "Content-Type": "application/x-www-form-urlencoded",
  //             Authorization: "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
  //           },
  //         }
  //       );

  //       const accessToken = tokenResponse.data.access_token;

  //       // Fetch new releases
  //       const res = await axios.get(
  //         "https://api.spotify.com/v1/browse/new-releases?locale=IN&limit=12",
  //         {
  //           headers: {
  //             Authorization: `Bearer ${accessToken}`,
  //           },
  //         }
  //       );

  //       setNewReleases(res.data.albums.items);
  //     } catch (err) {
  //       console.error("Error fetching new releases:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchNewReleases();
  // }, []);

  useEffect(() => {
    if (!query) {
      setTopResults([]);
      setSongs([]);
      setPlaylists([]);
      setAlbums([]);
      setArtists([]);
      return;
    }

    const fetchAll = async () => {
      setLoading2(true);
      try {
        const encoded = encodeURIComponent(query);

        // Run all API requests in parallel using Promise.all()
        const [
          topRes,
          songsRes,
          playlistsRes,
          albumsRes,
          artistsRes
        ] = await Promise.all([
          axios.get(`${API_URL}/api/search?query=${encoded}`),
          axios.get(`${API_URL}/api/search/songs?query=${encoded}&limit=20`),
          axios.get(`${API_URL}/api/search/playlists?query=${encoded}&limit=20`),
          axios.get(`${API_URL}/api/search/albums?query=${encoded}&limit=20`),
          axios.get(`${API_URL}/api/search/artists?query=${encoded}&limit=20`)
        ]);

        console.log(playlistsRes.data)

        // Set states safely with fallback defaults
        setTopResults(topRes.data.data.topQuery?.results || []);
        setSongs(songsRes.data.data.results || []);
        setPlaylists(playlistsRes.data.data.results || []);
        setAlbums(albumsRes.data.data.results || []);
        setArtists(artistsRes.data.data.results || []);

        console.log("✅ Fetched All Search Data");
      } catch (err) {
        console.error("❌ Error fetching search data:", err);
        setTopResults([]);
        setSongs([]);
        setPlaylists([]);
        setAlbums([]);
        setArtists([]);
      } finally {
        setLoading2(false);
      }
    };

    // Debounce search to avoid too many API hits
    const timeoutId = setTimeout(fetchAll, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/home?limit=5")
      .then(res => {
        setData(res.data.data)
      })
      .catch(err => {
        console.error("Error fetching home data:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main
     ref={scrollRef}
     className="flex-1 overflow-y-auto max-h-full max-w-full rounded-md bg-theme"
     >
      <Routes>
        <Route
          path="/"
          element={<Home data={data} loading={loading} />}
        />
        <Route path="/search" element={<Search songs={songs} topResults={topResults} playlists={playlists} albums={albums} artists={artists} loading2={loading2} query={query} />} />
        <Route path="/user/:userid" element={<UserProfile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/artist/:id" element={<Artist />} />
        <Route path="/song/:id" element={<Track />} />
        <Route path="/playlist/:id" element={<Playlist />} />
        <Route path="/album/:id" element={<Album />} />
        <Route path="*" element={<ErrorPage />} />

      </Routes>

      <Outlet />
    </main>
  );
}