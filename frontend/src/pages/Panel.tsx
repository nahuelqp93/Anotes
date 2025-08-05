import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton';
import { styles } from "../styles/PanelStyles";
import { backendUrl } from '../config';

interface Obra {
  id_Obra: number;
  nombre: string;
  costo: number;
}

const Panel: React.FC = () => {
  const navigate = useNavigate();
  const [obras, setObras] = useState<Obra[]>([]);
  const [nuevaObra, setNuevaObra] = useState({ nombre: '', costo: '' });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Obtener obras al cargar el componente
  useEffect(() => {
    fetchObras();
  }, []);

  const fetchObras = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/obras`);
      const data = await response.json();
      setObras(data);
    } catch (error) {
      console.error('Error al obtener obras:', error);
    }
  };

  const handleAgregarObra = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/obras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nuevaObra.nombre,
          costo: Number(nuevaObra.costo)
        }),
      });

      if (response.ok) {
        await fetchObras();
        setNuevaObra({ nombre: '', costo: '' });
        setMostrarFormulario(false);
      }
    } catch (error) {
      console.error('Error al agregar obra:', error);
    }
  };

  const handleVerAnotes = (obraId: number) => {
    navigate(`/obras/${obraId}/anotes`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>OBRAS ACTUALES</h1>
      
      {/* Lista de obras con scroll */}
      <div className={styles.obrasContainer}>
        {obras.map((obra) => (
          <button
            key={obra.id_Obra} // Cambiado de obra.id a obra.id_Obra
            onClick={() => navigate(`/obras/${obra.id_Obra}/anotes`)} // Cambiado aquí
            className={`${styles.obraCard} text-left hover:bg-gray-50 active:bg-gray-100 transition-colors`}
          >
            <h2 className={styles.obraNombre}>{obra.nombre}</h2>
            <p className={styles.obraCosto}>${obra.costo.toLocaleString()}</p>
          </button>
        ))}
      </div>

      {/* Botón para agregar nueva obra */}
      <div className={styles.buttonWrapper}>
        {mostrarFormulario ? (
          <div className={styles.formContainer}>
            <input
              type="text"
              placeholder="Nombre de la obra"
              className={styles.input}
              value={nuevaObra.nombre}
              onChange={(e) => setNuevaObra({...nuevaObra, nombre: e.target.value})}
            />
            <input
              type="number"
              placeholder="Costo"
              className={styles.input}
              value={nuevaObra.costo}
              onChange={(e) => setNuevaObra({...nuevaObra, costo: e.target.value})}
            />
            <div className={styles.buttonsContainer}>
              <CustomButton 
                text="Cancelar" 
                onClick={() => setMostrarFormulario(false)} 
                className="bg-gray-500 hover:bg-gray-600"
              />
              <CustomButton 
                text="Guardar" 
                onClick={handleAgregarObra} 
              />
            </div>
          </div>
        ) : (
          <CustomButton 
            text="AGREGAR NUEVA OBRA" 
            onClick={() => setMostrarFormulario(true)} 
          />
        )}
      </div>
    </div>
  );
};

export default Panel;