import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { setupAxiosInterceptors } from './utils/auth';
import './App.css';

// Importamos Componentes Públicos
import Home from './pages/Home';
import Login from './pages/Login'; 
import Register from './pages/Register';
import Recovery from './pages/Recovery';

// Importamos Componentes Protegidos (Jugador)
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import GameList from './pages/GameList'; 
import GameRoom from './pages/GameRoom';
import GameHistory from './pages/GameHistory';
import Cashier from './pages/Cashier';

// Importamos Componentes de Administración (Staff)
import StaffDashboard from './pages/staff/Dashboard';
import StaffPlayers from './pages/staff/Players';
import StaffTransactions from './pages/staff/Transactions';
import StaffReports from './pages/staff/Reports';

// Importamos Componentes de Utilidad
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Settings from './components/Settings';
import Support from './components/Support';

// Placeholders para otros roles de staff
const SupervisorPanel = () => (
  <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)', color: 'white', padding: '20px' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '80px' }}>
      <h1 style={{ color: '#d4af37', fontSize: '2.5rem' }}>Panel de Supervisor</h1>
      <p>Panel de supervisión de mesas y juegos (en desarrollo)</p>
    </div>
  </div>
);

const SupportPanel = () => (
  <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)', color: 'white', padding: '20px' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '80px' }}>
      <h1 style={{ color: '#d4af37', fontSize: '2.5rem' }}>Panel de Soporte Técnico</h1>
      <p>Soporte técnico y atención a usuarios (en desarrollo)</p>
    </div>
  </div>
);

function App() {
  // Configurar interceptores de axios al cargar la app
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          
          {/* ===== RUTAS PÚBLICAS ===== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recovery" element={<Recovery />} />
          
          {/* ===== RUTAS PROTEGIDAS PARA JUGADORES ===== */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/games" element={<ProtectedRoute><GameList /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><GameHistory /></ProtectedRoute>} />
          <Route path="/game/:id/play" element={<ProtectedRoute><GameRoom /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Cashier /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          {/* ===== RUTAS PROTEGIDAS PARA ADMINISTRADORES ===== */}
          <Route path="/staff/dashboard" element={<AdminRoute><StaffDashboard /></AdminRoute>} />
          <Route path="/staff/players" element={<AdminRoute><StaffPlayers /></AdminRoute>} />
          <Route path="/staff/transactions" element={<AdminRoute><StaffTransactions /></AdminRoute>} />
          <Route path="/staff/reports" element={<AdminRoute><StaffReports /></AdminRoute>} />
          <Route path="/staff/supervisor" element={<AdminRoute requiredRole="supervisor"><SupervisorPanel /></AdminRoute>} />
          <Route path="/staff/support" element={<AdminRoute requiredRole="support"><SupportPanel /></AdminRoute>} />
          
          {/* ===== RUTA 404 - NOT FOUND ===== */}
          <Route path="*" element={
            <div style={{
              minHeight: '100vh', 
              background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
              <h1 style={{fontSize: '4rem', color: '#d4af37'}}>404</h1>
              <p style={{fontSize: '1.5rem'}}>Página no encontrada</p>
              <a 
                href="/" 
                style={{
                  marginTop: '20px', 
                  color: '#d4af37', 
                  textDecoration: 'none', 
                  border: '1px solid #d4af37', 
                  padding: '10px 20px', 
                  borderRadius: '5px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#d4af37';
                  e.target.style.color = '#0c0c0c';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#d4af37';
                }}
              >
                Volver al Inicio
              </a>
            </div>
          } />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;