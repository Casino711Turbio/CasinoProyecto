import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import SlotMachine from '../components/games/SlotMachine';
import Blackjack from '../components/games/Blackjack';
import './GameRoom.css';

const GameRoom = () => {
    const { id } = useParams();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Obtener detalles del juego (nombre, tipo) para saber qué renderizar
        // Nota: Asumiendo que tienes un endpoint para ver detalle de juego o usas la lista
        // Si no, podemos pasar el tipo por props o state.
        // Por simplicidad, haré un fetch a la lista y buscaré el ID.
        const fetchGameDetails = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await axios.get('http://localhost:8000/api/games/games/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const foundGame = res.data.find(g => g.id === parseInt(id));
                setGame(foundGame);
            } catch (error) {
                console.error("Error game:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGameDetails();
    }, [id]);

    if (loading) return <div className="loading-screen">Preparando Mesa...</div>;
    if (!game) return <div className="error-screen">Juego no encontrado</div>;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="game-room-content">
                <header className="gameroom-header">
                    <Link to="/games" className="back-link">← Volver al Lobby</Link>
                    <h2>{game.name}</h2>
                    <div className="game-id">ID: {game.id}</div>
                </header>

                <div className="game-stage">
                    {/* Renderizado condicional del juego */}
                    {(game.game_type === 'Máquina' || game.name.includes('Tragamonedas')) ? (
                        <SlotMachine gameId={game.id} />
                    ) : (
                        <Blackjack gameId={game.id} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default GameRoom;