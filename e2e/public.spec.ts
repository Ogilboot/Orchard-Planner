import { expect, test } from "@playwright/test";

test("homepage renders hero and stats", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Find and trade propagable plants" }),
  ).toBeVisible();
  await expect(page.getByText("Recent listings")).toBeVisible();
});

test("variety database lists seeded varieties", async ({ page }) => {
  await page.goto("/varieties");
  await expect(page.getByText("Ashmead's Kernel")).toBeVisible();
  await expect(page.getByText("Bramley's Seedling")).toBeVisible();
});

test("variety search filters results", async ({ page }) => {
  await page.goto("/varieties");
  await page.fill('input[name="q"]', "Ashmead");
  await page.click('button[type="submit"]');
  await expect(page.getByText("Ashmead's Kernel")).toBeVisible();
});

test("rootstock database lists seeded rootstocks", async ({ page }) => {
  await page.goto("/rootstocks");
  await expect(page.getByText("MM106")).toBeVisible();
  await expect(page.getByText("M9")).toBeVisible();
});

test("listings browse renders", async ({ page }) => {
  await page.goto("/listings");
  await expect(page.getByRole("heading", { name: "Browse listings" })).toBeVisible();
});

test("login page shows demo credentials", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByText("Demo account: demo@example.com / password123"),
  ).toBeVisible();
});
