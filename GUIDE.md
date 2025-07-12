
# Farnect: From Development to Live on Farcaster

This document provides a comprehensive, step-by-step guide to deploy your Farnect application, implement a live leaderboard, integrate onchain payments, and monitor its performance.

**IMPORTANT: Follow these parts in order.** Each part builds upon the previous one. Attempting them out of sequence will lead to errors.

---

## Part 1: Deployment & Farcaster Frame Setup

This part gets your application live on the internet so Farcaster and the world can see it.

### Step 1.1: Push Project to GitHub

Vercel (our hosting service) works by connecting to a GitHub repository.

1.  **Initialize Git:** If you haven't already, open a terminal in your project's root directory and run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```

2.  **Create a GitHub Repository:** Go to [GitHub](https://github.com) and create a new, empty repository. Do **not** initialize it with a README or .gitignore.

3.  **Link and Push:** GitHub will give you commands to link your local project. They will look like this:
    ```bash
    # Replace the URL with your repository's URL
    git remote add origin https://github.com/your-username/your-repo-name.git
    git branch -M main
    git push -u origin main
    ```
    Your code is now on GitHub.

### Step 1.2: Host Your Application with Vercel

1.  **Sign up for Vercel:** Use your GitHub account to sign up for a free Vercel account.
2.  **Import Project:** In your Vercel dashboard, click **Add New... -> Project**.
3.  Choose **Continue with Git Provider** and select your Farnect GitHub repository. Vercel will automatically detect that it's a Vite project and set up the correct build settings.
4.  **Configure Environment Variables:** This is a critical step.
    *   Expand the **Environment Variables** section.
    *   Add a new variable with the name `API_KEY`.
    *   Paste your Gemini API key as the value.
    *   Click **Add**.
5.  **Deploy:** Click the **Deploy** button. Vercel will build and deploy your site. When it's done, you will get a public URL (e.g., `farnect-app.vercel.app`).

### Step 1.3: Update `index.html` for Farcaster Frame

Now that you have your live Vercel URL, you must tell your Farcaster Frame where to point.

1.  **Edit `index.html`:** Open `index.html` in your project. Find the `<meta>` tags and replace the placeholder URLs with your final Vercel URL.
    ```html
    <!-- TODO: Update these URLs with your final Vercel URL -->
    <meta property="fc:frame:button:1:target" content="https://farnect-app.vercel.app" />
    <!-- You also need to create and host images for the following tags -->
    <meta property="og:image" content="https://farnect-app.vercel.app/farnect-og.png" />
    <meta property="fc:frame:image" content="https://farnect-app.vercel.app/farnect-frame.png" />
    ```
2.  **Redeploy:** Commit and push this change to GitHub. Vercel will automatically see the update and redeploy your site.
    ```bash
    git add index.html
    git commit -m "Update frame target URL"
    git push
    ```

You can now post your Vercel URL on Farcaster to test the Frame.

---

## Part 2: Live Leaderboard with Supabase

Let's replace the mock leaderboard with a real database.

### Step 2.1: Set up Supabase Database

1.  Create a free account at [supabase.com](https://supabase.com).
2.  Create a new project.
3.  Go to the **Table Editor** and create a new table named `scores`.
4.  Define the columns for the `scores` table exactly as follows:
    *   `id` (int8, is primary key)
    *   `created_at` (timestamptz)
    *   `date` (text) - For the `YYYY-MM-DD` string.
    *   `fid` (int8) - The user's Farcaster ID.
    *   `username` (text)
    *   `time` (int4) - Time in seconds.
    *   `mistakes` (int4)

### Step 2.2: Set Up Security with Row Level Security (RLS)

By default, anyone can read or write to your database. We need to lock this down.

1.  In Supabase, go to **Authentication -> Policies**.
2.  Find your `scores` table and click **Enable RLS**.
3.  Now, create two policies:
    *   **Allow Public Read Access:** Click "New Policy" -> "Get started quickly". Choose the template **"Enable read access to everyone"**. Review the policy and click "Save". This lets anyone fetch leaderboard scores.
    *   **Allow Public Write Access:** Click "New Policy" -> "Get started quickly". Choose the template **"Enable insert for everyone"**. Review and click "Save". This lets anyone submit a score.
    *   **Security Note:** This setup is for simplicity. A production app should require user authentication to write scores to prevent spam.

### Step 2.3: Add Supabase Credentials to Vercel

1.  In Supabase, go to **Project Settings -> API**.
2.  Find your **Project URL** and your `anon` **public key**.
3.  In your Vercel project's **Settings -> Environment Variables**, add two new variables:
    *   `SUPABASE_URL`: Paste your Project URL.
    *   `SUPABASE_ANON_KEY`: Paste your `anon` public key.
4.  Save. Vercel will trigger a new deployment to apply these variables.

Your leaderboard is now live and secure!

---

## Part 3: Onchain Payments for Hints (In-Depth)

This is the most complex part. We will deploy a smart contract to a **Testnet** (a free testing blockchain) and then connect our app to it.

### Step 3.A: Create the Smart Contract with Remix

We will use **Remix**, a web-based tool for writing and deploying smart contracts.

1.  **Open Remix:** Go to [remix.ethereum.org](https://remix.ethereum.org).
2.  **Create File:** In the File Explorer, create a new file named `HintPayer.sol`.
3.  **Paste Code:** Paste the following Solidity code into the file.
    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

    contract HintPayer {
        address public owner;
        IERC20 public acceptedToken;
        uint256 public hintPrice;

        event HintsPurchased(address indexed user, uint256 amount);

        constructor(address _tokenAddress, uint256 _price) {
            owner = msg.sender;
            acceptedToken = IERC20(_tokenAddress);
            hintPrice = _price;
        }

        function payForHints() external {
            bool success = acceptedToken.transferFrom(msg.sender, address(this), hintPrice);
            require(success, "Token transfer failed");

            emit HintsPurchased(msg.sender, hintPrice);
        }
    }
    ```
