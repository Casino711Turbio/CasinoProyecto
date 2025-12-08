import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './GameList.css'; // Lo creamos en el siguiente paso

const GameList = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'Mesa', 'Máquina'

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        const token = localStorage.getItem('access_token');
        try {
            // Petición al endpoint público (o protegido según tu configuración)
            // Según tu urls.py es: /api/games/list/
            const res = await axios.get('http://localhost:8000/api/games/list/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGames(res.data);
        } catch (error) {
            console.error("Error cargando juegos:", error);
        } finally {
            setLoading(false);
        }
    };

    // Lógica de filtrado
    const filteredGames = games.filter(game => {
        const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || game.game_type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) return <div className="loading-screen">Cargando Lobby...</div>;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            
            <main className="dashboard-content">
                <header className="games-header">
                    <h2>Lobby de Juegos</h2>
                    
                    <div className="games-controls">
                        {/* Barra de Búsqueda */}
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Buscar juego..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filtros */}
                        <div className="filter-buttons">
                            <button 
                                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                                onClick={() => setFilterType('all')}
                            >
                                Todos
                            </button>
                            <button 
                                className={`filter-btn ${filterType === 'Mesa' ? 'active' : ''}`}
                                onClick={() => setFilterType('Mesa')}
                            >
                                Mesa
                            </button>
                            <button 
                                className={`filter-btn ${filterType === 'Máquina' ? 'active' : ''}`}
                                onClick={() => setFilterType('Máquina')}
                            >
                                Máquinas (Slots)
                            </button>
                        </div>
                    </div>
                </header>

                {/* Grid de Juegos */}
                <div className="games-grid">
                    {filteredGames.length > 0 ? (
                        filteredGames.map(game => (
                            <div key={game.id} className="game-card">
                                <div className="game-image-placeholder">
                                    {/* Icono dinámico según el tipo */}
                                    <span className="game-icon">
                                        {game.game_type === 'Mesa' ? '🃏' : '🎰'}
                                    </span>
                                </div>
                                <div className="game-info">
                                    <h3>{game.name}</h3>
                                    <p className="game-desc">{game.description}</p>
                                    <div className="game-meta">
                                        <span className={`game-badge ${game.game_type === 'Mesa' ? 'table' : 'slot'}`}>
                                            {game.game_type}
                                        </span>
                                        <Link to={`/game/${game.id}/play`} className="btn-play">
                                            JUGAR AHORA
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <p>No se encontraron juegos que coincidan con tu búsqueda.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GameList;