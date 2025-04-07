import express from 'express';
import authRoutes from './routes/authRoutes.js'
import cors from 'cors';
import { checkConnection } from './db.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes)

app.listen(8080, async () => {
    console.log("Servidor rodando na porta 8080")
    try {
        await checkConnection();
    } catch (error) {
        console.log("Erro ao iniciar o banco de dados",error);
    }
});