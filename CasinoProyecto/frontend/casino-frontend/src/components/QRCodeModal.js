import React from 'react';
import './QRCodeModal.css';

const QRCodeModal = ({ show, onClose, qrUrl, playerName }) => {
    if (!show) return null;

    // Si la URL del QR es relativa, le agregamos el host del backend
    const fullQrUrl = qrUrl && qrUrl.startsWith('http') ? qrUrl : `http://localhost:8000${qrUrl}`;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>ID DE JUGADOR</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <div className="modal-body">
                    <p className="scan-instruction">Escanea este código en la terminal</p>
                    
                    <div className="qr-container">
                        {qrUrl ? (
                            <img src={fullQrUrl} alt="Player QR Code" className="qr-image" />
                        ) : (
                            <div className="qr-placeholder" style={{padding: '20px', color: '#333'}}>
                                QR No Disponible
                            </div>
                        )}
                    </div>
                    
                    <p className="player-name">{playerName}</p>
                </div>

                <div className="modal-footer">
                    <button className="btn-close-modal" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal;