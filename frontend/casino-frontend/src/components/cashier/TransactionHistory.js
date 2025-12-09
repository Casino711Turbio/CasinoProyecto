import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ type: '', status: '' });

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('access_token');
            try {
                let url = 'http://localhost:8000/api/transactions/history/';
                const params = [];
                if (filters.type) params.push(`transaction_type=${filters.type}`);
                if (filters.status) params.push(`status=${filters.status}`);
                
                if (params.length > 0) url += `?${params.join('&')}`;

                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTransactions(res.data);
            } catch (error) {
                console.error("Error historial:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [filters]);

    return (
        <div className="cashier-tab-content">
            <div className="history-controls">
                <select onChange={e => setFilters({...filters, type: e.target.value})}>
                    <option value="">Todos los Tipos</option>
                    <option value="deposit">Depósitos</option>
                    <option value="withdrawal">Retiros</option>
                    <option value="win">Ganancias</option>
                    <option value="loss">Pérdidas</option>
                </select>
                <select onChange={e => setFilters({...filters, status: e.target.value})}>
                    <option value="">Todos los Estados</option>
                    <option value="completed">Completados</option>
                    <option value="pending">Pendientes</option>
                </select>
            </div>

            <div className="history-table-container">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Monto</th>
                            <th>Estado</th>
                            <th>ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx.id}>
                                <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                                <td className="capitalize">{tx.transaction_type}</td>
                                <td className={['deposit', 'win'].includes(tx.transaction_type) ? 'text-green' : 'text-red'}>
                                    {tx.currency} {parseFloat(tx.amount).toFixed(2)}
                                </td>
                                <td><span className={`status-pill ${tx.status}`}>{tx.status}</span></td>
                                <td className="text-muted">#{tx.id}</td>
                            </tr>
                        ))}
                        {transactions.length === 0 && !loading && (
                            <tr><td colSpan="5" className="text-center">No hay transacciones</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionHistory;