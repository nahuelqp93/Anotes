import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton';
import { styles } from "../styles/HomeStyles";

const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/home')
      .then(res => res.text())
      .then(data => {
        console.log('Mensaje del backend:', data);
      })
      .catch(err => {
        console.error('Error al conectarse con el backend:', err);
      });
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ANOTES</h1>
      <p className={styles.subtitle}>
        REALIZA EL CONTROL DE TUS ANOTES DE CONSTRUCCIÓN
      </p>
      <CustomButton 
        text="INGRESAR" 
        onClick={() => navigate('/panel')} 
      />
    </div>
  );
};

export default Home;