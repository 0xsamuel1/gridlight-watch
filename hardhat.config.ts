import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatNodeTestRunner from "@nomicfoundation/hardhat-node-test-runner";
import { defineConfig } from "hardhat/config";
import "dotenv/config";

const hskAccounts = process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [];

export default defineConfig({
  plugins: [hardhatEthers, hardhatNodeTestRunner],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hskTestnet: {
      type: "http",
      chainType: "l1",
      url: process.env.HSK_RPC_URL ?? "http://127.0.0.1:8545",
      accounts: hskAccounts,
    },
    hskMainnet: {
      type: "http",
      chainType: "l1",
      url: process.env.HSK_MAINNET_RPC_URL ?? "https://mainnet.hsk.xyz",
      accounts: hskAccounts,
    },
  },
});