4.  **Compile:**
    *   Go to the **Solidity Compiler** tab on the left.
    *   Ensure the compiler version is `0.8.20` or compatible.
    *   Click **Compile HintPayer.sol**. A green checkmark will appear.

### Step 3.B: Deploy to a Testnet

We'll deploy to **Base Sepolia**, the test network for Base.

1.  **Get a Wallet:** You need a browser wallet like MetaMask.
2.  **Get Testnet Funds (Faucet):**
    *   Switch your MetaMask network to **Base Sepolia**.
    *   You need Testnet ETH to pay for gas fees. Get some from a faucet like [https://www.base.org/faucets](https://www.base.org/faucets).
    *   You need Testnet USDC. You can get this from a faucet like [https://coinbase.com/faucets/base-sepolia-usdc-faucet](https://coinbase.com/faucets/base-sepolia-usdc-faucet).
3.  **Deploy from Remix:**
    *   Go to the **Deploy & Run Transactions** tab in Remix.
    *   For **ENVIRONMENT**, select **Injected Provider - MetaMask**. Remix will connect to your wallet.
    *   Under **CONTRACT**, make sure `HintPayer` is selected.
    *   Click the `>` next to **DEPLOY**. This reveals the constructor arguments.
        *   `_tokenAddress`: This is the address of the USDC token on Base Sepolia. Paste: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
        *   `_price`: This is the cost of hints in the smallest unit of the token. USDC has 6 decimals, so for 1 USDC, enter: `1000000`
    *   Click **transact**. MetaMask will pop up. Confirm the transaction.

### Step 3.C: Get Your Contract Address and ABI

1.  **Contract Address:** After deployment, your contract will appear under "Deployed Contracts" in Remix. Click the copy icon to get its address.
2.  **ABI (Application Binary Interface):** Go back to the **Compiler** tab. Below the "Compile" button, you'll find an "ABI" button. Click it to copy the ABI JSON to your clipboard.

### Step 3.D: Update Your Application

1.  **Add Details to App:** Open the `contracts.ts` file in your project. Paste your Contract Address and ABI.
    ```typescript
    // contracts.ts
    // TODO: Replace with your deployed contract's address
    export const hintPayerContractAddress = '0xYourDeployedContractAddress'; 

    // TODO: Replace with your contract's ABI from Remix
    export const hintPayerContractAbi = [ ... ];
    ```
2.  **Redeploy to Vercel:** Commit and push these changes to GitHub. Vercel will build and deploy the new version with onchain payment functionality.

---

## Part 4: Monitoring & Maintaining Your App

### 4.1. User Analytics (Vercel Analytics)
*   **What to look for:** In your Vercel dashboard, you can see page views, visitor counts, and traffic sources. This helps you understand if your Farcaster posts are driving traffic.

### 4.2. Performance Monitoring (Lighthouse)
*   **How:** In Chrome, open your app, right-click -> Inspect -> Lighthouse -> Analyze page load.
*   **What to look for:** Pay attention to the "Performance" score. It will give you specific advice, like compressing images or reducing JavaScript size, to make your app load faster.

### 4.3. Error Tracking (Sentry)
*   **How:** Sign up at Sentry.io, create a "React" project, and add their code snippet to your `index.tsx`.
*   **What to look for:** Sentry will email you when your app crashes for a real user. The dashboard shows which errors are most common so you can prioritize fixes. For example, you might see many errors from the Gemini API, indicating a problem with your prompts or API key.
