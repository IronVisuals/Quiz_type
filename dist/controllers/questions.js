"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuestion = createQuestion;
exports.getQuestions = getQuestions;
exports.getQuestionById = getQuestionById;
exports.getQuestionsForQuiz = getQuestionsForQuiz;
exports.deleteQuestion = deleteQuestion;
exports.updateQuestion = updateQuestion;
const db_1 = require("../db");
async function createQuestion(req, res) {
    const { text, points, answers } = req.body;
    const client = await db_1.pool.connect();
    try {
        await client.query('BEGIN');
        const qRes = await client.query('INSERT INTO questions(text, points) VALUES($1, $2) RETURNING id, text, points', [text, points || 1]);
        const question = qRes.rows[0];
        for (const a of answers) {
            await client.query('INSERT INTO answers(question_id, text, is_correct) VALUES($1, $2, $3)', [question.id, a.text, !!a.is_correct]);
        }
        await client.query('COMMIT');
        return res.status(201).json({ questionId: question.id });
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        return res.status(500).json({ error: 'erro ao criar pergunta' });
    }
    finally {
        client.release();
    }
}
async function getQuestions(req, res) {
    try {
        const q = await db_1.pool.query('SELECT * FROM questions ORDER BY id');
        const questions = [];
        for (const row of q.rows) {
            const a = await db_1.pool.query('SELECT id, text, is_correct FROM answers WHERE question_id = $1 ORDER BY id', [row.id]);
            questions.push({ ...row, answers: a.rows });
        }
        res.json(questions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'erro ao buscar perguntas' });
    }
}
async function getQuestionById(req, res) {
    const { id } = req.params;
    try {
        const qRes = await db_1.pool.query('SELECT * FROM questions WHERE id = $1', [id]);
        if (qRes.rows.length === 0) {
            return res.status(404).json({ error: 'Pergunta não encontrada' });
        }
        const aRes = await db_1.pool.query('SELECT id, text, is_correct FROM answers WHERE question_id = $1 ORDER BY id', [id]);
        res.json({ ...qRes.rows[0], answers: aRes.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'erro ao buscar pergunta' });
    }
}
async function getQuestionsForQuiz(req, res) {
    try {
        const q = await db_1.pool.query('SELECT * FROM questions ORDER BY id');
        const questions = [];
        for (const row of q.rows) {
            const a = await db_1.pool.query('SELECT id, text FROM answers WHERE question_id = $1 ORDER BY RANDOM()', [row.id]);
            questions.push({ ...row, answers: a.rows });
        }
        res.json(questions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'erro ao buscar perguntas para o quiz' });
    }
}
async function deleteQuestion(req, res) {
    const { id } = req.params;
    try {
        const result = await db_1.pool.query('DELETE FROM questions WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pergunta não encontrada' });
        }
        res.json({ message: 'Pergunta deletada com sucesso' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'erro ao deletar pergunta' });
    }
}
async function updateQuestion(req, res) {
    const { id } = req.params;
    const { text, points, answers } = req.body;
    const client = await db_1.pool.connect();
    try {
        await client.query('BEGIN');
        // Atualiza a pergunta
        const qRes = await client.query('UPDATE questions SET text = $1, points = $2 WHERE id = $3 RETURNING *', [text, points, id]);
        if (qRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pergunta não encontrada' });
        }
        // Remove respostas antigas
        await client.query('DELETE FROM answers WHERE question_id = $1', [id]);
        // Insere novas respostas
        for (const a of answers) {
            await client.query('INSERT INTO answers(question_id, text, is_correct) VALUES($1, $2, $3)', [id, a.text, !!a.is_correct]);
        }
        await client.query('COMMIT');
        res.json({ message: 'Pergunta atualizada com sucesso' });
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'erro ao atualizar pergunta' });
    }
    finally {
        client.release();
    }
}
