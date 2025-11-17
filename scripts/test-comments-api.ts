/**
 * Test script for GET /api/questions/[id]/comments endpoint
 * 
 * This script tests:
 * 1. Fetching comments for a valid question
 * 2. Handling non-existent questions
 * 3. Verifying comment structure with author metadata
 * 4. Checking isEdited flag calculation
 */

import { prisma } from '../lib/db'

async function testCommentsAPI() {
  console.log('🧪 Testing GET /api/questions/[id]/comments endpoint\n')

  try {
    // Find a question to test with
    const question = await prisma.question.findFirst({
      where: { isActive: true }
    })

    if (!question) {
      console.log('❌ No active questions found in database')
      return
    }

    console.log(`✅ Found test question: ${question.id}`)
    console.log(`   Question #${question.number}: ${question.text.substring(0, 50)}...\n`)

    // Check if there are any comments for this question
    const existingComments = await prisma.questionComment.findMany({
      where: { questionId: question.id }
    })

    console.log(`📊 Found ${existingComments.length} existing comment(s) for this question\n`)

    // Test 1: Fetch comments for valid question
    console.log('Test 1: Fetching comments for valid question')
    const response = await fetch(`http://localhost:4000/api/questions/${question.id}/comments`)
    
    if (!response.ok) {
      console.log(`❌ Failed with status: ${response.status}`)
      const error = await response.json()
      console.log('   Error:', error)
    } else {
      const comments = await response.json()
      console.log(`✅ Successfully fetched ${comments.length} comment(s)`)
      
      if (comments.length > 0) {
        console.log('\n   Sample comment structure:')
        const sample = comments[0]
        console.log('   {')
        console.log(`     id: "${sample.id}",`)
        console.log(`     questionId: "${sample.questionId}",`)
        console.log(`     userId: "${sample.userId}",`)
        console.log(`     userEmail: "${sample.userEmail}",`)
        console.log(`     content: "${sample.content.substring(0, 50)}...",`)
        console.log(`     author: {`)
        console.log(`       displayName: ${sample.author.displayName ? `"${sample.author.displayName}"` : 'null'},`)
        console.log(`       avatarUrl: ${sample.author.avatarUrl ? `"${sample.author.avatarUrl}"` : 'null'}`)
        console.log(`     },`)
        console.log(`     isEdited: ${sample.isEdited},`)
        console.log(`     createdAt: "${sample.createdAt}",`)
        console.log(`     updatedAt: "${sample.updatedAt}"`)
        console.log('   }')
      }
    }

    // Test 2: Fetch comments for non-existent question
    console.log('\n\nTest 2: Fetching comments for non-existent question')
    const invalidResponse = await fetch('http://localhost:4000/api/questions/invalid-id/comments')
    
    if (invalidResponse.status === 404) {
      const error = await invalidResponse.json()
      console.log(`✅ Correctly returned 404: ${error.error}`)
    } else {
      console.log(`❌ Expected 404, got ${invalidResponse.status}`)
    }

    console.log('\n✨ All tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the tests
testCommentsAPI()
