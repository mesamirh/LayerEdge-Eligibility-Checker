// LayerEdge Airdrop Eligibility Checker Script (Ethers v6 Compatible - Rev 4 - Cleaner Output)

// libraries
const ethers = require("ethers");
const axios = require("axios");
require("dotenv").config();

// Configuration
let PRIVATE_KEYS = [];
try {
  // Try to get PRIVATE_KEYS array first
  PRIVATE_KEYS = JSON.parse(process.env.PRIVATE_KEYS || "[]");

  // If empty check for legacy PRIVATE_KEY format
  if (PRIVATE_KEYS.length === 0 && process.env.PRIVATE_KEY) {
    PRIVATE_KEYS = [process.env.PRIVATE_KEY];
  }
} catch (error) {
  // If JSON parsing fails, check if single key exists
  if (process.env.PRIVATE_KEY) {
    PRIVATE_KEYS = [process.env.PRIVATE_KEY];
  }
}

const ELIGIBILITY_API_URL =
  "https://airdrop.layeredge.foundation/api/eligibility";
const RPC_URL = "https://rpc.layeredge.io/";
const AIRDROP_CONTRACT_ADDRESS = "0x02E860EfB6c0d32637c4ea91d732D82403f46ceD";

// Helper Functions
async function getAirdropEligibility(walletAddress) {
  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Referer: "https://airdrop.layeredge.foundation/",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      Origin: "https://airdrop.layeredge.foundation",
    };
    const response = await axios.get(
      `${ELIGIBILITY_API_URL}?address=${walletAddress}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return null;
  }
}

async function getOnChainStatus(wallet, provider) {
  try {
    const selectorAndFirstParam =
      "0xdfcae6229ff0a51bc4e4167cdd0fedfd04c446baee7914d324b709c93c45b1e936c7d1b9";
    const addressParamPadded = ethers.zeroPadValue(wallet.address, 32).slice(2);
    const callData = selectorAndFirstParam + addressParamPadded;
    const result = await provider.call({
      to: AIRDROP_CONTRACT_ADDRESS,
      data: callData,
    });
    const decodedResult = ethers.AbiCoder.defaultAbiCoder().decode(
      ["bool"],
      result
    );
    return decodedResult[0];
  } catch (error) {
    return null;
  }
}

async function checkWallet(privateKey, provider, walletIndex) {
  let wallet;
  try {
    wallet = new ethers.Wallet(privateKey);
  } catch (error) {
    console.log(
      "\x1b[31m%s\x1b[0m",
      `❌ Wallet #${walletIndex + 1}: Invalid private key`
    );
    return;
  }

  const eligibilityData = await getAirdropEligibility(wallet.address);
  const onChainClaimedStatus = await getOnChainStatus(wallet, provider);

  console.log(
    "\n\x1b[36m%s\x1b[0m",
    `════════════ WALLET #${walletIndex + 1} ════════════`
  );
  console.log("\x1b[33m%s\x1b[0m", `Address: ${wallet.address}`);

  if (eligibilityData) {
    console.log(
      "\x1b[32m%s\x1b[0m",
      `Current:  ${eligibilityData.allocation || "0"} EDGE`
    );
    console.log(
      "\x1b[32m%s\x1b[0m",
      `Initial:  ${eligibilityData.initAllocation || "0"} EDGE`
    );
    console.log(
      onChainClaimedStatus ? "\x1b[31m%s\x1b[0m" : "\x1b[32m%s\x1b[0m",
      `Status:   ${onChainClaimedStatus ? "CLAIMED" : "NOT CLAIMED"}`
    );
  } else {
    console.log("\x1b[31m%s\x1b[0m", "❌ Not eligible for airdrop");
  }
  console.log("\x1b[36m%s\x1b[0m", "════════════════════════════════════\n");
}

async function main() {
  console.log("\x1b[35m%s\x1b[0m", "\n🔍 LAYEREDGE AIRDROP CHECKER\n");

  if (!PRIVATE_KEYS || PRIVATE_KEYS.length === 0) {
    console.log("\x1b[31m%s\x1b[0m", "❌ No private keys found in .env file");
    return;
  }

  let provider;
  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
  } catch (e) {
    console.log("\x1b[31m%s\x1b[0m", "❌ Failed to connect to network");
    return;
  }

  for (let i = 0; i < PRIVATE_KEYS.length; i++) {
    await checkWallet(PRIVATE_KEYS[i], provider, i);
    if (i < PRIVATE_KEYS.length - 1)
      await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

main().catch((error) => {
  console.error("\n💥 UNHANDLED FATAL ERROR in script execution:");
  console.error(error);
});
