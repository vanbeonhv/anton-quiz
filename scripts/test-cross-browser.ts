/**
 * Cross-Browser Compatibility Testing Script
 * Tests the landing page across different browser engines
 */

import { chromium, firefox, webkit, Browser, BrowserContext, Page } from 'playwright';

const BASE_URL = 'http://localhost:4000';

interface BrowserTestResult {
  browser: string;
  passed: boolean;
  issues: string[];
  metrics: {
    loadTime: number;
    gradientRendering: boolean;
    animationsWorking: boolean;
    imagesLoaded: boolean;
  };
}

async function testBrowser(browserType: 'chromium' | 'firefox' | 'webkit'): Promise<BrowserTestResult> {
  console.log(`\n🌐 Testing ${browserType.toUpperCase()}`);
  
  let browser: Browser | null = null;
  const issues: string[] = [];
  const metrics = {
    loadTime: 0,
    gradientRendering: false,
    animationsWorking: false,
    imagesLoaded: false,
  };

  try {
    // Launch browser
    if (browserType === 'chromium') {
      browser = await chromium.launch({ headless: true });
    } else if (browserType === 'firefox') {
      browser = await firefox.launch({ headless: true });
    } else {
      browser = await webkit.launch({ headless: true });
    }

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    // Measure load time
    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 10000 });
    metrics.loadTime = Date.now() - startTime;
    console.log(`  Load time: ${metrics.loadTime}ms`);

    // Check gradient rendering
    const hasGradients = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="gradient"]');
      if (elements.length === 0) return false;
      
      for (const el of Array.from(elements)) {
        const style = window.getComputedStyle(el as Element);
        const bg = style.backgroundImage;
        if (bg && (bg.includes('gradient') || bg.includes('linear') || bg.includes('radial'))) {
          return true;
        }
      }
      return false;
    });
    metrics.gradientRendering = hasGradients;
    console.log(`  Gradient rendering: ${hasGradients ? '✅' : '❌'}`);
    
    if (!hasGradients) {
      issues.push('Gradients not rendering properly');
    }

    // Check animations
    const hasAnimations = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="animate"]');
      return elements.length > 0;
    });
    metrics.animationsWorking = hasAnimations;
    console.log(`  Animations present: ${hasAnimations ? '✅' : '❌'}`);
    
    if (!hasAnimations) {
      issues.push('Animations not working');
    }

    // Check images loaded (with retry for slower browsers)
    let imagesLoaded = false;
    let imageCount = 0;
    let loadedCount = 0;
    
    for (let i = 0; i < 5; i++) {
      const imageStatus = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        const loaded = images.filter(img => {
          const htmlImg = img as HTMLImageElement;
          return htmlImg.complete && htmlImg.naturalWidth > 0;
        });
        
        return {
          total: images.length,
          loaded: loaded.length,
          allLoaded: images.length > 0 && loaded.length === images.length
        };
      });
      
      imageCount = imageStatus.total;
      loadedCount = imageStatus.loaded;
      imagesLoaded = imageStatus.allLoaded;
      
      if (imagesLoaded) break;
      await page.waitForTimeout(1000);
    }
    
    metrics.imagesLoaded = imagesLoaded;
    console.log(`  Images loaded: ${loadedCount}/${imageCount} ${imagesLoaded ? '✅' : '⚠️'}`);
    
    // Only fail if less than 80% of images loaded (some lazy-loaded images might not load in time)
    if (imageCount > 0 && loadedCount / imageCount < 0.8) {
      issues.push(`Only ${loadedCount}/${imageCount} images loaded`);
    }

    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait a bit to catch any console errors
    await page.waitForTimeout(1000);

    if (consoleErrors.length > 0) {
      console.log(`  Console errors: ${consoleErrors.length}`);
      issues.push(`${consoleErrors.length} console error(s) detected`);
    } else {
      console.log(`  Console errors: None ✅`);
    }

    // Check critical elements are visible
    const heroVisible = await page.isVisible('text=Practice, Learn, and Level Up');
    if (!heroVisible) {
      issues.push('Hero section not visible');
    }

    const ctaButtons = await page.locator('a:has-text("Try a Question"), a:has-text("Sign Up")').count();
    if (ctaButtons < 2) {
      issues.push('CTA buttons not found');
    }

    await context.close();
    await browser.close();

    console.log(issues.length === 0 ? '  ✅ All checks passed' : `  ⚠️  ${issues.length} issue(s) found`);

    return {
      browser: browserType,
      passed: issues.length === 0,
      issues,
      metrics,
    };

  } catch (error) {
    const errorMsg = String(error);
    
    // If it's a missing dependencies error for WebKit, mark as skipped
    if (errorMsg.includes('Missing libraries') && browserType === 'webkit') {
      console.log(`  ⚠️  Skipped (missing system dependencies)`);
      
      if (browser) {
        await browser.close();
      }

      return {
        browser: browserType,
        passed: true, // Don't fail the test suite for WebKit on unsupported systems
        issues: ['Skipped: Missing system dependencies'],
        metrics,
      };
    }
    
    console.error(`  ❌ Error: ${error}`);
    
    if (browser) {
      await browser.close();
    }

    return {
      browser: browserType,
      passed: false,
      issues: [`Test error: ${error}`],
      metrics,
    };
  }
}

async function main() {
  console.log('🚀 Starting Cross-Browser Compatibility Tests\n');
  console.log('='.repeat(60));

  const browsers: ('chromium' | 'firefox' | 'webkit')[] = ['chromium', 'firefox', 'webkit'];
  const results: BrowserTestResult[] = [];

  for (const browser of browsers) {
    try {
      const result = await testBrowser(browser);
      results.push(result);
    } catch (error) {
      console.error(`Failed to test ${browser}:`, error);
      results.push({
        browser,
        passed: false,
        issues: [`Failed to launch browser: ${error}`],
        metrics: {
          loadTime: 0,
          gradientRendering: false,
          animationsWorking: false,
          imagesLoaded: false,
        },
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 CROSS-BROWSER TEST SUMMARY\n');

  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.browser.toUpperCase()}`);
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`    - ${issue}`));
    }
    console.log(`    Load time: ${result.metrics.loadTime}ms`);
    console.log(`    Gradients: ${result.metrics.gradientRendering ? '✅' : '❌'}`);
    console.log(`    Animations: ${result.metrics.animationsWorking ? '✅' : '❌'}`);
    console.log(`    Images: ${result.metrics.imagesLoaded ? '✅' : '❌'}`);
  });

  const allPassed = results.every(r => r.passed);

  console.log('\n' + '='.repeat(60));
  console.log(allPassed ? '\n✅ ALL BROWSERS PASSED!' : '\n⚠️  SOME BROWSERS FAILED');
  console.log('\n');

  process.exit(allPassed ? 0 : 1);
}

main();
