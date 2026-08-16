import { expect, test } from "@playwright/test";

test("nursery directory lists sellers", async ({ page }) => {
  await page.goto("/nurseries");
  await expect(page.getByText("Demo Nursery")).toBeVisible();
});

test("nursery directory searches by location via full-text search", async ({ page }) => {
  await page.goto("/nurseries?q=Wales");
  await expect(page.getByText("Demo Nursery")).toBeVisible();
});

test("storefront shows verified badge and listings", async ({ page }) => {
  await page.goto("/nurseries");
  await page.getByText("Demo Nursery").click();
  await expect(page.getByText("Verified nursery")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Listings" })).toBeVisible();
});
