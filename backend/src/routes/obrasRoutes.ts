import { Router } from 'express';
import { ObrasController } from '../controllers/ObrasController';

const router = Router();

// Rutas para productos
router.get('/obras', ObrasController.getAll);
router.post('/obras', ObrasController.create);
router.get('/obras/:id', ObrasController.getById);

export default router;