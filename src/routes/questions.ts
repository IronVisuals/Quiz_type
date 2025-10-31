import { Router } from 'express';
import * as QuestionsController from '../controllers/questions';
import { validateQuestion } from '../middleware';

const router = Router();

router.post('/', validateQuestion, QuestionsController.createQuestion);
router.get('/', QuestionsController.getQuestions);
router.get('/quiz', QuestionsController.getQuestionsForQuiz);
router.get('/:id', QuestionsController.getQuestionById);
router.put('/:id', validateQuestion, QuestionsController.updateQuestion);
router.delete('/:id', QuestionsController.deleteQuestion);

export default router;