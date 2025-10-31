import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Erro interno do servidor' });
};

export const validateQuestion = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Nome é obrigatório e deve ser uma string não vazia' });
  }

  next();
};

export const validateQuizSubmission = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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