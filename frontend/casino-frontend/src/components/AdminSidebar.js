import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css'; // Reutilizamos estilos base, pero añadiremos clase admin

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <aside className="sidebar admin-sidebar" style={{background: 'linear-gradient(180deg, #2c0e0e 0%, #000 100%)', borderRight: '1px solid #c0392b'}}>
            <div className="sidebar-header">
                <div className="logo-icon">🛡️</div>
                <h3 style={{color: '#e74c3c'}}>PANEL ADMIN</h3>
            </div>

            <nav className="sidebar-nav">
                {/* Enlace al Dashboard General (Lo haremos después) */}
                <Link to="/staff/dashboard" className={`nav-item ${isActive('/staff/dashboard')}`}>
                    <span className="icon">📈</span> Resumen
                </Link>
                
                {/* Gestión de Jugadores */}
                <Link to="/staff/players" className={`nav-item ${isActive('/staff/players')}`}>
                    <span className="icon">👥</span> Jugadores
                </Link>

                {/* Enlace para volver a la vista de jugador (útil para pruebas) */}
                <div className="nav-divider"></div>
                <Link to="/dashboard" className="nav-item">
                    <span className="icon">🎮</span> Vista Jugador
                </Link>
                
                <button onClick={handleLogout} className="nav-item logout-btn">
                    <span className="icon">🚪</span> Salir
                </button>
            </nav>
        </aside>
    );
};

export default AdminSidebar;