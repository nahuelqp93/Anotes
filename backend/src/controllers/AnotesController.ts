import { Request, Response } from 'express';
import { AnotesModel } from '../models/AnotesModel';

export const AnotesController = {
  async getByObra(req: Request, res: Response) {
    try {
      const obraId = parseInt(req.params.obraId);
      if (isNaN(obraId)) {
        return res.status(400).json({ error: 'ID de obra inválido' });
      }

      const anotes = await AnotesModel.getAnotesByObra(obraId);
      res.json(anotes);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener anotes' });
    }
  },

async create(req: Request, res: Response) {
  try {
    const { razon, gasto } = req.body;
    const obraId = parseInt(req.params.obraId);
    
    if (!razon || gasto === undefined || isNaN(obraId)) {
      return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }

    const newAnote = await AnotesModel.createAnote({
      razon,
      gasto: Number(gasto),
      id_Obra: obraId
    });
    
    res.status(201).json(newAnote);
  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({ error: 'Error al crear anote' });
  }
}
};