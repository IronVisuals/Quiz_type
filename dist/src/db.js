"use strict";
// db.ts
// Responsável pela conexão com o PostgreSQL e pela criação inicial das tabelas
// usadas pelo sistema de quiz. Mantemos a criação de tabelas aqui para que a
// aplicação possa ser iniciada sem passos manuais adicionais.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.init = init;
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
dotenv_1.default.config();
// Pool de conexões para o PostgreSQL. As configurações são lidas do .env.
const pool = new pg_1.Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'type',
    password: process.env.PGPASSWORD || '102030',
    database: process.env.PGDATABASE || 'quiz_db'
});
exports.pool = pool;
/**
 * init - cria as tabelas básicas caso não existam.
 * Tabelas criadas:
 * - users (id, name, score)
 * - questions (id, text, points)
 * - answers (id, question_id, text, is_correct)
 *
 * Uso: chamamos `init()` na inicialização do servidor para garantir que o
 * esquema mínimo exista.
 */
async function init() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Usuários: armazena o nome e o score acumulado
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        score INTEGER NOT NULL DEFAULT 0
      );
    `);
        // Perguntas: texto da pergunta e quantos pontos vale
        await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        points INTEGER NOT NULL DEFAULT 1
      );
    `);
        // Respostas: ligadas a uma pergunta e flag indicando se é correta
        await client.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        is_correct BOOLEAN NOT NULL DEFAULT false
      );
    `);
        await client.query('COMMIT');
    }
    catch (err) {
        // Em caso de erro, desfazemos a transação para não deixar o banco em
        // estado inconsistente.
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
