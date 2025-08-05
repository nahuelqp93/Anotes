// Configuración para diferentes entornos
const config = {
  development: {
    backendUrl: 'http://localhost:3000'
  },
  production: {
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'https://anotes-backend.onrender.com'
  }
};

const environment = import.meta.env.MODE || 'development';
let backendUrl = config[environment as keyof typeof config].backendUrl;

// Asegurar que la URL no termine con slash
if (backendUrl.endsWith('/')) {
  backendUrl = backendUrl.slice(0, -1);
}

export { backendUrl };

// Debug: mostrar la URL que se está usando
console.log('Environment:', environment);
console.log('Backend URL:', backendUrl);
console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL); 