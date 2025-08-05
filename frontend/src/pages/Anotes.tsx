import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton';
import { styles } from "../styles/PanelStyles";

interface Anote {
  id_Anotes: number;
  razon: string;
  gasto: number;
  fecha: string;
  id_Obra: number;
}

interface Obra {
  id: number;
  nombre: string;
}

const Anotes: React.FC = () => {
  const { obraId } = useParams<{ obraId: string }>();
  const navigate = useNavigate();
  const [anotes, setAnotes] = useState<Anote[]>([]);
  const [obra, setObra] = useState<Obra | null>(null);
  const [nuevoAnote, setNuevoAnote] = useState({ razon: '', gasto: '' });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!obraId) {
      setError('ID de obra no proporcionado');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Verificar primero que obraId es un número válido
        const idNum = parseInt(obraId);
        if (isNaN(idNum)) {
          throw new Error('ID de obra inválido');
        }

        // Obtener información de la obra y anotes en paralelo
        const [obraResponse, anotesResponse] = await Promise.all([
          fetch(`http://localhost:3000/api/obras/${idNum}`),
          fetch(`http://localhost:3000/api/obras/${idNum}/anotes`)
        ]);

        if (!obraResponse.ok) throw new Error('Obra no encontrada');
        if (!anotesResponse.ok) throw new Error('Error al cargar anotes');

        const obraData = await obraResponse.json();
        const anotesData = await anotesResponse.json();

        setObra(obraData);
        setAnotes(anotesData);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [obraId]);

  const handleAgregarAnote = async () => {
    if (!obraId) {
      setError('ID de obra no disponible');
      return;
    }

    if (!nuevoAnote.razon.trim() || !nuevoAnote.gasto) {
      setError('Razón y gasto son requeridos');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const idNum = parseInt(obraId);
      if (isNaN(idNum)) {
        throw new Error('ID de obra inválido');
      }

      const response = await fetch(`http://localhost:3000/api/obras/${idNum}/anotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razon: nuevoAnote.razon.trim(),
          gasto: Number(nuevoAnote.gasto)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear anote');
      }

      const newAnote = await response.json();
      setAnotes([newAnote, ...anotes]);
      setNuevoAnote({ razon: '', gasto: '' });
      setMostrarFormulario(false);
    } catch (err) {
      console.error('Error al agregar anote:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading && !obra) {
    return (
      <div className={styles.container}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Error</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <CustomButton 
          text="VOLVER A OBRAS" 
          onClick={() => navigate('/panel')}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ANOTES: {obra?.nombre || 'Sin nombre'}</h1>
      
      <div className={styles.obrasContainer}>
        {anotes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay anotes registrados</p>
        ) : (
          anotes.map((anote) => (
            <div key={anote.id_Anotes} className={styles.obraCard}>
              <div className="flex justify-between items-start">
                <h2 className={`${styles.obraNombre} truncate`}>{anote.razon}</h2>
                <span className="text-sm text-gray-500">{formatFecha(anote.fecha)}</span>
              </div>
              <p className={`${styles.obraCosto} text-red-600`}>
                -${anote.gasto.toLocaleString('es-ES')}
              </p>
            </div>
          ))
        )}
      </div>

      <div className={styles.buttonWrapper}>
        {mostrarFormulario ? (
          <div className={styles.formContainer}>
            <input
              type="text"
              placeholder="Razón del gasto"
              className={styles.input}
              value={nuevoAnote.razon}
              onChange={(e) => {
                setNuevoAnote({...nuevoAnote, razon: e.target.value});
                setError(null);
              }}
              disabled={isLoading}
            />
            <input
              type="number"
              placeholder="Monto gastado"
              className={styles.input}
              value={nuevoAnote.gasto}
              onChange={(e) => {
                setNuevoAnote({...nuevoAnote, gasto: e.target.value});
                setError(null);
              }}
              disabled={isLoading}
              min="0"
            />
            
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            
            <div className={styles.buttonsContainer}>
              <CustomButton 
                text="Cancelar" 
                onClick={() => setMostrarFormulario(false)} 
                className="bg-gray-500 hover:bg-gray-600"
                disabled={isLoading}
              />
              <CustomButton 
                text={isLoading ? 'Guardando...' : 'Guardar Anote'} 
                onClick={handleAgregarAnote} 
                disabled={isLoading}
              />
            </div>
          </div>
        ) : (
          <>
            <CustomButton 
              text="AGREGAR NUEVO ANOTE" 
              onClick={() => setMostrarFormulario(true)} 
              disabled={isLoading}
            />
            <CustomButton 
              text="VOLVER A OBRAS" 
              onClick={() => navigate('/panel')}
              className="mt-2 bg-gray-500 hover:bg-gray-600"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Anotes;