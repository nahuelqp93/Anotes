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
  id: number;
  nombre: string;
}

const Anotes: React.FC = () => {
  const { obraId } = useParams<{ obraId: string }>();
  const navigate = useNavigate();
  const [anotes, setAnotes] = useState<Anote[]>([]);
  const [obra, setObra] = useState<Obra | null>(null);
  const [nuevoAnote, setNuevoAnote] = useState({ razon: '', gasto: '' });
  const [anoteEditando, setAnoteEditando] = useState<Anote | null>(null);
  const [gastoEditando, setGastoEditando] = useState<string>('');
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

      const response = await fetch(`${backendUrl}/api/obras/${idNum}/anotes`, {
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
      setAnotes([...anotes, newAnote]);
      setNuevoAnote({ razon: '', gasto: '' });
      setMostrarFormulario(false);
    } catch (err) {
      console.error('Error al agregar anote:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditarAnote = async () => {
    if (!anoteEditando || !anoteEditando.razon.trim() || !gastoEditando) {
      setError('Razón y gasto son requeridos');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const idNum = parseInt(obraId!);
      if (isNaN(idNum)) {
        throw new Error('ID de obra inválido');
      }

      const response = await fetch(`${backendUrl}/api/obras/${idNum}/anotes/${anoteEditando.id_Anotes}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razon: anoteEditando.razon.trim(),
          gasto: Number(gastoEditando)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar anote');
      }

      const anoteActualizado = await response.json();
      setAnotes(anotes.map(anote => 
        anote.id_Anotes === anoteEditando.id_Anotes ? anoteActualizado : anote
      ));
      setAnoteEditando(null);
      setGastoEditando('');
    } catch (err) {
      console.error('Error al actualizar anote:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarAnote = async (anoteId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este anote?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const idNum = parseInt(obraId!);
      if (isNaN(idNum)) {
        throw new Error('ID de obra inválido');
      }

      const response = await fetch(`${backendUrl}/api/obras/${idNum}/anotes/${anoteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar anote');
      }

      setAnotes(anotes.filter(anote => anote.id_Anotes !== anoteId));
    } catch (err) {
      console.error('Error al eliminar anote:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setIsLoading(false);
    }
  };

  const iniciarEdicion = (anote: Anote) => {
    setAnoteEditando(anote);
    setGastoEditando(anote.gasto.toString());
  };

  const cancelarEdicion = () => {
    setAnoteEditando(null);
    setGastoEditando('');
  };

  const formatFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calcular el gasto total de todos los anotes
  const gastoTotal = anotes.reduce((total, anote) => total + anote.gasto, 0);

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
              {anoteEditando?.id_Anotes === anote.id_Anotes ? (
                // Modo edición
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Razón del gasto"
                    className={styles.input}
                    value={anoteEditando.razon}
                    onChange={(e) => setAnoteEditando({...anoteEditando, razon: e.target.value})}
                    disabled={isLoading}
                  />
                  <input
                    type="number"
                    placeholder="Monto gastado"
                    className={styles.input}
                    value={gastoEditando}
                    onChange={(e) => setGastoEditando(e.target.value)}
                    disabled={isLoading}
                    min="0"
                  />
                  <div className="flex space-x-2">
                    <CustomButton 
                      text="Guardar" 
                      onClick={handleEditarAnote}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <CustomButton 
                      text="Cancelar" 
                      onClick={cancelarEdicion}
                      className="bg-gray-500 hover:bg-gray-600 flex-1"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : (
                // Modo visualización
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className={`${styles.obraNombre} break-words leading-tight`}>{anote.razon}</h2>
                    <p className={`${styles.obraCosto} text-red-600`}>
                      -Bs {anote.gasto.toLocaleString('es-ES')}
                    </p>
                    <span className="text-sm text-gray-500">{formatFecha(anote.fecha)}</span>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <CustomButton 
                      text="✏️" 
                      onClick={() => iniciarEdicion(anote)}
                      className="bg-blue-500 hover:bg-blue-600 px-3 py-2 text-sm min-w-[40px] h-10"
                      disabled={isLoading}
                    />
                    <CustomButton 
                      text="🗑️" 
                      onClick={() => handleEliminarAnote(anote.id_Anotes)}
                      className="bg-red-500 hover:bg-red-600 px-3 py-2 text-sm min-w-[40px] h-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className={styles.buttonWrapper}>
        {/* Mostrar el gasto total */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 w-full max-w-md">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">GASTO TOTAL</h3>
            <p className="text-2xl font-bold text-red-600">
              Bs {gastoTotal.toLocaleString('es-ES')}
            </p>
          </div>
        </div>

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