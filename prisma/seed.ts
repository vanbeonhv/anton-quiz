import { PrismaClient, QuizType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Create Normal Quiz
  const reactQuiz = await prisma.quiz.create({
    data: {
      title: 'React Basics',
      description: 'Test your knowledge of React fundamentals',
      type: 'NORMAL',
      questions: {
        create: [
          {
            text: 'What is React?',
            optionA: 'A JavaScript library for building user interfaces',
            optionB: 'A database management system',
            optionC: 'A CSS framework',
            optionD: 'A server-side language',
            correctAnswer: 'A',
            explanation: 'React is a JavaScript library developed by Facebook for building user interfaces, particularly single-page applications.',
            order: 1
          },
          {
            text: 'Which hook is used for state management in functional components?',
            optionA: 'useEffect',
            optionB: 'useState',
            optionC: 'useContext',
            optionD: 'useReducer',
            correctAnswer: 'B',
            explanation: 'useState is the most common hook for managing state in functional components.',
            order: 2
          },
          {
            text: 'What does JSX stand for?',
            optionA: 'JavaScript XML',
            optionB: 'Java Syntax Extension',
            optionC: 'JavaScript Extension',
            optionD: 'Java Server Extension',
            correctAnswer: 'A',
            explanation: 'JSX stands for JavaScript XML. It allows us to write HTML in React.',
            order: 3
          },
          {
            text: 'Which method is used to update state in class components?',
            optionA: 'this.updateState()',
            optionB: 'this.setState()',
            optionC: 'this.changeState()',
            optionD: 'this.modifyState()',
            correctAnswer: 'B',
            explanation: 'In class components, setState() is used to update the component state.',
            order: 4
          },
          {
            text: 'What is the Virtual DOM?',
            optionA: 'A copy of the real DOM kept in memory',
            optionB: 'A new HTML specification',
            optionC: 'A CSS framework',
            optionD: 'A JavaScript engine',
            correctAnswer: 'A',
            explanation: 'The Virtual DOM is a lightweight copy of the actual DOM kept in memory, which React uses to optimize rendering.',
            order: 5
          }
        ]
      }
    }
  })
  
  // Create Daily Quiz
  const dailyQuiz = await prisma.quiz.create({
    data: {
      title: 'Daily Challenge',
      description: 'Complete your daily quiz challenge!',
      type: 'DAILY',
      questions: {
        create: [
          {
            text: 'What is TypeScript?',
            optionA: 'A superset of JavaScript with static typing',
            optionB: 'A replacement for JavaScript',
            optionC: 'A CSS preprocessor',
            optionD: 'A database query language',
            correctAnswer: 'A',
            explanation: 'TypeScript is a superset of JavaScript that adds optional static typing.',
            order: 1
          },
          {
            text: 'Which keyword is used to define a variable that cannot be reassigned?',
            optionA: 'var',
            optionB: 'let',
            optionC: 'const',
            optionD: 'static',
            correctAnswer: 'C',
            explanation: 'The const keyword creates a read-only reference to a value.',
            order: 2
          },
          {
            text: 'What does API stand for?',
            optionA: 'Application Programming Interface',
            optionB: 'Advanced Programming Integration',
            optionC: 'Automated Program Interaction',
            optionD: 'Application Process Integration',
            correctAnswer: 'A',
            explanation: 'API stands for Application Programming Interface.',
            order: 3
          }
        ]
      }
    }
  })
  
  console.log('✅ Seeding completed!')
  console.log(`Created quizzes:`)
  console.log(`- ${reactQuiz.title} (${reactQuiz.type})`)
  console.log(`- ${dailyQuiz.title} (${dailyQuiz.type})`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })