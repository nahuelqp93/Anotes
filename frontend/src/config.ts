// Configuración para diferentes entornos
const config = {
  development: {
    backendUrl: 'http://localhost:3000'
  },
  production: {
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'https://tu-backend-url.onrender.com'
  }
};

const environment = import.meta.env.MODE || 'development';
export const backendUrl = config[environment as keyof typeof config].backendUrl;

// Debug: mostrar la URL que se está usando
console.log('Environment:', environment);
console.log('Backend URL:', backendUrl);
console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL); 