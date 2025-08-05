# ANOTES - Control de Anotaciones de Construcción

Aplicación web para gestionar anotaciones y gastos de obras de construcción.

## 🚀 Despliegue en Render.com (100% GRATUITO)

### Pasos para desplegar:

#### 1. Preparar el repositorio
```bash
# Asegúrate de que todos los cambios estén committeados
git add .
git commit -m "Preparar para despliegue"
git push origin main
```

#### 2. Desplegar Backend en Render.com

1. Ve a [render.com](https://render.com) y crea una cuenta gratuita
2. Haz clic en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura el servicio:
   - **Name**: `anotes-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Variables de entorno** (Environment Variables):
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `SUPABASE_URL`: Tu URL de Supabase
   - `SUPABASE_ANON_KEY`: Tu clave anónima de Supabase

6. Haz clic en "Create Web Service"

#### 3. Desplegar Frontend en Render.com

1. En Render.com, haz clic en "New +" → "Static Site"
2. Conecta tu repositorio de GitHub
3. Configura el sitio:
   - **Name**: `anotes-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

4. **Variables de entorno**:
   - `REACT_APP_BACKEND_URL`: URL de tu backend (ej: `https://anotes-backend.onrender.com`)

5. Haz clic en "Create Static Site"

#### 4. Configurar CORS (si es necesario)

Si tienes problemas de CORS, actualiza el backend:

```typescript
// En backend/src/index.ts
app.use(cors({
  origin: ['https://tu-frontend-url.onrender.com', 'http://localhost:5173'],
  credentials: true
}));
```

### 🛠️ Desarrollo Local

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### 📁 Estructura del Proyecto

```
Anotes/
├── backend/          # API REST con Express + TypeScript
├── frontend/         # React + Vite + TypeScript
└── README.md
```

### 🔧 Tecnologías

- **Backend**: Node.js, Express, TypeScript, Supabase
- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)

### 📝 Notas importantes

1. **Variables de entorno**: Nunca subas archivos `.env` al repositorio
2. **CORS**: Configura correctamente los orígenes permitidos
3. **Base de datos**: Asegúrate de que Supabase esté configurado correctamente
4. **URLs**: Actualiza las URLs del backend en el frontend después del despliegue

### 🆘 Solución de problemas

- **Error de build**: Verifica que todas las dependencias estén en `package.json`
- **Error de CORS**: Revisa la configuración de CORS en el backend
- **Error de conexión a BD**: Verifica las variables de entorno de Supabase 