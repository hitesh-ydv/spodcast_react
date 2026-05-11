import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import MiddleSection from "../../layouts/MiddleSection";
import { SearchProvider } from "../../context/SearchContext";
import { AudioProvider } from "../../context/AudioContext";
import OfflineBanner from "@/components/OfflineBanner";
import { useOffline } from "../../context/OfflineProvider";
import MaintenanceModal from "@/components/MaintenanceModal";
const API_URL = import.meta.env.VITE_API_URL;
const URL = import.meta.env.VITE_API_URL2;

export default function DashboardLayout() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [maintenance, setMaintenance] = useState(true);

    const { showOfflineBanner } = useOffline();

    // useEffect(() => {
    //     const fetchUser = async () => {
    //         const token = localStorage.getItem("token");
    //         if (!token) return;

    //         try {
    //             const res = await axios.get(`${URL}/api/user/me`, {
    //                 headers: { Authorization: `Bearer ${token}` },
    //             });
    //             setUser(res.data);
    //         } catch (err) {
    //             console.error("Error fetching user:", err.response || err);
    //         }
    //     };

    //     fetchUser();
    // }, []);

    useEffect(() => {
        axios.get(`${API_URL}/api/songs/o_azuPYd/suggestions?limit=10`)
            .then(res => {
                setData(res.data.data)
                setMaintenance(false);
            })
            .catch(err => {
                console.error("Error fetching home data:", err);
                setMaintenance(true);
            })
    }, []);


    return (
        <AudioProvider>
            <div>
                <MaintenanceModal isOpen={maintenance} />
            </div>
            {!maintenance && (
                <div className="flex flex-col h-screen bg-[#0B0B10] text-white">
                    <Navbar />
                    <main className="flex-1 overflow-y-auto px-2">
                        <MiddleSection />
                    </main>
                    <div className="px-4">
                        <Footer />
                    </div>
                    <OfflineBanner isOffline={showOfflineBanner} />


                </div>
            )}
        </AudioProvider>
    );
}
