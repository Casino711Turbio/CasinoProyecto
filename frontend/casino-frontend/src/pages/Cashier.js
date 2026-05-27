import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TransactionSummary from '../components/cashier/TransactionSummary';
import TransactionHistory from '../components/cashier/TransactionHistory';
import DepositForm from '../components/cashier/DepositForm';
import WithdrawalForm from '../components/cashier/WithdrawalForm';
import './Cashier.css';

const Cashier = () => {
    const [activeTab, setActiveTab] = useState('summary');

    const tabs = [
        { id: 'summary', label: ' Resumen', icon: '📊' },
        { id: 'history', label: ' Historial', icon: '📜' },
        { id: 'deposit', label: ' Depositar', icon: '📥' },
        { id: 'withdrawal', label: ' Retirar', icon: '📤' },
    ];

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <header className="cashier-header">
                    <h2>Cajero & Transacciones</h2>
                    <p>Gestiona tus fondos y revisa tu historial financiero en tiempo real</p>
                </header>

                <div className="cashier-container">
                    {/* Navegación de Pestañas */}
                    <div className="cashier-tabs">
                        {tabs.map(tab => (
                            <button 
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="tab-icon">{tab.icon}</span>
                                <span className="tab-label">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Contenido Dinámico */}
                    <div className="tab-panel">
                        {activeTab === 'summary' && <TransactionSummary />}
                        {activeTab === 'history' && <TransactionHistory />}
                        {activeTab === 'deposit' && <DepositForm onSuccess={() => setActiveTab('history')} />}
                        {activeTab === 'withdrawal' && <WithdrawalForm onSuccess={() => setActiveTab('history')} />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Cashier;