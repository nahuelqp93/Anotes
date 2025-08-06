import { Request, Response } from 'express';
import { ObrasModel } from '../models/ObrasModel';
import supabase from '../supabaseClient';

export const ObrasController = {
  /**
   * Obtener todos las obras
   */
  async getAll(req: Request, res: Response) {
    try {
      const obras = await ObrasModel.getAllObras();
      res.json(obras);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las obras' });
    }
  },
  /**
   * Crear una nueva obra 
   */
  async create(req: Request, res: Response) {
    try {
      const { nombre, costo } = req.body;
      
      if (!nombre || costo === undefined) {
        return res.status(400).json({ error: 'Nombre y costo son requeridos' });
      }

      const nuevaObra = await ObrasModel.createObra({
        nombre,
        costo: Number(costo)
      });
      
      res.status(201).json(nuevaObra);
    } catch (error) {
      console.error('Error al crear obra:', error);
      res.status(500).json({ error: 'Error al crear la obra' });
    }
  },
  /**
   * Ver una obra por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const obra = await ObrasModel.getObraById(id);
      if (!obra) {
        return res.status(404).json({ error: 'Obra no encontrada' });
      }

      res.json(obra);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la obra' });
    }
  },

  /**
   * Actualizar una obra
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { nombre, costo } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      if (!nombre || costo === undefined) {
        return res.status(400).json({ error: 'Nombre y costo son requeridos' });
      }

      const obraActualizada = await ObrasModel.updateObra(id, {
        nombre,
        costo: Number(costo)
      });
      
      res.json(obraActualizada);
    } catch (error) {
      console.error('Error al actualizar obra:', error);
      res.status(500).json({ error: 'Error al actualizar la obra' });
    }
  },

  /**
   * Eliminar una obra
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      await ObrasModel.deleteObra(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar obra:', error);
      res.status(500).json({ error: 'Error al eliminar la obra' });
    }
  }
};