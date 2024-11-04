import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import quiniRoutes from './routes/quiniRoutes.js';
import { connectDB } from './config/mongodb.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas del Quini 6
app.use('/api/quini', quiniRoutes);

// Iniciar el servidor cuando la base de datos esté conectada
async function startServer() {
    try {
        await connectDB();
        const port = process.env.PORT || 4000;
        app.listen(port, () => {
            console.log(`Servidor escuchando en puerto ${port}`);
        });
    } catch (err) {
        console.error('Error conectando a la base de datos:', err);
        process.exit(1);
    }
}

startServer();
