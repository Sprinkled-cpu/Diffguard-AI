import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT_DIR = 'D:\\production projects\\diffguard-ai\\screenshots';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log('[+] Launching Edge headless browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  console.log('[+] Navigating to http://127.0.0.1:8000 ...');
  await page.goto('http://127.0.0.1:8000', { waitUntil: 'networkidle0', timeout: 15000 });

  // Wait a moment for preset to populate in state
  await new Promise((r) => setTimeout(r, 2000));

  // Screenshot 1: Workspace with Preset Loaded
  const shot1 = path.join(OUTPUT_DIR, '01_split_workspace.png');
  await page.screenshot({ path: shot1 });
  console.log(`[✓] Captured: ${shot1}`);

  // Click RUN SIMULATION button
  console.log('[+] Triggering "RUN SIMULATION" button...');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('SIMULATION')) {
      await b.click();
      break;
    }
  }

  // Wait for the pipeline and diff view to render
  await new Promise((r) => setTimeout(r, 3000));

  // Screenshot 2: Diff Studio & Impact Dashboard
  const shot2 = path.join(OUTPUT_DIR, '02_diff_studio_and_impact.png');
  await page.screenshot({ path: shot2 });
  console.log(`[✓] Captured: ${shot2}`);

  // Click on "4-Robot Stepper" Tab
  console.log('[+] Switching to 4-Robot Stepper tab...');
  for (const b of buttons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('4-Robot Stepper')) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1000));

  // Screenshot 3: 4-Robot Assembly Line Stepper
  const shot3 = path.join(OUTPUT_DIR, '03_assembly_line_stepper.png');
  await page.screenshot({ path: shot3 });
  console.log(`[✓] Captured: ${shot3}`);

  // Click on "Repo Scanner" Tab
  console.log('[+] Switching to Repo Scanner tab...');
  for (const b of buttons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Repo Scanner')) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1000));

  // Screenshot 4: Repo Scanner View
  const shot4 = path.join(OUTPUT_DIR, '04_repo_scanner.png');
  await page.screenshot({ path: shot4 });
  console.log(`[✓] Captured: ${shot4}`);

  await browser.close();
  console.log('[✓] All real screenshots captured successfully!');
}

run().catch((err) => {
  console.error('[!] Error capturing screenshots:', err);
  process.exit(1);
});
