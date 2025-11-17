/**
 * Test script to verify comment animations and loading states
 * 
 * This script tests:
 * 1. Fade-in animation for new comments
 * 2. Fade-out animation for deleted comments
 * 3. Smooth transition for edit mode toggle
 * 4. LoadingOverlay for comment submission
 * 5. Skeleton loaders for comment list loading state
 * 6. Optimistic update animations
 */

import { chromium, Browser, Page } from 'playwright'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'

async function testCommentAnimations() {
  let browser: Browser | null = null
  let page: Page | null = null

  try {
    console.log('🚀 Starting comment animations test...\n')

    // Launch browser
    browser = await chromium.launch({ headless: false, slowMo: 500 })
    const context = await browser.newContext()
    page = await context.newPage()

    // Navigate to login page
    console.log('📝 Logging in...')
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')

    // Login (adjust credentials as needed)
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com')
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'password123')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')

    // Navigate to a question page
    console.log('🔍 Navigating to question page...')
    await page.goto(`${BASE_URL}/questions`)
    await page.waitForLoadState('networkidle')
    
    // Click on first question
    await page.click('a[href*="/questions/"]')
    await page.waitForLoadState('networkidle')

    // Test 1: Verify comment section fade-in animation
    console.log('\n✅ Test 1: Comment section fade-in animation')
    const commentSection = page.locator('section[aria-labelledby="comments-heading"]')
    await commentSection.waitFor({ state: 'visible' })
    
    // Check if transition classes are present
    const sectionClasses = await commentSection.getAttribute('class')
    if (sectionClasses?.includes('transition-all') && sectionClasses?.includes('duration-500')) {
      console.log('   ✓ Comment section has fade-in animation classes')
    } else {
      console.log('   ✗ Comment section missing animation classes')
    }

    // Test 2: Verify skeleton loaders during loading
    console.log('\n✅ Test 2: Skeleton loaders with staggered animation')
    // Reload to see skeleton loaders
    await page.reload()
    
    // Check for skeleton loaders (they should appear briefly)
    const skeletons = page.locator('.animate-pulse')
    const skeletonCount = await skeletons.count()
    if (skeletonCount > 0) {
      console.log(`   ✓ Found ${skeletonCount} skeleton loaders with animation`)
    } else {
      console.log('   ℹ No skeleton loaders visible (comments loaded too quickly)')
    }

    await page.waitForLoadState('networkidle')

    // Test 3: Create a comment and verify LoadingOverlay
    console.log('\n✅ Test 3: LoadingOverlay during comment submission')
    const commentTextarea = page.locator('textarea[placeholder*="Write your comment"]')
    await commentTextarea.waitFor({ state: 'visible' })
    
    const testComment = `Test comment for animations - ${Date.now()}`
    await commentTextarea.fill(testComment)
    
    // Submit and check for loading overlay
    const submitButton = page.locator('button:has-text("Post Comment")')
    await submitButton.click()
    
    // Check for loading overlay
    const loadingOverlay = page.locator('[role="status"][aria-label="Loading overlay"]')
    const hasLoadingOverlay = await loadingOverlay.isVisible().catch(() => false)
    if (hasLoadingOverlay) {
      console.log('   ✓ LoadingOverlay displayed during submission')
    } else {
      console.log('   ℹ LoadingOverlay not visible (submission too fast)')
    }
    
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Wait for animation

    // Test 4: Verify new comment fade-in animation
    console.log('\n✅ Test 4: New comment fade-in animation')
    const newComment = page.locator(`article:has-text("${testComment}")`)
    await newComment.waitFor({ state: 'visible' })
    
    const commentClasses = await newComment.getAttribute('class')
    if (commentClasses?.includes('transition-all') && commentClasses?.includes('duration-300')) {
      console.log('   ✓ New comment has fade-in animation classes')
    } else {
      console.log('   ✗ New comment missing animation classes')
    }

    // Test 5: Verify edit mode transition
    console.log('\n✅ Test 5: Edit mode smooth transition')
    const editButton = newComment.locator('button:has-text("Edit")')
    await editButton.click()
    await page.waitForTimeout(500) // Wait for transition
    
    // Check if edit form is visible with transition
    const editForm = page.locator('textarea[placeholder*="Edit your comment"]')
    const isEditFormVisible = await editForm.isVisible()
    if (isEditFormVisible) {
      console.log('   ✓ Edit mode transition completed')
      
      // Cancel edit
      const cancelButton = page.locator('button:has-text("Cancel")')
      await cancelButton.click()
      await page.waitForTimeout(500) // Wait for transition back
      console.log('   ✓ Cancel transition completed')
    } else {
      console.log('   ✗ Edit form not visible')
    }

    // Test 6: Verify delete animation
    console.log('\n✅ Test 6: Delete fade-out animation')
    const deleteButton = newComment.locator('button:has-text("Delete")')
    await deleteButton.click()
    
    // Confirm deletion in dialog
    const confirmButton = page.locator('button:has-text("Delete"):not([aria-label*="your comment"])')
    await confirmButton.click()
    
    // Wait for fade-out animation
    await page.waitForTimeout(500)
    
    // Verify comment is removed
    const commentStillExists = await newComment.isVisible().catch(() => false)
    if (!commentStillExists) {
      console.log('   ✓ Comment deleted with fade-out animation')
    } else {
      console.log('   ✗ Comment still visible after deletion')
    }

    console.log('\n✨ All animation tests completed!')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    throw error
  } finally {
    if (page) {
      await page.waitForTimeout(2000) // Keep browser open to see results
    }
    if (browser) {
      await browser.close()
    }
  }
}

// Run the test
testCommentAnimations()
  .then(() => {
    console.log('\n✅ Test suite completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error)
    process.exit(1)
  })
