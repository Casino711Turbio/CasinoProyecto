import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');

    if (!token) {
        // Si no está logueado, redirigir al login
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;