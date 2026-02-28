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

function App() {
  // Set true by default
  const [maintenance] = useState(true);

  return (
    <SearchProvider>
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
    </SearchProvider>
  );
}

export default App;