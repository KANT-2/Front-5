/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = process.env.FRONT5_BASE_URL || "http://localhost:3337";
const shots = path.join(__dirname, "../docs/screenshots/code-quality");
fs.mkdirSync(shots, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const shot = (name) => page.screenshot({ path: path.join(shots, name + ".jpg"), type: "jpeg", quality: 80 });
    console.log("Login contract and administrator editors");
    await page.goto(base + "/admin/login");
    await shot("admin-login");
    await page.getByLabel("아이디", { exact: true }).fill("quality-admin");
    await page.getByLabel("비밀번호", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await page.getByRole("alert").getByText(/아이디 또는 비밀번호/).waitFor();
    await page.getByLabel("비밀번호", { exact: true }).fill("quality-password");
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await page.waitForURL(/\/admin(?:\?|#|$)/);
    for (const name of ["옵션 관리", "bowl match 관리", "고객 페이지 편집", "고객 리뷰 관리", "위치 및 배달 관리", "원산지 및 알레르기 관리", "휴지통", "메뉴 관리"]) {
      await page.getByRole("button", { name, exact: true }).click();
      await page.locator("main.workspace h1").waitFor();
    }
    let conflict = true;
    await page.route("**/api/admin/catalog", async (route) => {
      if (route.request().method() === "PUT" && conflict) {
        conflict = false;
        await route.fulfill({ status: 409, json: { error: "다른 관리자가 저장했습니다. 최신 내용을 불러와주세요." } });
      } else await route.continue();
    });
    await page.getByRole("button", { name: "수정", exact: true }).first().click();
    const editor = page.getByRole("dialog", { name: "메뉴 수정", exact: true });
    await editor.getByLabel("메뉴 이름", { exact: true }).fill("코드 품질 검증 메뉴");
    await editor.getByRole("button", { name: "메뉴 저장", exact: true }).click();
    await editor.getByRole("alert").waitFor();
    assert.equal(await editor.getByLabel("메뉴 이름", { exact: true }).inputValue(), "코드 품질 검증 메뉴");
    await editor.getByRole("button", { name: "최신 내용 불러오기", exact: true }).click();
    await editor.getByRole("button", { name: "메뉴 저장", exact: true }).click();
    await editor.waitFor({ state: "hidden" });
    await page.getByRole("row").filter({ hasText: "코드 품질 검증 메뉴" }).first().waitFor();
    await shot("admin-products");
    await page.getByRole("button", { name: "고객 미리보기", exact: true }).click();
    await page.frameLocator('iframe[title="고객 페이지 미리보기"]').getByRole("heading", { name: /좋은 하루는/ }).waitFor();
    await page.keyboard.press("Escape");

    console.log("Match state across unrelated catalog updates");
    let snapshot = await (await page.request.get(base + "/api/catalog")).json();
    await page.route("**/api/catalog", (route) => route.fulfill({ json: snapshot }));
    await page.goto(base + "/match");
    for (let n = 1; n <= 2; n++) {
      await page.getByRole("button", { name: "재료 추가하기", exact: true }).click();
      await page.waitForFunction((n) => document.querySelectorAll(".ingredient-chip").length === n, n);
    }
    snapshot.catalog.reviews.unshift({ id: "quality-revision-review", productId: "salad-0", author: "검증", rating: 5, title: "새 리뷰", body: "선택 진행 중 들어온 리뷰입니다.", menu: "코드 품질 검증 메뉴", date: "2026.10.10", deleted: false });
    snapshot.revision++;
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await page.waitForTimeout(700);
    assert.equal(await page.locator(".ingredient-chip").count(), 2);
    await page.getByRole("button", { name: "샐러드 완성", exact: true }).click();
    const result = page.locator("dialog.bm-result");
    await result.getByLabel("내 샐러드 이름", { exact: true }).fill("진행 보존 볼");
    snapshot.revision++;
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await page.waitForTimeout(700);
    assert.ok(await result.isVisible());
    assert.equal(await result.getByLabel("내 샐러드 이름", { exact: true }).inputValue(), "진행 보존 볼");
    await result.getByRole("button", { name: /내 조합 저장하기/ }).click();
    await shot("match-result");
    await result.getByRole("button", { name: "장바구니에 담기", exact: true }).click();
    const cart = page.getByRole("dialog", { name: "장바구니", exact: true });
    await cart.waitFor();
    await cart.getByText("진행 보존 볼", { exact: false }).first().waitFor();
    await shot("cart");
    await page.keyboard.press("Escape");
    await page.goto(base + "/menu");
    await page.goto(base + "/match");
    assert.equal(await page.locator(".ingredient-chip").count(), 0);
    await page.getByRole("button", { name: "저장한 조합 불러오기", exact: true }).first().click();
    await result.waitFor();
    assert.equal(await page.locator(".ingredient-chip").count(), 2);

    console.log("Checkout revalidates stock even before catalog polling");
    const seedCart = [{ id: 0, dressing: -1, drinks: [], qty: 2, optionSelections: { dressing: ["dressing-0"], drinks: [] } }];
    await page.evaluate((items) => localStorage.setItem("bb-cart", JSON.stringify(items)), seedCart);
    const date = new Date(); date.setDate(date.getDate() + 1);
    const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    await page.goto(base + "/checkout?" + new URLSearchParams({ address: "서울 중구", day, time: "10:00–11:00" }));
    await page.locator(".checkout-pay-btn").waitFor();
    snapshot.catalog.products.find((p) => p.customerId === 0).status = "soldout";
    snapshot.revision++;
    await page.locator(".checkout-pay-btn").click();
    await page.getByRole("alert").getByText(/품절되거나 삭제된/).waitFor();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("bb-orders") || "[]").length), 0);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("bb-cart")).length), 1);
    await shot("checkout-stock-changed");
    assert.deepEqual(errors, []);
    console.log("Passed: login, editor conflict/reload/save, admin panels/preview, match progress/modal/recipe, cart, checkout stock change; no page errors.");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
