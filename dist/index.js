"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const middleware_1 = require("./middleware");
const db_1 = require("./db");
// Rotas
const questions_1 = __importDefault(require("./routes/questions"));
const users_1 = __importDefault(require("./routes/users"));
const quiz_1 = __importDefault(require("./routes/quiz"));
// Carrega variáveis de ambiente
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requisições por janela por IP
});
app.use(limiter);
// Rotas
app.use('/questions', questions_1.default);
app.use('/users', users_1.default);
app.use('/quiz', quiz_1.default);
// Middleware de erro
app.use(middleware_1.errorHandler);
const PORT = Number(process.env.PORT || 3000);
// Inicializa o banco de dados
(0, db_1.init)().catch((err) => {
    console.error('Erro ao inicializar DB:', err);
    process.exit(1);
});
// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
