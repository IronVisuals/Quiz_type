import request from 'supertest';
import express from 'express';
import { pool } from '../db';

// Mock das funções do pool
jest.mock('../db', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn()
  },
  init: jest.fn()
}));

// Setup do app
const app = express();
app.use(express.json());

describe('API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /questions', () => {
    it('should create a new question', async () => {
      const mockQuestion = {
        text: 'Test question?',
        points: 1,
        answers: [
          { text: 'Answer 1', is_correct: true },
          { text: 'Answer 2', is_correct: false }
        ]
      };

      (pool.connect as jest.Mock).mockImplementation(() => ({
        query: jest.fn(),
        release: jest.fn()
      }));

      const response = await request(app)
        .post('/questions')
        .send(mockQuestion);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('questionId');
    });
  });

  describe('GET /questions', () => {
    it('should return all questions', async () => {
      const mockQuestions = [
        {
          id: 1,
          text: 'Test question?',
          points: 1,
          answers: [
            { id: 1, text: 'Answer 1', is_correct: true },
            { id: 2, text: 'Answer 2', is_correct: false }
          ]
        }
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: mockQuestions })
        .mockResolvedValueOnce({ rows: mockQuestions[0].answers });

      const response = await request(app).get('/questions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockQuestions);
    });
  });
});