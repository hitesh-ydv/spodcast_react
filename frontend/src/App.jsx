import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import AuthRoute from "./routes/AuthRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import { SearchProvider } from "./context/SearchContext";
import MaintenanceModal from "./components/MaintenanceModal";
import { useState } from "react";
import './App.css'
import { RecentProvider } from "./context/RecentContext";
import { LibraryProvider } from "./context/LibraryContext";
import { OfflineProvider } from "./context/OfflineProvider";
import { ActivityProvider } from "./context/ActivityContext";

function App() {
  // Set true by default
  const [maintenance] = useState(true);

  useEffect(() => {
    const activate = () => {
      console.log("TV Mode Activated");

      // 👇 first focus do
      const firstBtn = document.querySelector("button, a, input");
      if (firstBtn) firstBtn.focus();
    };

    document.addEventListener("tv-ready", activate);

    return () => {
      document.removeEventListener("tv-ready", activate);
    };
  }, []);

  return (
    <SearchProvider>
      <RecentProvider>
        <LibraryProvider>
          <OfflineProvider>
            <ActivityProvider>
              <Router>
                {/* Maintenance Popup */}
                <MaintenanceModal isOpen={!maintenance} />

                <Routes>
                  <Route element={<AuthRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                  </Route>

                  <Route element={<ProtectedRoute />}>
                    <Route path="/*" element={<DashboardLayout />} />
                  </Route>
                </Routes>
              </Router>
            </ActivityProvider>
          </OfflineProvider>
        </LibraryProvider>
      </RecentProvider>
    </SearchProvider>
  );
}

export default App;