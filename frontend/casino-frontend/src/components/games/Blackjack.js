import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Blackjack.css';

const Blackjack = ({ gameId }) => {
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [dealerHiddenCard, setDealerHiddenCard] = useState(null);
    const [playerScore, setPlayerScore] = useState(0);
    const [dealerScore, setDealerScore] = useState(0);
    const [bet, setBet] = useState(50);
    const [gameState, setGameState] = useState('idle');
    const [resultMsg, setResultMsg] = useState('');
    const [resultType, setResultType] = useState('');
    const [playerBusted, setPlayerBusted] = useState(false);
    const [currentTurn, setCurrentTurn] = useState(null);
    const [activeGameId, setActiveGameId] = useState(null); // NUEVO: ID del juego activo
    
    const tableRef = useRef(null);
    const audioContextRef = useRef(null);

    // Inicializar AudioContext
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    const getSuitSymbol = (suit) => {
        const suits = {
            'HEARTS': '♥',
            'DIAMONDS': '♦', 
            'CLUBS': '♣',
            'SPADES': '♠',
            '♥': '♥',
            '♦': '♦',
            '♣': '♣',
            '♠': '♠'
        };
        return suits[suit] || suit;
    };

    const getCardValue = (rank) => {
        if (['J', 'Q', 'K', 'JACK', 'QUEEN', 'KING'].includes(rank)) return 10;
        if (rank === 'A' || rank === 'ACE') return 11;
        return parseInt(rank) || 0;
    };

    const calculateScore = (hand) => {
        let score = 0;
        let aces = 0;
        
        hand.forEach(card => {
            const value = getCardValue(card.rank);
            score += value;
            if (card.rank === 'A' || card.rank === 'ACE') aces++;
        });
        
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        
        return score;
    };

    const playSound = (frequency, type = 'sine', duration = 0.2) => {
        if (!audioContextRef.current) return;
        
        try {
            const oscillator = audioContextRef.current.createOscillator();
            const gainNode = audioContextRef.current.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
            
            oscillator.start();
            oscillator.stop(audioContextRef.current.currentTime + duration);
        } catch (error) {
            console.log('Audio error:', error);
        }
    };

    const playCardSound = () => playSound(220, 'sine', 0.1);
    const playFlipSound = () => playSound(150, 'sawtooth', 0.3);
    const playWinSound = () => {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => playSound(440 + i * 100, 'triangle', 0.2), i * 100);
        }
    };
    const playLoseSound = () => playSound(300, 'sine', 0.5);
    const playTieSound = () => playSound(329.63, 'sine', 0.3);

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const startGame = async () => {
        if (gameState !== 'idle') return;
        
        setGameState('dealing');
        setCurrentTurn('player');
        setPlayerBusted(false);
        setPlayerHand([]);
        setDealerHand([]);
        setDealerHiddenCard(null);
        setPlayerScore(0);
        setDealerScore(0);
        setResultMsg('');
        setResultType('');
        setActiveGameId(null);
        
        const token = localStorage.getItem('access_token');
        try {
            const res = await axios.post(
                `http://localhost:8000/api/games/games/${gameId}/start_blackjack/`,
                { bet_amount: bet },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { game_data, game_id } = res.data;
            
            // Guardar el ID del juego activo
            setActiveGameId(game_id);
            
            const pCards = game_data.player_hand;
            const dCards = game_data.dealer_hand;
            
            // Repartir cartas iniciales con animación
            // Primera carta del jugador
            await delay(500);
            setPlayerHand([{ ...pCards[0], dealing: true, cardIndex: 0 }]);
            playCardSound();
            
            // Primera carta del dealer
            await delay(800);
            setDealerHand([{ ...dCards[0], dealing: true, cardIndex: 0 }]);
            playCardSound();
            
            // Segunda carta del jugador
            await delay(800);
            setPlayerHand(prev => [...prev, { ...pCards[1], dealing: true, cardIndex: 1 }]);
            const playerScore = calculateScore([pCards[0], pCards[1]]);
            setPlayerScore(playerScore);
            playCardSound();
            
            // Segunda carta del dealer (oculta)
            await delay(800);
            setDealerHiddenCard({ ...dCards[1], hidden: true, cardIndex: 1 });
            playCardSound();
            
            await delay(1000);
            setGameState('player-turn');
            
        } catch (error) {
            console.error('Error starting blackjack:', error);
            setGameState('idle');
            setResultMsg('Error al iniciar el juego');
            setResultType('lose');
            if (error.response && error.response.data && error.response.data.error) {
                setResultMsg(error.response.data.error);
            }
        }
    };

    const hit = async () => {
        if (gameState !== 'player-turn' || !activeGameId) return;
        
        setGameState('dealing');
        const token = localStorage.getItem('access_token');
        try {
            const res = await axios.post(
                `http://localhost:8000/api/games/games/${gameId}/hit_blackjack/`,
                { game_id: activeGameId }, // ENVIAR game_id
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { game_data, busted } = res.data;
            
            // Añadir nueva carta al jugador
            const newCard = game_data.player_hand[game_data.player_hand.length - 1];
            await delay(500);
            const newPlayerHand = [...playerHand, { ...newCard, dealing: true, cardIndex: playerHand.length }];
            setPlayerHand(newPlayerHand);
            
            const newScore = calculateScore(newPlayerHand.map(c => ({ rank: c.rank, suit: c.suit })));
            setPlayerScore(newScore);
            playCardSound();
            
            await delay(800);
            
            if (busted || newScore > 21) {
                setPlayerBusted(true);
                // Si el jugador se pasa, terminamos el juego inmediatamente
                setGameState('ended');
                setResultMsg('¡TE HAS PASADO DE 21! 💥 LA CASA GANA');
                setResultType('lose');
                playLoseSound();
            } else {
                setGameState('player-turn');
            }
            
        } catch (error) {
            console.error('Error hitting:', error);
            setGameState('player-turn');
            if (error.response && error.response.data && error.response.data.error) {
                setResultMsg(error.response.data.error);
                setResultType('lose');
            }
        }
    };

    const stand = async () => {
        if ((gameState !== 'player-turn' && gameState !== 'dealing') || !activeGameId) return;
        
        setGameState('dealer-turn');
        setCurrentTurn('dealer');
        
        const token = localStorage.getItem('access_token');
        try {
            // Primero voltear carta oculta del dealer si existe
            if (dealerHiddenCard) {
                await delay(500);
                setDealerHiddenCard(null);
                playFlipSound();
                
                await delay(600);
                setDealerHand(prev => [...prev, { rank: '?', suit: 'HIDDEN', flipping: true }]);
            }
            
            const res = await axios.post(
                `http://localhost:8000/api/games/games/${gameId}/stand_blackjack/`,
                { game_id: activeGameId }, // ENVIAR game_id
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { game_data, result, amount_won } = res.data;
            
            // Mostrar todas las cartas del dealer
            await delay(500);
            setDealerHand(game_data.dealer_hand.map((card, index) => ({
                ...card,
                cardIndex: index
            })));
            setDealerScore(calculateScore(game_data.dealer_hand));
            
            await delay(1000);
            
            // Determinar resultado
            let msg = '';
            let type = '';
            if (result === 'won') {
                msg = `¡GANASTE $${amount_won || bet * 2}! 🏆`;
                type = 'win';
                playWinSound();
                // Marcar cartas ganadoras
                setPlayerHand(prev => prev.map(card => ({ ...card, winning: true })));
            } else if (result === 'tie') {
                msg = '¡EMPATE! 🤝';
                type = 'tie';
                playTieSound();
                // Marcar ambas manos como empate
                setPlayerHand(prev => prev.map(card => ({ ...card, tie: true })));
                setDealerHand(prev => prev.map(card => ({ ...card, tie: true })));
            } else {
                msg = playerBusted ? '¡TE HAS PASADO! 💥 LA CASA GANA' : 'LA CASA GANA 🏠';
                type = 'lose';
                playLoseSound();
                setDealerHand(prev => prev.map(card => ({ ...card, winning: true })));
            }
            
            setResultMsg(msg);
            setResultType(type);
            setGameState('ended');
            
        } catch (error) {
            console.error('Error standing:', error);
            setGameState('ended');
            setResultMsg('Error en el juego');
            setResultType('lose');
            if (error.response && error.response.data && error.response.data.error) {
                setResultMsg(error.response.data.error);
            }
        }
    };

    const Card = ({ rank, suit, hidden, dealing, flipping, winning, tie, cardIndex }) => {
        if (hidden) {
            return (
                <div 
                    className="card hidden"
                    style={{ 
                        '--card-offset': cardIndex || 0,
                        '--card-index': cardIndex || 0
                    }}
                />
            );
        }

        const suitSymbol = getSuitSymbol(suit);
        const isRed = ['HEARTS', 'DIAMONDS', '♥', '♦'].includes(suit);
        
        // Formatear el rank para mostrar
        const displayRank = rank === 'A' ? 'A' : 
                          rank === 'K' ? 'K' :
                          rank === 'Q' ? 'Q' :
                          rank === 'J' ? 'J' :
                          rank === 'ACE' ? 'A' :
                          rank === 'KING' ? 'K' :
                          rank === 'QUEEN' ? 'Q' :
                          rank === 'JACK' ? 'J' : rank;
        
        return (
            <div 
                className={`card ${isRed ? 'red' : 'black'} ${dealing ? 'dealing' : ''} ${flipping ? 'flipping' : ''} ${winning ? 'winning' : ''} ${tie ? 'tie' : ''}`}
                style={{ 
                    '--card-offset': cardIndex || 0,
                    '--card-index': cardIndex || 0
                }}
            >
                <div className={`card-corner top-left suit-${suit.toLowerCase()}`}>
                    <div>{displayRank}</div>
                    <div>{suitSymbol}</div>
                </div>
                <div className={`card-center suit-${suit.toLowerCase()}`}>
                    {suitSymbol}
                </div>
                <div className={`card-corner bottom-right suit-${suit.toLowerCase()}`}>
                    <div>{displayRank}</div>
                    <div>{suitSymbol}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="blackjack-table" ref={tableRef}>
            {/* Mazo de cartas */}
            <div className="deck"></div>
            
            {/* Área del Dealer */}
            <div className="dealer-area">
                <h3>
                    Dealer 
                    {dealerScore > 0 && <span className="score-display dealer">{dealerScore}</span>}
                </h3>
                {currentTurn === 'dealer' && gameState !== 'ended' && (
                    <div className="turn-indicator">TURNO DEL DEALER</div>
                )}
                <div className="hand">
                    {dealerHand.map((card, i) => (
                        <Card 
                            key={i}
                            cardIndex={i}
                            rank={card.rank}
                            suit={card.suit}
                            hidden={card.hidden}
                            dealing={card.dealing}
                            flipping={card.flipping}
                            winning={card.winning}
                            tie={card.tie}
                        />
                    ))}
                    {dealerHiddenCard && (
                        <Card 
                            key="hidden"
                            cardIndex={dealerHand.length}
                            rank={dealerHiddenCard.rank}
                            suit={dealerHiddenCard.suit}
                            hidden={true}
                        />
                    )}
                    {dealerHand.length === 0 && !dealerHiddenCard && <div className="card-placeholder"></div>}
                </div>
            </div>

            {/* Mensaje central */}
            <div className="center-info">
                {resultMsg ? (
                    <div className={`bj-message ${resultType}`}>
                        {resultMsg}
                    </div>
                ) : gameState === 'dealing' ? (
                    <div className="bj-message">REPARTIENDO CARTAS...</div>
                ) : gameState === 'player-turn' ? (
                    <div className="bj-message">TU TURNO - ELIGE UNA ACCIÓN</div>
                ) : gameState === 'dealer-turn' ? (
                    <div className="bj-message">EL DEALER JUEGA...</div>
                ) : null}
            </div>

            {/* Área del Jugador */}
            <div className="player-area">
                <h3>
                    Jugador 
                    {playerScore > 0 && <span className={`score-display player ${playerScore > 21 ? 'busted' : ''}`}>
                        {playerScore}{playerScore > 21 ? ' 💥' : ''}
                    </span>}
                </h3>
                {currentTurn === 'player' && gameState !== 'ended' && (
                    <div className="turn-indicator">TU TURNO</div>
                )}
                <div className="hand">
                    {playerHand.map((card, i) => (
                        <Card 
                            key={i}
                            cardIndex={i}
                            rank={card.rank}
                            suit={card.suit}
                            hidden={card.hidden}
                            dealing={card.dealing}
                            flipping={card.flipping}
                            winning={card.winning}
                            tie={card.tie}
                        />
                    ))}
                    {playerHand.length === 0 && <div className="card-placeholder"></div>}
                </div>
            </div>

            {/* Controles */}
            <div className="bj-controls">
                {gameState === 'idle' ? (
                    <>
                        <div className="bet-control">
                            <label>APUESTA:</label>
                            <input 
                                type="number" 
                                value={bet} 
                                onChange={(e) => setBet(Math.max(10, Math.min(1000, parseInt(e.target.value) || 10)))} 
                                min="10"
                                max="1000"
                            />
                        </div>
                        <button className="action-btn deal-btn" onClick={startGame}>
                            REPARTIR CARTAS
                        </button>
                    </>
                ) : gameState === 'player-turn' ? (
                    <div className="action-buttons">
                        <button className="action-btn hit-btn" onClick={hit}>
                            PEDIR CARTA (HIT)
                        </button>
                        <button className="action-btn stand-btn" onClick={stand}>
                            PLANTARSE (STAND)
                        </button>
                    </div>
                ) : gameState === 'ended' ? (
                    <div className="action-buttons">
                        <button className="action-btn new-game-btn" onClick={() => setGameState('idle')}>
                            JUGAR DE NUEVO
                        </button>
                    </div>
                ) : (
                    <div className="bj-message">JUGANDO...</div>
                )}
            </div>
        </div>
    );
};

export default Blackjack;