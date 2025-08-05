import express from 'express';
import cors from 'cors';
import supabase from './supabaseClient'; 
import obrasRoutes from './routes/obrasRoutes';
import anotesRoutes from './routes/anotesRoutes';

const app= express();
const PORT= process.env.PORT || 3000;

app.use(cors({
  origin: ['https://anotes-frontend.onrender.com', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rutas
app.get('/home',(_req,res)=>{
    console.log('Petición recibida en /home');
    res.send('Hola desde el backend con Express+TypeScript usando Cors');
});

// Ruta de prueba para verificar que el servidor funciona
app.get('/test',(_req,res)=>{
    console.log('Petición de prueba recibida');
    res.json({ message: 'Backend funcionando correctamente', timestamp: new Date().toISOString() });
});

// Rutas de productos

app.use('/api', obrasRoutes);
app.use('/api', anotesRoutes);

app.listen(PORT, ()=>{
    console.log(`Servidor iniciado en el puerto ${PORT}`);
})