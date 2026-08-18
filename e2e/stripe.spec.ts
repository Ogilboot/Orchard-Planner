import { expect, test } from "@playwright/test";

test("stripe checkout returns 401 when unauthenticated", async ({ request }) => {
  const res = await request.post("/api/stripe/checkout");
  expect(res.status()).toBe(401);
});

test("stripe webhook returns 501 when unconfigured", async ({ request }) => {
  const res = await request.post("/api/stripe/webhook", { data: "{}" });
  expect(res.status()).toBe(501);
});

test("stripe connect returns 401 when unauthenticated", async ({ request }) => {
  const res = await request.post("/api/stripe/connect");
  expect(res.status()).toBe(401);
});
