import { Router } from 'express';
import { AnotesController } from '../controllers/AnotesController';

const router = Router();

router.get('/obras/:obraId/anotes', AnotesController.getByObra);
router.post('/obras/:obraId/anotes', AnotesController.create);

export default router;