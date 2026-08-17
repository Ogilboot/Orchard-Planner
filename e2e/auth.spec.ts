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

test("admin can manage varieties and rootstocks", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/");

  await page.goto("/admin/varieties");
  await expect(page.getByRole("heading", { name: "Manage varieties" })).toBeVisible();
  await expect(page.getByText("Bulk import")).toBeVisible();

  await page.goto("/admin/rootstocks");
  await expect(page.getByRole("heading", { name: "Manage rootstocks" })).toBeVisible();
  await expect(page.getByText("MM106")).toBeVisible();
});

test("admin can bulk import varieties", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/");

  await page.goto("/admin/import");
  const unique = `Test Import ${Date.now()}`;
  const rows = [
    "commonName\tspecies\tchillHours\thardinessZone\tpollinationGroup\tharvestWindow\tflavorNotes\tdiseaseResistanceNotes\toriginNotes\tselfFertile\ttriploid\tdiseaseRating\theritage\tsynonyms",
    `${unique}\tMalus domestica\t600\t4-8\t3\tOctober\tTest flavour\t\t\tfalse\tfalse\t3\tfalse\t`,
  ].join("\n");
  await page.fill('textarea[name="data"]', rows);
  await page.getByRole("button", { name: "Import" }).click();
  await page.waitForURL(/\/admin\/import\?ok=/);
  await expect(page.getByText(/Imported 1 new/)).toBeVisible();
});

test("sign out returns to signed-out state", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "demo@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/");
  await expect(page.locator("header").getByText("Demo Nursery")).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
});
