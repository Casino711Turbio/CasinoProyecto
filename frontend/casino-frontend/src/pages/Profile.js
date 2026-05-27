import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import QRCodeModal from '../components/QRCodeModal';
import './Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState({
        user: { username: '', email: '' },
        name: '',
        last_name: '',
        qr_code: '',
        balance: 0,
        games_played: 0,
        games_won: 0
    });
    
    const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        fetchProfile();
        // fetchPlayerStats(); // Comentado temporalmente hasta que tengas este endpoint
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await axios.get('http://localhost:8000/api/players/players/my_profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const data = res.data;
            // Asegurarnos de que los valores numéricos sean números
            setProfile({
                ...data,
                user: data.user || { username: '', email: '' },
                balance: parseFloat(data.balance) || 0,
                games_played: parseInt(data.games_played) || 0,
                games_won: parseInt(data.games_won) || 0
            });

        } catch (error) {
            console.error("Error cargando perfil:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
            setMessage({ type: 'error', text: 'Error al cargar los datos.' });
        } finally {
            setLoading(false);
        }
    };

    // Función para formatear números de manera segura
    const formatNumber = (value, decimals = 2) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '0.00';
        return num.toFixed(decimals);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'username' || name === 'email') {
            setProfile(prev => ({
                ...prev,
                user: { ...prev.user, [name]: value }
            }));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        if (passwordData.password && passwordData.password !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
            setSaving(false);
            return;
        }

        const token = localStorage.getItem('access_token');
        const playerId = profile.id;

        const payload = {
            name: profile.name,
            last_name: profile.last_name,
            user: {
                username: profile.user.username,
                email: profile.user.email
            }
        };

        if (passwordData.password) {
            payload.user.password = passwordData.password;
        }

        try {
            await axios.patch(`http://localhost:8000/api/players/players/${playerId}/`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: '¡Perfil actualizado correctamente!' });
            setPasswordData({ password: '', confirmPassword: '' });
            fetchProfile(); // Refrescar datos
        } catch (error) {
            console.error("Error actualizando perfil:", error);
            const errorMsg = error.response?.data?.message || 'Error al guardar los cambios.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    };

    if (loading) return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <div className="loading-screen">
                    <div className="spinner"></div>
                    <p>Cargando perfil...</p>
                </div>
            </main>
        </div>
    );

    // Calcular porcentaje de victoria de manera segura
    const winRate = profile.games_played > 0 
        ? Math.round((profile.games_won / profile.games_played) * 100) 
        : 0;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h2>Mi Perfil</h2>
                    <div className="header-actions">
                        <button className="btn-logout" onClick={handleLogout}>
                            <span>🚪</span> Cerrar Sesión
                        </button>
                    </div>
                </header>

                <div className="profile-container">
                    {/* Encabezado del perfil */}
                    <div className="profile-hero">
                        <div className="profile-info">
                            <div className="profile-avatar">
                                {profile.name?.charAt(0) || profile.user.username?.charAt(0) || '👤'}
                            </div>
                            <div className="profile-details">
                                <h1 className="profile-name">{profile.name} {profile.last_name}</h1>
                                <p className="profile-username">@{profile.user.username}</p>
                                <p className="profile-email">{profile.user.email}</p>
                                
                                <div className="profile-stats">
                                    <div className="stat-item">
                                        <span className="stat-value">${formatNumber(profile.balance)}</span>
                                        <span className="stat-label">Saldo</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">{profile.games_played || 0}</span>
                                        <span className="stat-label">Juegos</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">{profile.games_won || 0}</span>
                                        <span className="stat-label">Victorias</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="profile-actions">
                            <button 
                                className="btn-profile-action qr" 
                                onClick={() => setShowQR(true)}
                            >
                                <span>📱</span> Ver Código QR
                            </button>
                            <button 
                                className="btn-profile-action"
                                onClick={() => window.location.href = '/games'}
                            >
                                <span>🎮</span> Jugar Ahora
                            </button>
                            <button 
                                className="btn-profile-action"
                                onClick={() => window.location.href = '/history'}
                            >
                                <span>📊</span> Historial
                            </button>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`alert-message ${message.type}`}>
                            {message.type === 'success' ? '✅' : '❌'} {message.text}
                        </div>
                    )}

                    <div className="profile-sections">
                        {/* Sección principal: Información del perfil */}
                        <div className="info-card">
                            <h3>📝 Información del Perfil</h3>
                            
                            <form onSubmit={handleSubmit} className="profile-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nombre</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={profile.name}
                                            onChange={handleChange}
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Apellido</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={profile.last_name}
                                            onChange={handleChange}
                                            placeholder="Tu apellido"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Usuario</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={profile.user.username}
                                            onChange={handleChange}
                                            placeholder="Nombre de usuario"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Correo Electrónico</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profile.user.email}
                                            onChange={handleChange}
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="password-section">
                                    <h4>🔒 Cambiar Contraseña</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Nueva Contraseña</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={passwordData.password}
                                                onChange={handlePasswordChange}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirmar Contraseña</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <small className="password-hint">
                                        Deja estos campos vacíos si no quieres cambiar la contraseña.
                                    </small>
                                </div>

                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? '💾 Guardando...' : '💾 Guardar Cambios'}
                                </button>
                            </form>
                        </div>

                        {/* Sección lateral: Estadísticas y acciones rápidas */}
                        <div className="info-card">
                            <h3>📊 Tus Estadísticas</h3>
                            
                            <div className="stats-grid">
                                <div className="stat-card gold">
                                    <div className="number">${formatNumber(profile.balance)}</div>
                                    <div className="label">Saldo Total</div>
                                </div>
                                <div className="stat-card">
                                    <div className="number">{profile.games_played || 0}</div>
                                    <div className="label">Juegos Jugados</div>
                                </div>
                                <div className="stat-card">
                                    <div className="number">{profile.games_won || 0}</div>
                                    <div className="label">Victorias</div>
                                </div>
                                <div className="stat-card">
                                    <div className="number">{winRate}%</div>
                                    <div className="label">Tasa de Victoria</div>
                                </div>
                            </div>

                            <h3 style={{ marginTop: '30px' }}>⚡ Acciones Rápidas</h3>
                            <div className="quick-actions">
                                <div className="action-item" onClick={() => window.location.href = '/deposit'}>
                                    <div className="action-icon">💳</div>
                                    <div className="action-text">
                                        <div className="title">Depositar Fondos</div>
                                        <div className="desc">Agregar saldo a tu cuenta</div>
                                    </div>
                                </div>
                                <div className="action-item" onClick={() => window.location.href = '/history'}>
                                    <div className="action-icon">📊</div>
                                    <div className="action-text">
                                        <div className="title">Ver Historial</div>
                                        <div className="desc">Revisa tus juegos anteriores</div>
                                    </div>
                                </div>
                                <div className="action-item" onClick={() => window.location.href = '/support'}>
                                    <div className="action-icon">🛟</div>
                                    <div className="action-text">
                                        <div className="title">Soporte</div>
                                        <div className="desc">Ayuda y preguntas frecuentes</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <QRCodeModal 
                    show={showQR} 
                    onClose={() => setShowQR(false)} 
                    qrUrl={profile.qr_code} 
                    playerName={`${profile.name} ${profile.last_name}`}
                    playerId={profile.id}
                />
            </main>
        </div>
    );
};

export default Profile;