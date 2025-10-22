import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import MiddleSection from "../../layouts/MiddleSection";
import { SearchProvider } from "../../context/SearchContext";
import { AudioProvider } from "../../context/AudioContext";

export default function DashboardLayout() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await axios.get("http://localhost:5000/api/user/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(res.data);
            } catch (err) {
                console.error("Error fetching user:", err.response || err);
            }
        };

        fetchUser();
    }, []);



    return (
        <AudioProvider>
            <SearchProvider>
                <div className="flex flex-col h-screen bg-black text-white">
                    <Navbar />
                    <main className="flex-1 overflow-y-auto px-2">
                        <MiddleSection />
                    </main>
                    <div className="px-4">
                        <Footer />
                    </div>

                </div>
            </SearchProvider>
        </AudioProvider>
    );
}
