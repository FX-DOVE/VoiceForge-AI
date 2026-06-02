/**
 * VoiceForge AI - Billing Refactor Validation Tests (2026)
 * 
 * These tests validate the new dynamic billing engine.
 * Run with: npm test or node tests/billing-refactor.test.js
 */

const { calculateCreditsFromPayment, calculateCreditsForUsage, calculateEstimatedApiCost, getBillingSettings } = require("../src/utils/creditCalc");

async function runTests() {
  console.log("=== Running Billing Refactor Validation Tests ===\n");

  const settings = await getBillingSettings();
  console.log("Current live settings:", settings);

  // Expected values from the spec (creditsPerCharacter = 2, ttsCost = $15)
  const testCases = [
    { deposit: 1, expectedCredits: 66666 },
    { deposit: 5, expectedCredits: 333333 },
    { deposit: 10, expectedCredits: 666666 },
    { deposit: 20, expectedCredits: 1333333 },
    { deposit: 50, expectedCredits: 3333333 },
    { deposit: 100, expectedCredits: 6666666 },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    const actual = await calculateCreditsFromPayment(test.deposit);
    const diff = Math.abs(actual - test.expectedCredits);
    const tolerance = Math.floor(test.expectedCredits * 0.02); // 2% tolerance for rounding

    if (diff <= tolerance) {
      console.log(`✅ Deposit $${test.deposit} → ${actual.toLocaleString()} credits (expected ~${test.expectedCredits.toLocaleString()})`);
      passed++;
    } else {
      console.log(`❌ Deposit $${test.deposit} → ${actual} credits (expected ~${test.expectedCredits})`);
      failed++;
    }
  }

  // Usage charging test
  const usageTests = [1, 100, 1000, 10000];
  for (const chars of usageTests) {
    const credits = await calculateCreditsForUsage(chars);
    const expected = Math.ceil(chars * settings.creditsPerCharacter);
    if (credits === expected) {
      console.log(`✅ ${chars} chars → ${credits} credits charged`);
      passed++;
    } else {
      console.log(`❌ ${chars} chars → ${credits} (expected ${expected})`);
      failed++;
    }
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
