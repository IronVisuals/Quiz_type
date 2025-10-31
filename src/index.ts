import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { errorHandler } from './middleware';
import { pool, init } from './db';

// Rotas
import questionsRoutes from './routes/questions';
import usersRoutes from './routes/users';
import quizRoutes from './routes/quiz';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por janela por IP
});

app.use(limiter);

// Rotas
app.use('/questions', questionsRoutes);
app.use('/users', usersRoutes);
app.use('/quiz', quizRoutes);

// Middleware de erro
app.use(errorHandler);

const PORT = Number(process.env.PORT || 3000);

// Inicializa o banco de dados
init().catch((err) => {
  console.error('Erro ao inicializar DB:', err);
  process.exit(1);
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
