    import React, { useEffect, useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import axios from 'axios';
    import './StaffDashboard.css';

    const StaffDashboard = () => {
    const [stats, setStats] = useState({
        totalPlayers: 0,
        activePlayers: 0,
        todayTransactions: 0,
        totalBalance: 0
    });
    const [loading, setLoading] = useState(true); // Aún declarado pero ahora se usará
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
        // Aquí irían las llamadas a la API para obtener estadísticas
        // Por ahora simulamos una carga
        setTimeout(() => {
            setStats({
            totalPlayers: 1542,
            activePlayers: 342,
            todayTransactions: 245,
            totalBalance: 1254300
            });
            setLoading(false); // Se usa aquí
        }, 500);
        } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setLoading(false); // Se usa aquí
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    // Si está cargando, muestra un indicador
    if (loading) {
        return (
        <div className="staff-dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#d4af37' }}>Cargando estadísticas...</h2>
            <p>Por favor espera un momento</p>
            </div>
        </div>
        );
    }

    return (
        <div className="staff-dashboard-container">
        {/* Header */}
        <header className="staff-header">
            <div className="staff-header-left">
            <h1>🦁 CASINO ROYAL - ADMINISTRACIÓN</h1>
            <p className="welcome-text">Bienvenido, <strong>{username}</strong></p>
            </div>
            <div className="staff-header-right">
            <button className="btn-logout" onClick={handleLogout}>
                Cerrar Sesión
            </button>
            </div>
        </header>

        {/* Main Content */}
        <div className="staff-content-wrapper">
            {/* Sidebar */}
            <aside className="staff-sidebar">
            <nav className="staff-nav">
                <Link to="/staff/dashboard" className="nav-item active">
                📊 Dashboard
                </Link>
                <Link to="/staff/players" className="nav-item">
                👥 Gestión de Jugadores
                </Link>
                <Link to="/staff/transactions" className="nav-item">
                💰 Transacciones
                </Link>
                <Link to="/staff/reports" className="nav-item">
                📈 Reportes
                </Link>
                <Link to="/staff/supervisor" className="nav-item">
                👁️ Supervisión
                </Link>
                <Link to="/staff/support" className="nav-item">
                🛠️ Soporte
                </Link>
            </nav>
            </aside>

            {/* Main Dashboard */}
            <main className="staff-main">
            <h2 className="dashboard-title">Panel de Administración</h2>
            
            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                    <h3>Total Jugadores</h3>
                    <p className="stat-number">{stats.totalPlayers}</p>
                </div>
                </div>
                
                <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                    <h3>Jugadores Activos</h3>
                    <p className="stat-number">{stats.activePlayers}</p>
                </div>
                </div>
                
                <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                    <h3>Transacciones Hoy</h3>
                    <p className="stat-number">{stats.todayTransactions}</p>
                </div>
                </div>
                
                <div className="stat-card">
                <div className="stat-icon">🏦</div>
                <div className="stat-info">
                    <h3>Balance Total</h3>
                    <p className="stat-number">${stats.totalBalance.toLocaleString()}</p>
                </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Acciones Rápidas</h3>
                <div className="actions-grid">
                <button className="action-btn" onClick={() => navigate('/staff/players')}>
                    <span className="action-icon">➕</span>
                    Nuevo Jugador
                </button>
                <button className="action-btn" onClick={() => navigate('/staff/transactions')}>
                    <span className="action-icon">💳</span>
                    Ver Transacciones
                </button>
                <button className="action-btn" onClick={() => navigate('/staff/reports')}>
                    <span className="action-icon">📊</span>
                    Generar Reporte
                </button>
                <button className="action-btn" onClick={() => alert('Funcionalidad en desarrollo')}>
                    <span className="action-icon">🔔</span>
                    Notificaciones
                </button>
                </div>
            </div>
            </main>
        </div>
        </div>
    );
    };

    export default StaffDashboard;