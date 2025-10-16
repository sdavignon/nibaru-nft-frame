import { execSync } from 'node:child_process';

const addr = process.env.CONTRACT_ADDRESS;
const name = process.env.NAME || 'Mothership Nibaru Ticket';
const symbol = process.env.SYMBOL || 'NIBARU';
const baseURI = process.env.BASE_URI || 'ipfs://YOUR_METADATA_CID/';
const bps = process.env.ROYALTY_BPS || '500';
const max = process.env.MAX_SUPPLY || '777';
const root = process.env.MERKLE_ROOT || '';

if (!addr) {
  console.error('Missing CONTRACT_ADDRESS in env');
  process.exit(1);
}

const cmd = root
  ? `npx hardhat verify --network baseSepolia ${addr} "${name}" "${symbol}" "${baseURI}" ${bps} ${max} ${root}`
  : `npx hardhat verify --network baseSepolia ${addr} "${name}" "${symbol}" "${baseURI}" ${bps} ${max}`;

console.log('Verifying with command:\n', cmd);
try {
  execSync(cmd, { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}
