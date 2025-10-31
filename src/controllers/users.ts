import { Request, Response } from 'express';
import { pool } from '../db';
import { User, ErrorResponse } from '../types';

export async function createUser(req: Request, res: Response) {
  const { name } = req.body;
  
  try {
    const r = await pool.query(
      'INSERT INTO users(name, score) VALUES($1, $2) ON CONFLICT (name) DO NOTHING RETURNING id, name, score',
      [name, 0]
    );
    
    if (r.rows.length === 0) {
      const existing = await pool.query(
        'SELECT id, name, score FROM users WHERE name = $1',
        [name]
      );
      return res.status(200).json(existing.rows[0]);
    }
    
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'erro ao criar usuário' });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const r = await pool.query('SELECT id, name, score FROM users ORDER BY id');
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'erro ao buscar usuários' });
  }
}

export async function getRanking(req: Request, res: Response) {
  try {
    const r = await pool.query(
      'SELECT id, name, score FROM users ORDER BY score DESC LIMIT 10'
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'erro ao buscar ranking' });
  }
}

export async function getUserById(req: Request, res: Response) {
  const { id } = req.params;
  
  try {
    const r = await pool.query(
      'SELECT id, name, score FROM users WHERE id = $1',
      [id]
    );
    
    if (r.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'erro ao buscar usuário' });
  }
}