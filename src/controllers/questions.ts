import { Request, Response } from 'express';
import { pool } from '../db';
import { Question, QuestionWithAnswers, ErrorResponse } from '../types';

export async function createQuestion(req: Request, res: Response) {
  const { text, points, answers } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const qRes = await client.query(
      'INSERT INTO questions(text, points) VALUES($1, $2) RETURNING id, text, points',
      [text, points || 1]
    );
    
    const question = qRes.rows[0];
    for (const a of answers) {
      await client.query(
        'INSERT INTO answers(question_id, text, is_correct) VALUES($1, $2, $3)',
        [question.id, a.text, !!a.is_correct]
      );
    }
    
    await client.query('COMMIT');
    return res.status(201).json({ questionId: question.id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(500).json({ error: 'erro ao criar pergunta' });
  } finally {
    client.release();
  }
}

export async function getQuestions(req: Request, res: Response) {
  try {
    const q = await pool.query('SELECT * FROM questions ORDER BY id');
    const questions: QuestionWithAnswers[] = [];
    
    for (const row of q.rows) {
      const a = await pool.query(
        'SELECT id, text, is_correct FROM answers WHERE question_id = $1 ORDER BY id',
        [row.id]
      );
      questions.push({ ...row, answers: a.rows });
    }
    
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'erro ao buscar perguntas' });
  }
}

export async function getQuestionById(req: Request, res: Response) {
  const { id } = req.params;
  
  try {
    const qRes = await pool.query('SELECT * FROM questions WHERE id = $1', [id]);
    if (qRes.rows.length === 0) {
      return res.status(404).json({ error: 'Pergunta não encontrada' });
    }

    const aRes = await pool.query(
      'SELECT id, text, is_correct FROM answers WHERE question_id = $1 ORDER BY id',
      [id]
    );
    
    res.json({ ...qRes.rows[0], answers: aRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'erro ao buscar pergunta' });
  }
}

export async function getQuestionsForQuiz(req: Request, res: Response) {
  try {
    const q = await pool.query('SELECT * FROM questions ORDER BY id');
    const questions = [];
    
    for (const row of q.rows) {
      const a = await pool.query(
        'SELECT id, text FROM answers WHERE question_id = $1 ORDER BY RANDOM()',
        [row.id]
      );
      questions.push({ ...row, answers: a.rows });
    }
    
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'erro ao buscar perguntas para o quiz' });
  }
}

export async function deleteQuestion(req: Request, res: Response) {
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM questions WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pergunta não encontrada' });
    }
    res.json({ message: 'Pergunta deletada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'erro ao deletar pergunta' });
  }
}

export async function updateQuestion(req: Request, res: Response) {
  const { id } = req.params;
  const { text, points, answers } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Atualiza a pergunta
    const qRes = await client.query(
      'UPDATE questions SET text = $1, points = $2 WHERE id = $3 RETURNING *',
      [text, points, id]
    );

    if (qRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pergunta não encontrada' });
    }

    // Remove respostas antigas
    await client.query('DELETE FROM answers WHERE question_id = $1', [id]);

    // Insere novas respostas
    for (const a of answers) {
      await client.query(
        'INSERT INTO answers(question_id, text, is_correct) VALUES($1, $2, $3)',
        [id, a.text, !!a.is_correct]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Pergunta atualizada com sucesso' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'erro ao atualizar pergunta' });
  } finally {
    client.release();
  }
}