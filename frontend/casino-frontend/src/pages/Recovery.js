import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import Header from '../components/Header'; 

const Recovery = () => {
const [email, setEmail] = useState('');
const [error, setError] = useState(null);
const [success, setSuccess] = useState(false);
const [loading, setLoading] = useState(false);
const navigate = useNavigate();

// Endpoint de recuperación de contraseña
const RECOVERY_URL = 'http://localhost:8000/api/auth/password-reset/'; 

const handleChange = (e) => {
    setEmail(e.target.value);
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
    const response = await axios.post(RECOVERY_URL, { email });
    
    // Mostrar mensaje de éxito
    setSuccess(true);
    console.log("Recovery Response:", response.data);
    
    } catch (err) {
    console.error("Recovery Error:", err);
    if (err.response && err.response.data) {
        if (err.response.data.error) {
        setError(err.response.data.error);
        } else {
        setError('Error al procesar la solicitud. Inténtalo nuevamente.');
        }
    } else {
        setError('Error al conectar con el servidor. Verifica la conexión.');
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
        <form className="login-form recovery-form-adjust" onSubmit={handleSubmit}>
            <h2 className="form-title">RECUPERAR CONTRASEÑA</h2>
            <p className="form-subtitle">Ingresa tu correo electrónico para recibir un enlace de recuperación</p>

            {error && <p className="auth-error">{error}</p>}
            
            {success ? (
            <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>Solicitud Enviada</h3>
                <p>
                Si el correo <strong>{email}</strong> está registrado en nuestro sistema, 
                recibirás un enlace para restablecer tu contraseña.
                </p>
                <p className="success-note">
                Por favor, revisa tu bandeja de entrada y la carpeta de spam.
                </p>
                <Link to="/login" className="btn-back-login">Volver al Login</Link>
            </div>
            ) : (
            <>
                <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Ingresa el correo de tu cuenta"
                    required
                    disabled={loading}
                />
                <small style={{color: '#aaa', fontSize: '0.8rem', marginTop: '5px', display: 'block'}}>
                    Te enviaremos un enlace para restablecer tu contraseña
                </small>
                </div>
                
                <button type="submit" className="btn-login-solid" disabled={loading}>
                {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE DE RECUPERACIÓN'}
                </button>
            </>
            )}

            <div className="form-links">
            <Link to="/login">← Volver al Login</Link>
            <Link to="/register">¿No tienes cuenta? Regístrate</Link>
            </div>
        </form>
        </main>
    </div>
    </div>
);
};

export default Recovery;