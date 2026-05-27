import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './SlotMachine.css';

const SlotMachine = ({ gameId }) => {
    const [reels, setReels] = useState(['❓', '❓', '❓']);
    const [spinning, setSpinning] = useState(false);
    const [stopping, setStopping] = useState(false);
    const [bet, setBet] = useState(10);
    const [message, setMessage] = useState('¡Prueba tu suerte!');
    const [lastWin, setLastWin] = useState(0);
    const [totalWins, setTotalWins] = useState(0);
    const [totalSpins, setTotalSpins] = useState(0);
    const [messageType, setMessageType] = useState('');
    const [showWinPopup, setShowWinPopup] = useState(false);
    const [particles, setParticles] = useState([]);
    
    const audioContextRef = useRef(null);
    const reelsRef = useRef([null, null, null]);

    // Inicializar AudioContext
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    const getRandomSymbol = () => {
        const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
        return symbols[Math.floor(Math.random() * symbols.length)];
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

    const playSpinSound = () => {
        playSound(100, 'sawtooth', 0.1);
        setTimeout(() => playSound(150, 'sawtooth', 0.1), 100);
        setTimeout(() => playSound(200, 'sawtooth', 0.1), 200);
    };

    const playWinSound = () => {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                playSound(440 + i * 100, 'triangle', 0.2);
            }, i * 100);
        }
    };

    const playJackpotSound = () => {
        const frequencies = [261.63, 329.63, 392.00, 523.25, 659.25];
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                playSound(freq, 'sine', 0.3);
            }, i * 150);
        });
    };

    const createParticles = (count) => {
        const newParticles = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: Date.now() + i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 20 + 10
            });
        }
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 1000);
    };

    const spin = async () => {
        if (spinning) return;
        
        setSpinning(true);
        setStopping(false);
        setMessage('GIRANDO... 🎰');
        setMessageType('');
        setLastWin(0);
        setShowWinPopup(false);
        
        playSpinSound();
        
        // Animación de giro rápido
        let spinCount = 0;
        const maxSpins = 30;
        const spinInterval = setInterval(() => {
            setReels([
                getRandomSymbol(),
                getRandomSymbol(),
                getRandomSymbol()
            ]);
            spinCount++;
            
            if (spinCount >= maxSpins) {
                clearInterval(spinInterval);
                executeServerSpin();
            }
        }, 50);
    };

    const executeServerSpin = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.post(
                `http://localhost:8000/api/games/games/${gameId}/play/`,
                { bet_amount: bet },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { game_data, amount_won, result } = res.data;
            
            // Parada gradual de los rodillos
            setStopping(true);
            
            // Parar primer rodillo
            setTimeout(() => {
                setReels(prev => [game_data.reels[0], prev[1], prev[2]]);
                playSound(300, 'square', 0.1);
            }, 300);
            
            // Parar segundo rodillo
            setTimeout(() => {
                setReels(prev => [prev[0], game_data.reels[1], prev[2]]);
                playSound(350, 'square', 0.1);
            }, 600);
            
            // Parar tercer rodillo y mostrar resultado
            setTimeout(() => {
                setReels(game_data.reels);
                setStopping(false);
                setSpinning(false);
                setTotalSpins(prev => prev + 1);
                
                if (result === 'won') {
                    const winAmount = amount_won || 0;
                    setLastWin(winAmount);
                    setTotalWins(prev => prev + winAmount);
                    setMessage(`¡GANASTE $${winAmount}! 🎉`);
                    setMessageType('win');
                    setShowWinPopup(true);
                    
                    if (winAmount > bet * 10) {
                        playJackpotSound();
                        createParticles(50);
                    } else {
                        playWinSound();
                        createParticles(20);
                    }
                    
                    // Ocultar popup después de 3 segundos
                    setTimeout(() => setShowWinPopup(false), 3000);
                } else {
                    setMessage('Suerte para la próxima 😢');
                    setMessageType('lose');
                    playSound(100, 'sine', 0.5);
                }
            }, 900);
            
        } catch (error) {
            console.error('Spin error:', error);
            setSpinning(false);
            setStopping(false);
            setMessage('Error en el servidor');
            setMessageType('lose');
        }
    };

    const Symbol = ({ symbol, index }) => {
        let symbolClass = '';
        if (symbol === '7️⃣') symbolClass = 'symbol-7';
        if (symbol === '💎') symbolClass = 'symbol-diamond';
        if (symbol === '🔔') symbolClass = 'symbol-bell';
        
        return (
            <div 
                ref={el => reelsRef.current[index] = el}
                className={`reel ${spinning ? 'spinning' : ''} ${stopping ? 'stopping' : ''}`}
            >
                <div className="reel-inner">
                    <span className={symbolClass}>{symbol}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="slot-machine-container">
            {/* Cabecera */}
            <div className="slot-header">
                <h2>TRAGAMONEDAS</h2>
            </div>
            
            {/* Línea de pago */}
            <div className="payline center"></div>
            
            {/* Rodillos */}
            <div className="reels-container">
                {reels.map((symbol, index) => (
                    <Symbol key={index} symbol={symbol} index={index} />
                ))}
            </div>
            
            {/* Controles */}
            <div className="slot-controls">
                <div className="bet-display">
                    <label>APUESTA:</label>
                    <input 
                        type="number" 
                        value={bet} 
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1 && value <= 1000) {
                                setBet(value);
                            }
                        }} 
                        min="1"
                        max="1000"
                        disabled={spinning}
                    />
                </div>
                
                <div className={`message-display ${messageType}`}>
                    {message}
                </div>
                
                <button 
                    className="spin-btn" 
                    onClick={spin} 
                    disabled={spinning}
                >
                    {spinning ? '🎰 GIRANDO... 🎰' : '🎰 GIRAR 🎰'}
                </button>
            </div>
            
            {/* Panel de información */}
            <div className="info-panel">
                <div className="info-item">
                    <span className="info-label">Última Ganancia</span>
                    <span className="info-value">${lastWin}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Ganancias Totales</span>
                    <span className="info-value">${totalWins}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Tiradas</span>
                    <span className="info-value">{totalSpins}</span>
                </div>
            </div>
            
            {/* Popup de victoria */}
            {showWinPopup && lastWin > 0 && (
                <div className="win-popup">
                    ¡GANASTE ${lastWin}! 🎉
                </div>
            )}
            
            {/* Partículas para efectos de victoria */}
            <div className="win-particles">
                {particles.map(particle => (
                    <div 
                        key={particle.id}
                        className="particle"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default SlotMachine;