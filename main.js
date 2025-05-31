// LayerEdge Airdrop Eligibility Checker Script (Ethers v6 Compatible - Rev 4 - Cleaner Output)

// libraries
const ethers = require("ethers");
const axios = require("axios");
require("dotenv").config();

// Configuration
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ELIGIBILITY_API_URL =
  "https://airdrop.layeredge.foundation/api/eligibility";
const RPC_URL = "https://rpc.layeredge.io/";
const AIRDROP_CONTRACT_ADDRESS = "0x02E860EfB6c0d32637c4ea91d732D82403f46ceD";

// Helper Functions
async function getAirdropEligibility(walletAddress) {
  const url = `${ELIGIBILITY_API_URL}?address=${walletAddress}`;
  console.log(`\n⏳ Fetching Airdrop Eligibility for ${walletAddress}...`);
  console.log(`   API Endpoint: ${url}`);
  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Referer: "https://airdrop.layeredge.foundation/",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      Origin: "https://airdrop.layeredge.foundation",
    };
    const response = await axios.get(url, { headers: headers });
    console.log("✅ Eligibility data retrieved successfully!");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching eligibility data:");
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      let responseDataPreview = error.response.data;
      if (
        typeof responseDataPreview === "string" &&
        responseDataPreview.length > 200
      ) {
        responseDataPreview =
          responseDataPreview.substring(0, 200) + "... (truncated)";
      }
      console.error("   Response:", responseDataPreview);
      if (error.response.status === 503 || error.response.status === 504) {
        console.warn(
          `   ⚠️ Note: A ${error.response.status} error often indicates a temporary server-side issue with the LayerEdge API.`
        );
      }
    } else if (error.request) {
      console.error(
        "   No response received from the server. Check network or API status."
      );
    } else {
      console.error(`   Error message: ${error.message}`);
    }
    return null;
  }
}

async function getOnChainStatus(wallet, provider) {
  console.log(`\n⏳ Checking On-Chain Claim Status for ${wallet.address}...`);
  console.log(`   Contract: ${AIRDROP_CONTRACT_ADDRESS}`);

  const selectorAndFirstParam =
    "0xdfcae6229ff0a51bc4e4167cdd0fedfd04c446baee7914d324b709c93c45b1e936c7d1b9";
  const addressParamPadded = ethers.zeroPadValue(wallet.address, 32).slice(2);
  const callData = selectorAndFirstParam + addressParamPadded;

  try {
    const result = await provider.call({
      to: AIRDROP_CONTRACT_ADDRESS,
      data: callData,
    });

    const decodedResult = ethers.AbiCoder.defaultAbiCoder().decode(
      ["bool"],
      result
    );
    console.log(`✅ On-chain status decoded: ${decodedResult[0]}`);
    return decodedResult[0];
  } catch (error) {
    console.error("❌ Error checking on-chain status:");
    console.error(`   Message: ${error.message}`);
    if (error.error && error.error.message) {
      console.error("   Provider detailed error:", error.error.message);
    } else if (error.reason) {
      console.error("   Provider detailed reason:", error.reason);
    }
    return null;
  }
}

// Main Execution
async function main() {
  console.log("===================================================");
  console.log("🚀 LayerEdge Airdrop Eligibility Checker 🚀");
  console.log("===================================================");

  if (!PRIVATE_KEY) {
    console.error("\n❌ FATAL ERROR: PRIVATE_KEY not found in .env file.");
    console.error("   Please create a .env file and add your private key:");
    console.error('   Example: PRIVATE_KEY="your_actual_private_key_here"');
    return;
  }
  console.log("\n🔑 Private Key: Loaded successfully from .env file.");

  let wallet;
  try {
    wallet = new ethers.Wallet(PRIVATE_KEY);
    console.log("🔗 Wallet Initialized:");
    console.log(`   👤 Address: ${wallet.address}`);
  } catch (error) {
    console.error(
      "\n❌ FATAL ERROR: Invalid PRIVATE_KEY. Could not initialize wallet."
    );
    console.error(`   Error details: ${error.message}`);
    return;
  }

  let provider;
  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    console.log(`🌍 RPC Connection: Established with ${RPC_URL}`);
  } catch (e) {
    console.error("\n❌ FATAL ERROR: Could not initialize JsonRpcProvider.");
    console.error(`   Error details: ${e.message}`);
    return;
  }

  console.log("\n---------------------------------------------------");
  console.log("📊 Checking Airdrop Status...");
  console.log("---------------------------------------------------");

  // 1. Get Airdrop Eligibility
  const eligibilityData = await getAirdropEligibility(wallet.address);
  let allocationAmount = "N/A"; // Default value

  if (eligibilityData) {
    if (
      typeof eligibilityData === "string" &&
      eligibilityData.startsWith("<!doctype html>")
    ) {
      console.error(
        "\n❌ ELIGIBILITY CHECK: Failed. Received an HTML error page from the API."
      );
      console.log(
        "   This usually means the API is down or blocking the request."
      );
    } else {
      console.log("\n🎁 Airdrop Eligibility Details:");
      allocationAmount = eligibilityData.allocation || "N/A";
      console.log(`   💰 Current Allocation: ${allocationAmount}`);
      console.log(
        `   💎 Initial Allocation: ${eligibilityData.initAllocation || "N/A"}`
      );

      if (eligibilityData.proof && eligibilityData.proof.length > 0) {
        console.log(
          `   🧾 Merkle Proof: Found (${eligibilityData.proof.length} elements)`
        );
      } else {
        console.log("   🧾 Merkle Proof: Not provided or empty.");
      }

      if (
        eligibilityData.details &&
        Object.keys(eligibilityData.details).length > 0
      ) {
        console.log("   📋 Allocation Breakdown:");
        for (const key in eligibilityData.details) {
          if (
            eligibilityData.details[key] &&
            eligibilityData.details[key] !== ""
          ) {
            // print if there's a value
            console.log(`     🔹 ${key}: ${eligibilityData.details[key]}`);
          }
        }
      } else {
        console.log(
          "   📋 Allocation Breakdown: No specific details provided."
        );
      }
    }
  } else {
    console.log(
      "\nℹ️ ELIGIBILITY CHECK: Could not retrieve eligibility details or an API error occurred."
    );
  }

  // 2. On-Chain Status
  const onChainClaimedStatus = await getOnChainStatus(wallet, provider);

  console.log("\n---------------------------------------------------");
  console.log("📜 Summary of Findings");
  console.log("---------------------------------------------------");
  console.log(`👤 Wallet Address: ${wallet.address}`);
  console.log(`🎁 Airdrop Allocation: ${allocationAmount}`);

  if (onChainClaimedStatus !== null) {
    console.log(
      `⛓️ On-Chain Claim Status: ${
        onChainClaimedStatus
          ? "✅ Claimed / Action Taken"
          : "❌ Not Claimed / Action Not Taken"
      }`
    );
  } else {
    console.log(
      "⛓️ On-Chain Claim Status: Could not determine (error during check)."
    );
  }

  console.log("\n===================================================");
  console.log("🏁 Script Finished 🏁");
  console.log("===================================================");
}

main().catch((error) => {
  console.error("\n💥 UNHANDLED FATAL ERROR in script execution:");
  console.error(error);
});
