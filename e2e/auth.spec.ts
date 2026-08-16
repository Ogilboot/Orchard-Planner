import { expect, test } from "@playwright/test";

test("sign in with demo account", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "demo@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/");
  await expect(page.locator("header").getByText("Demo Nursery")).toBeVisible();
});

test("signed-in user can view their listings", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "demo@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/");

  await page.goto("/listings/mine");
  await expect(page.getByRole("heading", { name: "My listings" })).toBeVisible();
  await expect(page.getByText("Ashmead's Kernel")).toBeVisible();
});

test("admin can view the admin dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/");

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
  await expect(page.getByText("Site overview and user management.")).toBeVisible();
});
