# LayerEdge Airdrop Eligibility Checker

This Node.js script checks your airdrop eligibility and on-chain claim status for the LayerEdge airdrop. It interacts directly with the LayerEdge API and an Ethereum RPC provider.

---

## 🚀 Features

- **Eligibility Check**: Fetches your airdrop allocation amount from the LayerEdge API.
- **On-Chain Status**: Checks a specific LayerEdge smart contract to determine if the airdrop has potentially been claimed for your address.
- **Secure**: Reads your private key from a `.env` file to ensure it's not hardcoded.
- **User-Friendly Output**: Provides clear, emoji-enhanced console messages about the process and results.

---

## 🛠️ Prerequisites

- **Node.js**: Version 16.x or higher recommended. You can download it from [nodejs.org](https://nodejs.org/).
- **npm** (Node Package Manager): Usually comes with Node.js.
- An **Ethereum Private Key**: For the wallet you want to check.
- An **RPC URL**: The script is pre-configured to use `https://rpc.layeredge.io/`, but you can change it if needed.

---

## ⚙️ Setup & Installation

1.  **Clone or Download:**
    ```bash
    git clone https://github.com/mesamirh/LayerEdge-Eligibility-Checker.git
    ```
2.  **Navigate to Project Directory:**
    Open your terminal or command prompt and navigate to the directory where you saved the script.

    ```bash
    cd LayerEdge-Eligibility-Checker
    ```

3.  **Install Dependencies:**
    Run the following command to install the necessary Node.js packages (`ethers.js` and `axios` for functionality, `dotenv` for environment variable management):

    ```bash
    npm install ethers axios dotenv
    ```

4.  **Create `.env` File:**
    In the same project directory, create a file named `.env`. This file will securely store your private key. Add your private key to this file in the following format:

    ```env
    PRIVATE_KEY="your_ethereum_private_key"
    ```

    **🔒 IMPORTANT SECURITY NOTE:**

    - Never share your private key with anyone.
    - Never commit your `.env` file to a public repository (like GitHub). If you're using Git, add `.env` to your `.gitignore` file.

---

## ▶️ How to Run

Once you've completed the setup:

1.  Open your terminal or command prompt.
2.  Navigate to the project directory.
3.  Run the script using Node.js:
    ```bash
    node main.js
    ```

The script will then:

- Load your private key.
- Initialize your wallet and display your public address.
- Connect to the RPC provider.
- Fetch airdrop eligibility from the LayerEdge API.
- Check the on-chain claim status from the LayerEdge smart contract.
- Display a summary of the findings.

---

## 📄 Script Overview

- **Configuration**: At the top of the script, you can find constants for API URLs and the contract address. These are generally pre-set for the LayerEdge airdrop.
- **`getAirdropEligibility(walletAddress)`**: This asynchronous function sends a GET request to the LayerEdge API to retrieve allocation details. It includes headers to mimic a browser request.
- **`getOnChainStatus(wallet, provider)`**: This asynchronous function performs an `eth_call` to the specified LayerEdge smart contract to check a likely claim status for the given wallet address.
- **`main()`**: The main asynchronous function that orchestrates the script's execution, including loading the private key, initializing the wallet and provider, calling the helper functions, and displaying the results.

---

## ⚠️ Troubleshooting

- **`PRIVATE_KEY not found` Error**: Ensure your `.env` file is correctly named (`.env`, not `env.txt` or similar) and is in the same directory as the script. Also, check that `PRIVATE_KEY=` is correctly set within the file.
- **`Invalid PRIVATE_KEY` Error**: Double-check that the private key in your `.env` file is correct and complete.
- **API Errors (e.g., 403, 503, 504)**:
  - `403 Forbidden`: The API might be blocking the script. The script includes common browser headers to try and mitigate this, but advanced blocking might still occur.
  - `503 Service Unavailable` / `504 Gateway Timeout`: These usually indicate a temporary issue on the LayerEdge API server-side. Try running the script again later.
- **RPC Errors**: Ensure the `RPC_URL` in the script is correct and accessible. The default `https://rpc.layeredge.io/` should work, but network issues or RPC provider downtime can occur.
- **"Cannot read properties of undefined" (related to `ethers`)**: This usually means there's an issue with your `ethers.js` installation or version compatibility. Ensure you've run `npm install ethers` and that the script is using syntax compatible with your installed version (the provided script is designed for `ethers` v6).

---

## Disclaimer

- This script is provided as-is for educational and informational purposes.
- **Always handle your private keys with extreme caution.** Ensure your environment is secure. The script reads the private key locally and uses it to derive your address; it does not send your private key over the internet.
- The accuracy of the airdrop information depends entirely on the LayerEdge API and the data it provides.
- The interpretation of the on-chain status depends on the specific function of the smart contract being called.

---
