import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import './Settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('account'); // Cambiado de 'profile' a 'account'
    const [isLoading, setIsLoading] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    
    // Configuración de cuenta
    const [accountSettings, setAccountSettings] = useState({
        twoFactorAuth: false,
        emailNotifications: true,
        smsNotifications: false,
        promotionalEmails: true,
        sessionTimeout: '30'
    });
    
    // Configuración de privacidad
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'private',
        showOnlineStatus: true,
        allowFriendRequests: true,
        dataSharing: false
    });
    
    // Configuración de notificaciones
    const [notificationSettings, setNotificationSettings] = useState({
        depositAlerts: true,
        withdrawalAlerts: true,
        gameAlerts: true,
        bonusAlerts: true,
        winAlerts: true,
        lossAlerts: false
    });
    
    // Seguridad (cambio de contraseña)
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Cargar datos del usuario al montar el componente (solo para otros propósitos)
    useEffect(() => {
        // Se mantiene el efecto si se necesita para otros componentes
    }, []);

    const handleAccountChange = (setting, value) => {
        setAccountSettings(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    const handlePrivacyChange = (setting, value) => {
        setPrivacySettings(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    const handleNotificationChange = (setting) => {
        setNotificationSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const handleSecurityChange = (e) => {
        const { name, value } = e.target;
        setSecurityData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChangePassword = async () => {
        if (securityData.newPassword !== securityData.confirmPassword) {
            setSaveMessage('error:Las contraseñas no coinciden');
            return;
        }

        if (securityData.newPassword.length < 8) {
            setSaveMessage('error:La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setIsLoading(true);
        setSaveMessage('');

        const token = localStorage.getItem('access_token');
        try {
            const response = await axios.post(
                'http://localhost:8000/api/auth/change-password/',
                {
                    current_password: securityData.currentPassword,
                    new_password: securityData.newPassword
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            setSaveMessage('success:Contraseña cambiada exitosamente');
            setSecurityData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setSaveMessage(`error:${error.response?.data?.error || 'Error al cambiar la contraseña'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = () => {
        // En un entorno real, aquí enviarías las configuraciones al backend
        console.log('Guardando configuraciones:', {
            accountSettings,
            privacySettings,
            notificationSettings
        });
        
        setSaveMessage('success:Configuraciones guardadas exitosamente');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const tabs = [
        { id: 'account', label: 'Cuenta', icon: '⚙️' },
        { id: 'privacy', label: 'Privacidad', icon: '🔒' },
        { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
        { id: 'security', label: 'Seguridad', icon: '🛡️' },
        { id: 'preferences', label: 'Preferencias', icon: '🎨' }
    ];

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <header className="settings-header">
                    <h2>Configuración</h2>
                    <p>Personaliza tu experiencia en Casino Royal</p>
                </header>

                {/* Pestañas de navegación */}
                <div className="settings-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Mensaje de guardado */}
                {saveMessage && (
                    <div className={`save-message ${saveMessage.startsWith('success') ? 'success' : 'error'}`}>
                        {saveMessage.split(':')[1]}
                    </div>
                )}

                {/* Contenido de las pestañas */}
                <div className="settings-content">
                    {/* Pestaña Cuenta */}
                    {activeTab === 'account' && (
                        <div className="settings-section">
                            <h3>Configuración de Cuenta</h3>
                            <p className="section-description">
                                Controla cómo funciona tu cuenta.
                            </p>
                            
                            <div className="account-settings">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Autenticación de Dos Factores</h4>
                                        <p>Agrega una capa extra de seguridad a tu cuenta</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={accountSettings.twoFactorAuth}
                                            onChange={(e) => handleAccountChange('twoFactorAuth', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Notificaciones por Email</h4>
                                        <p>Recibe actualizaciones importantes por correo</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={accountSettings.emailNotifications}
                                            onChange={(e) => handleAccountChange('emailNotifications', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Notificaciones por SMS</h4>
                                        <p>Recibe alertas importantes por mensaje de texto</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={accountSettings.smsNotifications}
                                            onChange={(e) => handleAccountChange('smsNotifications', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Correos Promocionales</h4>
                                        <p>Recibe ofertas especiales y bonos</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={accountSettings.promotionalEmails}
                                            onChange={(e) => handleAccountChange('promotionalEmails', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Tiempo de Sesión</h4>
                                        <p>Tiempo de inactividad antes de cerrar sesión automáticamente</p>
                                    </div>
                                    <select
                                        value={accountSettings.sessionTimeout}
                                        onChange={(e) => handleAccountChange('sessionTimeout', e.target.value)}
                                        className="session-select"
                                    >
                                        <option value="15">15 minutos</option>
                                        <option value="30">30 minutos</option>
                                        <option value="60">1 hora</option>
                                        <option value="120">2 horas</option>
                                        <option value="never">Nunca</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button className="save-btn" onClick={handleSaveSettings}>
                                Guardar Configuración
                            </button>
                        </div>
                    )}

                    {/* Pestaña Privacidad */}
                    {activeTab === 'privacy' && (
                        <div className="settings-section">
                            <h3>Privacidad</h3>
                            <p className="section-description">
                                Controla quién puede ver tu información.
                            </p>
                            
                            <div className="privacy-settings">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Visibilidad del Perfil</h4>
                                        <p>Quién puede ver tu perfil y actividad</p>
                                    </div>
                                    <select
                                        value={privacySettings.profileVisibility}
                                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                                        className="privacy-select"
                                    >
                                        <option value="public">Público</option>
                                        <option value="friends">Solo Amigos</option>
                                        <option value="private">Privado</option>
                                    </select>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Mostrar Estado en Línea</h4>
                                        <p>Permitir que otros vean cuando estás en línea</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={privacySettings.showOnlineStatus}
                                            onChange={(e) => handlePrivacyChange('showOnlineStatus', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Solicitudes de Amistad</h4>
                                        <p>Permitir que otros usuarios te envíen solicitudes de amistad</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={privacySettings.allowFriendRequests}
                                            onChange={(e) => handlePrivacyChange('allowFriendRequests', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Compartir Datos Anónimos</h4>
                                        <p>Permitir compartir datos anónimos para mejorar el servicio</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={privacySettings.dataSharing}
                                            onChange={(e) => handlePrivacyChange('dataSharing', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                            
                            <div className="data-export">
                                <h4>Exportar Mis Datos</h4>
                                <p>Descarga una copia de toda tu información personal</p>
                                <button className="export-btn">
                                    📥 Solicitar Exportación de Datos
                                </button>
                            </div>
                            
                            <button className="save-btn" onClick={handleSaveSettings}>
                                Guardar Configuración
                            </button>
                        </div>
                    )}

                    {/* Pestaña Notificaciones */}
                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h3>Notificaciones</h3>
                            <p className="section-description">
                                Controla qué notificaciones recibes.
                            </p>
                            
                            <div className="notification-settings">
                                <div className="notification-category">
                                    <h4>Transacciones</h4>
                                    <div className="notification-item">
                                        <span>Depósitos completados</span>
                                        <label className="toggle-switch small">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.depositAlerts}
                                                onChange={() => handleNotificationChange('depositAlerts')}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                    <div className="notification-item">
                                        <span>Retiros procesados</span>
                                        <label className="toggle-switch small">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.withdrawalAlerts}
                                                onChange={() => handleNotificationChange('withdrawalAlerts')}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="notification-category">
                                    <h4>Juego</h4>
                                    <div className="notification-item">
                                        <span>Alertas de juego</span>
                                        <label className="toggle-switch small">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.gameAlerts}
                                                onChange={() => handleNotificationChange('gameAlerts')}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                    <div className="notification-item">
                                        <span>Grandes ganancias</span>
                                        <label className="toggle-switch small">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.winAlerts}
                                                onChange={() => handleNotificationChange('winAlerts')}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                    <div className="notification-item">
                                        <span>Pérdidas significativas</span>
                                        <label className="toggle-switch small">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.lossAlerts}
                                                onChange={() => handleNotificationChange('lossAlerts')}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="notification-category">
                                    <h4>Promociones</h4>
                                    <div className="notification-item">
                                        <span>Bonos y ofertas</span>
                                        <label className="toggle-switch small">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.bonusAlerts}
                                                onChange={() => handleNotificationChange('bonusAlerts')}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <button className="save-btn" onClick={handleSaveSettings}>
                                Guardar Configuración
                            </button>
                        </div>
                    )}

                    {/* Pestaña Seguridad */}
                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <h3>Seguridad</h3>
                            <p className="section-description">
                                Gestiona la seguridad de tu cuenta.
                            </p>
                            
                            <div className="security-settings">
                                <div className="security-form">
                                    <h4>Cambiar Contraseña</h4>
                                    
                                    <div className="form-group">
                                        <label>Contraseña Actual</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={securityData.currentPassword}
                                            onChange={handleSecurityChange}
                                            placeholder="Ingresa tu contraseña actual"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={securityData.newPassword}
                                            onChange={handleSecurityChange}
                                            placeholder="Mínimo 8 caracteres"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Confirmar Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={securityData.confirmPassword}
                                            onChange={handleSecurityChange}
                                            placeholder="Repite la nueva contraseña"
                                        />
                                    </div>
                                    
                                    <button
                                        className="save-btn"
                                        onClick={handleChangePassword}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                                    </button>
                                </div>
                                
                                <div className="security-info">
                                    <h4>Sesiones Activas</h4>
                                    <div className="sessions-list">
                                        <div className="session-item">
                                            <div className="session-details">
                                                <strong>Chrome • Windows</strong>
                                                <p>Última actividad: Hace 5 minutos</p>
                                                <p>IP: 192.168.1.1</p>
                                            </div>
                                            <button className="logout-session-btn">
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                        <div className="session-item">
                                            <div className="session-details">
                                                <strong>iPhone • iOS</strong>
                                                <p>Última actividad: Hace 2 horas</p>
                                                <p>IP: 192.168.1.2</p>
                                            </div>
                                            <button className="logout-session-btn">
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                    <button className="logout-all-btn">
                                        Cerrar Todas las Sesiones
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pestaña Preferencias */}
                    {activeTab === 'preferences' && (
                        <div className="settings-section">
                            <h3>Preferencias</h3>
                            <p className="section-description">
                                Personaliza tu experiencia de juego.
                            </p>
                            
                            <div className="preferences-settings">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Tema de la Interfaz</h4>
                                        <p>Selecciona el tema visual de la plataforma</p>
                                    </div>
                                    <select className="theme-select">
                                        <option value="dark">Oscuro (Predeterminado)</option>
                                        <option value="light">Claro</option>
                                        <option value="blue">Azul</option>
                                        <option value="green">Verde</option>
                                    </select>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Idioma</h4>
                                        <p>Selecciona el idioma de la plataforma</p>
                                    </div>
                                    <select className="language-select">
                                        <option value="es">Español</option>
                                        <option value="en">English</option>
                                        <option value="pt">Português</option>
                                        <option value="fr">Français</option>
                                    </select>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Sonidos de Juego</h4>
                                        <p>Activa o desactiva los sonidos en los juegos</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Animaciones</h4>
                                        <p>Activa o desactiva las animaciones de la interfaz</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Mostrar Ayudas</h4>
                                        <p>Mostrar sugerencias y tutoriales</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Límites de Apuesta Automáticos</h4>
                                        <p>Configura límites automáticos para tus apuestas diarias/semanales</p>
                                    </div>
                                    <input
                                        type="number"
                                        className="bet-limit-input"
                                        placeholder="Ej: 100"
                                    />
                                    <span className="currency-symbol">USD</span>
                                </div>
                            </div>
                            
                            <button className="save-btn" onClick={handleSaveSettings}>
                                Guardar Preferencias
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Settings;