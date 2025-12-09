import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminPlayerList.css'; // Lo creamos a continuación

const AdminPlayerList = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        const token = localStorage.getItem('access_token');
        try {
            // El backend detectará que eres admin y devolverá TODOS los jugadores
            const res = await axios.get('http://localhost:8000/api/players/players/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlayers(res.data);
        } catch (error) {
            console.error("Error cargando jugadores:", error);
            if(error.response && (error.response.status === 401 || error.response.status === 403)) {
                alert("Acceso denegado. No tienes permisos de administrador.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Filtrado en el cliente (búsqueda rápida)
    const filteredPlayers = players.filter(player => 
        player.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (player.name + ' ' + player.last_name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-layout">
            <AdminSidebar />
            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h2>Gestión de Jugadores</h2>
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="Buscar por usuario, email o nombre..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-search-input"
                        />
                    </div>
                </header>

                <div className="admin-table-container">
                    {loading ? (
                        <p className="loading-text">Cargando base de datos...</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Usuario</th>
                                    <th>Nombre Completo</th>
                                    <th>Email</th>
                                    <th>Saldo (USD)</th>
                                    <th>Registro</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlayers.map(player => (
                                    <tr key={player.id}>
                                        <td>#{player.id}</td>
                                        <td>
                                            <div className="user-cell">
                                                <span className="user-icon">👤</span>
                                                {player.user.username}
                                            </div>
                                        </td>
                                        <td>{player.name} {player.last_name}</td>
                                        <td>{player.user.email}</td>
                                        <td className={parseFloat(player.balance) > 0 ? 'text-green' : ''}>
                                            ${parseFloat(player.balance).toFixed(2)}
                                        </td>
                                        <td>{new Date(player.join_date).toLocaleDateString()}</td>
                                        <td>
                                            <button className="action-btn edit-btn" onClick={() => alert(`Editar ${player.user.username} (Próximamente)`)}>✏️</button>
                                            {/* Aquí podrías agregar botones para banear o ver historial */}
                                        </td>
                                    </tr>
                                ))}
                                {filteredPlayers.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="no-data">No se encontraron jugadores.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminPlayerList;
