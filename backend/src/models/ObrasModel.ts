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
  }
};