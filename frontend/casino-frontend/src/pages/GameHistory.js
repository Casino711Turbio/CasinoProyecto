import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './GameHistory.css';

const GameHistory = () => {
    const [historyData, setHistoryData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('access_token');
            try {
                // Petición al endpoint de historial
                const res = await axios.get('http://localhost:8000/api/games/player/history/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistoryData(res.data);
            } catch (error) {
                console.error("Error cargando historial:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="loading-screen">Cargando Historial...</div>;

    // CORRECCIÓN: Aseguramos que statistics y game_sessions existan siempre
    const statistics = historyData?.statistics || {}; 
    const game_sessions = historyData?.game_sessions || [];

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <header className="history-header">
                    <h2>Historial de Partidas</h2>
                    <div className="history-subtitle">Revisa tu desempeño y transacciones de juego</div>
                </header>

                {/* SECCIÓN 1: TARJETAS DE ESTADÍSTICAS */}
                <div className="stats-overview">
                    <div className="stat-card">
                        <div className="stat-icon">🎮</div>
                        <div className="stat-details">
                            <h4>Total Juegos</h4>
                            <p>{statistics.total_games || 0}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🔥</div>
                        <div className="stat-details">
                            <h4>Win Rate</h4>
                            <p>{statistics.win_rate || 0}%</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💸</div>
                        <div className="stat-details">
                            <h4>Total Apostado</h4>
                            <p>${(statistics.total_wagered || 0).toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-details">
                            <h4>Ganancia Neta</h4>
                            <p className={(statistics.net_profit || 0) >= 0 ? 'text-green' : 'text-red'}>
                                ${(statistics.net_profit || 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 2: TABLA DE SESIONES */}
                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Fecha / Hora</th>
                                <th>Juego</th>
                                <th>Apostado</th>
                                <th>Ganado</th>
                                <th>Resultado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {game_sessions.length > 0 ? (
                                game_sessions.map((session) => (
                                    <tr key={session.id}>
                                        <td>{new Date(session.start_time).toLocaleString()}</td>
                                        <td>
                                            <span className="game-name-cell">
                                                {session.game_name || 'Juego Desconocido'}
                                            </span>
                                        </td>
                                        <td>${parseFloat(session.bet_amount || 0).toFixed(2)}</td>
                                        <td>
                                            <span className={parseFloat(session.amount_won || 0) > 0 ? 'text-green' : ''}>
                                                ${parseFloat(session.amount_won || 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`result-badge ${session.result === 'won' ? 'won' : 'lost'}`}>
                                                {session.result === 'won' ? 'VICTORIA' : 'DERROTA'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="empty-state">
                                        No has jugado ninguna partida todavía.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default GameHistory;