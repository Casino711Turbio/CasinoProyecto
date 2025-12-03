import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import Header from '../components/Header'; 

const Register = () => {
const [formData, setFormData] = useState({
    username: '',
    email: '', // AÑADIDO: Campo de email
    password: '',
    name: '',
    last_name: ''
});

const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);
const navigate = useNavigate();

const REGISTER_URL = 'http://localhost:8000/api/auth/register/'; 

const handleChange = (e) => {
    setFormData({
    ...formData,
    [e.target.name]: e.target.value
    });
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
    const response = await axios.post(REGISTER_URL, formData);
    
    // Mostrar mensaje de éxito con información del usuario
    alert(`¡Registro exitoso!
Nombre: ${response.data.name} ${response.data.last_name}
Usuario: ${response.data.username}
Email: ${response.data.email}
    
Por favor inicia sesión con tus credenciales.`);
    
    navigate('/login'); 

    } catch (err) {
    console.error("Register Error:", err);
    
    // Manejo mejorado de errores del backend
    if (err.response && err.response.data) {
        if (err.response.data.error) {
        setError(err.response.data.error);
        } else if (err.response.data.email) {
        setError(`Error en email: ${err.response.data.email[0]}`);
        } else if (err.response.data.username) {
        setError(`Error en usuario: ${err.response.data.username[0]}`);
        } else if (typeof err.response.data === 'object') {
        // Si hay múltiples errores, mostrarlos todos
        const errors = Object.values(err.response.data).flat().join(', ');
        setError(`Errores: ${errors}`);
        } else {
        setError('Error al registrarse. Verifica tus datos.');
        }
    } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
    } else {
        setError('Error al registrarse. Inténtalo nuevamente.');
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
        <form className="login-form register-form-adjust" onSubmit={handleSubmit}>
            <h2 className="form-title">NUEVO JUGADOR</h2>
            <p className="form-subtitle">Únete a Casino Royal hoy mismo</p>

            {error && <p className="auth-error">{error}</p>}
            
            {/* Nombre y Apellido */}
            <div className="form-row">
            <div className="form-group half-width">
                <label htmlFor="name">Nombre</label>
                <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu Nombre"
                required
                disabled={loading}
                />
            </div>
            <div className="form-group half-width">
                <label htmlFor="last_name">Apellido</label>
                <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Tu Apellido"
                required
                disabled={loading}
                />
            </div>
            </div>

            {/* CAMPO AÑADIDO: Email */}
            <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@email.com"
                required
                disabled={loading}
            />
            </div>

            <div className="form-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Elige un usuario único"
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
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                required
                disabled={loading}
            />
            <small style={{color: '#aaa', fontSize: '0.8rem', marginTop: '5px', display: 'block'}}>
                La contraseña debe tener al menos 8 caracteres
            </small>
            </div>
            
            <button type="submit" className="btn-login-solid" disabled={loading}>
            {loading ? 'REGISTRANDO...' : 'CREAR CUENTA'}
            </button>

            <div className="form-links">
            <Link to="/login">¿Ya tienes cuenta? Inicia Sesión</Link>
            <Link to="/">← Volver al Inicio</Link>
            </div>
        </form>
        </main>
    </div>
    </div>
);
};

export default Register;