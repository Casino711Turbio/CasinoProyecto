import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    // Función para resaltar el link activo
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon">🦁</div>
                <h3>CASINO ROYAL</h3>
            </div>

            <nav className="sidebar-nav">
                <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
                    <span className="icon">📊</span> Dashboard
                </Link>
                <Link to="/profile" className={`nav-item ${isActive('/profile')}`}>
                    <span className="icon">👤</span> Mi Perfil
                </Link>
                <Link to="/transactions" className={`nav-item ${isActive('/transactions')}`}>
                    <span className="icon">💰</span> Cajero
                </Link>
                <Link to="/games" className={`nav-item ${isActive('/games')}`}>
                    <span className="icon">🎲</span> Juegos
                </Link>
                
                <div className="nav-divider"></div>
                
                <button onClick={handleLogout} className="nav-item logout-btn">
                    <span className="icon">🚪</span> Cerrar Sesión
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;