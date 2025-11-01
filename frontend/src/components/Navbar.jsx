import { useCallback, useContext, useEffect, useRef, useState } from "react";
import HomeFill from "../assets/home-fill.svg";
import Home from "../assets/home.svg";
import Bell from "../assets/bell-fill.svg";
import Search from "../assets/search.svg";
import Close from "../assets/close.svg";
import Share from "../assets/share.svg";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import axios from "axios";
import { useSearch } from "../context/SearchContext";

const URL = import.meta.env.VITE_API_URL2;


export default function Navbar() {
    const navigate = useNavigate();
    const { setQuery } = useSearch();

    const inputRef = useRef(null);

    const [user, setUser] = useState(null);
    const [searchText, setSearchText] = useState("");

    const location = useLocation();
    const isHomePage = location.pathname === "/";

    useEffect(() => {
        if (inputRef.current) {
            if (location.pathname === "/search") {
                inputRef.current.focus(); // Focus on search route
            } else {
                inputRef.current.blur(); // Remove focus when not on search route

            }
        }
    }, [location.pathname]);


    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await axios.get(`${URL}/api/user/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(res.data); // { name, email, userid }
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        };

        fetchUser();
    }, []);

    // const handleFocus = (e) => {
    //     navigate("/search"); // navigate to your search route
    // };

    const handleSearch = (e) => {
        const value = e.target.value;
        setQuery(value);
    };


    const handleFocus2 = () => {
        navigate("/"); // navigate to your search route
        setSearchText("");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchText(query);

        // run your search logic
        handleSearch(e);

        // navigate to /search only if query > 0 and not already on /search
        if (query.length > 0 && location.pathname !== "/search") {
            navigate("/search");
        }
    };

    const handleFocus = () => {
        navigate("/search")
    }

    return (
        <nav className="w-full flex items-center justify-between px-2 py-2 pr-4 text-white h-16">

            {/* Left Logo */}
            <div className="ml-2.5">
                <img
                    src="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_White.png"
                    alt="Spotify"
                    className="w-8 h-8"
                />
            </div>

            {/* Middle Search Section */}
            <div className="h-full w-[35%] min-w-[20%] flex items-center gap-2">

                {/* Home Button */}
                <button onClick={handleFocus2} className="transition-transform duration-300 hover:scale-105 w-13 bg-[#1f1f1f] p-2 rounded-full hover:bg-[#242424] cursor-pointer transition-all">
                    <img
                        src={isHomePage ? HomeFill : Home}
                        alt="Home"
                    />
                </button>

                {/* Search Bar */}
                <div className="flex items-center bg-[#1f1f1f] hover:bg-neutral-800 rounded-full w-full transition h-full px-3">
                    <img src={Search} alt="Search" className="h-8 w-8" />

                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="What do you want to play?"
                        value={searchText}
                        onChange={handleInputChange}

                        className="bg-transparent outline-none text-white placeholder-[#adadad] flex-1 ml-3 h-full font-semibold"
                        onClick={handleFocus}
                    />

                    {/* Close Icon — only show when there's text */}
                    {searchText && (
                        <button
                            onClick={() => {
                                setSearchText("")
                                inputRef.current.focus();
                            }}
                            className="p-1 hover:bg-[#2a2a2a] rounded-full transition flex items-center justify-center mr-1"
                        >
                            <img src={Close} alt="Clear" className="h-8 w-8 cursor-pointer" />
                        </button>
                    )}

                    <div className="h-6 w-[1px] bg-[#adadad] py-2"></div>
                    <img src={Share} alt="Share" className="h-8 ml-2 p-1 hover:bg-[#2a2a2a] rounded-full cursor-pointer" />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6 ">
                <img src={Bell} onClick={() => navigate("/notifications")} alt="Notifications" className="h-8 w-8 cursor-pointer p-1 rounded-full" />
                <Menu>
                    <MenuButton
                        className="cursor-pointer w-10 h-10 inline-flex items-center justify-center rounded-full bg-gray-800 p-1
                   text-sm font-semibold text-white shadow-inner shadow-white/10 
                   focus:outline-none data-hover:bg-gray-700 data-open:bg-gray-700"
                    >
                        {user?.userId ? (
                            <img
                                src={`${URL}/api/user/${user.userId}/photo`}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            user?.name ? user.name.charAt(0).toUpperCase() : ""
                        )}
                    </MenuButton>

                    <MenuItems
                        anchor="bottom end"
                        className="z-43567 w-48 origin-top-right rounded-sm border border-white/5 bg-[#282828] p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95"
                    >
                        <MenuItem>
                            <button onClick={() => navigate(`/user/${user.userId}`)} className="group flex w-full font-semibold text-base items-center gap-2 rounded-sm px-3 py-1.5 data-focus:bg-white/10">
                                Profile
                            </button>
                        </MenuItem>
                        <MenuItem>
                            <button className="hover:underline relative group flex w-full font-semibold text-base items-center gap-2 rounded-sm px-3 py-1.5 data-focus:bg-white/10">
                                Download
                                <svg className="absolute right-3" width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 9L21 3M21 3H15M21 3L13 11M10 5H7.8C6.11984 5 5.27976 5 4.63803 5.32698C4.07354 5.6146 3.6146 6.07354 3.32698 6.63803C3 7.27976 3 8.11984 3 9.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H14.2C15.8802 21 16.7202 21 17.362 20.673C17.9265 20.3854 18.3854 19.9265 18.673 19.362C19 18.7202 19 17.8802 19 16.2V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </MenuItem>
                        <MenuItem>
                            <button className="group flex w-full font-semibold text-base items-center gap-2 rounded-sm px-3 py-1.5 data-focus:bg-white/10">
                                Settings
                            </button>
                        </MenuItem>
                        <div className="my-1 h-px bg-white/5" />
                        <MenuItem>
                            <button onClick={handleLogout} className="group flex w-full items-center text-base gap-2 font-semibold rounded-sm px-3 py-1.5 data-focus:bg-white/10">

                                Logout

                            </button>
                        </MenuItem>
                    </MenuItems>
                </Menu>
            </div>
        </nav>
    );
}

