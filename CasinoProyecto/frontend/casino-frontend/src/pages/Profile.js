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
        qr_code: ''
    });
    
    const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showQR, setShowQR] = useState(false); 

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem('access_token');
        try {
            console.log("Solicitando perfil...");
            const res = await axios.get('http://localhost:8000/api/players/players/my_profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const data = res.data;
            setProfile({
                ...data,
                user: data.user || { username: '', email: '' }
            });

        } catch (error) {
            console.error("Error cargando perfil:", error);
            if (error.response && error.response.status === 401) {
                // Manejo de sesión expirada
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
            setMessage({ type: 'error', text: 'Error al cargar los datos. Revisa la consola.' });
        } finally {
            setLoading(false);
        }
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
        } catch (error) {
            console.error("Error actualizando perfil:", error);
            setMessage({ type: 'error', text: 'Error al guardar los cambios.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-screen">Cargando Perfil...</div>;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h2>Mi Perfil</h2>
                </header>

                <div className="profile-container">
                    <div className="profile-card">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                👤
                            </div>
                            <h3>{profile.name} {profile.last_name}</h3>
                            <p className="role-badge">JUGADOR</p>

                            {/* --- BOTÓN CORREGIDO: SIN ESTILOS EN LÍNEA --- */}
                            <button 
                                type="button" 
                                className="btn-show-qr-striking" 
                                onClick={() => setShowQR(true)}
                            >
                                <span style={{fontSize: '1.4rem'}}>📱</span> VER CÓDIGO QR
                            </button>
                            {/* --------------------------------------------- */}
                        </div>

                        {message.text && (
                            <div className={`alert-message ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-section">
                                <h4>Información Personal</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nombre</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={profile.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Apellido</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={profile.last_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Cuenta de Usuario</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Usuario</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={profile.user.username}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Correo Electrónico</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profile.user.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section password-section">
                                <h4>Cambiar Contraseña <small>(Opcional)</small></h4>
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
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <QRCodeModal 
                    show={showQR} 
                    onClose={() => setShowQR(false)} 
                    qrUrl={profile.qr_code} 
                    playerName={`${profile.name} ${profile.last_name}`}
                />
            </main>
        </div>
    );
};

export default Profile;