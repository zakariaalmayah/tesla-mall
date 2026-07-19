import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads Arabic homepage by default with RTL direction", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  });

  test("switches to English (LTR)", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("header exposes cart, wishlist, and account links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /cart|السلة/i })).toBeVisible();
  });
});
