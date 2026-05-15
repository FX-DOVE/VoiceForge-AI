const { test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");

test("GET /api/health returns success", async () => {
  const res = await request(app).get("/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, "ok");
});
