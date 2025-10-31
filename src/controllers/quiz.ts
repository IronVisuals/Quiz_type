import { Request, Response } from 'express';
import { pool } from '../db';
import { QuizSubmission, QuizResult } from '../types';

export async function submitQuiz(req: Request, res: Response) {
  const { name, answers } = req.body as QuizSubmission;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Garante que o usuário exista
    let userRes = await client.query(
      'SELECT id, score FROM users WHERE name = $1',
      [name]
    );
    
    let userId: number;
    if (userRes.rows.length === 0) {
      const ins = await client.query(
        'INSERT INTO users(name, score) VALUES($1, $2) RETURNING id, score',
        [name, 0]
      );
      userId = ins.rows[0].id;
    } else {
      userId = userRes.rows[0].id;
    }

    // Valida e calcula pontos
    let totalGain = 0;
    for (const a of answers) {
      // Verifica se a questão existe
      const questionExists = await client.query(
        'SELECT id FROM questions WHERE id = $1',
        [a.questionId]
      );
      if (questionExists.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Questão ${a.questionId} não existe` });
      }

      // Verifica se a resposta existe e está correta
      const correctRes = await client.query(
        `SELECT q.points 
         FROM answers an 
         JOIN questions q ON q.id = an.question_id 
         WHERE an.id = $1 AND an.question_id = $2 AND an.is_correct = true`,
        [a.answerId, a.questionId]
      );
      
      if (correctRes.rows.length > 0) {
        totalGain += Number(correctRes.rows[0].points || 0);
      }
    }

    // Atualiza pontuação
    await client.query(
      'UPDATE users SET score = score + $1 WHERE id = $2',
      [totalGain, userId]
    );
    
    await client.query('COMMIT');

    const updated = await pool.query(
      'SELECT id, name, score FROM users WHERE id = $1',
      [userId]
    );
    
    res.json({ gained: totalGain, user: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'erro ao submeter quiz' });
  } finally {
    client.release();
  }
}