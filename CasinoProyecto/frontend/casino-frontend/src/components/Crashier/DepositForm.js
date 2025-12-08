import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DepositForm = ({ onSuccess }) => {
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
                
                const res = await axios.get('http://localhost:8000/api/players/my/balance/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log("Respuesta de balance:", res.data);
                
                if (res.data.success === true) {
                    const balanceValue = parseFloat(res.data.balance);
                    setBalance(isNaN(balanceValue) ? 0 : balanceValue);
                } else if (res.data.balance !== undefined) {
                    const balanceValue = parseFloat(res.data.balance);
                    setBalance(isNaN(balanceValue) ? 0 : balanceValue);
                } else {
                    console.warn("Formato de respuesta inesperado:", res.data);
                    setBalance(0);
                }
            } catch (error) {
                console.error("Error obteniendo balance:", error.response?.data || error.message);
                setBalance(0);
            } finally {
                setBalanceLoading(false);
            }
        };
        fetchBalance();
    }, [navigate]);

    const handleDeposit = async (e) => {
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
            const depositAmount = parseFloat(amount);
            if (isNaN(depositAmount) || depositAmount <= 0) {
                setMessage('error:El monto debe ser mayor a 0');
                setLoading(false);
                return;
            }

            console.log("📤 ENVIANDO DEPÓSITO:", {
                amount: depositAmount,  // Número, no string
                amount_type: typeof depositAmount,
                currency: 'USD',
                origin: 'Web App',
                channel: 'web'
            });
            
            const response = await axios.post(
                'http://localhost:8000/api/transactions/transactions/create_deposit/', 
                {
                    amount: depositAmount,  // ✅ ENVIAR COMO NÚMERO
                    currency: 'USD',        // ✅ INCLUIR CURRENCY
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
            
            console.log("✅ DEPÓSITO EXITOSO:", response.data);
            
            // Mostrar mensaje de éxito
            let successMsg = '¡Depósito exitoso!';
            if (response.data.new_balance) {
                successMsg += ` Tu nuevo saldo es: $${parseFloat(response.data.new_balance).toFixed(2)}`;
                setBalance(parseFloat(response.data.new_balance));
            } else if (response.data.message) {
                successMsg = response.data.message;
            }
            
            setMessage('success:' + successMsg);
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
            
            if (onSuccess) {
                setTimeout(onSuccess, 2000);
            }
        } catch (error) {
            console.error("❌ ERROR EN DEPÓSITO:", {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
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
                let errorMsg = 'Error al procesar el depósito';
                
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
                        errorMsg = error.response.data.error || error.response.data.detail || JSON.stringify(error.response.data);
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
            <h3>Realizar Depósito</h3>
            <p className="form-desc">
                Aumenta tu saldo para disfrutar de todos nuestros juegos premium. 
                Los depósitos son procesados de forma segura e instantánea.
            </p>

            {!balanceLoading && (
                <div className="balance-display">
                    <h4>Saldo Actual</h4>
                    <p>
                        ${typeof balance === 'number' ? balance.toFixed(2) : '0.00'} USD
                    </p>
                </div>
            )}

            <form onSubmit={handleDeposit} className="cashier-form">
                <div className="form-group">
                    <label>Monto a Depositar (USD)</label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        placeholder="Ej. 100.00"
                        min="0.01"
                        step="0.01"
                        required 
                    />
                    
                    <div style={{marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                        {quickAmounts.map(quickAmount => (
                            <button
                                key={quickAmount}
                                type="button"
                                onClick={() => setAmount(quickAmount.toString())}
                                style={{
                                    padding: '8px 12px',
                                    background: 'rgba(212, 175, 55, 0.1)',
                                    border: '1px solid rgba(212, 175, 55, 0.2)',
                                    borderRadius: '6px',
                                    color: '#d4af37',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.target.style.background = 'rgba(212, 175, 55, 0.2)'}
                                onMouseLeave={e => e.target.style.background = 'rgba(212, 175, 55, 0.1)'}
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
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                >
                    {loading ? 'Procesando...' : 'Confirmar Depósito'}
                </button>
                
                <p style={{
                    marginTop: '20px',
                    fontSize: '0.85rem',
                    color: '#888',
                    textAlign: 'center'
                }}>
                    💳 Pagos seguros • ⚡ Procesamiento instantáneo
                </p>
            </form>
        </div>
    );
};

export default DepositForm;