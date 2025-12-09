import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Mostrar confirmación antes de cerrar sesión
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate('/login');
        }
    };

    // Función para resaltar el link activo con soporte para subrutas
    const isActive = (path) => {
        return location.pathname.startsWith(path) ? 'active' : '';
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon">♠️</div>
                <h3>CASINO ROYAL</h3>
            </div>

            <nav className="sidebar-nav">
                <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
                    <span className="icon">📈</span> 
                    <span>Dashboard</span>
                </Link>
                
                <Link to="/profile" className={`nav-item ${isActive('/profile')}`}>
                    <span className="icon">👨‍💼</span>
                    <span>Mi Perfil</span>
                </Link>
                
                <Link to="/transactions" className={`nav-item ${isActive('/transactions')}`}>
                    <span className="icon">💳</span>
                    <span>Cajero</span>
                </Link>
                
                <Link to="/games" className={`nav-item ${isActive('/games')}`}>
                    <span className="icon">🎯</span>
                    <span>Juegos</span>
                </Link>
                
                <div className="nav-divider"></div>
                
                <Link to="/support" className={`nav-item ${isActive('/support')}`}>
                    <span className="icon">🛟</span>
                    <span>Soporte</span>
                </Link>
                
                <Link to="/settings" className={`nav-item ${isActive('/settings')}`}>
                    <span className="icon">⚙️</span>
                    <span>Configuración</span>
                </Link>
                
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="nav-item logout-btn">
                        <span className="icon">🚪</span>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;