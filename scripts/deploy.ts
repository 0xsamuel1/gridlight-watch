import { network } from "hardhat";

const connection = await network.create();
const { ethers } = connection;
const networkInfo = await ethers.provider.getNetwork();

if (connection.networkName === "hskMainnet") {
  if (networkInfo.chainId !== 177n) {
    throw new Error(`Refusing mainnet deploy: expected chain ID 177, got ${networkInfo.chainId}`);
  }

  if (process.env.CONFIRM_MAINNET_DEPLOY !== "GRIDWITNESS_MAINNET") {
    throw new Error(
      "Refusing mainnet deploy: set CONFIRM_MAINNET_DEPLOY=GRIDWITNESS_MAINNET to confirm.",
    );
  }
}

const gridWitness = await ethers.deployContract("GridWitness");
await gridWitness.waitForDeployment();

const address = await gridWitness.getAddress();

console.log(`GridWitness deployed to ${address}`);
console.log(`Network: ${connection.networkName}`);
console.log(`Chain ID: ${networkInfo.chainId}`);
