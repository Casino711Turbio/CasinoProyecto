    import axios from 'axios';

    const API_BASE_URL = 'http://localhost:8000';

    // Configurar interceptor para manejar tokens
    export const setupAxiosInterceptors = () => {
    // Agregar token a todas las solicitudes
    axios.interceptors.request.use(
        config => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
        },
        error => {
        return Promise.reject(error);
        }
    );

    // Interceptor de respuesta para manejar errores 401
    axios.interceptors.response.use(
        response => response,
        async error => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }
            
            const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
                refresh: refreshToken
            });
            
            const newAccessToken = response.data.access;
            localStorage.setItem('access_token', newAccessToken);
            
            // Actualizar el header de autorización
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            
            // Reintentar la solicitud original
            return axios(originalRequest);
            } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            // Limpiar localStorage y redirigir al login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
            window.location.href = '/login';
            return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
        }
    );
    };

    // Verificar si el usuario está autenticado
    export const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    // Verificar si el token ha expirado (simple check)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch (e) {
        return false;
    }
    };

    // Obtener información del usuario desde el token
    export const getUserFromToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
        userId: payload.user_id,
        username: payload.username,
        };
    } catch (e) {
        return null;
    }
    };

    // Cerrar sesión
    export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/login';
    };