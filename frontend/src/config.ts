// Configuración para diferentes entornos
const config = {
  development: {
    backendUrl: 'http://localhost:3000'
  },
  production: {
    backendUrl: process.env.REACT_APP_BACKEND_URL || 'https://tu-backend-url.onrender.com'
  }
};

const environment = process.env.NODE_ENV || 'development';
export const backendUrl = config[environment as keyof typeof config].backendUrl; 