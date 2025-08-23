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

interface AnotesPorSemana {
  semana: string;
  anotes: Anote[];
  gastoTotal: number;
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
  const [mostrarAnotesPasados, setMostrarAnotesPasados] = useState(false);
  const [anotesPasados, setAnotesPasados] = useState<AnotesPorSemana[]>([]);

  // Función para obtener el inicio de la semana actual (lunes)
  const getInicioSemana = (fecha: Date): Date => {
    const dia = fecha.getDay();
    const diff = fecha.getDate() - dia + (dia === 0 ? -6 : 1); // Ajuste para que lunes sea 1
    return new Date(fecha.setDate(diff));
  };

  // Función para verificar si una fecha está en la semana actual
  const esSemanaActual = (fechaString: string): boolean => {
    const fecha = new Date(fechaString);
    const inicioSemana = getInicioSemana(new Date());
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    
    return fecha >= inicioSemana && fecha <= finSemana;
  };

  // Función para agrupar anotes por semana
  const agruparAnotesPorSemana = (anotes: Anote[]): AnotesPorSemana[] => {
    const anotesPorSemana: { [key: string]: Anote[] } = {};
    
    anotes.forEach(anote => {
      const fecha = new Date(anote.fecha);
      const inicioSemana = getInicioSemana(fecha);
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      
      // Formato mejorado: siempre incluir mes "SEMANA DEL 04/08 AL 10/08"
      const diaInicio = inicioSemana.getDate().toString().padStart(2, '0');
      const diaFin = finSemana.getDate().toString().padStart(2, '0');
      const mesInicio = (inicioSemana.getMonth() + 1).toString().padStart(2, '0');
      const mesFin = (finSemana.getMonth() + 1).toString().padStart(2, '0');
      
      let semanaKey: string;
      if (inicioSemana.getMonth() === finSemana.getMonth()) {
        // Mismo mes: "SEMANA DEL 04/08 AL 10/08"
        semanaKey = `SEMANA DEL ${diaInicio}/${mesInicio} AL ${diaFin}/${mesFin}`;
      } else {
        // Diferente mes: "SEMANA DEL 04/12 AL 10/01"
        semanaKey = `SEMANA DEL ${diaInicio}/${mesInicio} AL ${diaFin}/${mesFin}`;
      }
      
      if (!anotesPorSemana[semanaKey]) {
        anotesPorSemana[semanaKey] = [];
      }
      anotesPorSemana[semanaKey].push(anote);
    });

    return Object.entries(anotesPorSemana)
      .map(([semana, anotes]) => ({
        semana,
        anotes: anotes.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
        gastoTotal: anotes.reduce((total, anote) => total + anote.gasto, 0)
      }))
      .sort((a, b) => {
        const fechaA = new Date(a.anotes[0]?.fecha || 0);
        const fechaB = new Date(b.anotes[0]?.fecha || 0);
        return fechaB.getTime() - fechaA.getTime();
      });
  };

  // Filtrar anotes de la semana actual
  const anotesSemanaActual = anotes.filter(anote => esSemanaActual(anote.fecha));

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
        
        // Preparar anotes pasados agrupados por semana
        const anotesPasadosData = agruparAnotesPorSemana(anotesData);
        setAnotesPasados(anotesPasadosData);
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
      const anotesActualizados = [...anotes, newAnote];
      setAnotes(anotesActualizados);
      
      // Actualizar también anotesPasados
      const anotesPasadosActualizados = agruparAnotesPorSemana(anotesActualizados);
      setAnotesPasados(anotesPasadosActualizados);
      
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
      const anotesActualizados = anotes.map(anote => 
        anote.id_Anotes === anoteEditando.id_Anotes ? anoteActualizado : anote
      );
      setAnotes(anotesActualizados);
      
      // Actualizar también anotesPasados
      const anotesPasadosActualizados = agruparAnotesPorSemana(anotesActualizados);
      setAnotesPasados(anotesPasadosActualizados);
      
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
      
      // Actualizar también anotesPasados
      const anotesPasadosActualizados = agruparAnotesPorSemana(
        anotes.filter(anote => anote.id_Anotes !== anoteId)
      );
      setAnotesPasados(anotesPasadosActualizados);
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

  // Calcular el gasto total de la semana actual
  const gastoTotal = anotesSemanaActual.reduce((total, anote) => total + anote.gasto, 0);

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
      <div className="flex justify-between items-start gap-3 mb-4">
        <h1 className={`${styles.title} flex-1 break-words leading-tight`}>
          ANOTES: {obra?.nombre || 'Sin nombre'}
        </h1>
        <div className="flex flex-col gap-2">
          <CustomButton 
            text="📊" 
            onClick={() => navigate(`/obras/${obraId}/resumen`)}
            className="bg-green-500 hover:bg-green-600 px-3 py-2 text-sm min-w-[40px] h-10 flex-shrink-0 w-auto max-w-none mx-0 block"
            disabled={isLoading}
          />
          <CustomButton 
            text="👁️" 
            onClick={() => setMostrarAnotesPasados(true)}
            className="bg-blue-500 hover:bg-blue-600 px-3 py-2 text-sm min-w-[40px] h-10 flex-shrink-0 w-auto max-w-none mx-0 block"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
          📅 Mostrando anotes de esta semana (lunes a domingo)
        </p>
      </div>
      
      <div className={styles.obrasContainer}>
        {anotesSemanaActual.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay anotes registrados esta semana</p>
        ) : (
          anotesSemanaActual.map((anote) => (
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
             <h3 className="text-lg font-semibold text-gray-800 mb-2">GASTO TOTAL DE ESTA SEMANA</h3>
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

      {/* Modal para mostrar anotes pasados */}
      {mostrarAnotesPasados && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Anotes de Semanas Pasadas - {obra?.nombre}
              </h2>
              <button
                onClick={() => setMostrarAnotesPasados(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              {anotesPasados.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay anotes de semanas pasadas</p>
              ) : (
                <div className="space-y-6">
                  {anotesPasados.map((semana, index) => (
                                         <div key={index} className="border rounded-lg p-4">
                       <div className="flex justify-between items-center mb-3">
                         <h3 className="text-lg font-semibold text-gray-800">
                           {semana.semana}
                         </h3>
                         <span className="text-lg font-bold text-red-600">
                           Total: Bs {semana.gastoTotal.toLocaleString('es-ES')}
                         </span>
                       </div>
                      
                      <div className="space-y-3">
                        {semana.anotes.map((anote) => (
                          <div key={anote.id_Anotes} className="bg-gray-50 p-3 rounded border-l-4 border-gray-300">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800">{anote.razon}</h4>
                                <p className="text-red-600 font-semibold">
                                  -Bs {anote.gasto.toLocaleString('es-ES')}
                                </p>
                                <span className="text-sm text-gray-500">{formatFecha(anote.fecha)}</span>
                              </div>
                              <div className="text-xs text-gray-400 ml-2">
                                Solo lectura
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <CustomButton 
                text="Cerrar" 
                onClick={() => setMostrarAnotesPasados(false)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Anotes;