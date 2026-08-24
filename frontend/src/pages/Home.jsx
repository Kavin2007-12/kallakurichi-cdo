import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutMLA from '../components/AboutMLA';
import CitizenPortalsHub from '../components/CitizenPortalsHub';
import DailyUpdates from '../components/DailyUpdates';
import EventsCalendar from '../components/EventsCalendar';
import VijayScrollAnimation from '../components/VijayScrollAnimation';
import LiveNewsUpdates from '../components/LiveNewsUpdates';
import SocialMedia from '../components/SocialMedia';
import VolunteerSignup from '../components/VolunteerSignup';
import Statistics from '../components/Statistics';
import TempleHeritage from '../components/TempleHeritage';
import QuickActions from '../components/QuickActions';
import Footer from '../components/Footer';
import ChatAssistant from '../components/ChatAssistant';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#news-feed' || window.location.hash === '#news-feed') {
      const timer = setTimeout(() => {
        const el = document.getElementById('news-feed');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location]);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        <AboutMLA />
        <LiveNewsUpdates />
        <DailyUpdates />
        {/* Temporarily hidden for future use */}
        {/* <CitizenPortalsHub /> */}
        {/* Temporarily hidden for the animation feature */}
        {/* <EventsCalendar /> */}
        <VijayScrollAnimation />
        <VolunteerSignup />
        {/* Temporarily hidden for future use */}
        {/* <Statistics /> */}
        <TempleHeritage />
        <SocialMedia />
        <QuickActions />
      </main>

      <Footer />
      <ChatAssistant />
    </div>
  );
};

export default Home;
