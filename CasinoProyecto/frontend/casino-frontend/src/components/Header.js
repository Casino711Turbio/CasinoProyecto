import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../pages/Home.css'; // Reutilizamos los estilos del Home

const Header = () => {
    const location = useLocation();
    
    // Función para saber si el link está activo
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <header className="home-header">
            <div className="logo-section">
                <div className="logo-icon">🦁</div>
                <h1>CASINO ROYAL</h1>
            </div>
            <nav className="top-nav">
                <Link to="/" className={`nav-link ${isActive('/')}`}>INICIO</Link>
                <Link to="/login" className={`btn-gold-outline ${isActive('/login')}`}>LOGIN</Link>
                <Link to="/register" className={`btn-gold-outline ${isActive('/register')}`}>REGISTRO</Link>
            </nav>
        </header>
    );
};

export default Header;