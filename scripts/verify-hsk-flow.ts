import { network } from "hardhat";

const contractAddress =
  process.env.VITE_CONTRACT_ADDRESS ?? process.env.VITE_GRIDWITNESS_CONTRACT_ADDRESS;

if (!contractAddress) {
  throw new Error("Set VITE_CONTRACT_ADDRESS to the deployed GridWitness contract address");
}

const connection = await network.create();
const { ethers } = connection;
const [signer] = await ethers.getSigners();
const gridWitness = await ethers.getContractAt("GridWitness", contractAddress, signer);

const expectedChainId = 133n;
const networkInfo = await ethers.provider.getNetwork();
if (networkInfo.chainId !== expectedChainId) {
  throw new Error(`Expected chain ID ${expectedChainId}, got ${networkInfo.chainId}`);
}

const owner = await gridWitness.owner();
if (owner.toLowerCase() !== signer.address.toLowerCase()) {
  throw new Error(`Connected signer ${signer.address} is not the contract owner ${owner}`);
}

const meters = [
  { id: "GW-YB-001", label: "Meter A", status: 0 },
  { id: "GW-YB-002", label: "Meter B", status: 0 },
  { id: "GW-YB-003", label: "Meter C", status: 1 },
] as const;
const location = "Yaba";
const roundId = BigInt(Date.now());

console.log(`Network: ${connection.networkName} (${networkInfo.chainId})`);
console.log(`Contract: ${contractAddress}`);
console.log(`Signer: ${signer.address}`);
console.log(`Round: ${roundId}`);

for (const meter of meters) {
  const current = await gridWitness.getMeter(meter.id);
  if (!current.registered) {
    const tx = await gridWitness.registerMeter(meter.id, signer.address, location);
    await tx.wait();
    console.log(`${meter.label} registered: ${tx.hash}`);
  } else {
    console.log(`${meter.label} already registered`);
  }
}

for (const meter of meters) {
  const tx = await gridWitness.submitReport(roundId, meter.id, meter.status);
  await tx.wait();
  console.log(`${meter.label} submitted Power ${meter.status === 0 ? "OFF" : "ON"}: ${tx.hash}`);
}

const finalizeTx = await gridWitness.finalizeRound(roundId);
await finalizeTx.wait();
console.log(`Consensus finalized: ${finalizeTx.hash}`);

const round = await gridWitness.getRound(roundId);
const outageCount = await gridWitness.outageCount();
const outage = await gridWitness.getVerifiedOutage(outageCount);
const meterA = await gridWitness.getMeter("GW-YB-001");
const meterB = await gridWitness.getMeter("GW-YB-002");
const meterC = await gridWitness.getMeter("GW-YB-003");

console.log(`Consensus: ${round.consensusPercentage}%`);
console.log(`Outage verified: ${round.outageVerified}`);
console.log(`Outage location: ${outage.location}`);
console.log(`Outage consensus: ${outage.consensusPercentage}%`);
console.log(`Meter A rewards: ${meterA.rewardPoints}`);
console.log(`Meter B rewards: ${meterB.rewardPoints}`);
console.log(`Meter C rewards: ${meterC.rewardPoints}`);
