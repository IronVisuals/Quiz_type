import { Router } from 'express';
import * as QuizController from '../controllers/quiz';
import { validateQuizSubmission } from '../middleware';

const router = Router();

router.post('/submit', validateQuizSubmission, QuizController.submitQuiz);

export default router;