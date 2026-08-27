import { network } from "hardhat";

const connection = await network.create();
const { ethers } = connection;

const gridWitness = await ethers.deployContract("GridWitness");
await gridWitness.waitForDeployment();

const address = await gridWitness.getAddress();

console.log(`GridWitness deployed to ${address}`);
console.log(`Network: ${connection.networkName}`);
