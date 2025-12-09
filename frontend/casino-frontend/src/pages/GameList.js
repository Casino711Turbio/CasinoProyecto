import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './GameList.css';

const GameList = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [balance, setBalance] = useState(0);
    const [balanceLoading, setBalanceLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGames();
        fetchBalance();
    }, []);

    const fetchGames = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await axios.get('http://localhost:8000/api/games/list/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGames(res.data);
        } catch (error) {
            console.error("Error cargando juegos:", error);
            // Mock data para desarrollo
            setGames([
                {
                    id: 1,
                    name: "Blackjack Premier",
                    description: "Clásico juego de cartas 21 con múltiples mesas",
                    game_type: "Mesa",
                    min_bet: 5,
                    max_bet: 1000,
                    popularity: 95
                },
                {
                    id: 2,
                    name: "Fortune Slots",
                    description: "Tragamonedas con jackpots progresivos",
                    game_type: "Máquina",
                    min_bet: 0.50,
                    max_bet: 100,
                    popularity: 88
                },
                {
                    id: 3,
                    name: "Roulette Royale",
                    description: "Ruleta europea con dealer en vivo",
                    game_type: "Mesa",
                    min_bet: 10,
                    max_bet: 5000,
                    popularity: 92
                },
                {
                    id: 4,
                    name: "Poker Diamond",
                    description: "Texas Hold'em con torneos diarios",
                    game_type: "Mesa",
                    min_bet: 25,
                    max_bet: 2500,
                    popularity: 87
                },
                {
                    id: 5,
                    name: "Golden Reels",
                    description: "Slots clásicos con 5 carretes",
                    game_type: "Máquina",
                    min_bet: 1,
                    max_bet: 200,
                    popularity: 85
                },
                {
                    id: 6,
                    name: "Baccarat Elite",
                    description: "Baccarat con estadísticas en tiempo real",
                    game_type: "Mesa",
                    min_bet: 20,
                    max_bet: 10000,
                    popularity: 90
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchBalance = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        try {
            const res = await axios.get('http://localhost:8000/api/players/my/balance/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data && res.data.balance !== undefined) {
                setBalance(parseFloat(res.data.balance));
            }
        } catch (error) {
            console.error("Error obteniendo balance:", error);
        } finally {
            setBalanceLoading(false);
        }
    };

    const filteredGames = games.filter(game => {
        const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             game.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || game.game_type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner-gold"></div>
                <p>Cargando Lobby Premium...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            
            <main className="dashboard-content">
                {/* Header Premium */}
                <header className="games-header-premium">
                    <div className="header-top">
                        <div className="header-title-section">
                            <h1>
                                <span className="title-gold">CASINO</span>
                                <span className="title-white"> LOUNGE</span>
                            </h1>
                            <p className="header-subtitle">
                                Selecciona tu juego y experimenta la emoción del casino premium
                            </p>
                        </div>
                        
                        <div className="header-actions">
                            {/* Balance Display */}
                            <div className="balance-display-premium">
                                <div className="balance-label">SALDO DISPONIBLE</div>
                                <div className="balance-amount">
                                    {balanceLoading ? (
                                        <div className="balance-loading"></div>
                                    ) : (
                                        `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                    )}
                                </div>
                                <button 
                                    className="btn-deposit-mini"
                                    onClick={() => navigate('/cashier')}
                                >
                                    + Depositar
                                </button>
                            </div>
                            
                            {/* History Button */}
                            <button 
                                onClick={() => navigate('/history')}
                                className="btn-history-premium"
                            >
                                <span className="history-icon">📜</span>
                                <span>Mi Historial</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Stats Bar */}
                    <div className="stats-bar">
                        <div className="stat-item">
                            <span className="stat-number">{games.length}</span>
                            <span className="stat-label">Juegos Disponibles</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {games.filter(g => g.game_type === 'Mesa').length}
                            </span>
                            <span className="stat-label">Mesas Activas</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {games.filter(g => g.game_type === 'Máquina').length}
                            </span>
                            <span className="stat-label">Slots Premium</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">24/7</span>
                            <span className="stat-label">Soporte en Vivo</span>
                        </div>
                    </div>
                </header>

                {/* Search & Filter Section */}
                <div className="search-filter-section">
                    <div className="search-container-premium">
                        <div className="search-icon-premium">🎲</div>
                        <input 
                            type="text" 
                            placeholder="Buscar juegos, categorías, proveedores..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input-premium"
                        />
                        <div className="search-stats">
                            {filteredGames.length} juegos encontrados
                        </div>
                    </div>
                    
                    <div className="filter-container-premium">
                        <div className="filter-label">FILTRAR POR:</div>
                        <div className="filter-buttons-premium">
                            <button 
                                className={`filter-btn-premium ${filterType === 'all' ? 'active' : ''}`}
                                onClick={() => setFilterType('all')}
                            >
                                <span className="filter-icon">🌟</span>
                                Todos los Juegos
                            </button>
                            <button 
                                className={`filter-btn-premium ${filterType === 'Mesa' ? 'active' : ''}`}
                                onClick={() => setFilterType('Mesa')}
                            >
                                <span className="filter-icon">🃏</span>
                                Juegos de Mesa
                            </button>
                            <button 
                                className={`filter-btn-premium ${filterType === 'Máquina' ? 'active' : ''}`}
                                onClick={() => setFilterType('Máquina')}
                            >
                                <span className="filter-icon">🎰</span>
                                Tragamonedas
                            </button>
                        </div>
                    </div>
                </div>

                {/* Games Grid */}
                <div className="games-grid-premium">
                    {filteredGames.length > 0 ? (
                        filteredGames.map(game => (
                            <div key={game.id} className="game-card-premium">
                                {/* Game Image/Icon */}
                                <div className={`game-card-header ${game.game_type === 'Mesa' ? 'table-game' : 'slot-game'}`}>
                                    <div className="game-icon-premium">
                                        {game.game_type === 'Mesa' ? '🃏' : '🎰'}
                                    </div>
                                    <div className="game-popularity">
                                        <span className="popularity-badge">
                                            {game.popularity || 85}%
                                        </span>
                                        <span className="popularity-label">Popular</span>
                                    </div>
                                </div>
                                
                                {/* Game Info */}
                                <div className="game-card-body">
                                    <div className="game-title-section">
                                        <h3>{game.name}</h3>
                                        <div className={`game-type-badge ${game.game_type === 'Mesa' ? 'type-table' : 'type-slot'}`}>
                                            {game.game_type}
                                        </div>
                                    </div>
                                    
                                    <p className="game-description-premium">
                                        {game.description}
                                    </p>
                                    
                                    {/* Game Stats */}
                                    <div className="game-stats">
                                        <div className="game-stat">
                                            <span className="stat-label-small">Apuesta Mín.</span>
                                            <span className="stat-value">
                                                ${game.min_bet || 5}.00
                                            </span>
                                        </div>
                                        <div className="game-stat">
                                            <span className="stat-label-small">Apuesta Máx.</span>
                                            <span className="stat-value">
                                                ${game.max_bet || 1000}.00
                                            </span>
                                        </div>
                                        <div className="game-stat">
                                            <span className="stat-label-small">RTP</span>
                                            <span className="stat-value">
                                                {game.game_type === 'Mesa' ? '98.5%' : '96.2%'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Action Button */}
                                    <div className="game-card-actions">
                                        <Link 
                                            to={`/game/${game.id}/play`} 
                                            className="btn-play-premium"
                                        >
                                            <span className="play-text">JUGAR AHORA</span>
                                            <span className="play-arrow">→</span>
                                        </Link>
                                        <button className="btn-info-premium">
                                            ℹ️ Info
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Glow Effect */}
                                <div className="game-card-glow"></div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results-premium">
                            <div className="no-results-icon">🔍</div>
                            <h3>No se encontraron juegos</h3>
                            <p>Intenta con otros términos de búsqueda o cambia los filtros</p>
                            <button 
                                className="btn-clear-filters"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterType('all');
                                }}
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Footer Note */}
                <div className="lobby-footer">
                    <p className="footer-note">
                        <span className="security-badge">🔒</span> 
                        Todos los juegos utilizan tecnología de juego justo certificada
                        <span className="rtp-badge">📊 RTP Verificado</span>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default GameList;