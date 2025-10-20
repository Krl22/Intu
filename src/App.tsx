import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Services from './pages/Services';
import Activity from './pages/Activity';
import Account from './pages/Account';
import BottomNavBar from './components/BottomNavBar';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className={`min-h-screen bg-gray-50 ${isHomePage ? '' : 'pb-16'}`}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/account" element={<Account />} />
      </Routes>
      <BottomNavBar />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
