import puppeteer from 'puppeteer';

export async function generatePDF(html: string): Promise<Buffer> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle2' });

    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
      printBackground: true,
    });

    return Buffer.from(pdf);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
