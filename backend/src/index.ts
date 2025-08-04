import express from 'express';
import cors from 'cors';

const app= express();
const PORT= 3000;

app.use(cors());
app.use(express.json());

app.get('/',(_req,res)=>{
    res.send('Hola desde el backend con Express+TypeScript usando Cors');
});


app.listen(PORT, ()=>{

    console.log('Servidor iniciado en el puerto 3000');
})