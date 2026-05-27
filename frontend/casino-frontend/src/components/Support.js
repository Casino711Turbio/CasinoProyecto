import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './Support.css';

const Support = () => {
    const [activeTab, setActiveTab] = useState('faq');
    const [ticketForm, setTicketForm] = useState({
        subject: '',
        category: 'technical',
        message: '',
        priority: 'medium'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTicketForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage('');

        // Simular envío al backend
        setTimeout(() => {
            console.log('Ticket enviado:', ticketForm);
            setIsSubmitting(false);
            setSubmitMessage('✅ Tu ticket ha sido enviado. Te contactaremos en 24-48 horas.');
            
            // Limpiar formulario
            setTicketForm({
                subject: '',
                category: 'technical',
                message: '',
                priority: 'medium'
            });
        }, 1500);
    };

    const faqItems = [
        {
            question: '¿Cómo puedo realizar un depósito?',
            answer: 'Ve a la sección "Cajero" > "Depositar". Puedes depositar usando tarjeta de crédito/débito o transferencia bancaria. Los depósitos se procesan instantáneamente.'
        },
        {
            question: '¿Cuánto tiempo tarda un retiro?',
            answer: 'Los retiros son procesados en 24-48 horas hábiles. Una vez aprobado, el dinero llegará a tu cuenta en 1-3 días hábiles dependiendo de tu banco.'
        },
        {
            question: '¿Qué juegos están disponibles?',
            answer: 'Ofrecemos tragamonedas, blackjack, ruleta y más. Todos nuestros juegos son certificados y utilizan generadores de números aleatorios verificados.'
        },
        {
            question: '¿Cómo recupero mi contraseña?',
            answer: 'En la página de login haz clic en "¿Olvidaste tu contraseña?". Te enviaremos un enlace de recuperación a tu email registrado.'
        },
        {
            question: '¿Hay límites de apuesta?',
            answer: 'Sí, cada juego tiene límites mínimos y máximos de apuesta. Puedes ver los límites específicos en la página de cada juego.'
        }
    ];

    const contactMethods = [
        {
            icon: '📧',
            title: 'Correo Electrónico',
            details: 'soporte@casinoroyal.com',
            responseTime: 'Respuesta en 24 horas'
        },
        {
            icon: '📞',
            title: 'Teléfono de Soporte',
            details: '+1 (800) 123-4567',
            responseTime: 'Lunes a Viernes 9AM-6PM EST'
        },
        {
            icon: '💬',
            title: 'Chat en Vivo',
            details: 'Disponible en horario laboral',
            responseTime: 'Respuesta inmediata'
        }
    ];

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <header className="support-header">
                    <h2>Centro de Soporte</h2>
                    <p>¿Necesitas ayuda? Estamos aquí para asistirte</p>
                </header>

                {/* Pestañas de navegación */}
                <div className="support-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
                        onClick={() => setActiveTab('faq')}
                    >
                        <span className="tab-icon">❓</span>
                        <span>Preguntas Frecuentes</span>
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'ticket' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ticket')}
                    >
                        <span className="tab-icon">🎫</span>
                        <span>Crear Ticket</span>
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contact')}
                    >
                        <span className="tab-icon">📞</span>
                        <span>Métodos de Contacto</span>
                    </button>
                </div>

                {/* Contenido de las pestañas */}
                <div className="tab-content">
                    {/* Pestaña FAQ */}
                    {activeTab === 'faq' && (
                        <div className="faq-section">
                            <h3>Preguntas Frecuentes</h3>
                            <div className="faq-list">
                                {faqItems.map((item, index) => (
                                    <div key={index} className="faq-item">
                                        <div className="faq-question">
                                            <strong>Q: {item.question}</strong>
                                        </div>
                                        <div className="faq-answer">
                                            <strong>A:</strong> {item.answer}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pestaña Crear Ticket */}
                    {activeTab === 'ticket' && (
                        <div className="ticket-section">
                            <h3>Crear Ticket de Soporte</h3>
                            <p className="section-description">
                                Describe detalladamente tu problema. Nuestro equipo de soporte te responderá lo antes posible.
                            </p>
                            
                            <form onSubmit={handleSubmitTicket} className="ticket-form">
                                <div className="form-group">
                                    <label>Asunto *</label>
                                    <input 
                                        type="text" 
                                        name="subject"
                                        value={ticketForm.subject}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Problema con depósito"
                                        required
                                    />
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Categoría *</label>
                                        <select 
                                            name="category"
                                            value={ticketForm.category}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="technical">Problema Técnico</option>
                                            <option value="deposit">Depósito</option>
                                            <option value="withdrawal">Retiro</option>
                                            <option value="account">Cuenta</option>
                                            <option value="game">Juego</option>
                                            <option value="other">Otro</option>
                                        </select>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Prioridad *</label>
                                        <select 
                                            name="priority"
                                            value={ticketForm.priority}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="low">Baja</option>
                                            <option value="medium">Media</option>
                                            <option value="high">Alta</option>
                                            <option value="urgent">Urgente</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label>Descripción Detallada *</label>
                                    <textarea 
                                        name="message"
                                        value={ticketForm.message}
                                        onChange={handleInputChange}
                                        placeholder="Describe tu problema con el mayor detalle posible..."
                                        rows="6"
                                        required
                                    />
                                </div>
                                
                                {submitMessage && (
                                    <div className={`submit-message ${submitMessage.includes('✅') ? 'success' : 'error'}`}>
                                        {submitMessage}
                                    </div>
                                )}
                                
                                <button 
                                    type="submit" 
                                    className="submit-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Enviando...' : 'Enviar Ticket'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Pestaña Métodos de Contacto */}
                    {activeTab === 'contact' && (
                        <div className="contact-section">
                            <h3>Métodos de Contacto</h3>
                            <p className="section-description">
                                Puedes contactarnos a través de los siguientes métodos:
                            </p>
                            
                            <div className="contact-methods">
                                {contactMethods.map((method, index) => (
                                    <div key={index} className="contact-card">
                                        <div className="contact-icon">{method.icon}</div>
                                        <div className="contact-details">
                                            <h4>{method.title}</h4>
                                            <p className="contact-info">{method.details}</p>
                                            <p className="response-time">{method.responseTime}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="support-info">
                                <h4>Información Adicional</h4>
                                <ul>
                                    <li>Horario de atención: Lunes a Domingo, 24/7 para depósitos y retiros</li>
                                    <li>Para consultas sobre verificaciones de cuenta, adjunta tus documentos</li>
                                    <li>Para reportar problemas técnicos, incluye capturas de pantalla si es posible</li>
                                    <li>Número de licencia: GLH-OCCHKTW-241028456</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Support;