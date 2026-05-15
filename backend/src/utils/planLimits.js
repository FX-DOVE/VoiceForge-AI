const config = require("../config");

function getPlanLimits(plan) {
  return config.planLimits[plan] || config.planLimits.free;
}

function getCharactersLimit(plan) {
  return getPlanLimits(plan).charactersLimit;
}

module.exports = { getPlanLimits, getCharactersLimit };
