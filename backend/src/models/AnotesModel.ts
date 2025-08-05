import supabase from '../supabaseClient';

export const AnotesModel = {
  async getAnotesByObra(obraId: number) {
    const { data, error } = await supabase
      .from('anotes')
      .select('*')
      .eq('id_Obra', obraId)
      .order('fecha', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createAnote(anoteData: { razon: string; gasto: number; id_Obra: number }) {
    const { data, error } = await supabase
      .from('anotes')
      .insert([{
        razon: anoteData.razon,
        gasto: anoteData.gasto,
        id_Obra: anoteData.id_Obra,
        fecha: new Date().toISOString()
      }])
      .select();
    
    if (error) {
      console.error('Error de Supabase:', error);
      throw error;
    }
    return data?.[0];
  }
};