/**
 * Test script for PATCH and DELETE comment endpoints
 * Tests editing and deleting comments with proper authentication and authorization
 */

const BASE_URL = 'http://localhost:4000'

async function testCommentEditDelete() {
  console.log('🧪 Testing Comment PATCH and DELETE endpoints\n')

  // Note: You'll need to replace these with actual values from your database
  const TEST_COMMENT_ID = 'your-comment-id-here'
  const TEST_AUTH_TOKEN = 'your-auth-token-here'

  // Test 1: PATCH - Update comment (authenticated, owner)
  console.log('Test 1: Update comment as owner')
  try {
    const response = await fetch(`${BASE_URL}/api/comments/${TEST_COMMENT_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        content: 'This is an updated comment content',
      }),
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('✅ Should return 200 with updated comment\n')
  } catch (error) {
    console.error('❌ Error:', error)
  }

  // Test 2: PATCH - Update with invalid content (too long)
  console.log('Test 2: Update comment with content > 500 chars')
  try {
    const longContent = 'a'.repeat(501)
    const response = await fetch(`${BASE_URL}/api/comments/${TEST_COMMENT_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        content: longContent,
      }),
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('✅ Should return 400 with validation error\n')
  } catch (error) {
    console.error('❌ Error:', error)
  }

  // Test 3: PATCH - Update without authentication
  console.log('Test 3: Update comment without authentication')
  try {
    const response = await fetch(`${BASE_URL}/api/comments/${TEST_COMMENT_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'Trying to update without auth',
      }),
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('✅ Should return 401 unauthorized\n')
  } catch (error) {
    console.error('❌ Error:', error)
  }

  // Test 4: PATCH - Update non-existent comment
  console.log('Test 4: Update non-existent comment')
  try {
    const response = await fetch(`${BASE_URL}/api/comments/non-existent-id`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        content: 'Trying to update non-existent comment',
      }),
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('✅ Should return 404 not found\n')
  } catch (error) {
    console.error('❌ Error:', error)
  }

  // Test 5: DELETE - Delete comment (authenticated, owner)
  console.log('Test 5: Delete comment as owner')
  try {
    const response = await fetch(`${BASE_URL}/api/comments/${TEST_COMMENT_ID}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
      },
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('✅ Should return 200 with success: true\n')
  } catch (error) {
    console.error('❌ Error:', error)
  }

  // Test 6: DELETE - Delete without authentication
  console.log('Test 6: Delete comment without authentication')
  try {
    const response = await fetch(`${BASE_URL}/api/comments/${TEST_COMMENT_ID}`, {
      method: 'DELETE',
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('✅ Should return 401 unauthorized\n')
  } catch (error) {
    console.error('❌ Error:', error)
  }

  // Test 7: DELETE - Delete non-existent comment
  console.log('Test 7: Delete non-existent comment')
  try {
    const response = await fetch(`${BASE_URL}/api/comments/non-existent-id`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
      },
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('✅ Should return 404 not found\n')
  } catch (error) {
    console.error('❌ Error:', error)
  }

  console.log('✅ All tests completed!')
}

// Run tests
testCommentEditDelete().catch(console.error)
