const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Run with UI
  const context = await browser.newContext();
  const page = await context.newPage();

  // Helper function to get cookies from browser storage after login as user
  const getCookiesAfterLoginAsUser = async () => {
    console.log('🍪 Extracting cookies from browser storage...');
    
    // Get cookies for the specific domain
    const domainCookies = await context.cookies('https://demo-emea1.gainsightcloud.com');
    
    return domainCookies;
  };

  // Helper function to format cookies for API requests
  const formatCookiesForAPI = (cookies) => {
    return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  };

  try {
    // 1. Go to login page
    console.log('🌐 Navigating to login page...');
    await page.goto('https://demo-emea1.gainsightcloud.com');

    // 2. Wait and fill login
    console.log('📝 Filling login credentials...');
    await page.waitForSelector('input[type="email"], input[name="username"]', { timeout: 10000 });
    await page.fill('input[type="email"], input[name="username"]', 'somarajuramprasad@gmail.com');
    await page.fill('input[type="password"]', '@Ramprasad826ie');

    // 3. Submit and wait for redirect
    console.log('🔐 Submitting login...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.keyboard.press('Enter')
    ]);

    // 4. Check login result
    if (page.url().includes('dashboard') || page.url().includes('home')) {
      console.log('✅ Login successful!\n');

      // 4.a Navigate to User Management
      console.log('➡️ Navigating to User Management page...');
      await page.goto('https://demo-emea1.gainsightcloud.com/v1/ui/usermanagement#/users', {
        waitUntil: 'networkidle'
      });
      
      // Wait for the user table to load
      console.log('📋 User Management page loaded successfully');

      // 5. Function to login as a specific user using search
      const loginAsUser = async (targetEmail) => {
        console.log(`🔍 Searching for user with email: ${targetEmail}`);
        
        try {
          // Use the search input to find the user
          const searchInput = page.locator('input.px-search.ant-input[placeholder="Name or Email"]');
          await searchInput.waitFor({ timeout: 10000 });
          
          // Clear any existing search and enter the target email
          await searchInput.clear();
          await searchInput.fill(targetEmail);
          console.log(`📝 Entered "${targetEmail}" in search box`);
          
          // Press Enter to trigger the search
          await searchInput.press('Enter');
          console.log('⌨️ Pressed Enter to trigger search');
          
          // Wait for search results to load
          await page.waitForTimeout(2000);
          
          // Find the three dots menu button for the searched user
          console.log('🔍 Looking for three dots menu...');
          
          // Try multiple selectors for the three dots menu
          const threeDotSelectors = [
            'svg[data-icon="more-vertical"]',
            'svg[viewBox="0 0 24 24"]:has(path[d*="M12 15.5a1.5 1.5 0 110 3"])',
            '[data-icon="more-vertical"]',
            'button:has(svg[data-icon="more-vertical"])',
            '.ant-dropdown-trigger:has(svg[data-icon="more-vertical"])'
          ];
          
          let threeDotButton = null;
          for (const selector of threeDotSelectors) {
            try {
              threeDotButton = page.locator(selector).first();
              if (await threeDotButton.isVisible({ timeout: 2000 })) {
                console.log(`✅ Found three dots menu with selector: ${selector}`);
                break;
              }
            } catch (e) {
              continue;
            }
          }
          
          if (!threeDotButton || !(await threeDotButton.isVisible())) {
            // Fallback: look for any SVG with the specific viewBox in a user row
            threeDotButton = page.locator('tr:has-text("' + targetEmail + '") svg[viewBox="0 0 24 24"]').first();
            if (await threeDotButton.isVisible({ timeout: 2000 })) {
              console.log('✅ Found three dots menu using fallback selector');
            } else {
              throw new Error('Three dots menu not found');
            }
          }
          
          // Click on the three dots menu
          console.log('🖱️ Clicking on three dots menu...');
          await threeDotButton.click();
          
          // Wait for dropdown menu to appear
          await page.waitForTimeout(1000);
          
          // Find and click "Login as User" option
          console.log('🔍 Looking for "Login as User" option...');
          
          // Try multiple selectors for the "Login as User" menu item
          const loginMenuSelectors = [
            'li.ant-menu-item:has-text("Login as User")',
            'li[nz-menu-item]:has-text("Login as User")',
            '.ant-menu-item:has-text("Login as User")',
            '[nz-menu-item]:has-text("Login as User")',
            'li:has-text("Login as User")'
          ];
          
          let loginMenuItem = null;
          for (const selector of loginMenuSelectors) {
            try {
              loginMenuItem = page.locator(selector);
              if (await loginMenuItem.isVisible({ timeout: 2000 })) {
                console.log(`✅ Found "Login as User" menu item with selector: ${selector}`);
                break;
              }
            } catch (e) {
              continue;
            }
          }
          
          if (!loginMenuItem || !(await loginMenuItem.isVisible())) {
            throw new Error('"Login as User" menu item not found');
          }
          
          // Click on "Login as User"
          console.log('🖱️ Clicking on "Login as User"...');
          await loginMenuItem.click();
          
          // Wait for the login process to complete
          console.log('⏳ Waiting for user login to complete...');
          await page.waitForTimeout(5000); // Increased wait time for login process
          
          // Wait for any navigation/loading to complete
          console.log('📡 Waiting for page to stabilize...');
          await page.waitForLoadState('networkidle');
          
          // Check if login was successful (URL change or page content change)
          const currentUrl = page.url();
          console.log(`📍 Current URL after login attempt: ${currentUrl}`);
          
          return true;
          
        } catch (error) {
          console.error(`❌ Error in loginAsUser function:`, error.message);
          
          // Take a screenshot for debugging
          await page.screenshot({ path: `login_error_${Date.now()}.png` });
          console.log('📸 Error screenshot saved');
          
          return false;
        }
      };

      // 6. Specify the email of the user you want to login as
      const targetUserEmail = 'mackenzie.kiebach@mend.io'; // Change this to your target email
      const loginSuccess = await loginAsUser(targetUserEmail);
      
      if (loginSuccess) {
        console.log(`✅ Successfully initiated login as user: ${targetUserEmail}`);
        
        // Wait for additional activity after login
        console.log('⏳ Waiting for post-login processes...');
        await page.waitForTimeout(5000);
        
        // THIS IS THE ONLY COOKIE CAPTURE WE NEED
        console.log('🍪 Capturing cookies after "Login as User"...');
        const cookies = await getCookiesAfterLoginAsUser();
        const cookieString = formatCookiesForAPI(cookies);
        
        // Save the cookie data
        const timestamp = Date.now();
        const cookieData = {
          targetUser: targetUserEmail,
          cookies: cookies,
          cookieString: cookieString,
          extractedAt: new Date().toISOString(),
          cookieCount: cookies.length
        };
        
        // Save to JSON file
        fs.writeFileSync(`login_as_user_cookies_${timestamp}.json`, JSON.stringify(cookieData, null, 2));
        
        // Save cookie string for easy copy-paste
        fs.writeFileSync(`cookie_string_${timestamp}.txt`, cookieString);
        
        console.log(`💾 Cookie data saved to login_as_user_cookies_${timestamp}.json`);
        console.log(`📄 Cookie string saved to cookie_string_${timestamp}.txt`);
        
        console.log('\n🎯 SUCCESS! Cookies extracted:');
        console.log('='.repeat(60));
        console.log(`📊 Total cookies found: ${cookies.length}`);
        console.log(`🍪 Cookie string for API:`);
        console.log(cookieString);
        console.log('='.repeat(60));
        
        // Display cookie names
        console.log('\n🔑 Cookies found:');
        cookies.forEach((cookie, index) => {
          console.log(`  ${index + 1}. ${cookie.name} = ${cookie.value.substring(0, 50)}${cookie.value.length > 50 ? '...' : ''}`);
        });
        
        // Optional: Take a screenshot
  
        console.log('📸 Success screenshot saved');
        
      } else {
        console.log(`❌ Failed to login as user: ${targetUserEmail}`);
      }

    } else {
      console.warn('⚠️ Login may have failed. Current URL:', page.url());
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    // await page.screenshot({ path: `error_screenshot_${Date.now()}.png` });
    console.log('📸 Error screenshot saved');
  } finally {
    // Display final results
    console.log('\n🎯 FINAL RESULTS:');
    console.log('='.repeat(60));
    console.log('✅ Script completed successfully!');
    console.log('🍪 Cookies have been extracted and saved after "Login as User" action');
    console.log('📁 Check the generated files:');
    console.log('  - login_as_user_cookies_[timestamp].json (detailed cookie data)');
    console.log('  - cookie_string_[timestamp].txt (ready-to-use cookie string)');
    
    // Optionally close browser - comment out to keep browser open for debugging
    await browser.close();
    console.log('\n🎭 Script completed. Browser left open for inspection.');
  }
})();