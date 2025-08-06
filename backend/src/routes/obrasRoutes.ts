import { Router } from 'express';
import { ObrasController } from '../controllers/ObrasController';

const router = Router();

// Rutas para productos
router.get('/obras', ObrasController.getAll);
router.post('/obras', ObrasController.create);
router.get('/obras/:id', ObrasController.getById);
router.put('/obras/:id', ObrasController.update);
router.delete('/obras/:id', ObrasController.delete);

export default router;