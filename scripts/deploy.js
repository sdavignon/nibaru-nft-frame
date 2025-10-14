const hre = require("hardhat");

async function main() {
  const NAME = "Mothership Nibaru Ticket";
  const SYMBOL = "NIBARU";
  const BASE_URI = "ipfs://YOUR_METADATA_CID/";
  const ROYALTY_BPS = 500;  // 5%
  const MAX_SUPPLY = 777;

  const Factory = await hre.ethers.getContractFactory("NibaruTicket");
  const nft = await Factory.deploy(NAME, SYMBOL, BASE_URI, ROYALTY_BPS, MAX_SUPPLY);
  await nft.waitForDeployment();

  const addr = await nft.getAddress();
  console.log("Deployed NibaruTicket to:", addr);
}

main().catch((e) => { console.error(e); process.exit(1); });
