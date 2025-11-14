/**
 * Test script to verify markdown rendering edge cases
 * Run with: npx tsx scripts/test-markdown-rendering.ts
 */

import { renderSimpleMarkdown } from '../lib/utils/markdown'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

interface TestCase {
  name: string
  input: string
  expectedPattern?: RegExp
  shouldContain?: string[]
  shouldNotContain?: string[]
}

const testCases: TestCase[] = [
  // Plain text backward compatibility
  {
    name: 'Plain text without formatting',
    input: 'React is a JavaScript library for building user interfaces.',
    shouldContain: ['React is a JavaScript library'],
    shouldNotContain: ['<strong>', '<em>', '<code>']
  },
  {
    name: 'Plain text with single newlines',
    input: 'Line 1\nLine 2\nLine 3',
    shouldContain: ['<br/>', 'Line 1', 'Line 2', 'Line 3']
  },
  {
    name: 'Plain text with double newlines (paragraphs)',
    input: 'Paragraph 1\n\nParagraph 2',
    shouldContain: ['<p', 'Paragraph 1', 'Paragraph 2']
  },

  // Markdown formatting
  {
    name: 'Bold text',
    input: 'This is **bold text** here.',
    shouldContain: ['<strong', 'bold text', '</strong>']
  },
  {
    name: 'Italic text with asterisk',
    input: 'This is *italic text* here.',
    shouldContain: ['<em', 'italic text', '</em>']
  },
  {
    name: 'Italic text with underscore',
    input: 'This is _italic text_ here.',
    shouldContain: ['<em', 'italic text', '</em>']
  },
  {
    name: 'Code text',
    input: 'Use the `useState` hook.',
    shouldContain: ['<code', 'useState', '</code>']
  },
  {
    name: 'Mixed inline formatting',
    input: 'This has **bold**, *italic*, and `code` formatting.',
    shouldContain: ['<strong', '<em', '<code', 'bold', 'italic', 'code']
  },

  // Lists
  {
    name: 'Bullet list',
    input: '- First item\n- Second item\n- Third item',
    shouldContain: ['<ul', '<li', 'First item', 'Second item', 'Third item', '</ul>']
  },
  {
    name: 'Numbered list',
    input: '1. First step\n2. Second step\n3. Third step',
    shouldContain: ['<ol', '<li', 'First step', 'Second step', 'Third step', '</ol>']
  },

  // Edge cases
  {
    name: 'Empty string',
    input: '',
    shouldContain: []
  },
  {
    name: 'Malformed bold (unclosed)',
    input: 'This has **unclosed bold',
    shouldNotContain: ['<strong>'],
    shouldContain: ['**unclosed bold']
  },
  {
    name: 'Malformed italic (unclosed)',
    input: 'This has *unclosed italic',
    shouldNotContain: ['<em>'],
    shouldContain: ['*unclosed italic']
  },
  {
    name: 'Special characters',
    input: 'Special: & < > " \' @ # $ %',
    shouldContain: ['&amp;', '&lt;', '&gt;', '&quot;']
  },
  {
    name: 'Asterisk in math expression',
    input: '2 * 3 = 6 and 4 * 5 = 20',
    shouldNotContain: ['<em>'],
    shouldContain: ['2 * 3', '4 * 5']
  },
  {
    name: 'Underscore in variable names',
    input: 'variable_name and another_variable',
    shouldNotContain: ['<em>'],
    shouldContain: ['variable_name', 'another_variable']
  },
  {
    name: 'Unicode and emoji',
    input: 'React ⚛️ is awesome! 🎉',
    shouldContain: ['⚛️', '🎉', 'React', 'awesome']
  },
  {
    name: 'HTML in text (should be escaped)',
    input: 'This has <script>alert("xss")</script> HTML',
    shouldContain: ['&lt;script&gt;', '&lt;/script&gt;'],
    shouldNotContain: ['<script>']
  },
  {
    name: 'Multiple consecutive newlines',
    input: 'Line 1\n\n\n\nLine 2',
    shouldContain: ['<p', 'Line 1', 'Line 2']
  },
  {
    name: 'Complex markdown with multiple features',
    input: 'The answer is **correct** because:\n\n1. React uses *virtual DOM*\n2. It provides `useState` hook\n\n- Performance\n- Maintainability',
    shouldContain: ['<strong', '<em', '<code', '<ol', '<ul', 'correct', 'virtual DOM', 'useState', 'Performance', 'Maintainability']
  }
]

function runTests() {
  console.log('🧪 Running Markdown Rendering Tests\n')
  console.log('='.repeat(80))
  
  let passed = 0
  let failed = 0
  const failures: string[] = []

  for (const testCase of testCases) {
    try {
      // Render the markdown to React elements
      const result = renderSimpleMarkdown(testCase.input)
      
      // Convert React elements to HTML string for testing
      const html = result ? renderToStaticMarkup(createElement('div', null, result)) : ''
      
      let testPassed = true
      const errors: string[] = []

      // Check shouldContain patterns
      if (testCase.shouldContain) {
        for (const pattern of testCase.shouldContain) {
          if (!html.includes(pattern)) {
            testPassed = false
            errors.push(`  ✗ Should contain "${pattern}" but doesn't`)
          }
        }
      }

      // Check shouldNotContain patterns
      if (testCase.shouldNotContain) {
        for (const pattern of testCase.shouldNotContain) {
          if (html.includes(pattern)) {
            testPassed = false
            errors.push(`  ✗ Should NOT contain "${pattern}" but does`)
          }
        }
      }

      if (testPassed) {
        console.log(`✓ ${testCase.name}`)
        passed++
      } else {
        console.log(`✗ ${testCase.name}`)
        errors.forEach(err => console.log(err))
        console.log(`  Input: "${testCase.input}"`)
        console.log(`  Output: ${html}`)
        failed++
        failures.push(testCase.name)
      }
    } catch (error) {
      console.log(`✗ ${testCase.name}`)
      console.log(`  Error: ${error instanceof Error ? error.message : String(error)}`)
      failed++
      failures.push(testCase.name)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`)
  
  if (failures.length > 0) {
    console.log('\n❌ Failed tests:')
    failures.forEach(name => console.log(`  - ${name}`))
    process.exit(1)
  } else {
    console.log('\n✅ All tests passed!')
    process.exit(0)
  }
}

runTests()
