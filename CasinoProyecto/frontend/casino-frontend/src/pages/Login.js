    import React, { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import axios from 'axios';
    import './Login.css';
    import Header from '../components/Header'; 

    const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '', // Aquí puede ser email o username
        password: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const TOKEN_URL = 'http://localhost:8000/api/token/'; 

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
        const response = await axios.post(TOKEN_URL, {
            username: credentials.username, // El backend acepta email o username
            password: credentials.password
        });
        
        const { access, refresh } = response.data;

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        
        // Configurar header de autorización por defecto
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        navigate('/dashboard'); 

        } catch (err) {
        console.error("Login Error:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 400)) {
            setError('Credenciales inválidas. Verifica tu nombre de usuario/email y contraseña.');
        } else {
            setError('Error al conectar con el servidor. Inténtalo más tarde.');
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