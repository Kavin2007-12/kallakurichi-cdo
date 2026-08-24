import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import About from './pages/About';
import Appointment from './pages/Appointment';
import Volunteer from './pages/Volunteer';
import VerifyVolunteer from './pages/VerifyVolunteer';
import NewsDetail from './pages/NewsDetail';
import BackToTop from './components/BackToTop';
import TempleLoader from './components/TempleLoader';

// Scroll to top utility component on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instantly reset scroll position to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  
  // Instant fast reload on language switch (skip slow splash loader)
  const shouldSkipLoader = () => {
    if (isAdmin) return true;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('skip_temple_loader') === 'true') {
      sessionStorage.removeItem('skip_temple_loader');
      return true;
    }
    return false;
  };

  const [showLoader, setShowLoader] = useState(!shouldSkipLoader());

  useEffect(() => {
    if (isAdmin) {
      // Force English language for Admin portal
      document.cookie = 'googtrans=/en/en; path=/;';
      document.cookie = `googtrans=/en/en; path=/; domain=${window.location.hostname};`;
      document.cookie = `googtrans=/en/en; path=/; domain=.${window.location.hostname};`;
    }
  }, [isAdmin]);

  return (
    <>
      {showLoader && <TempleLoader onComplete={() => setShowLoader(false)} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/about" element={<About />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/verify-volunteer" element={<VerifyVolunteer />} />
        <Route path="/verify" element={<VerifyVolunteer />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/news" element={<NewsDetail />} />
      </Routes>
      {!isAdmin && <BackToTop />}
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
