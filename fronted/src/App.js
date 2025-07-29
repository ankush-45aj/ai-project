import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import HeroSection from "./pages/HeroSection";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

function ScrollToHero() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#hero') {
      const hero = document.getElementById('hero');
      if (hero) {
        // Small timeout to ensure components are mounted
        setTimeout(() => {
          hero.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToHero />
        <Routes>
          {/* New Hero Section as landing page */}
          <Route path="/" element={<HeroSection />} />
          
          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Redirect for backward compatibility */}
          <Route path="/home" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;