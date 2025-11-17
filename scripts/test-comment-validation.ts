/**
 * Manual test script for comment validation utilities
 * Run with: tsx scripts/test-comment-validation.ts
 */

import {
  validateCommentContent,
  getCommentCharacterCount,
  isCommentLengthValid,
  COMMENT_VALIDATION_ERRORS,
  COMMENT_CONSTRAINTS
} from '../lib/utils/comments'

console.log('Testing Comment Validation Utilities\n')
console.log('=====================================\n')

// Test cases
const testCases = [
  {
    name: 'Empty string',
    input: '',
    expectedValid: false,
    expectedError: COMMENT_VALIDATION_ERRORS.EMPTY
  },
  {
    name: 'Whitespace only',
    input: '   ',
    expectedValid: false,
    expectedError: COMMENT_VALIDATION_ERRORS.EMPTY
  },
  {
    name: 'Valid short comment',
    input: 'Hello world',
    expectedValid: true
  },
  {
    name: 'Valid comment with leading/trailing whitespace',
    input: '  Hello world  ',
    expectedValid: true
  },
  {
    name: 'Exactly 500 characters',
    input: 'a'.repeat(500),
    expectedValid: true
  },
  {
    name: 'Exactly 501 characters',
    input: 'a'.repeat(501),
    expectedValid: false,
    expectedError: COMMENT_VALIDATION_ERRORS.TOO_LONG
  },
  {
    name: 'Very long comment (1000 chars)',
    input: 'a'.repeat(1000),
    expectedValid: false,
    expectedError: COMMENT_VALIDATION_ERRORS.TOO_LONG
  },
  {
    name: 'Single character',
    input: 'a',
    expectedValid: true
  },
  {
    name: 'Multiline comment',
    input: 'Line 1\nLine 2\nLine 3',
    expectedValid: true
  }
]

let passed = 0
let failed = 0

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`)
  console.log(`Input: "${testCase.input.substring(0, 50)}${testCase.input.length > 50 ? '...' : ''}"`)
  console.log(`Input length: ${testCase.input.length}`)
  
  const result = validateCommentContent(testCase.input)
  const charCount = getCommentCharacterCount(testCase.input)
  const lengthValid = isCommentLengthValid(testCase.input)
  
  console.log(`Result: isValid=${result.isValid}, error="${result.error || 'none'}"`)
  console.log(`Character count: ${charCount}`)
  console.log(`Length valid: ${lengthValid}`)
  
  // Verify results
  const validationPassed = result.isValid === testCase.expectedValid
  const errorPassed = !testCase.expectedError || result.error?.includes(testCase.expectedError)
  const lengthCheckPassed = lengthValid === testCase.expectedValid
  
  if (validationPassed && errorPassed && lengthCheckPassed) {
    console.log('✅ PASSED\n')
    passed++
  } else {
    console.log('❌ FAILED')
    if (!validationPassed) {
      console.log(`  Expected isValid: ${testCase.expectedValid}, got: ${result.isValid}`)
    }
    if (!errorPassed) {
      console.log(`  Expected error to include: "${testCase.expectedError}", got: "${result.error}"`)
    }
    if (!lengthCheckPassed) {
      console.log(`  Length check mismatch`)
    }
    console.log()
    failed++
  }
})

console.log('=====================================')
console.log(`Total: ${testCases.length} tests`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
console.log('=====================================\n')

// Test constants
console.log('Testing Constants:')
console.log(`MIN_LENGTH: ${COMMENT_CONSTRAINTS.MIN_LENGTH}`)
console.log(`MAX_LENGTH: ${COMMENT_CONSTRAINTS.MAX_LENGTH}`)
console.log(`EMPTY error: "${COMMENT_VALIDATION_ERRORS.EMPTY}"`)
console.log(`TOO_LONG error: "${COMMENT_VALIDATION_ERRORS.TOO_LONG}"`)
console.log(`WHITESPACE_ONLY error: "${COMMENT_VALIDATION_ERRORS.WHITESPACE_ONLY}"`)

process.exit(failed > 0 ? 1 : 0)
