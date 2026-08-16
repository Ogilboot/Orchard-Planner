import { expect, test } from "@playwright/test";

test("global search finds a variety", async ({ page }) => {
  await page.goto("/search?q=Dabinett");
  await expect(page.getByText("Dabinett")).toBeVisible();
});

test("full-text search matches variety notes", async ({ page }) => {
  await page.goto("/search?q=cider");
  await expect(page.getByText("Dabinett")).toBeVisible();
});

test("variety search matches synonyms", async ({ page }) => {
  await page.goto("/varieties?q=Cox");
  await expect(page.getByText("Cox's Orange Pippin")).toBeVisible();
});
