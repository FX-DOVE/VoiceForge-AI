const config = require("../config");

// xAI API base URL
const XAI_API_BASE = "https://api.x.ai/v1";
const XAI_MGMT_API_BASE = "https://management-api.x.ai/v1";

/**
 * xAI Billing API Integration
 * Docs: https://docs.x.ai/developers/rest-api-reference/management/billing
 */

/**
 * Get prepaid credit balance from xAI Billing API
 * GET /v1/billing/teams/{team_id}/prepaid/balance
 */
async function getXaiPrepaidBalance() {
  if (!config.xai.apiKey || !config.xai.teamId) {
    return {
      success: false,
      error: "XAI_API_KEY and XAI_TEAM_ID required",
      balance: 0,
      currency: "USD",
    };
  }

  try {
    // Try multiple endpoint patterns
    const endpoints = [
      `${XAI_MGMT_API_BASE}/billing/teams/${config.xai.teamId}/prepaid/balance`,
      `${XAI_MGMT_API_BASE}/billing/balance`,
      `${XAI_MGMT_API_BASE}/teams/${config.xai.teamId}/billing/prepaid/balance`,
    ];
    
    let response = null;
    let lastError = null;
    
    for (const endpoint of endpoints) {
      console.log(`[xAI Billing] Trying endpoint: ${endpoint}`);
      
      const tryResponse = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.xai.apiKey}`,
          Accept: "application/json",
        },
      });
      
      if (tryResponse.ok) {
        response = tryResponse;
        console.log(`[xAI Billing] Success with endpoint: ${endpoint}`);
        break;
      } else {
        const errorData = await tryResponse.json().catch(() => ({}));
        console.log(`[xAI Billing] Endpoint ${endpoint} failed:`, tryResponse.status, errorData);
        lastError = { status: tryResponse.status, data: errorData };
      }
    }
    
    if (!response) {
      console.error("[xAI Billing] All endpoints failed. Last error:", lastError);
      return {
        success: false,
        error: `API error: ${lastError?.status || 404}`,
        balance: 0,
        currency: "USD",
      };
    }

    const data = await response.json();
    
    // xAI returns balance in USD cents
    const balanceUsdCents = data.total?.value || 0;
    const balanceUsd = balanceUsdCents / 100;
    
    return {
      success: true,
      balance: balanceUsd,
      balanceCents: balanceUsdCents,
      currency: data.total?.currency || "USD",
      changes: data.changes || [],
    };
  } catch (error) {
    console.error("[xAI Billing] Error fetching balance:", error.message);
    return {
      success: false,
      error: error.message,
      balance: 0,
      currency: "USD",
    };
  }
}

/**
 * Get historical usage from xAI Billing API
 * GET /v1/billing/teams/{team_id}/usage
 */
async function getXaiUsage(period = "30d") {
  if (!config.xai.apiKey || !config.xai.teamId) {
    return {
      success: false,
      error: "XAI_API_KEY and XAI_TEAM_ID required",
      usage: [],
    };
  }

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  const days = parseInt(period, 10) || 30;
  startDate.setDate(startDate.getDate() - days);

  try {
    const params = new URLSearchParams({
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    });

    const response = await fetch(
      `${XAI_MGMT_API_BASE}/billing/teams/${config.xai.teamId}/usage?${params}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.xai.apiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("[xAI Billing] Failed to fetch usage:", response.status);
      return {
        success: false,
        error: `API error: ${response.status}`,
        usage: [],
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      usage: data.usage || [],
      totalCost: data.total_cost || 0,
      totalRequests: data.total_requests || 0,
    };
  } catch (error) {
    console.error("[xAI Billing] Error fetching usage:", error.message);
    return {
      success: false,
      error: error.message,
      usage: [],
    };
  }
}

/**
 * Get billing information from xAI
 * GET /v1/billing/teams/{team_id}/billing-info
 */
