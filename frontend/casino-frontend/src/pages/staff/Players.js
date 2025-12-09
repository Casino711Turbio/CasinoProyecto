    import React from 'react';
    import { Link } from 'react-router-dom';

    const StaffPlayers = () => {
    return (
        <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)',
        color: 'white',
        padding: '20px'
        }}>
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            paddingTop: '80px'
        }}>
            <h1 style={{ color: '#d4af37', fontSize: '2.5rem' }}>Gestión de Jugadores</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
            Aquí puedes gestionar todos los jugadores del sistema.
            </p>
            
            <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            padding: '20px',
            marginTop: '20px'
            }}>
            <h3>Funcionalidades disponibles:</h3>
            <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                <li>Ver lista de jugadores</li>
                <li>Crear nuevos jugadores</li>
                <li>Editar información de jugadores</li>
                <li>Bloquear/Desbloquear jugadores</li>
                <li>Ver historial de transacciones</li>
                <li>Generar reportes</li>
            </ul>
            </div>
            
            <div style={{ marginTop: '30px' }}>
            <Link 
                to="/staff/dashboard" 
                style={{
                color: '#d4af37',
                textDecoration: 'none',
                border: '1px solid #d4af37',
                padding: '10px 20px',
                borderRadius: '5px',
                display: 'inline-block'
                }}
            >
                ← Volver al Dashboard
            </Link>
            </div>
        </div>
        </div>
    );
    };

    export default StaffPlayers;