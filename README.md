# Nibaru NFT Frame 🎫

A **Farcaster Frame** integration for minting NFTs on **Base Sepolia** with allowlist support, automated deployment, and verification workflows.

## 🌟 Features

- **ERC721 NFT Contract** with ERC2981 royalty support
- **Merkle Tree Allowlist** for exclusive/discounted mints
- **Public & Allowlist Minting** with configurable pricing
- **Automated CI/CD Pipeline** via GitHub Actions
- **One-Click Deployment** to Base Sepolia testnet
- **Automatic Contract Verification** on Basescan
- **Farcaster Frame Integration** with customizable buttons
- **Owner-Only Frame Routes** for administrative access

## 🛠️ Tech Stack

- **Smart Contracts**: Solidity ^0.8.24, OpenZeppelin
- **Development**: Hardhat, Ethers.js v6
- **Network**: Base Sepolia (Testnet)
- **CI/CD**: GitHub Actions
- **Verification**: Basescan API
- **Frame**: Farcaster Frames SDK

## 📋 Prerequisites

- Node.js v18+ and pnpm (or npm)
- A Base Sepolia RPC URL (e.g., from [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/))
- A wallet with testnet ETH on Base Sepolia
- A GitHub account with repository admin access
- A Basescan API key (get one at [Basescan](https://sepolia.basescan.org/))

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/sdavignon/nibaru-nft-frame.git
cd nibaru-nft-frame

# Install dependencies
pnpm install

# or with npm
npm install
```

### 2. Environment Setup

Create a `.env` file in the project root:

```env
# Network Configuration
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_deployer_private_key_here

# Contract Verification
BASESCAN_API_KEY=your_basescan_api_key_here

# Contract Configuration
CONTRACT_NAME="Mothership Nibaru Ticket"
CONTRACT_SYMBOL=NIBARU
BASE_URI=ipfs://YOUR_CID/
ROYALTY_BPS=500
MAX_SUPPLY=777

# Allowlist (optional - for allowlist-enabled contracts)
MERKLE_ROOT=0x0000000000000000000000000000000000000000000000000000000000000000
```

### 3. Local Deployment

```bash
# Compile contracts
npx hardhat compile

# Deploy to Base Sepolia
node scripts/deploy-and-record.js

# Verify contract (auto-detect constructor based on MERKLE_ROOT)
node scripts/verify-autofill.js
```

## 🤖 Automated Workflows

This project includes two GitHub Actions workflows for seamless deployment and verification.

### Deploy Workflow

**Trigger**: Manual (workflow_dispatch)  
**File**: `.github/workflows/deploy-sepolia.yml`

**What it does**:
1. Compiles the smart contract
2. Deploys to Base Sepolia
3. Automatically saves the contract address as a repository variable
4. Triggers verification workflow

**Usage**:
1. Go to **Actions** tab in your GitHub repository
2. Select **"Deploy to Base Sepolia"**
3. Click **"Run workflow"**
4. Enter contract parameters (or use repository variables)
5. Click **"Run workflow"** to start deployment

### Verify Workflow

**Trigger**: Auto (on push to main) or Manual  
**File**: `.github/workflows/verify-base-sepolia.yml`

**What it does**:
1. Automatically detects contract type (standard vs allowlist)
2. Verifies the contract on Basescan
3. Provides verification status and link

## ⚙️ GitHub Configuration

### Required Secrets

Configure these in **Settings > Secrets and variables > Actions > Secrets**:

| Secret Name | Description |
|------------|-------------|
| `BASE_SEPOLIA_RPC_URL` | Your Base Sepolia RPC endpoint |
| `DEPLOYER_PRIVATE_KEY` | Private key for contract deployment |
| `BASESCAN_API_KEY` | API key for contract verification |
| `REPO_ADMIN_TOKEN` | GitHub Personal Access Token with `repo` scope |

### Required Variables

Configure these in **Settings > Secrets and variables > Actions > Variables**:

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `CONTRACT_NAME` | NFT collection name | "Mothership Nibaru Ticket" |
| `CONTRACT_SYMBOL` | Token symbol | "NIBARU" |
| `BASE_URI` | Token metadata URI | "ipfs://QmXXX/" |
| `ROYALTY_BPS` | Royalty basis points (500 = 5%) | "500" |
| `MAX_SUPPLY` | Maximum token supply | "777" |
| `MERKLE_ROOT` | Merkle root for allowlist (optional) | "0x..." |

> **Note**: The `CONTRACT_ADDRESS` variable is automatically created/updated by the deploy workflow.

## 🎭 Allowlist Configuration

### Generate Allowlist

1. Edit `allowlist.json` with wallet addresses:

```json
[
  "0x1234567890123456789012345678901234567890",
  "0xABCDEF1234567890ABCDEF1234567890ABCDEF12"
]
```

2. Generate the Merkle root:

```bash
# Install dependencies if needed
pnpm add merkletreejs keccak256

# Generate root
node scripts/generateAllowlist.js
```

3. Copy the printed Merkle root and add it to your `.env` file or GitHub Variables as `MERKLE_ROOT`

### Update Merkle Root (Post-Deployment)

```bash
node scripts/setMerkleRoot.js <CONTRACT_ADDRESS> <NEW_MERKLE_ROOT>
```

## 📁 Project Structure

```
nibaru-nft-frame/
├── .github/
│   └── workflows/
│       ├── deploy-sepolia.yml      # Automated deployment workflow
│       └── verify-base-sepolia.yml # Automated verification workflow
├── contracts/
│   └── NibaruTicketAllowlist.sol   # ERC721 + Merkle allowlist contract
├── scripts/
│   ├── deploy-and-record.js        # Deploy + save address to GitHub
│   ├── verify-autofill.js          # Auto-detect verification
│   ├── generateAllowlist.js        # Generate Merkle root
│   ├── setMerkleRoot.js            # Update on-chain Merkle root
│   └── verify.js                   # Manual verification helper
├── server/
│   ├── app.frame-buttons-snippet.js  # Farcaster Frame button config
│   └── app.owner-frame-snippet.js    # Owner-only Frame routes
├── allowlist.json                  # Allowlist wallet addresses
├── hardhat.config.js               # Hardhat configuration
├── package.json                    # Project dependencies
└── README.md                       # This file
```

## 🔧 Scripts Reference

### Deployment

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy-and-record.js` | Deploy contract and save address to GitHub | `node scripts/deploy-and-record.js` |

### Verification

| Script | Purpose | Usage |
|--------|---------|-------|
| `verify-autofill.js` | Auto-detect constructor and verify | `node scripts/verify-autofill.js` |
| `verify.js` | Manual verification with custom params | `node scripts/verify.js <address> <args...>` |

### Allowlist Management

| Script | Purpose | Usage |
|--------|---------|-------|
| `generateAllowlist.js` | Generate Merkle root from allowlist.json | `node scripts/generateAllowlist.js` |
| `setMerkleRoot.js` | Update Merkle root on deployed contract | `node scripts/setMerkleRoot.js <address> <root>` |

## 🎨 Contract Features

### NibaruTicketAllowlist.sol

**Minting Functions**:
- `mintPublic(uint256 qty)` - Public mint (when enabled)
- `mintAllowlist(uint256 qty, bytes32[] proof)` - Allowlist mint with Merkle proof

**Admin Functions**:
- `setBaseURI(string uri)` - Update metadata URI
- `setPrices(uint256 publicWei, uint256 allowWei)` - Update mint prices
- `setSaleStates(bool public, bool allow)` - Enable/disable sales
- `setAllowlistRoot(bytes32 root)` - Update allowlist Merkle root
- `setMaxPerWallet(uint256 n)` - Set per-wallet mint limit
- `setRoyalty(address receiver, uint96 bps)` - Configure royalties
- `withdraw(address payable to)` - Withdraw contract balance

**Default Configuration**:
- Public mint price: 0.01 ETH
- Allowlist mint price: FREE
- Max per wallet: 3 tokens
- Public sale: OFF by default
- Allowlist sale: ON by default

## 🔍 Verification

### Automatic Verification

The verify workflow automatically runs after deployment and intelligently detects whether you deployed a standard or allowlist-enabled contract.

### Manual Verification

```bash
# Standard contract (no allowlist)
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> \
  "Mothership Nibaru Ticket" "NIBARU" "ipfs://CID/" 500 777

# Allowlist contract (with Merkle root)
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> \
  "Mothership Nibaru Ticket" "NIBARU" "ipfs://CID/" 500 777 <MERKLE_ROOT>
```

## 🖼️ Farcaster Frame Integration

### Add "Mint on Site" Button

Integrate the Frame button snippet into your existing `server/app.js`:

```javascript
// Add to your Frame response
const frameButtons = [
  {
    label: "Mint Now",
    action: "post"
  },
  {
    label: "Mint on Site",
    action: "link",
    target: "https://your-minting-site.com"
  }
];
```

See `server/app.frame-buttons-snippet.js` for complete implementation.

### Owner-Only Frame Routes

Add administrative Frame routes for owner-specific actions:

```javascript
// Merge server/app.owner-frame-snippet.js into your server/app.js
app.get('/owner', async (req, res) => {
  // Owner-only Frame interface
});
```

## 🧪 Testing

```bash
# Compile contracts
npx hardhat compile

# Run tests (if test files exist)
npx hardhat test

# Test deployment on local network
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy-and-record.js --network localhost
```

## 📚 Additional Resources

- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet) - Get testnet ETH
- [Hardhat Documentation](https://hardhat.org/docs) - Development environment
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts) - Smart contract library
- [Farcaster Frames](https://docs.farcaster.xyz/developers/frames) - Frame development guide
- [Basescan](https://sepolia.basescan.org/) - Block explorer and verification

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

**MiniMax Agent**

---

**Need Help?**
- Check the [Additional Documentation](README-ADDONS.md) for advanced features
- Review the [GitHub Actions logs](../../actions) for deployment debugging
- Verify your configuration in `.env` and GitHub Secrets/Variables

🚀 Happy minting!
