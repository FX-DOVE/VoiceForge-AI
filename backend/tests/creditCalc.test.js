const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  calculateCreditsFromPayment,
  calculateCreditsForUsage,
} = require("../src/utils/creditCalc");

describe("calculateCreditsFromPayment", () => {
  // 50% split: $1 * 0.5 / 4.20 * 1,000,000 * 2 = 238,095 credits
  it("$1 payment adds 238,095 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(1), 238095);
  });

  it("$5 payment adds 1,190,476 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(5), 1190476);
  });

  it("$10 payment adds 2,380,952 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(10), 2380952);
  });

  it("$100 payment adds 23,809,523 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(100), 23809523);
  });

  it("$2 payment adds 476,190 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(2), 476190);
  });

  it("$25 payment adds 5,952,380 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(25), 5952380);
  });

  it("$50 payment adds 11,904,761 credits", () => {
    assert.strictEqual(calculateCreditsFromPayment(50), 11904761);
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

  it("platform keeps 50%, user gets 50% API value", () => {
    const payment = 10;
    const apiValue = payment * 0.5;
    assert.strictEqual(apiValue, 5);
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
