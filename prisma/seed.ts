import { PrismaClient } from '@prisma/client'
import dayjs from '../lib/dayjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data to prevent duplicates
  console.log('Cleaning up existing question data...')
  await prisma.questionTag.deleteMany({})
  await prisma.questionAttempt.deleteMany({})
  await prisma.question.deleteMany({})

  // Create sample tags (using upsert to handle existing tags)
  console.log('Creating tags...')
  const reactTag = await prisma.tag.upsert({
    where: { name: 'React' },
    update: {},
    create: {
      name: 'React',
      description: 'React library fundamentals and concepts'
    }
  })

  const jsTag = await prisma.tag.upsert({
    where: { name: 'JavaScript' },
    update: {},
    create: {
      name: 'JavaScript',
      description: 'Core JavaScript concepts and features'
    }
  })

  const tsTag = await prisma.tag.upsert({
    where: { name: 'TypeScript' },
    update: {},
    create: {
      name: 'TypeScript',
      description: 'TypeScript language features and typing'
    }
  })

  const hooksTag = await prisma.tag.upsert({
    where: { name: 'React Hooks' },
    update: {},
    create: {
      name: 'React Hooks',
      description: 'React Hooks patterns and usage'
    }
  })

  const domTag = await prisma.tag.upsert({
    where: { name: 'DOM' },
    update: {},
    create: {
      name: 'DOM',
      description: 'Document Object Model concepts'
    }
  })

  // Create sample questions with difficulty levels and tags
  console.log('Creating questions...')
  
  const questions = await Promise.all([
    prisma.question.create({
      data: {
        text: 'What is React?',
        optionA: 'A JavaScript library for building user interfaces',
        optionB: 'A database management system',
        optionC: 'A CSS framework',
        optionD: 'A server-side language',
        correctAnswer: 'A',
        explanation: 'React is a JavaScript library developed by Facebook for building user interfaces, particularly single-page applications.',
        difficulty: 'EASY'
      }
    }),
    prisma.question.create({
      data: {
        text: 'Which hook is used for state management in functional components?',
        optionA: 'useEffect',
        optionB: 'useState',
        optionC: 'useContext',
        optionD: 'useReducer',
        correctAnswer: 'B',
        explanation: 'useState is the most common hook for managing state in functional components.',
        difficulty: 'EASY'
      }
    }),
    prisma.question.create({
      data: {
        text: 'What does JSX stand for?',
        optionA: 'JavaScript XML',
        optionB: 'Java Syntax Extension',
        optionC: 'JavaScript Extension',
        optionD: 'Java Server Extension',
        correctAnswer: 'A',
        explanation: 'JSX stands for JavaScript XML. It allows us to write HTML in React.',
        difficulty: 'MEDIUM'
      }
    }),
    prisma.question.create({
      data: {
        text: 'Which method is used to update state in class components?',
        optionA: 'this.updateState()',
        optionB: 'this.setState()',
        optionC: 'this.changeState()',
        optionD: 'this.modifyState()',
        correctAnswer: 'B',
        explanation: 'In class components, setState() is used to update the component state.',
        difficulty: 'MEDIUM'
      }
    }),
    prisma.question.create({
      data: {
        text: 'What is the Virtual DOM?',
        optionA: 'A copy of the real DOM kept in memory',
        optionB: 'A new HTML specification',
        optionC: 'A CSS framework',
        optionD: 'A JavaScript engine',
        correctAnswer: 'A',
        explanation: 'The Virtual DOM is a lightweight copy of the actual DOM kept in memory, which React uses to optimize rendering.',
        difficulty: 'HARD'
      }
    }),
    prisma.question.create({
      data: {
        text: 'What is TypeScript?',
        optionA: 'A superset of JavaScript with static typing',
        optionB: 'A replacement for JavaScript',
        optionC: 'A CSS preprocessor',
        optionD: 'A database query language',
        correctAnswer: 'A',
        explanation: 'TypeScript is a superset of JavaScript that adds optional static typing.',
        difficulty: 'MEDIUM'
      }
    })
  ])

  // Link questions to tags
  console.log('Linking questions to tags...')

  // Helper function to create question-tag relationships safely
  const createQuestionTag = async (questionId: string, tagId: string) => {
    try {
      await prisma.questionTag.create({
        data: { questionId, tagId }
      })
    } catch (error: any) {
      // Ignore duplicate key errors (relationship already exists)
      if (error.code !== 'P2002') {
        throw error
      }
    }
  }

  // Question 1: "What is React?" - React, JavaScript
  await createQuestionTag(questions[0].id, reactTag.id)
  await createQuestionTag(questions[0].id, jsTag.id)

  // Question 2: "Which hook is used for state management" - React, React Hooks
  await createQuestionTag(questions[1].id, reactTag.id)
  await createQuestionTag(questions[1].id, hooksTag.id)

  // Question 3: "What does JSX stand for?" - React, JavaScript
  await createQuestionTag(questions[2].id, reactTag.id)
  await createQuestionTag(questions[2].id, jsTag.id)

  // Question 4: "Which method is used to update state in class components?" - React
  await createQuestionTag(questions[3].id, reactTag.id)

  // Question 5: "What is the Virtual DOM?" - React, DOM
  await createQuestionTag(questions[4].id, reactTag.id)
  await createQuestionTag(questions[4].id, domTag.id)

  // Question 6: "What is TypeScript?" - TypeScript, JavaScript
  await createQuestionTag(questions[5].id, tsTag.id)
  await createQuestionTag(questions[5].id, jsTag.id)

  // Create sample UserStats entries
  console.log('Creating sample user statistics...')

  const sampleUsers = [
    {
      userId: 'user_sample_1',
      userEmail: 'alice@example.com',
      totalQuestionsAnswered: 15,
      totalCorrectAnswers: 12,
      easyQuestionsAnswered: 5,
      easyCorrectAnswers: 5,
      mediumQuestionsAnswered: 7,
      mediumCorrectAnswers: 5,
      hardQuestionsAnswered: 3,
      hardCorrectAnswers: 2,
      currentStreak: 2,
      longestStreak: 5,
      lastAnsweredDate: dayjs('2024-01-15').toDate()
    },
    {
      userId: 'user_sample_2',
      userEmail: 'bob@example.com',
      totalQuestionsAnswered: 8,
      totalCorrectAnswers: 6,
      easyQuestionsAnswered: 3,
      easyCorrectAnswers: 3,
      mediumQuestionsAnswered: 4,
      mediumCorrectAnswers: 3,
      hardQuestionsAnswered: 1,
      hardCorrectAnswers: 0,
      currentStreak: 1,
      longestStreak: 3,
      lastAnsweredDate: dayjs('2024-01-14').toDate()
    },
    {
      userId: 'user_sample_3',
      userEmail: 'charlie@example.com',
      totalQuestionsAnswered: 25,
      totalCorrectAnswers: 22,
      easyQuestionsAnswered: 8,
      easyCorrectAnswers: 8,
      mediumQuestionsAnswered: 12,
      mediumCorrectAnswers: 11,
      hardQuestionsAnswered: 5,
      hardCorrectAnswers: 3,
      currentStreak: 4,
      longestStreak: 7,
      lastAnsweredDate: dayjs('2024-01-16').toDate()
    }
  ]

  for (const userData of sampleUsers) {
    await prisma.userStats.upsert({
      where: { userId: userData.userId },
      update: userData,
      create: userData
    })
  }

  console.log('✅ Seeding completed!')
  console.log(`Created ${questions.length} sample questions`)
  console.log(`Created ${sampleUsers.length} sample user statistics`)
  console.log(`Created tags: React, JavaScript, TypeScript, React Hooks, DOM`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })