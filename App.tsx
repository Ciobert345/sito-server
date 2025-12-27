
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Modpack from './pages/Modpack';
import Utilities from './pages/Utilities';
import Dashboard from './pages/Dashboard';
import DashboardTutorial from './pages/DashboardTutorial';
import Updates from './pages/Updates';
import Information from './pages/Information';
import Mobile from './pages/Mobile';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { shouldRedirectToMobile } from './utils/deviceDetection';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isMobilePage = location.pathname === '/mobile';

  useEffect(() => {
    if (shouldRedirectToMobile() && !isMobilePage) {
      window.location.hash = '#/mobile';
    }
  }, [isMobilePage]);

  return (
    <div className={isMobilePage ? '' : 'min-h-screen flex flex-col relative text-white'}>
      {!isMobilePage && <Navbar />}

      <main className={isMobilePage ? '' : 'flex-grow'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/modpack" element={<Modpack />} />
          <Route path="/utilities" element={<Utilities />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard-tutorial" element={<DashboardTutorial />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/info" element={<Information />} />
          <Route path="/mobile" element={<Mobile />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {!isMobilePage && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
