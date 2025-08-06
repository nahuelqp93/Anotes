import { Router } from 'express';
import { AnotesController } from '../controllers/AnotesController';

const router = Router();

router.get('/obras/:obraId/anotes', AnotesController.getByObra);
router.post('/obras/:obraId/anotes', AnotesController.create);
router.put('/obras/:obraId/anotes/:anoteId', AnotesController.update);
router.delete('/obras/:obraId/anotes/:anoteId', AnotesController.delete);

export default router;