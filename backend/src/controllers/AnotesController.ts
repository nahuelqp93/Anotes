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
  },

  async update(req: Request, res: Response) {
    try {
      const { razon, gasto } = req.body;
      const anoteId = parseInt(req.params.anoteId);
      const obraId = parseInt(req.params.obraId);
      
      if (!razon || gasto === undefined || isNaN(anoteId) || isNaN(obraId)) {
        return res.status(400).json({ error: 'Datos incompletos o inválidos' });
      }

      const anoteActualizado = await AnotesModel.updateAnote(anoteId, {
        razon,
        gasto: Number(gasto)
      });
      
      res.json(anoteActualizado);
    } catch (error) {
      console.error('Error al actualizar anote:', error);
      res.status(500).json({ error: 'Error al actualizar el anote' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const anoteId = parseInt(req.params.anoteId);
      const obraId = parseInt(req.params.obraId);
      
      if (isNaN(anoteId) || isNaN(obraId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      await AnotesModel.deleteAnote(anoteId);
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar anote:', error);
      res.status(500).json({ error: 'Error al eliminar el anote' });
    }
  }
};