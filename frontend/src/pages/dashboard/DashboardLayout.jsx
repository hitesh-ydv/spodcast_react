import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import MiddleSection from "../../layouts/MiddleSection";
import OfflineBanner from "@/components/OfflineBanner";
import MaintenanceModal from "@/components/MaintenanceModal";

import { AudioProvider } from "../../context/AudioContext";
import { useOffline } from "../../context/OfflineProvider";

const API_URL = import.meta.env.VITE_API_URL;

export default function DashboardLayout() {
    const [loading, setLoading] = useState(true);
    const [maintenance, setMaintenance] = useState(false);

    const { showOfflineBanner } = useOffline();

    useEffect(() => {
        const init = async () => {
            try {
                let token = sessionStorage.getItem("token");

                if (!token) {
                    const { data } = await axios.get(
                        `${API_URL}/api/session`
                    );

                    token = data.token;
                    sessionStorage.setItem("token", token);
                }

                setMaintenance(false);
            } catch (err) {
                setMaintenance(true);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    return (
        <AudioProvider>

            {/* Loading Screen */}
            {loading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black gap-4">

                    {/* Spinner */}
                    <div className="w-14 h-14 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />

                </div>
            )}

            {/* Maintenance Modal */}
            {!loading && maintenance && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    <MaintenanceModal isOpen={true} />
                </div>
            )}

            {/* Main App */}
            {!loading && !maintenance && (
                <div className="flex flex-col h-screen bg-[#0B0B10] text-white">

                    <Navbar />

                    <main className="flex-1 overflow-y-auto px-2">
                        <MiddleSection />
                    </main>

                    <div className="px-4 max-[799px]:px-0 ">
                        <Footer />
                    </div>

                    <OfflineBanner isOffline={showOfflineBanner} />

                </div>
            )}

        </AudioProvider>
    );
}