async function getXaiBillingInfo() {
  if (!config.xai.apiKey || !config.xai.teamId) {
    return {
      success: false,
      error: "XAI_API_KEY and XAI_TEAM_ID required",
    };
  }

  try {
    const response = await fetch(
      `${XAI_MGMT_API_BASE}/billing/teams/${config.xai.teamId}/billing-info`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.xai.apiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("[xAI Billing] Failed to fetch billing info:", response.status);
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      billingInfo: data.billingInfo,
    };
  } catch (error) {
    console.error("[xAI Billing] Error fetching billing info:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check xAI API balance - now uses real Billing API
 */
async function checkXaiApiBalance() {
  const balanceResult = await getXaiPrepaidBalance();
  
  if (!balanceResult.success) {
    return {
      available: false,
      error: balanceResult.error,
      balance: 0,
      currency: "USD",
    };
  }

  const balance = balanceResult.balance;
  
  return {
    available: true,
    balance: balance,
    balanceCents: balanceResult.balanceCents,
    currency: balanceResult.currency,
    status: balance > 0 ? "active" : "depleted",
    message: balance > 0 
      ? `Active - $${balance.toFixed(2)} available` 
      : "Credits depleted",
  };
}

/**
 * Parse xAI TTS response headers for usage information
 */
function parseXaiUsageHeaders(headers) {
  const usage = {
    costInUsdTicks: 0,
    charactersProcessed: 0,
    modelUsed: "",
    requestId: "",
  };

  const costHeader = headers.get("x-usage-cost-ticks") || headers.get("x-cost-ticks");
  if (costHeader) {
    usage.costInUsdTicks = parseInt(costHeader, 10) || 0;
  }

  const charsHeader = headers.get("x-characters-processed") || headers.get("x-usage-characters");
  if (charsHeader) {
    usage.charactersProcessed = parseInt(charsHeader, 10) || 0;
  }

  const requestIdHeader = headers.get("x-request-id") || headers.get("xai-request-id");
  if (requestIdHeader) {
    usage.requestId = requestIdHeader;
  }

  return usage;
}

/**
 * Parse xAI TTS JSON response for usage data
 */
function parseXaiUsageFromBody(body) {
  const usage = {
    costInUsdTicks: 0,
    costUsd: 0,
    charactersProcessed: 0,
    modelUsed: "",
    requestId: "",
  };

  if (body.usage) {
    usage.costInUsdTicks = body.usage.cost_in_usd_ticks || 0;
    usage.costUsd = body.usage.cost_usd || (usage.costInUsdTicks / 10000000000);
    usage.charactersProcessed = body.usage.characters || body.usage.characters_processed || 0;
    usage.modelUsed = body.usage.model || body.model || "";
  }

  if (body.id || body.request_id) {
    usage.requestId = body.id || body.request_id;
  }

  return usage;
}

/**
 * Convert xAI cost ticks to USD
 */
function convertTicksToUsd(ticks) {
  return ticks / 10000000000;
}

/**
 * Estimate cost based on character count for TTS.
 * Now delegates to the central dynamic billing engine.
 */
async function estimateTtsCost(characters) {
  const { calculateEstimatedApiCost } = require("./creditCalc"); // note: may need path adjustment
  try {
    return await calculateEstimatedApiCost(characters);
  } catch {
    // Safe fallback
    return (characters / 1_000_000) * 15;
  }
}

/**
 * Fetch xAI voice catalog
 */
async function fetchXaiVoiceCatalog() {
  if (!config.xai.apiKey) return [];

  try {
    const response = await fetch(`${XAI_API_BASE}/tts/voices`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.xai.apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("[xAI Billing] Failed to fetch voice catalog:", response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.voices || data.data || [];
  } catch (error) {
    console.error("[xAI Billing] Error fetching voice catalog:", error.message);
    return [];
  }
}

module.exports = {
  // Real Billing API
  getXaiPrepaidBalance,
  getXaiUsage,
  getXaiBillingInfo,
  checkXaiApiBalance,
  
  // Legacy helpers
  parseXaiUsageHeaders,
  parseXaiUsageFromBody,
  convertTicksToUsd,
  estimateTtsCost,
  fetchXaiVoiceCatalog,
};
