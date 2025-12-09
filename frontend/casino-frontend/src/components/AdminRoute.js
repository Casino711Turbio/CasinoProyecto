    import React from 'react';
    import { Navigate } from 'react-router-dom';

    const AdminRoute = ({ children, requiredRole = null }) => {
    // Verificar si hay token (usuario autenticado)
    const token = localStorage.getItem('access_token');
    
    // Verificar si es staff (administrador)
    const isStaff = localStorage.getItem('is_staff') === 'true';
    const userRole = localStorage.getItem('role');
    
    // Si no hay token, redirigir al login
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    // Si no es staff, redirigir al dashboard de jugador
    if (!isStaff) {
        console.warn('Intento de acceso a ruta administrativa sin permisos');
        return <Navigate to="/dashboard" replace />;
    }
    
    // Si se requiere un rol específico y el usuario no lo tiene
    if (requiredRole && userRole !== requiredRole) {
        console.warn(`Acceso denegado. Se requiere rol: ${requiredRole}, usuario tiene: ${userRole}`);
        return <Navigate to="/staff/dashboard" replace />;
    }
    
    // Usuario autorizado, renderizar el componente hijo
    return children;
    };

    export default AdminRoute;