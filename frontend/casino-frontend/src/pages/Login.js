import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import Header from '../components/Header'; 

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    // ✅ CORREGIDO: Usar las rutas bajo /api/auth/
    const TOKEN_URL = 'http://localhost:8000/api/auth/token/';
    const USER_INFO_URL = 'http://localhost:8000/api/auth/user-info/';
    
    const roleFromHome = location.state?.role;

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Obtener token personalizado (con is_staff, is_superuser)
            const tokenResponse = await axios.post(TOKEN_URL, {
                username: credentials.username,
                password: credentials.password
            });
            
            const { access, refresh } = tokenResponse.data;

            // Guardar tokens
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            
            // Configurar axios con el token
            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

            // 2. Obtener información detallada del usuario
            const userInfoResponse = await axios.get(USER_INFO_URL);
            const userInfo = userInfoResponse.data;
            
            console.log("👤 Información del usuario recibida:", userInfo);

            // Guardar información del usuario
            localStorage.setItem('username', userInfo.username);
            localStorage.setItem('email', userInfo.email || '');
            localStorage.setItem('full_name', userInfo.full_name || userInfo.username);
            localStorage.setItem('has_player_profile', userInfo.has_player_profile);
            localStorage.setItem('is_staff', userInfo.is_staff);
            localStorage.setItem('is_superuser', userInfo.is_superuser);
            
            if (userInfo.player_id) {
                localStorage.setItem('player_id', userInfo.player_id);
            }
            
            // 3. DECIDIR REDIRECCIÓN BASADA EN EL ROL
            if (userInfo.is_staff || userInfo.is_superuser) {
                console.log("👑 Usuario identificado como staff/admin");
                localStorage.setItem('role', 'admin');
                navigate('/staff/players');  // Panel administrativo
            } else {
                console.log("🎮 Usuario identificado como jugador");
                localStorage.setItem('role', 'player');
                navigate('/dashboard');  // Panel de jugador
            }

        } catch (err) {
            console.error("❌ Login Error:", err.response || err);
            
            if (err.response) {
                switch (err.response.status) {
                    case 401:
                    case 400:
                        setError('Credenciales inválidas. Verifica tu nombre de usuario/email y contraseña.');
                        break;
                    case 404:
                        setError(`Error 404: Ruta no encontrada. Verifica que el servidor esté corriendo.`);
                        console.error("URLs intentadas:");
                        console.error(" - Token:", TOKEN_URL);
                        console.error(" - User Info:", USER_INFO_URL);
                        break;
                    case 500:
                        setError('Error interno del servidor. Inténtalo más tarde.');
                        break;
                    default:
                        setError('Error al conectar con el servidor. Inténtalo más tarde.');
                }
            } else {
                setError('Error de red. Verifica tu conexión a internet.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container-page">
            <div className="background-blur"></div>
            
            <div className="content-wrapper">
                <Header />
                
                <main className="login-main-content">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2 className="form-title">ACCESO AL SISTEMA</h2>
                    
                    {roleFromHome && (
                        <p className="role-notice">
                            Acceso como <strong>{roleFromHome}</strong> - Ingresa tus credenciales administrativas
                        </p>
                    )}
                    
                    <p className="form-subtitle">Ingresa tus credenciales para continuar</p>

                    {error && <p className="auth-error">{error}</p>}
                    
                    <div className="form-group">
                    <label htmlFor="username">Usuario o Correo Electrónico</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        placeholder="Ingresa tu usuario o email"
                        required
                        disabled={loading}
                    />
                    </div>

                    <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="Ingresa tu contraseña"
                        required
                        disabled={loading}
                    />
                    </div>
                    
                    <button type="submit" className="btn-login-solid" disabled={loading}>
                    {loading ? 'ACCEDIENDO...' : 'ACCEDER AL SISTEMA'}
                    </button>

                    <div className="form-links">
                    <Link to="/register">¿Eres nuevo? Crea una cuenta</Link>
                    <Link to="/recovery">¿Olvidaste tu contraseña?</Link>
                    </div>
                </form>
                </main>
            </div>
        </div>
    );
};

export default Login;