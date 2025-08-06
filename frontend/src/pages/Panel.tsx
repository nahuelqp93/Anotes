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
  const [obraEditando, setObraEditando] = useState<Obra | null>(null);
  const [costoEditando, setCostoEditando] = useState<string>('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!nuevaObra.nombre.trim() || !nuevaObra.costo) {
      alert('Nombre y costo son requeridos');
      return;
    }

    try {
      setIsLoading(true);
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
      } else {
        alert('Error al crear la obra');
      }
    } catch (error) {
      console.error('Error al agregar obra:', error);
      alert('Error al crear la obra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditarObra = async () => {
    if (!obraEditando || !obraEditando.nombre.trim() || !costoEditando) {
      alert('Nombre y costo son requeridos');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${backendUrl}/api/obras/${obraEditando.id_Obra}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: obraEditando.nombre,
          costo: Number(costoEditando)
        }),
      });

      if (response.ok) {
        await fetchObras();
        setObraEditando(null);
      } else {
        alert('Error al actualizar la obra');
      }
    } catch (error) {
      console.error('Error al actualizar obra:', error);
      alert('Error al actualizar la obra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarObra = async (obraId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta obra? Esta acción también eliminará todos los anotes asociados.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${backendUrl}/api/obras/${obraId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchObras();
        alert('Obra eliminada exitosamente');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error al eliminar la obra: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al eliminar obra:', error);
      alert('Error de conexión al eliminar la obra');
    } finally {
      setIsLoading(false);
    }
  };

  const iniciarEdicion = (obra: Obra) => {
    setObraEditando(obra);
    setCostoEditando(obra.costo.toString());
  };

  const cancelarEdicion = () => {
    setObraEditando(null);
    setCostoEditando('');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>OBRAS ACTUALES</h1>
      
      {/* Lista de obras con scroll */}
      <div className={styles.obrasContainer}>
        {obras.map((obra) => (
          <div key={obra.id_Obra} className={styles.obraCard}>
            {obraEditando?.id_Obra === obra.id_Obra ? (
              // Modo edición
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nombre de la obra"
                  className={styles.input}
                  value={obraEditando.nombre}
                  onChange={(e) => setObraEditando({...obraEditando, nombre: e.target.value})}
                  disabled={isLoading}
                />
                                 <input
                   type="number"
                   placeholder="Costo"
                   className={styles.input}
                   value={costoEditando}
                   onChange={(e) => setCostoEditando(e.target.value)}
                   disabled={isLoading}
                 />
                <div className="flex space-x-2">
                  <CustomButton 
                    text="Guardar" 
                    onClick={handleEditarObra}
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
                <button
                  onClick={() => navigate(`/obras/${obra.id_Obra}/anotes`)}
                  className="flex-1 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors p-2 rounded min-w-0"
                >
                  <h2 className={`${styles.obraNombre} break-words leading-tight`}>{obra.nombre}</h2>
                  <p className={styles.obraCosto}>Bs {obra.costo.toLocaleString('es-ES')}</p>
                </button>
                <div className="flex space-x-2 flex-shrink-0">
                  <CustomButton 
                    text="✏️" 
                    onClick={() => iniciarEdicion(obra)}
                    className="bg-blue-500 hover:bg-blue-600 px-3 py-2 text-sm min-w-[40px] h-10"
                    disabled={isLoading}
                  />
                  <CustomButton 
                    text="🗑️" 
                    onClick={() => handleEliminarObra(obra.id_Obra)}
                    className="bg-red-500 hover:bg-red-600 px-3 py-2 text-sm min-w-[40px] h-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>
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
              disabled={isLoading}
            />
            <input
              type="number"
              placeholder="Costo"
              className={styles.input}
              value={nuevaObra.costo}
              onChange={(e) => setNuevaObra({...nuevaObra, costo: e.target.value})}
              disabled={isLoading}
            />
            <div className={styles.buttonsContainer}>
              <CustomButton 
                text="Cancelar" 
                onClick={() => setMostrarFormulario(false)} 
                className="bg-gray-500 hover:bg-gray-600"
                disabled={isLoading}
              />
              <CustomButton 
                text={isLoading ? 'Guardando...' : 'Guardar'} 
                onClick={handleAgregarObra}
                disabled={isLoading}
              />
            </div>
          </div>
        ) : (
          <CustomButton 
            text="AGREGAR NUEVA OBRA" 
            onClick={() => setMostrarFormulario(true)}
            disabled={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default Panel;