require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const { RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    baseSepolia: {
      url: RPC_URL || "https://sepolia.base.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  etherscan: { apiKey: { base: "EMPTY", baseSepolia: "EMPTY" } }
};
