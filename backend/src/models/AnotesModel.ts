import supabase from '../supabaseClient';

export const AnotesModel = {
  async getAnotesByObra(obraId: number) {
    const { data, error } = await supabase
      .from('anotes')
      .select('*')
      .eq('id_Obra', obraId)
      .order('fecha', { ascending: true });
    
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
  },

  async updateAnote(anoteId: number, anoteData: { razon: string; gasto: number }) {
    const { data, error } = await supabase
      .from('anotes')
      .update({
        razon: anoteData.razon,
        gasto: anoteData.gasto
      })
      .eq('id_Anotes', anoteId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteAnote(anoteId: number) {
    const { error } = await supabase
      .from('anotes')
      .delete()
      .eq('id_Anotes', anoteId);
    
    if (error) throw error;
    return true;
  }
};