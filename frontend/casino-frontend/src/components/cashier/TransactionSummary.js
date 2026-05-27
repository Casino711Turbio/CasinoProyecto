import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionSummary = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await axios.get('http://localhost:8000/api/transactions/history/summary/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSummary(res.data.summary);
            } catch (error) {
                console.error("Error cargando resumen:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) return <div className="loading-panel">Cargando finanzas...</div>;
    if (!summary) return <div className="alert-message error">No hay datos disponibles.</div>;

    // Convertir los strings del backend a números
    const deposits = parseFloat(summary.total_deposits) || 0;
    const withdrawals = parseFloat(summary.total_withdrawals) || 0;
    const wins = parseFloat(summary.total_wins) || 0;
    const losses = parseFloat(summary.total_losses) || 0;

    // Cálculos
    const totalVolume = deposits + withdrawals + wins + losses;
    const getPercent = (val) => totalVolume > 0 ? (val / totalVolume) * 100 : 0;
    const netBalance = deposits - withdrawals;

    // Usar losses en algún lugar para evitar la advertencia
    const profitLossRatio = wins > 0 ? ((wins - losses) / wins * 100).toFixed(1) : 0;

    return (
        <div className="cashier-tab-content">
            <h3>Resumen Financiero</h3>
            
            <div className="summary-cards">
                <div className="summary-card deposit">
                    <span className="icon">📥</span>
                    <div className="info">
                        <h4>Total Depósitos</h4>
                        <p>${deposits.toFixed(2)}</p>
                    </div>
                </div>
                <div className="summary-card withdrawal">
                    <span className="icon">📤</span>
                    <div className="info">
                        <h4>Total Retiros</h4>
                        <p>${withdrawals.toFixed(2)}</p>
                    </div>
                </div>
                <div className="summary-card win">
                    <span className="icon">🏆</span>
                    <div className="info">
                        <h4>Total Ganado</h4>
                        <p className="text-green">${wins.toFixed(2)}</p>
                    </div>
                </div>
                <div className="summary-card loss">
                    <span className="icon">📉</span>
                    <div className="info">
                        <h4>Total Perdido</h4>
                        <p className="text-red">${losses.toFixed(2)}</p>
                    </div>
                </div>
                <div className="summary-card net">
                    <span className="icon">💰</span>
                    <div className="info">
                        <h4>Flujo Neto</h4>
                        <p className={netBalance >= 0 ? 'text-green' : 'text-red'}>
                           {netBalance > 0 ? '+' : ''}${netBalance.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="financial-chart">
                <h4>Distribución de Movimientos</h4>
                <div className="chart-bars">
                    <div className="chart-row">
                        <span className="label">Depósitos</span>
                        <div className="bar-container">
                            <div className="bar fill-deposit" style={{width: `${getPercent(deposits)}%`}}></div>
                        </div>
                        <span className="value">{getPercent(deposits).toFixed(1)}%</span>
                    </div>
                    <div className="chart-row">
                        <span className="label">Retiros</span>
                        <div className="bar-container">
                            <div className="bar fill-withdrawal" style={{width: `${getPercent(withdrawals)}%`}}></div>
                        </div>
                        <span className="value">{getPercent(withdrawals).toFixed(1)}%</span>
                    </div>
                    <div className="chart-row">
                        <span className="label">Ganancias</span>
                        <div className="bar-container">
                            <div className="bar fill-win" style={{width: `${getPercent(wins)}%`}}></div>
                        </div>
                        <span className="value">{getPercent(wins).toFixed(1)}%</span>
                    </div>
                    <div className="chart-row">
                        <span className="label">Pérdidas</span>
                        <div className="bar-container">
                            <div className="bar fill-loss" style={{width: `${getPercent(losses)}%`}}></div>
                        </div>
                        <span className="value">{getPercent(losses).toFixed(1)}%</span>
                    </div>
                </div>
                
                {/* Agregar información adicional sobre pérdidas */}
                <div style={{marginTop: '30px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px'}}>
                    <p style={{color: '#a0a0a0', margin: '0', fontSize: '0.9rem'}}>
                        Ratio Ganancias/Pérdidas: <strong className={profitLossRatio >= 0 ? 'text-green' : 'text-red'}>
                            {profitLossRatio}%
                        </strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TransactionSummary;