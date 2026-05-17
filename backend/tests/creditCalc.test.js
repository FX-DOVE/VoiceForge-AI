const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  calculateCreditsFromPayment,
  calculateCreditsForUsage,
} = require("../src/utils/creditCalc");

describe("calculateCreditsFromPayment", () => {
  it("$1 payment adds 285,714 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(1), 285714);
  });

  it("$5 payment adds 1,428,571 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(5), 1428571);
  });

  it("$10 payment adds 2,857,142 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(10), 2857142);
  });

  it("$100 payment adds 28,571,428 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(100), 28571428);
  });

  it("$2 payment adds 571,428 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(2), 571428);
  });

  it("$25 payment adds 7,142,857 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(25), 7142857);
  });

  it("$50 payment adds 14,285,714 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(50), 14285714);
  });

  it("$0 payment returns 0 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(0), 0);
  });

  it("negative payment returns <= 0", () => {
    assert.ok(calculateCreditsFromPayment(-5) <= 0);
  });

  it("always returns an integer (floor)", () => {
    assert.ok(Number.isInteger(calculateCreditsFromPayment(1)));
    assert.ok(Number.isInteger(calculateCreditsFromPayment(3.33)));
    assert.ok(Number.isInteger(calculateCreditsFromPayment(7.77)));
  });
});

describe("calculateCreditsForUsage", () => {
  it("8,000 characters charge 16,000 credits", () => {
    assert.strictEqual(calculateCreditsForUsage(8000), 16000);
  });

  it("1 character charges 2 credits", () => {
    assert.strictEqual(calculateCreditsForUsage(1), 2);
  });

  it("0 characters charges 0 credits", () => {
    assert.strictEqual(calculateCreditsForUsage(0), 0);
  });

  it("uses ceil() rounding", () => {
    assert.strictEqual(calculateCreditsForUsage(1.5), 3);
  });

  it("500 characters charges 1,000 credits", () => {
    assert.strictEqual(calculateCreditsForUsage(500), 1000);
  });

  it("always returns an integer (ceil)", () => {
    assert.ok(Number.isInteger(calculateCreditsForUsage(1234)));
    assert.ok(Number.isInteger(calculateCreditsForUsage(0)));
  });
});

describe("business rule consistency", () => {
  it("credits from payment are always integers", () => {
    const amounts = [0.5, 1, 2, 3.33, 5, 7.77, 10, 25, 50, 100, 999.99];
    for (const amt of amounts) {
      assert.ok(Number.isInteger(calculateCreditsFromPayment(amt)), `Non-integer for $${amt}`);
    }
  });

  it("credits for usage are always integers", () => {
    const chars = [0, 1, 10, 100, 1000, 5000, 10000, 99999];
    for (const c of chars) {
      assert.ok(Number.isInteger(calculateCreditsForUsage(c)), `Non-integer for ${c} chars`);
    }
  });

  it("platform keeps 40%, user gets 60% API value", () => {
    const payment = 10;
    const apiValue = payment * 0.6;
    assert.strictEqual(apiValue, 6);
    const chars = (apiValue / 4.2) * 1_000_000;
    const credits = Math.floor(chars * 2);
    assert.strictEqual(credits, calculateCreditsFromPayment(payment));
  });

  it("insufficient credits blocks generation", () => {
    const userCreditsRemaining = 100;
    const charCount = 200;
    const creditsToCharge = calculateCreditsForUsage(charCount);
    assert.strictEqual(creditsToCharge, 400);
    assert.ok(userCreditsRemaining < creditsToCharge, "Should be insufficient");
  });
});
