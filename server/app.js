import 'dotenv/config';
import express from 'express';
import { ethers } from 'ethers';

const app = express();
app.use(express.json());

const {
  RPC_URL,
  PRIVATE_KEY,
  CONTRACT_ADDRESS,
  NETWORK = "base-sepolia"
} = process.env;

const provider = RPC_URL ? new ethers.JsonRpcProvider(RPC_URL) : null;
const wallet = (provider && PRIVATE_KEY) ? new ethers.Wallet(PRIVATE_KEY, provider) : null;

const ABI = [
  "function priceWei() view returns (uint256)",
  "function mint(uint256 qty) payable"
];

const contract = (provider && CONTRACT_ADDRESS) ? new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet || provider) : null;

// Initial preview
app.get('/frame', async (req, res) => {
  const og = "https://dummyimage.com/1200x630/000/fff&text=Mothership+Nibaru";
  const html = `
  <!doctype html><html><head>
    <meta property="og:title" content="Mothership Nibaru – Passage" />
    <meta property="og:image" content="${og}" />
    <meta name="fc:frame" content="vNext" />
    <meta name="fc:frame:image" content="${og}" />
    <meta name="fc:frame:button:1" content="Mint" />
    <meta name="fc:frame:post_url" content="/frame/confirm" />
  </head></html>`;
  res.set('Content-Type', 'text/html').status(200).send(html);
});

// Confirm step
app.post('/frame/confirm', async (req, res) => {
  let price = "0";
  try {
    if (contract) price = (await contract.priceWei()).toString();
  } catch {}
  const og = "https://dummyimage.com/1200x630/111/eee&text=Confirm+Mint";
  const html = `
  <!doctype html><html><head>
    <meta property="og:title" content="Confirm Mint" />
    <meta property="og:image" content="${og}" />
    <meta name="fc:frame" content="vNext" />
    <meta name="fc:frame:image" content="${og}" />
    <meta name="fc:frame:button:1" content="Approve & Mint" />
    <meta name="fc:frame:post_url" content="/frame/mint" />
    <meta name="fc:frame:state" content="{&quot;qty&quot;:1,&quot;priceWei&quot;:&quot;${price}&quot;}" />
  </head></html>`;
  res.set('Content-Type', 'text/html').status(200).send(html);
});

// Mint (server-relayed demo)
app.post('/frame/mint', async (req, res) => {
  const state = req.headers['x-fc-state'] || '{}';
  let qty = 1, priceWei = "0";
  try {
    const parsed = JSON.parse(state);
    qty = parsed.qty || 1;
    priceWei = parsed.priceWei || "0";
  } catch {}

  let ok = false, txHash = "";
  try {
    if (!wallet || !contract) throw new Error("Server not configured for relayed mints");
    const tx = await contract.connect(wallet).mint(qty, { value: priceWei });
    const receipt = await tx.wait();
    txHash = receipt?.hash || tx?.hash;
    ok = true;
  } catch (e) {
    console.error("Mint error:", e.message);
  }

  const og = ok
    ? "https://dummyimage.com/1200x630/062/fff&text=Mint+Success"
    : "https://dummyimage.com/1200x630/600/fff&text=Mint+Failed";

  const viewUrl = txHash ? `https://basescan.org/tx/${txHash}` : "https://warpcast.com";
  const html = `
  <!doctype html><html><head>
    <meta property="og:title" content="${ok ? "Minted!" : "Mint failed"}" />
    <meta property="og:image" content="${og}" />
    <meta name="fc:frame" content="vNext" />
    <meta name="fc:frame:image" content="${og}" />
    <meta name="fc:frame:button:1" content="View Tx" />
    <meta name="fc:frame:button:1:action" content="link" />
    <meta name="fc:frame:button:1:target" content="${viewUrl}" />
  </head></html>`;
  res.set('Content-Type', 'text/html').status(200).send(html);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Frame server on :${port} (${NETWORK})`));
