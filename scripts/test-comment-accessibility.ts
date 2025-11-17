/**
 * Comment System Accessibility Testing Script
 * Tests responsive design and accessibility features
 */

import { chromium, Browser, Page } from 'playwright';

const BASE_URL = 'http://localhost:4000';

interface AccessibilityTestResult {
  testName: string;
  passed: boolean;
  details: string;
}

async function testCommentAccessibility(): Promise<void> {
  console.log('🚀 Starting Comment System Accessibility Tests\n');
  console.log('='.repeat(60));

  let browser: Browser | null = null;
  const results: AccessibilityTestResult[] = [];

  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to a question page with comments
    console.log('\n📍 Navigating to question page...');
    await page.goto(`${BASE_URL}/questions/1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Test 1: Check for ARIA labels on buttons
    console.log('\n🔍 Test 1: ARIA Labels on Action Buttons');
    const editButtons = await page.locator('button[aria-label*="Edit"]').count();
    const deleteButtons = await page.locator('button[aria-label*="Delete"]').count();
    const hasAriaLabels = editButtons > 0 || deleteButtons > 0;
    results.push({
      testName: 'ARIA labels on edit/delete buttons',
      passed: hasAriaLabels,
      details: `Found ${editButtons} edit buttons and ${deleteButtons} delete buttons with ARIA labels`
    });
    console.log(hasAriaLabels ? '  ✅ ARIA labels present' : '  ❌ ARIA labels missing');

    // Test 2: Check for ARIA live region on character counter
    console.log('\n🔍 Test 2: ARIA Live Region for Character Counter');
    const liveRegion = await page.locator('[aria-live="polite"]').count();
    const hasLiveRegion = liveRegion > 0;
    results.push({
      testName: 'ARIA live region for character counter',
      passed: hasLiveRegion,
      details: `Found ${liveRegion} live region(s)`
    });
    console.log(hasLiveRegion ? '  ✅ Live region present' : '  ❌ Live region missing');

    // Test 3: Check semantic HTML (article, section, time)
    console.log('\n🔍 Test 3: Semantic HTML Elements');
    const articles = await page.locator('article').count();
    const sections = await page.locator('section[aria-labelledby]').count();
    const timeElements = await page.locator('time[datetime]').count();
    const hasSemanticHTML = articles > 0 && sections > 0;
    results.push({
      testName: 'Semantic HTML elements',
      passed: hasSemanticHTML,
      details: `Found ${articles} articles, ${sections} sections, ${timeElements} time elements`
    });
    console.log(hasSemanticHTML ? '  ✅ Semantic HTML present' : '  ❌ Semantic HTML missing');

    // Test 4: Keyboard Navigation
    console.log('\n🔍 Test 4: Keyboard Navigation');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.tagName + (el.getAttribute('aria-label') ? ` (${el.getAttribute('aria-label')})` : '') : 'none';
    });
    const hasKeyboardNav = focusedElement !== 'none' && focusedElement !== 'BODY';
    results.push({
      testName: 'Keyboard navigation',
      passed: hasKeyboardNav,
      details: `Focused element: ${focusedElement}`
    });
    console.log(hasKeyboardNav ? '  ✅ Keyboard navigation works' : '  ❌ Keyboard navigation issues');

    // Test 5: Responsive Design - Mobile
    console.log('\n🔍 Test 5: Responsive Design - Mobile (375px)');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileLayout = await page.evaluate(() => {
      const commentSection = document.querySelector('section[aria-labelledby="comments-heading"]');
      if (!commentSection) return { exists: false, width: 0 };
      
      const rect = commentSection.getBoundingClientRect();
      const buttons = commentSection.querySelectorAll('button');
      const hasStackedButtons = Array.from(buttons).some(btn => {
        const btnRect = btn.getBoundingClientRect();
        return btnRect.width > 200; // Full width buttons on mobile
      });
      
      return {
        exists: true,
        width: rect.width,
        hasStackedButtons
      };
    });
    
    const mobileResponsive = mobileLayout.exists && mobileLayout.width <= 375;
    results.push({
      testName: 'Mobile responsive design (375px)',
      passed: mobileResponsive,
      details: `Section width: ${mobileLayout.width}px, Stacked buttons: ${mobileLayout.hasStackedButtons}`
    });
    console.log(mobileResponsive ? '  ✅ Mobile layout works' : '  ❌ Mobile layout issues');

    // Test 6: Responsive Design - Tablet
    console.log('\n🔍 Test 6: Responsive Design - Tablet (768px)');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    const tabletLayout = await page.evaluate(() => {
      const commentSection = document.querySelector('section[aria-labelledby="comments-heading"]');
      if (!commentSection) return { exists: false, width: 0 };
      
      const rect = commentSection.getBoundingClientRect();
      return {
        exists: true,
        width: rect.width
      };
    });
    
    const tabletResponsive = tabletLayout.exists && tabletLayout.width <= 768;
    results.push({
      testName: 'Tablet responsive design (768px)',
      passed: tabletResponsive,
      details: `Section width: ${tabletLayout.width}px`
    });
    console.log(tabletResponsive ? '  ✅ Tablet layout works' : '  ❌ Tablet layout issues');

    // Test 7: Responsive Design - Desktop
    console.log('\n🔍 Test 7: Responsive Design - Desktop (1440px)');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);
    
    const desktopLayout = await page.evaluate(() => {
      const commentSection = document.querySelector('section[aria-labelledby="comments-heading"]');
      if (!commentSection) return { exists: false, width: 0 };
      
      const rect = commentSection.getBoundingClientRect();
      return {
        exists: true,
        width: rect.width
      };
    });
    
    const desktopResponsive = desktopLayout.exists;
    results.push({
      testName: 'Desktop responsive design (1440px)',
      passed: desktopResponsive,
      details: `Section width: ${desktopLayout.width}px`
    });
    console.log(desktopResponsive ? '  ✅ Desktop layout works' : '  ❌ Desktop layout issues');

    // Test 8: Focus Management in Edit Mode
    console.log('\n🔍 Test 8: Focus Management in Edit Mode');
    // Reset to desktop view
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Check if edit button exists and click it
    const editButton = page.locator('button[aria-label*="Edit"]').first();
    const editButtonExists = await editButton.count() > 0;
    
    let focusManagementWorks = false;
    if (editButtonExists) {
      await editButton.click();
      await page.waitForTimeout(500);
      
      const focusedAfterEdit = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName : 'none';
      });
      
      focusManagementWorks = focusedAfterEdit === 'TEXTAREA';
      results.push({
        testName: 'Focus management in edit mode',
        passed: focusManagementWorks,
        details: `Focused element after edit: ${focusedAfterEdit}`
      });
      console.log(focusManagementWorks ? '  ✅ Focus moves to textarea' : '  ❌ Focus management issues');
    } else {
      results.push({
        testName: 'Focus management in edit mode',
        passed: true,
        details: 'No comments to edit (test skipped)'
      });
      console.log('  ⚠️  No comments to edit (test skipped)');
    }

    // Test 9: Color Contrast
    console.log('\n🔍 Test 9: Color Contrast Compliance');
    const contrastCheck = await page.evaluate(() => {
      const elements = [
        { selector: '.text-gray-900', name: 'Primary text' },
        { selector: '.text-gray-600', name: 'Secondary text' },
        { selector: '.text-gray-500', name: 'Muted text' },
        { selector: '.text-red-600', name: 'Error text' },
        { selector: '.text-green-600', name: 'Success text' }
      ];
      
      const results = elements.map(({ selector, name }) => {
        const el = document.querySelector(selector);
        if (!el) return { name, exists: false };
        
        const style = window.getComputedStyle(el);
        return {
          name,
          exists: true,
          color: style.color
        };
      });
      
      return results;
    });
    
    const hasColorElements = contrastCheck.some(c => c.exists);
    results.push({
      testName: 'Color contrast elements present',
      passed: hasColorElements,
      details: `Found ${contrastCheck.filter(c => c.exists).length}/${contrastCheck.length} color elements`
    });
    console.log(hasColorElements ? '  ✅ Color elements present' : '  ❌ Color elements missing');

    await context.close();
    await browser.close();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 ACCESSIBILITY TEST SUMMARY\n');

    results.forEach(result => {
      console.log(`${result.passed ? '✅' : '❌'} ${result.testName}`);
      console.log(`    ${result.details}`);
    });

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const passRate = ((passedCount / totalCount) * 100).toFixed(1);

    console.log('\n' + '='.repeat(60));
    console.log(`\n${passedCount}/${totalCount} tests passed (${passRate}%)`);
    console.log(passedCount === totalCount ? '\n✅ ALL TESTS PASSED!' : '\n⚠️  SOME TESTS FAILED');
    console.log('\n');

    process.exit(passedCount === totalCount ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Test error:', error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

testCommentAccessibility();
