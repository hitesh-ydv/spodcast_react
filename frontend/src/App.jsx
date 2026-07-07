import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import AuthRoute from "./routes/AuthRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import { SearchProvider } from "./context/SearchContext";
import MaintenanceModal from "./components/MaintenanceModal";
import { useState, useEffect } from "react";
import './App.css'
import { RecentProvider } from "./context/RecentContext";
import { LibraryProvider } from "./context/LibraryContext";
import { OfflineProvider } from "./context/OfflineProvider";
import { ActivityProvider } from "./context/ActivityContext";
import TopLoadingBar from "./components/TopLoadingBar";
import { LoadingProvider } from "./context/LoadingContext";

function App() {

  useEffect(() => {
    const getSession = async () => {
      try {
        const res = await fetch(
          'https://api.spodcast.workers.dev/api/session'
        )

        const data = await res.json()

        sessionStorage.setItem(
          'token',
          data.token
        )
      } catch (err) {
        console.error('Session Error:', err)
      }
    }

    getSession()
  }, [])

  useEffect(() => {
    const disableContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", disableContextMenu);

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);

  useEffect(() => {
    const activate = () => {

      const firstBtn = document.querySelector("button, a, input");
      if (firstBtn) firstBtn.focus();
    };

    document.addEventListener("tv-ready", activate);

    return () => {
      document.removeEventListener("tv-ready", activate);
    };
  }, []);

  return (
    <LoadingProvider>
      <TopLoadingBar />

      <SearchProvider>
        <RecentProvider>
          <LibraryProvider>
            <OfflineProvider>
              <ActivityProvider>

                <Router>

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
    </LoadingProvider>
  );
}

export default App;