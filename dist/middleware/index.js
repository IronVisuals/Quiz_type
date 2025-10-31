"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuizSubmission = exports.validateUser = exports.validateQuestion = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Erro interno do servidor' });
};
exports.errorHandler = errorHandler;
const validateQuestion = (req, res, next) => {
    const { text, answers } = req.body;
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Texto da pergunta é obrigatório e deve ser uma string' });
    }
    if (!Array.isArray(answers) || answers.length < 2) {
        return res.status(400).json({ error: 'É necessário fornecer pelo menos 2 respostas' });
    }
    const hasCorrectAnswer = answers.some(a => a.is_correct);
    if (!hasCorrectAnswer) {
        return res.status(400).json({ error: 'É necessário ter pelo menos uma resposta correta' });
    }
    next();
};
exports.validateQuestion = validateQuestion;
const validateUser = (req, res, next) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Nome é obrigatório e deve ser uma string não vazia' });
    }
    next();
};
exports.validateUser = validateUser;
const validateQuizSubmission = (req, res, next) => {
    const { name, answers } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Nome é obrigatório e deve ser uma string não vazia' });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ error: 'É necessário fornecer pelo menos uma resposta' });
    }
    for (const answer of answers) {
        if (!answer.questionId || !answer.answerId ||
            typeof answer.questionId !== 'number' ||
            typeof answer.answerId !== 'number') {
            return res.status(400).json({ error: 'Formato inválido das respostas' });
        }
    }
    next();
};
exports.validateQuizSubmission = validateQuizSubmission;
