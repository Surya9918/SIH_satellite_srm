const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  console.log("Navigating to http://localhost:3001");
  // using { waitUntil: 'networkidle0' } to ensure full load
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });

  async function getThemeData(modeName) {
    return await page.evaluate((modeName) => {
      function getElementData(selector, name) {
        const el = document.querySelector(selector);
        if (!el) return { name, error: 'Not found' };
        
        const computed = window.getComputedStyle(el);
        return {
          name,
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      }

      const html = document.documentElement;
      return {
        mode: modeName,
        htmlClass: html.className,
        elements: [
          getElementData('p', 'Body/description text'),
          getElementData('footer', 'Footer container'),
          getElementData('footer p', 'Footer paragraph text')
        ]
      };
    }, modeName);
  }

  // Ensure it starts in light mode
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  });
  // give the browser a moment to apply styles
  await new Promise(r => setTimeout(r, 500));
  
  const lightData = await getThemeData('LIGHT MODE');

  // Switch to dark mode
  await page.evaluate(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  });
  await new Promise(r => setTimeout(r, 500));
  
  const darkData = await getThemeData('DARK MODE');

  console.log(JSON.stringify({ lightData, darkData }, null, 2));
  await browser.close();
}

run().catch(console.error);
