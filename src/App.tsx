import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Services from './pages/Services';
import Activity from './pages/Activity';
import Account from './pages/Account';
import BottomNavBar from './components/BottomNavBar';
import PhoneLogin from './components/PhoneLogin';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar pantalla de login
  if (!user) {
    return <PhoneLogin />;
  }

  // Usuario autenticado, mostrar la aplicación principal
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
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
