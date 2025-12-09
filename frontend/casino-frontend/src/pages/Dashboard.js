import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const [balanceData, setBalanceData] = useState({ balance: 0, player_name: 'Jugador' });
    const [membershipData, setMembershipData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d
    const [chartData, setChartData] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        generateChartData();
        generatePerformanceData();
    }, []);

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('access_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            const balanceRes = await axios.get('http://localhost:8000/api/players/my/balance/', config);
            setBalanceData(balanceRes.data);

            const memberRes = await axios.get('http://localhost:8000/api/memberships/player-memberships/my_membership/', config);
            setMembershipData(memberRes.data);

            const statsRes = await axios.get('http://localhost:8000/api/memberships/player-memberships/statistics/', config);
            setStats(statsRes.data.last_30_days);
            
        } catch (error) {
            console.error("Error cargando datos del dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    // Función para generar datos de ejemplo para gráficos
    const generateChartData = () => {
        const data = [];
        const now = new Date();
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            
            data.push({
                date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
                balance: Math.random() * 1000 + 500,
                won: Math.random() * 500 + 100,
                lost: Math.random() * 300 + 50,
                games: Math.floor(Math.random() * 20) + 5,
                net_profit: (Math.random() - 0.5) * 200
            });
        }
        
        setChartData(data);
    };

    // Datos de rendimiento por juego
    const generatePerformanceData = () => {
        const games = [
            { name: 'Blackjack', value: 85, games: 120, won: 85, color: '#d4af37' },
            { name: 'Tragamonedas', value: 65, games: 200, won: 130, color: '#9b59b6' },
            { name: 'Ruleta', value: 45, games: 80, won: 36, color: '#e74c3c' },
            { name: 'Póker', value: 70, games: 60, won: 42, color: '#2ecc71' },
            { name: 'Dados', value: 55, games: 40, won: 22, color: '#3498db' },
        ];
        
        setPerformanceData(games);
    };

    // Función para formatear números
    const formatNumber = (num) => {
        return parseFloat(num || 0).toFixed(2);
    };

    // Colores para gráficos
    const COLORS = ['#d4af37', '#9b59b6', '#2ecc71', '#e74c3c', '#3498db', '#f1c40f'];

    // Tooltip personalizado para gráficos
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="value" style={{ color: entry.color }}>
                            {entry.name}: {entry.name.includes('balance') ? '$' : ''}{formatNumber(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) return (
        <div className="loading-screen">
            <div className="loading-spinner"></div>
            <p>Cargando Casino Royal...</p>
        </div>
    );

    return (
        <div className="dashboard-layout">
            <Sidebar />
            
            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h2>Bienvenido, {balanceData.player_name}</h2>
                    <div className="date-display">
                        {new Date().toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </header>

                <div className="top-cards-container">
                    <div className="dashboard-card balance-card">
                        <h3>Balance Total</h3>
                        <div className="balance-amount">
                            ${formatNumber(balanceData.balance)}
                        </div>
                        <p className="currency-label">USD - Disponible</p>
                        <div className="balance-change">
                            <span className="text-green">+12.5% este mes</span>
                        </div>
                    </div>

                    <div className="dashboard-card membership-card">
                        <div className="card-header">
                            <h3>Membresía Actual</h3>
                            <span className="status-badge active">Activa</span>
                        </div>
                        <div className="membership-info">
                            <h4>{membershipData?.plan_details?.name || 'Plan VIP Gold'}</h4>
                            <p>Nivel: {membershipData?.plan_details?.tier?.toUpperCase() || 'GOLD'}</p>
                            <p>Beneficios: Cashback 5%, Soporte Prioritario</p>
                            <small>Expira: {membershipData?.expires_at ? 
                                new Date(membershipData.expires_at).toLocaleDateString() : 
                                '01/12/2024'
                            }</small>
                        </div>
                    </div>
                </div>

                {/* Gráficos principales */}
                <div className="charts-grid">
                    {/* Gráfico de evolución del balance */}
                    <div className="chart-card large">
                        <div className="chart-header">
                            <h3 className="chart-title">📈 Evolución del Balance</h3>
                            <div className="chart-controls">
                                <div className="time-filter">
                                    <button 
                                        className={`time-filter-btn ${timeRange === '7d' ? 'active' : ''}`}
                                        onClick={() => setTimeRange('7d')}
                                    >
                                        7D
                                    </button>
                                    <button 
                                        className={`time-filter-btn ${timeRange === '30d' ? 'active' : ''}`}
                                        onClick={() => setTimeRange('30d')}
                                    >
                                        30D
                                    </button>
                                    <button 
                                        className={`time-filter-btn ${timeRange === '90d' ? 'active' : ''}`}
                                        onClick={() => setTimeRange('90d')}
                                    >
                                        90D
                                    </button>
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="rgba(255,255,255,0.5)"
                                    fontSize={12}
                                />
                                <YAxis 
                                    stroke="rgba(255,255,255,0.5)"
                                    fontSize={12}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area 
                                    type="monotone" 
                                    dataKey="balance" 
                                    stroke="#d4af37" 
                                    fill="rgba(212, 175, 55, 0.2)"
                                    strokeWidth={2}
                                    name="Balance"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="net_profit" 
                                    stroke="#2ecc71" 
                                    strokeWidth={1.5}
                                    dot={false}
                                    name="Profit Diario"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfico de rendimiento por juego */}
                    <div className="chart-card small">
                        <div className="chart-header">
                            <h3 className="chart-title">🎯 Rendimiento por Juego</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={performanceData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis 
                                    dataKey="name" 
                                    stroke="rgba(255,255,255,0.6)"
                                    fontSize={12}
                                />
                                <PolarRadiusAxis 
                                    stroke="rgba(255,255,255,0.1)"
                                    fontSize={10}
                                />
                                <Radar 
                                    name="Tasa de Victoria" 
                                    dataKey="value" 
                                    stroke="#d4af37"
                                    fill="rgba(212, 175, 55, 0.4)"
                                    fillOpacity={0.6}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Segunda fila de gráficos */}
                <div className="charts-grid">
                    {/* Gráfico de barras - Ganancias vs Pérdidas */}
                    <div className="chart-card large">
                        <div className="chart-header">
                            <h3 className="chart-title">💰 Ganancias vs Pérdidas</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.slice(-7)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="rgba(255,255,255,0.5)"
                                    fontSize={12}
                                />
                                <YAxis 
                                    stroke="rgba(255,255,255,0.5)"
                                    fontSize={12}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar 
                                    dataKey="won" 
                                    name="Ganado" 
                                    fill="#2ecc71" 
                                    radius={[4, 4, 0, 0]}
                                    strokeWidth={0}
                                />
                                <Bar 
                                    dataKey="lost" 
                                    name="Perdido" 
                                    fill="#e74c3c" 
                                    radius={[4, 4, 0, 0]}
                                    strokeWidth={0}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfico de torta - Distribución de juegos */}
                    <div className="chart-card small">
                        <div className="chart-header">
                            <h3 className="chart-title">🎮 Distribución de Juegos</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={performanceData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${entry.value}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {performanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value, name) => [`${value}%`, name]}
                                    contentStyle={{ 
                                        background: 'rgba(45, 27, 78, 0.95)',
                                        border: '1px solid rgba(212, 175, 55, 0.3)',
                                        borderRadius: '10px'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <h3 className="section-title">📊 Estadísticas (Últimos 30 días)</h3>
                
                <div className="stats-grid">
                    <div className="stat-widget">
                        <span className="stat-icon">🎮</span>
                        <div className="stat-info">
                            <h4>Total Juegos</h4>
                            <p className="text-gold">{stats?.total_games || 156}</p>
                        </div>
                    </div>

                    <div className="stat-widget">
                        <span className="stat-icon">🏆</span>
                        <div className="stat-info">
                            <h4>Ganado</h4>
                            <p className="text-green">${formatNumber(stats?.total_won || 2450.75)}</p>
                        </div>
                    </div>

                    <div className="stat-widget">
                        <span className="stat-icon">📥</span>
                        <div className="stat-info">
                            <h4>Depositado</h4>
                            <p className="text-gold">${formatNumber(stats?.total_deposits || 1500)}</p>
                        </div>
                    </div>

                    <div className="stat-widget">
                        <span className="stat-icon">📈</span>
                        <div className="stat-info">
                            <h4>Profit Neto</h4>
                            <p className={stats?.net_profit >= 0 ? 'text-green' : 'text-red'}>
                                ${formatNumber(stats?.net_profit || 950.75)}
                            </p>
                        </div>
                    </div>

                    <div className="stat-widget">
                        <span className="stat-icon">⭐</span>
                        <div className="stat-info">
                            <h4>Juego Favorito</h4>
                            <p className="text-gold">Blackjack</p>
                        </div>
                    </div>

                    <div className="stat-widget">
                        <span className="stat-icon">⏱️</span>
                        <div className="stat-info">
                            <h4>Horas Jugadas</h4>
                            <p className="text-gold">42h</p>
                        </div>
                    </div>
                </div>

                {/* Métricas de rendimiento */}
                <h3 className="section-title">📈 Métricas de Rendimiento</h3>
                <div className="performance-metrics">
                    <div className="metric-card">
                        <div className="metric-header">
                            <span className="metric-title">Tasa de Victoria</span>
                            <span className="metric-change positive">+5.2%</span>
                        </div>
                        <div className="metric-value">68.5%</div>
                        <p className="metric-description">Mejor que 85% de los jugadores</p>
                    </div>

                    <div className="metric-card">
                        <div className="metric-header">
                            <span className="metric-title">ROI Promedio</span>
                            <span className="metric-change positive">+12.3%</span>
                        </div>
                        <div className="metric-value">42.7%</div>
                        <p className="metric-description">Retorno por cada $100 invertidos</p>
                    </div>

                    <div className="metric-card">
                        <div className="metric-header">
                            <span className="metric-title">Racha Actual</span>
                            <span className="metric-change positive">+8</span>
                        </div>
                        <div className="metric-value">5 Victorias</div>
                        <p className="metric-description">Mejor racha: 12 victorias</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;