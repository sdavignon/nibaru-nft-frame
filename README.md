# Mothership Nibaru – NFT + Warpcast Frame

ERC-721 on **Base** + a **Warpcast Frame** mini-app that lets users mint in-app.

## Structure
- `contracts/` → `NibaruTicket.sol` (ERC721 + ERC2981)
- `scripts/` → Hardhat deploy
- `server/` → Express app with Frame endpoints
- `metadata/` → IPFS-ready example JSON

## Quickstart
```bash
pnpm i
npx hardhat compile
# optional local chain: npx hardhat node
# deploy to Base Sepolia:
npx hardhat run scripts/deploy.js --network baseSepolia

cd server
pnpm i
pnpm start
```

## Env (server/.env)
```
RPC_URL=
PRIVATE_KEY=
CONTRACT_ADDRESS=
NETWORK=base-sepolia
FARCASTER_HUB_URL=https://hub.farcaster.xyz
```
