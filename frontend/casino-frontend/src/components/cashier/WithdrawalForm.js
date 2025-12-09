import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WithdrawalForm = ({ onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [balance, setBalance] = useState(0);
    const [balanceLoading, setBalanceLoading] = useState(true);
    const navigate = useNavigate();

    // Obtener saldo actual
    useEffect(() => {
        const fetchBalance = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                console.log("Obteniendo balance del jugador...");
                
                // ✅ Usar SOLO el endpoint que existe según tu documentación
                const res = await axios.get('http://localhost:8000/api/players/my/balance/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log("Respuesta de balance:", res.data);
                
                // ✅ Manejar diferentes formatos de respuesta
                if (res.data.success === true) {
                    // Formato: {success: true, balance: "100.00", ...}
                    const balanceValue = parseFloat(res.data.balance);
                    setBalance(isNaN(balanceValue) ? 0 : balanceValue);
                } else if (res.data.balance !== undefined) {
                    // Formato: {balance: "100.00", ...}
                    const balanceValue = parseFloat(res.data.balance);
                    setBalance(isNaN(balanceValue) ? 0 : balanceValue);
                } else {
                    // Formato desconocido, usar 0 por defecto
                    console.warn("Formato de respuesta inesperado:", res.data);
                    setBalance(0);
                }
            } catch (error) {
                console.error("Error obteniendo balance:", error.response?.data || error.message);
                
                // ✅ Mostrar el error específico del backend
                if (error.response?.data?.detail) {
                    console.error("Detalle del error:", error.response.data.detail);
                }
                
                setBalance(0);
            } finally {
                setBalanceLoading(false);
            }
        };
        fetchBalance();
    }, [navigate]);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            // Validar monto
            const withdrawalAmount = parseFloat(amount);
            if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
                setMessage('error:El monto debe ser mayor a 0');
                setLoading(false);
                return;
            }

            // Validar saldo suficiente
            if (withdrawalAmount > balance) {
                setMessage('error:Saldo insuficiente para realizar el retiro');
                setLoading(false);
                return;
            }

            // Formatear a 2 decimales como string
            const formattedAmount = withdrawalAmount.toFixed(2);
            
            console.log("Enviando retiro:", {
                amount: formattedAmount,
                token: token.substring(0, 20) + '...'
            });
            
            const response = await axios.post(
                'http://localhost:8000/api/transactions/transactions/create_withdrawal/', 
                {
                    amount: formattedAmount,
                    currency: 'USD',
                    origin: 'Web App',
                    channel: 'web'
                },
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );
            
            console.log("Retiro exitoso:", response.data);
            
            // Mostrar mensaje de éxito
            let successMsg = '¡Solicitud de retiro enviada! Será procesada en 24-48 horas.';
            if (response.data.new_balance) {
                successMsg += ` Tu nuevo saldo es: $${parseFloat(response.data.new_balance).toFixed(2)}`;
                // Actualizar balance localmente
                setBalance(parseFloat(response.data.new_balance));
            } else if (response.data.message) {
                successMsg = response.data.message;
            }
            
            setMessage('success:' + successMsg);
            
            // Limpiar formulario
            setAmount('');
            
            // Actualizar balance después de 1 segundo
            setTimeout(async () => {
                try {
                    const balanceRes = await axios.get('http://localhost:8000/api/players/my/balance/', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (balanceRes.data && balanceRes.data.balance) {
                        setBalance(parseFloat(balanceRes.data.balance));
                    }
                } catch (err) {
                    console.error("Error actualizando balance:", err);
                }
            }, 1000);
            
            // Redirigir si es necesario
            if (onSuccess) {
                setTimeout(onSuccess, 2000);
            }
        } catch (error) {
            console.error("Error completo en retiro:", {
                error: error,
                response: error.response,
                data: error.response?.data
            });
            
            // Manejar error 401 (sesión expirada)
            if (error.response && error.response.status === 401) {
                setMessage('error:Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
                setTimeout(() => {
                    localStorage.removeItem('access_token');
                    navigate('/login');
                }, 2000);
                return;
            }
            
            // Manejar error 400 (validación)
            if (error.response && error.response.status === 400) {
                let errorMsg = 'Error al procesar el retiro';
                
                if (error.response.data) {
                    if (typeof error.response.data === 'string') {
                        errorMsg = error.response.data;
                    } else if (error.response.data.error) {
                        errorMsg = error.response.data.error;
                    } else if (error.response.data.detail) {
                        errorMsg = error.response.data.detail;
                    } else if (Array.isArray(error.response.data)) {
                        errorMsg = error.response.data.map(err => err.message || err).join(', ');
                    } else if (typeof error.response.data === 'object') {
                        // Buscar cualquier mensaje de error en el objeto
                        for (const key in error.response.data) {
                            if (Array.isArray(error.response.data[key])) {
                                errorMsg = error.response.data[key].join(', ');
                                break;
                            } else if (typeof error.response.data[key] === 'string') {
                                errorMsg = error.response.data[key];
                                break;
                            }
                        }
                    }
                }
                
                setMessage('error:' + errorMsg);
            } else {
                setMessage('error:Error de conexión. Verifica tu conexión a internet.');
            }
        } finally {
            setLoading(false);
        }
    };

    const quickAmounts = [10, 25, 50, 100, 250, 500];

    return (
        <div className="cashier-form-container">
            <h3>Solicitar Retiro</h3>
            <p className="form-desc">
                Retira tus ganancias de forma segura. Las solicitudes son procesadas 
                en un plazo de 24-48 horas hábiles.
            </p>

            {/* Mostrar saldo actual - SOLUCIÓN AL ERROR toFixed */}
            {!balanceLoading && (
                <div className="balance-display">
                    <h4>Saldo Disponible para Retiro</h4>
                    <p>
                        {/* Asegurarse de que balance sea un número antes de usar toFixed */}
                        ${typeof balance === 'number' ? balance.toFixed(2) : '0.00'} USD
                    </p>
                    {amount && parseFloat(amount) > balance && (
                        <p style={{
                            color: '#e74c3c',
                            fontSize: '0.9rem',
                            marginTop: '10px'
                        }}>
                            ⚠️ El monto excede tu saldo disponible
                        </p>
                    )}
                </div>
            )}

            <form onSubmit={handleWithdraw} className="cashier-form">
                <div className="form-group">
                    <label>Monto a Retirar (USD)</label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        placeholder="Ej. 50.00"
                        min="0.01"
                        step="0.01"
                        required 
                    />
                    
                    {/* Botones rápidos de cantidad */}
                    <div style={{marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                        {quickAmounts.map(quickAmount => (
                            <button
                                key={quickAmount}
                                type="button"
                                onClick={() => setAmount(quickAmount.toString())}
                                disabled={quickAmount > balance}
                                style={{
                                    padding: '8px 12px',
                                    background: quickAmount > balance 
                                        ? 'rgba(255,255,255,0.05)' 
                                        : 'rgba(212, 175, 55, 0.1)',
                                    border: '1px solid rgba(212, 175, 55, 0.2)',
                                    borderRadius: '6px',
                                    color: quickAmount > balance ? '#666' : '#d4af37',
                                    cursor: quickAmount > balance ? 'not-allowed' : 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s',
                                    opacity: quickAmount > balance ? 0.5 : 1
                                }}
                                onMouseEnter={e => {
                                    if (quickAmount <= balance) {
                                        e.target.style.background = 'rgba(212, 175, 55, 0.2)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (quickAmount <= balance) {
                                        e.target.style.background = 'rgba(212, 175, 55, 0.1)';
                                    }
                                }}
                            >
                                ${quickAmount}
                            </button>
                        ))}
                    </div>
                </div>
                
                {message && (
                    <div className={`alert-message ${message.startsWith('success') ? 'success' : 'error'}`}>
                        {message.split(':')[1]}
                    </div>
                )}
                
                <button 
                    type="submit" 
                    className="btn-gold-solid" 
                    disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                    style={{
                        opacity: (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance) ? 0.5 : 1
                    }}
                >
                    {loading ? 'Procesando...' : 'Solicitar Retiro'}
                </button>
                
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: 'rgba(243, 156, 18, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(243, 156, 18, 0.2)'
                }}>
                    <p style={{
                        margin: '0',
                        fontSize: '0.85rem',
                        color: '#f39c12',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>⏳</span>
                        <span>
                            <strong>Tiempo de procesamiento:</strong> 24-48 horas hábiles.<br/>
                            <small>Verifica que tu información de pago esté actualizada.</small>
                        </span>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default WithdrawalForm;