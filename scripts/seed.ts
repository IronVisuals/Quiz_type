import { pool, init } from '../src/db';

const questions = [
  {
    text: 'Qual é a capital do Brasil?',
    points: 1,
    answers: [
      { text: 'São Paulo', is_correct: false },
      { text: 'Rio de Janeiro', is_correct: false },
      { text: 'Brasília', is_correct: true },
      { text: 'Salvador', is_correct: false }
    ]
  },
  {
    text: 'Quem escreveu Dom Casmurro?',
    points: 2,
    answers: [
      { text: 'Machado de Assis', is_correct: true },
      { text: 'José de Alencar', is_correct: false },
      { text: 'Carlos Drummond de Andrade', is_correct: false },
      { text: 'Jorge Amado', is_correct: false }
    ]
  },
  {
    text: 'Qual é o planeta mais próximo do Sol?',
    points: 1,
    answers: [
      { text: 'Terra', is_correct: false },
      { text: 'Vênus', is_correct: false },
      { text: 'Mercúrio', is_correct: true },
      { text: 'Marte', is_correct: false }
    ]
  }
];

async function seed() {
  try {
    // Inicializa o banco
    await init();

    // Limpa as tabelas
    await pool.query('DELETE FROM answers');
    await pool.query('DELETE FROM questions');
    await pool.query('DELETE FROM users');

    // Insere as questões e respostas
    for (const q of questions) {
      const qRes = await pool.query(
        'INSERT INTO questions(text, points) VALUES($1, $2) RETURNING id',
        [q.text, q.points]
      );
      const questionId = qRes.rows[0].id;

      for (const a of q.answers) {
        await pool.query(
          'INSERT INTO answers(question_id, text, is_correct) VALUES($1, $2, $3)',
          [questionId, a.text, a.is_correct]
        );
      }
    }

    console.log('Seed completado com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('Erro durante o seed:', err);
    process.exit(1);
  }
}

seed();