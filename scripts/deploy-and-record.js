// scripts/deploy-and-record.js
import 'dotenv/config';
import { ethers } from 'ethers';
import https from 'node:https';

const {
  // Chain / deployer
  RPC_URL,
  PRIVATE_KEY,

  // NFT config (defaults are fine to start)
  NAME = 'Mothership Nibaru Ticket',
  SYMBOL = 'NIBARU',
  BASE_URI = 'ipfs://YOUR_METADATA_CID/',
  ROYALTY_BPS = '500',
  MAX_SUPPLY = '777',
  MERKLE_ROOT = '', // if set, deploy allowlist contract

  // GitHub (to write CONTRACT_ADDRESS into repo variables)
  GITHUB_OWNER,          // e.g. 'sdavignon'
  GITHUB_REPO,           // e.g. 'nibaru-nft-frame'
  GH_TOKEN               // PAT or fine-grained token with "Actions: Read/Write" scope
} = process.env;

if (!RPC_URL || !PRIVATE_KEY) {
  console.error('Missing RPC_URL or PRIVATE_KEY');
  process.exit(1);
}
if (!GITHUB_OWNER || !GITHUB_REPO || !GH_TOKEN) {
  console.error('Missing GITHUB_OWNER, GITHUB_REPO, or GH_TOKEN for GitHub variable update');
  process.exit(1);
}

function ghRequest(method, path, bodyObj) {
  const body = bodyObj ? JSON.stringify(bodyObj) : '';
  const options = {
    hostname: 'api.github.com',
    path,
    method,
    headers: {
      'Authorization': `Bearer ${GH_TOKEN}`,
      'User-Agent': 'deploy-and-record-script',
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-GitHub-Api-Version': '2022-11-28'
    }
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : {} });
        } else {
          reject(new Error(`GitHub ${method} ${path} → ${res.statusCode} ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Upsert a repository-level Actions variable
async function upsertRepoVar(name, value) {
  // 1) try GET to see if exists
  try {
    await ghRequest('GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/variables/${encodeURIComponent(name)}`);
    // 2) exists → PATCH
    await ghRequest('PATCH', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/variables/${encodeURIComponent(name)}`, {
      name, value
    });
  } catch {
    // 3) not found → POST create
    await ghRequest('POST', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/variables`, { name, value });
  }
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Choose contract based on MERKLE_ROOT
  const isAllowlist = !!MERKLE_ROOT && MERKLE_ROOT !== '0x' && MERKLE_ROOT !== '0x0';

  // Load factories via Hardhat runtime by requiring compiled artifacts:
  // NOTE: run with: `node --loader ts-node/esm scripts/deploy-and-record.js` if using TS, but here we use JS.
  // We assume you compiled already: `npx hardhat compile`
  const { readFileSync } = await import('node:fs');
  const path = (rel) => new URL(`../artifacts/contracts/${rel}`, import.meta.url);

  const artifactFile = isAllowlist
    ? 'NibaruTicketAllowlist.sol/NibaruTicketAllowlist.json'
    : 'NibaruTicket.sol/NibaruTicket.json';
  const artifact = JSON.parse(readFileSync(path(artifactFile)));

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  let contract;
  if (isAllowlist) {
    console.log('Deploying NibaruTicketAllowlist with:');
    console.log({ NAME, SYMBOL, BASE_URI, ROYALTY_BPS, MAX_SUPPLY, MERKLE_ROOT });
    contract = await factory.deploy(NAME, SYMBOL, BASE_URI, Number(ROYALTY_BPS), Number(MAX_SUPPLY), MERKLE_ROOT);
  } else {
    console.log('Deploying NibaruTicket with:');
    console.log({ NAME, SYMBOL, BASE_URI, ROYALTY_BPS, MAX_SUPPLY });
    contract = await factory.deploy(NAME, SYMBOL, BASE_URI, Number(ROYALTY_BPS), Number(MAX_SUPPLY));
  }

  console.log('Waiting for deployment...');
  const deployed = await contract.waitForDeployment();
  const addr = await deployed.getAddress();
  console.log('Deployed at:', addr);

  console.log('Recording CONTRACT_ADDRESS into GitHub repo variable…');
  await upsertRepoVar('CONTRACT_ADDRESS', addr);

  // (optional) also record BASE_URI / ROYALTY_BPS / MAX_SUPPLY / MERKLE_ROOT if you want CI to pick them up:
  await Promise.all([
    upsertRepoVar('BASE_URI', BASE_URI),
    upsertRepoVar('ROYALTY_BPS', String(ROYALTY_BPS)),
    upsertRepoVar('MAX_SUPPLY', String(MAX_SUPPLY)),
    upsertRepoVar('MERKLE_ROOT', String(MERKLE_ROOT || ''))
  ]);

  console.log('All set. CI verify workflow can now run with the new address.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
