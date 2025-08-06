import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton';
import { styles } from "../styles/PanelStyles";
import { backendUrl } from '../config';

interface Anote {
  id_Anotes: number;
  razon: string;
  gasto: number;
  fecha: string;
  id_Obra: number;
}

interface Obra {
  id_Obra: number;
  nombre: string;
  costo: number;
}

const Resumen: React.FC = () => {
  const { obraId } = useParams<{ obraId: string }>();
  const navigate = useNavigate();
  const [anotes, setAnotes] = useState<Anote[]>([]);
  const [obra, setObra] = useState<Obra | null>(null);
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
        
        const idNum = parseInt(obraId);
        if (isNaN(idNum)) {
          throw new Error('ID de obra inválido');
        }

        const [obraResponse, anotesResponse] = await Promise.all([
          fetch(`${backendUrl}/api/obras/${idNum}`),
          fetch(`${backendUrl}/api/obras/${idNum}/anotes`)
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

  // Calcular totales
  const totalObra = obra?.costo || 0;
  const totalGastado = anotes.reduce((total, anote) => total + anote.gasto, 0);
  const totalRestante = totalObra - totalGastado;

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
    <div className="min-h-screen flex flex-col">
      <div className={styles.container}>
        <h1 className={styles.title}>RESUMEN</h1>
        
        {/* Nombre de la obra */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 w-full max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 break-words leading-tight">
              {obra?.nombre || 'Sin nombre'}
            </h2>
          </div>
        </div>

        {/* Totales */}
        <div className="space-y-4 w-full max-w-md">
          {/* Total de la obra */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">PRESUPUESTO TOTAL</h3>
              <p className="text-2xl font-bold text-blue-600">
                Bs {totalObra.toLocaleString('es-ES')}
              </p>
            </div>
          </div>

          {/* Total gastado */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">TOTAL GASTADO</h3>
              <p className="text-2xl font-bold text-red-600">
                Bs {totalGastado.toLocaleString('es-ES')}
              </p>
            </div>
          </div>

          {/* Total restante */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">TOTAL RESTANTE</h3>
              <p className={`text-2xl font-bold ${totalRestante >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Bs {totalRestante.toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className={styles.buttonWrapper}>
        <CustomButton 
          text="VER ANOTES" 
          onClick={() => navigate(`/obras/${obraId}/anotes`)}
          disabled={isLoading}
        />
        <CustomButton 
          text="VOLVER A OBRAS" 
          onClick={() => navigate('/panel')}
          className="mt-2 bg-gray-500 hover:bg-gray-600"
        />
      </div>
    </div>
  );
};

export default Resumen; 