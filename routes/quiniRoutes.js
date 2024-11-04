import express from 'express';
import { playQuini, getResults } from '../controllers/quiniController.js';

const router = express.Router();

// Ruta para que el jugador juegue sus números
router.post('/play', playQuini);

// Ruta para obtener los resultados del sorteo
router.get('/results', getResults);

export default router;
