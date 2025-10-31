"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
// Mock das funções do pool
jest.mock('../db', () => ({
    pool: {
        query: jest.fn(),
        connect: jest.fn()
    },
    init: jest.fn()
}));
// Setup do app
const app = (0, express_1.default)();
app.use(express_1.default.json());
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
            db_1.pool.connect.mockImplementation(() => ({
                query: jest.fn(),
                release: jest.fn()
            }));
            const response = await (0, supertest_1.default)(app)
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
            db_1.pool.query
                .mockResolvedValueOnce({ rows: mockQuestions })
                .mockResolvedValueOnce({ rows: mockQuestions[0].answers });
            const response = await (0, supertest_1.default)(app).get('/questions');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockQuestions);
        });
    });
});
