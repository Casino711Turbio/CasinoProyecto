import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
// IMPORTANTE: Asegúrate de que esta imagen exista en src/assets/Hero.jpeg
import heroImage from '../assets/Hero.jpeg'; 

const Home = () => {
    const [apiStatus, setApiStatus] = useState("Conectando con el servidor...");
    const [showStaffMenu, setShowStaffMenu] = useState(false);

    // Conexión con el Backend (Endpoint '/' que devuelve API info)
    useEffect(() => {
        const checkBackend = async () => {
        try {
            const response = await axios.get('http://localhost:8000/');
            // Tu view devuelve: {"message": "Bienvenido a CasinoChill API", ...}
            setApiStatus(response.data.message || "Sistema En Línea");
        } catch (error) {
            setApiStatus("Servidor Offline - Revise conexión");
        }
        };
        checkBackend();
    }, []);

    const handleStaffAccess = () => {
        setShowStaffMenu(!showStaffMenu);
    };

    const handleSettings = () => {
        alert("Configuración del sistema (en desarrollo)");
    };

    const handleHelp = () => {
        alert("Centro de ayuda (en desarrollo)");
    };

    const handleStaffRole = (role) => {
        alert(`Acceso como ${role} (en desarrollo)`);
        setShowStaffMenu(false);
    };

    return (
        <div className="home-container">
        {/* Fondo con blur (z-index: 0) */}
        <div className="background-blur" style={{ backgroundImage: `url(${heroImage})` }}></div>
        
        {/* Contenido principal (z-index: 1) */}
        <div className="content-wrapper">
            {/* HEADER */}
            <header className="home-header">
            <div className="logo-section">
                <div className="logo-icon">🦁</div>
                <h1>CASINO ROYAL</h1>
            </div>
            <nav className="top-nav">
                <Link to="/" className="nav-link active">INICIO</Link>
                <Link to="/login" className="btn-gold-outline">LOGIN</Link>
                <Link to="/register" className="btn-gold-outline">REGISTRO</Link>
            </nav>
            </header>

            {/* HERO SECTION */}
            <main className="hero-section">
            <div className="hero-content">
                <h2 className="welcome-title">Bienvenido al Sistema de Gestión</h2>
                <p className="welcome-subtitle">Tu Plataforma Integral para Operaciones de Casino</p>
                
                {/* Indicador de estado del Backend */}
                <div className="status-indicator">
                <span className={`status-dot ${apiStatus.includes("Offline") ? "red" : "green"}`}></span>
                <span className="status-text">{apiStatus}</span>
                </div>

                {/* Círculo central con la imagen */}
                <div className="hero-image-container">
                <div className="hero-circle-decoration">
                    <img 
                    src={heroImage} 
                    alt="Casino Royal Hero" 
                    className="center-img" 
                    />
                </div>
                </div>
            </div>
            </main>

            {/* ACTION CARDS */}
            <section className="features-grid">
            <div className="feature-card">
                <div className="icon">🎰</div>
                <h3>Gestionar Jugadores</h3>
                <p>Administración de perfiles y accesos.</p>
                <Link to="/players" className="link-text">Ir Ahora →</Link>
            </div>

            <div className="feature-card">
                <div className="icon">🃏</div>
                <h3>Monitorear Juegos</h3>
                <p>Supervisión de mesas y máquinas en vivo.</p>
                <Link to="/games" className="link-text">Ir Ahora →</Link>
            </div>

            <div className="feature-card">
                <div className="icon">🪙</div>
                <h3>Ver Transacciones</h3>
                <p>Control de depósitos, retiros y caja.</p>
                <Link to="/transactions" className="link-text">Ir Ahora →</Link>
            </div>
            </section>

            {/* FOOTER */}
            <footer className="home-footer">
            <div className="footer-content">
                <div 
                    className="staff-access-container"
                    onMouseEnter={() => setShowStaffMenu(true)}
                    onMouseLeave={() => setShowStaffMenu(false)}
                >
                <button 
                    className="staff-access-btn"
                    onClick={handleStaffAccess}
                >
                    <span className="staff-icon">👤</span>
                    Staff Access
                    <span className="dropdown-arrow">▼</span>
                </button>
                
                {showStaffMenu && (
                    <div className="staff-dropdown-menu">
                    <button className="dropdown-item" onClick={() => handleStaffRole('Administrador')}>
                        Administrador
                    </button>
                    <button className="dropdown-item" onClick={() => handleStaffRole('Supervisor')}>
                        Supervisor
                    </button>
                    <button className="dropdown-item" onClick={() => handleStaffRole('Cajero')}>
                        Cajero
                    </button>
                    <button className="dropdown-item" onClick={() => handleStaffRole('Soporte')}>
                        Soporte
                    </button>
                    </div>
                )}
                </div>

                <div className="footer-actions">
                <button className="footer-btn" onClick={handleSettings}>
                    <span className="btn-icon">⚙️</span>
                    Ajustes
                </button>
                
                <button className="footer-btn" onClick={handleHelp}>
                    <span className="btn-icon">❓</span>
                    Ayuda
                </button>
                </div>
            </div>
            </footer>
        </div>
        </div>
    );
};

export default Home;