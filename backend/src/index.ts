import express from 'express';
import cors from 'cors';
import supabase from './supabaseClient'; 
import obrasRoutes from './routes/obrasRoutes';
import anotesRoutes from './routes/anotesRoutes';


const app= express();
const PORT= 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.get('/home',(_req,res)=>{
    res.send('Hola desde el backend con Express+TypeScript usando Cors');
});

// Rutas de productos

app.use('/api', obrasRoutes);
app.use('/api', anotesRoutes);

app.listen(PORT, ()=>{

    console.log('Servidor iniciado en el puerto 3000');
})