/**
 * Basic automated frontend tests using Jest and Puppeteer
 */

const puppeteer = require("puppeteer");

describe("Ecommerce Store Frontend", () => {
  let browser;
  let page;

  beforeAll(async () => {
    jest.setTimeout(60000); // Increase timeout to 60 seconds
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    page = await browser.newPage();
    await page.goto("http://localhost:5000");
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test("Index page loads and displays products", async () => {
    jest.setTimeout(30000); // Increase timeout for this test
    await page.waitForSelector(".product", { timeout: 30000 });
    const productCount = await page.$$eval(
      ".product",
      (products) => products.length
    );
    expect(productCount).toBeGreaterThan(0);
  });

  test("Signup page form validation", async () => {
    await page.goto("http://localhost:5000/signup.html");
    await page.click('button[type="submit"]');
    const errorMessages = await page.$$eval(".error-message", (elems) =>
      elems.map((e) => e.textContent)
    );
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  test("Login page form validation", async () => {
    await page.goto("http://localhost:5000/login.html");
    await page.click('button[type="submit"]');
    const errorMessages = await page.$$eval(".error-message", (elems) =>
      elems.map((e) => e.textContent)
    );
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  test("Checkout page requires payment details", async () => {
    await page.goto("http://localhost:5000/checkout.html");
    // The checkout.html uses alert for validation errors, so listen for alert dialog
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toMatch(/please/i);
      await dialog.dismiss();
    });
    await page.click('button[type="submit"]');
  });
});
