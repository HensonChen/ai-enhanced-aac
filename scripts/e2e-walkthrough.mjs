import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const artifacts = '/opt/cursor/artifacts';
const delay = (page, ms = 800) => page.waitForTimeout(ms);
const videoOut = path.join(artifacts, 'aac_mvp_walkthrough.webm');
const screenshotOut = path.join(artifacts, 'aac_mvp_final_state.png');

fs.rmSync(videoOut, { force: true });
fs.rmSync(screenshotOut, { force: true });

let browser;
let context;
let page;

try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    recordVideo: { dir: artifacts, size: { width: 1440, height: 1050 } },
  });
  page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await delay(page, 900);

  const startButton = page.getByRole('button', { name: /start building boards/i });
  if (await startButton.isVisible().catch(() => false)) {
    await startButton.hover();
    await delay(page, 300);
    await startButton.click();
    await delay(page);
  }

  await page.getByRole('button', { name: /going to a loud grocery store/i }).click();
  await delay(page);
  await page.getByRole('button', { name: /We are at the grocery store/i }).click();
  await delay(page, 500);
  await page.getByRole('button', { name: /It is loud/i }).click();
  await delay(page, 500);
  await page.getByRole('button', { name: /I need headphones/i }).click();
  await delay(page, 900);
  await page.getByRole('button', { name: /^Speak$/i }).click();
  await delay(page, 600);
  await page.getByRole('button', { name: /expand/i }).click();
  await delay(page, 700);

  const madButton = page.getByRole('button', { name: /I am mad/i });
  await madButton.scrollIntoViewIfNeeded();
  await delay(page, 600);
  await madButton.click();
  await page.locator('section[aria-label="Sentence builder"]').scrollIntoViewIfNeeded();
  await delay(page, 1700);

  const sentenceText = await page.locator('section[aria-label="Sentence builder"]').innerText();
  if (!sentenceText.includes('grocery store') || !sentenceText.includes('loud') || !sentenceText.includes('headphones') || !sentenceText.includes('mad')) {
    throw new Error(`Sentence strip missing expected tokens: ${sentenceText}`);
  }

  await page.getByRole('button', { name: /^Clear$/i }).click();
  await delay(page, 800);
  await page.getByLabel(/environment and needs/i).scrollIntoViewIfNeeded();
  await page.getByLabel(/environment and needs/i).fill('We are going to a loud grocery store this afternoon.');
  await delay(page, 500);
  await page.getByRole('button', { name: /generate board/i }).hover();
  await delay(page, 400);
  await page.getByRole('button', { name: /generate board/i }).click();
  await page.getByRole('heading', { name: /review generated vocabulary/i }).waitFor({ timeout: 20000 });
  await delay(page, 1300);

  const useButton = page.getByRole('button', { name: /use this board/i });
  await useButton.hover();
  await delay(page, 900);
  await useButton.click();
  await delay(page, 900);
  await page.getByRole('button', { name: /We are at the grocery store/i }).click();
  await delay(page, 1100);

  const finalSentence = await page.locator('section[aria-label="Sentence builder"]').innerText();
  if (!finalSentence.includes('grocery store')) {
    throw new Error('Generated board selection did not reach sentence strip');
  }

  await page.screenshot({ path: screenshotOut, fullPage: true });
  const video = page.video();
  await context.close();
  await browser.close();
  const videoPath = await video.path();
  fs.renameSync(videoPath, videoOut);
  console.log('PASS: AAC MVP walkthrough completed');
  console.log(`Screenshot: ${screenshotOut}`);
  console.log(`Video: ${videoOut}`);
} catch (error) {
  if (context) await context.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
  throw error;
}
