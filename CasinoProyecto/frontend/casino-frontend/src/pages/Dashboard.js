import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const Dashboard = () => {
    const [balanceData, setBalanceData] = useState({ balance: 0, player_name: 'Jugador' });
    const [membershipData, setMembershipData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('access_token');
            // Configuración del header con el token
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                // 1. Obtener Balance (Corrección de URL)
                const balanceRes = await axios.get('http://localhost:8000/api/players/players/my_balance/', config);
                setBalanceData(balanceRes.data);

                // 2. Obtener Membresía (Corrección de URL)
                // Según tu backend/apps/memberships/urls.py el router es 'player-memberships'
                const memberRes = await axios.get('http://localhost:8000/api/memberships/player-memberships/my_membership/', config);
                setMembershipData(memberRes.data);

                // 3. Obtener Estadísticas (Corrección de URL)
                const statsRes = await axios.get('http://localhost:8000/api/memberships/player-memberships/statistics/', config);
                setStats(statsRes.data.last_30_days);

            } catch (error) {
                console.error("Error cargando datos del dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="loading-screen">Cargando Casino Royal...</div>;

    return (
        <div className="dashboard-layout">
            {/* Sidebar fijo a la izquierda */}
            <Sidebar />
            
            {/* Contenido principal a la derecha */}
            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h2>Bienvenido, {balanceData.player_name}</h2>
                    <div className="date-display">{new Date().toLocaleDateString()}</div>
                </header>

                <div className="top-cards-container">
                    {/* TARJETA DE BALANCE */}
                    <div className="dashboard-card balance-card">
                        <h3>Balance Total</h3>
                        <div className="balance-amount">
                            ${parseFloat(balanceData.balance).toFixed(2)}
                        </div>
                        <p className="currency-label">USD - Disponible</p>
                    </div>

                    {/* TARJETA DE MEMBRESÍA */}
                    <div className="dashboard-card membership-card">
                        <div className="card-header">
                            <h3>Membresía Actual</h3>
                            <span className="status-badge active">Activa</span>
                        </div>
                        <div className="membership-info">
                            {/* Manejo seguro de datos anidados */}
                            <h4>{membershipData?.plan_details?.name || 'Plan Básico'}</h4>
                            <p>Nivel: {membershipData?.plan_details?.tier?.toUpperCase() || 'BRONZE'}</p>
                            <small>Expira: {membershipData?.expires_at ? new Date(membershipData.expires_at).toLocaleDateString() : 'N/A'}</small>
                        </div>
                    </div>
                </div>

                <h3 className="section-title">Estadísticas (Últimos 30 días)</h3>
                
                <div className="stats-grid">
                    <div className="stat-widget">
                        <span className="stat-icon">🎮</span>
                        <div className="stat-info">
                            <h4>Total Juegos</h4>
                            <p>{stats?.total_games || 0}</p>
                        </div>
                    </div>

                    <div className="stat-widget">
                        <span className="stat-icon">🏆</span>
                        <div className="stat-info">
                            <h4>Ganado</h4>
                            <p className="text-green">${stats?.total_won?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>

                    <div className="stat-widget">
                        <span className="stat-icon">📥</span>
                        <div className="stat-info">
                            <h4>Depositado</h4>
                            <p>${stats?.total_deposits?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>

                    <div className="stat-widget">
                        <span className="stat-icon">📈</span>
                        <div className="stat-info">
                            <h4>Profit Neto</h4>
                            <p className={stats?.net_profit >= 0 ? 'text-green' : 'text-red'}>
                                ${stats?.net_profit?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;