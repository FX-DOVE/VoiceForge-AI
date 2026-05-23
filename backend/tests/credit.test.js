const { calculateCreditsFromPayment, calculateCreditsForUsage } = require("../src/utils/creditCalc");

describe("Credit Calculation Logic", () => {
  it("should calculate correct credits for a $1 payment", () => {
    const credits = calculateCreditsFromPayment(1);
    expect(credits).toBe(285714);
  });

  it("should calculate correct credits for a $5 payment", () => {
    const credits = calculateCreditsFromPayment(5);
    expect(credits).toBe(1428571); // Floor of 1428571.42...
  });

  it("should calculate correct credits for a $100 payment", () => {
    const credits = calculateCreditsFromPayment(100);
    expect(credits).toBe(28571428); // Floor of 28571428.57...
  });

  it("should calculate correct charge for 8000 characters", () => {
    const charge = calculateCreditsForUsage(8000);
    expect(charge).toBe(16000);
  });
});
