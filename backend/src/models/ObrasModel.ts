import supabase from '../supabaseClient';

export const ObrasModel = {
  async getAllObras() {
    const { data, error } = await supabase
      .from('obras')
      .select('id_Obra, nombre, costo') // Especifica las columnas
      .order('id_Obra', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createObra(obraData: { nombre: string; costo: number }) {
    const { data, error } = await supabase
      .from('obras')
      .insert([obraData])
      .select('id_Obra, nombre, costo');
    
    if (error) throw error;
    return data?.[0];
  },

  async getObraById(id: number) {
    const { data, error } = await supabase
      .from('obras')
      .select('id_Obra, nombre, costo')
      .eq('id_Obra', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateObra(id: number, obraData: { nombre: string; costo: number }) {
    const { data, error } = await supabase
      .from('obras')
      .update(obraData)
      .eq('id_Obra', id)
      .select('id_Obra, nombre, costo')
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteObra(id: number) {
    // Primero eliminar todos los anotes relacionados
    const { error: anotesError } = await supabase
      .from('anotes')
      .delete()
      .eq('id_Obra', id);
    
    if (anotesError) throw anotesError;
    
    // Luego eliminar la obra
    const { error } = await supabase
      .from('obras')
      .delete()
      .eq('id_Obra', id);
    
    if (error) throw error;
    return true;
  }
};