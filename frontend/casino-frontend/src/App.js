import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { setupAxiosInterceptors } from './utils/auth';
import './App.css';

// Importamos Componentes
import Home from './pages/Home';
import Login from './pages/Login'; 
import Register from './pages/Register';
import Recovery from './pages/Recovery';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import GameList from './pages/GameList'; // <--- IMPORTACIÓN DEL COMPONENTE DE JUEGOS

// Componentes de Layout
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Configurar interceptores de axios al cargar la app
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recovery" element={<Recovery />} />
          
          {/* Rutas Protegidas (Módulo 2) */}
          <Route 
            path="/dashboard" 
            element={ <ProtectedRoute> <Dashboard /> </ProtectedRoute> } 
          />

          {/* Ruta de Perfil */}
          <Route 
            path="/profile" 
            element={ <ProtectedRoute> <Profile /> </ProtectedRoute> } 
          />
          
          {/* Módulo de Juegos */}
          <Route 
            path="/games" 
            element={ <ProtectedRoute> <GameList /> </ProtectedRoute> } 
          />
          
          {/* Módulo de Jugadores */}
          <Route 
            path="/players" 
            element={ <ProtectedRoute> <div style={{color:'white', marginTop:'100px'}}>Gestión de Jugadores (En desarrollo)</div> </ProtectedRoute> } 
          />
          
          {/* Módulo de Transacciones */}
          <Route 
            path="/transactions" 
            element={ <ProtectedRoute> <div style={{color:'white', marginTop:'100px'}}>Cajero (En desarrollo)</div> </ProtectedRoute> } 
          />
          
          {/* Rutas para Staff */}
          <Route 
            path="/staff/admin" 
            element={ <ProtectedRoute> <div style={{color:'white', marginTop:'100px'}}>Panel de Administrador (En desarrollo)</div> </ProtectedRoute> } 
          />
          <Route 
            path="/staff/supervisor" 
            element={ <ProtectedRoute> <div style={{color:'white', marginTop:'100px'}}>Panel de Supervisor (En desarrollo)</div> </ProtectedRoute> } 
          />
          <Route 
            path="/staff/cashier" 
            element={ <ProtectedRoute> <div style={{color:'white', marginTop:'100px'}}>Panel de Cajero (En desarrollo)</div> </ProtectedRoute> } 
          />
          <Route 
            path="/staff/support" 
            element={ <ProtectedRoute> <div style={{color:'white', marginTop:'100px'}}>Panel de Soporte (En desarrollo)</div> </ProtectedRoute> } 
          />
          
          {/* Ruta 404 - Not Found */}
          <Route 
            path="*" 
            element={
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
                    borderRadius: '5px'
                  }}
                >
                  Volver al Inicio
                </a>
              </div>
            } 
          />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;