require("dotenv").config();
const config = require("./src/config");

async function test() {
  const XAI_MGMT_API_BASE = "https://management-api.x.ai/v1";
  const apiKey = process.env.XAI_API_KEY;
  const teamId = process.env.XAI_TEAM_ID || "9da6a4ba-7cb0-4f5d-b0ab-abe978c4b4d5";
  
  if (!apiKey) {
    console.error("Error: XAI_API_KEY not set in .env file");
    process.exit(1);
  }

  const endpoints = [
    `${XAI_MGMT_API_BASE}/billing/teams/${teamId}/prepaid/balance`,
    `${XAI_MGMT_API_BASE}/billing/balance`,
    `${XAI_MGMT_API_BASE}/teams/${teamId}/billing/prepaid/balance`,
  ];

  for (const endpoint of endpoints) {
    console.log(`Trying: ${endpoint}`);
    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      });
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Body: ${text}\n`);
    } catch (e) {
      console.error(e);
    }
  }
}

test();
