import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain, zeroAddress, type Address } from "viem";

const useBlockchainValue = import.meta.env.VITE_USE_BLOCKCHAIN ?? "false";
const chainIdValue = import.meta.env.VITE_GRIDWITNESS_CHAIN_ID ?? "31337";
const contractAddressValue = import.meta.env.VITE_GRIDWITNESS_CONTRACT_ADDRESS ?? "";
const rpcUrlValue = import.meta.env.VITE_GRIDWITNESS_RPC_URL ?? "http://127.0.0.1:8545";

export const blockchainEnabled = useBlockchainValue === "true";
export const gridWitnessChainId = Number(chainIdValue);
export const gridWitnessContractAddress = (
  contractAddressValue && contractAddressValue !== "0x0000000000000000000000000000000000000000"
    ? contractAddressValue
    : zeroAddress
) as Address;
export const gridWitnessContractConfigured = gridWitnessContractAddress !== zeroAddress;

export const gridWitnessChain = defineChain({
  id: gridWitnessChainId,
  name: import.meta.env.VITE_GRIDWITNESS_CHAIN_NAME ?? "GridWitness Local",
  nativeCurrency: {
    name: import.meta.env.VITE_GRIDWITNESS_NATIVE_CURRENCY_NAME ?? "Ether",
    symbol: import.meta.env.VITE_GRIDWITNESS_NATIVE_CURRENCY_SYMBOL ?? "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [rpcUrlValue] },
  },
});

export const gridWitnessAbi = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "REWARD_PER_ACCURATE_REPORT",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "finalizeRound",
    inputs: [{ name: "roundId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getMeter",
    inputs: [{ name: "meterId", type: "string", internalType: "string" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct GridWitness.Meter",
        components: [
          { name: "owner", type: "address", internalType: "address" },
          { name: "location", type: "string", internalType: "string" },
          { name: "registered", type: "bool", internalType: "bool" },
          { name: "rewardPoints", type: "uint256", internalType: "uint256" },
          { name: "totalReports", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getOutageParticipantMeters",
    inputs: [{ name: "outageId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "string[]", internalType: "string[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getReport",
    inputs: [
      { name: "roundId", type: "uint256", internalType: "uint256" },
      { name: "meterId", type: "string", internalType: "string" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct GridWitness.Report",
        components: [
          { name: "meterId", type: "string", internalType: "string" },
          { name: "reporter", type: "address", internalType: "address" },
          { name: "location", type: "string", internalType: "string" },
          { name: "status", type: "uint8", internalType: "enum GridWitness.PowerStatus" },
          { name: "timestamp", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRound",
    inputs: [{ name: "roundId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct GridWitness.RoundSummary",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "location", type: "string", internalType: "string" },
          { name: "reportCount", type: "uint256", internalType: "uint256" },
          { name: "powerOffCount", type: "uint256", internalType: "uint256" },
          { name: "powerOnCount", type: "uint256", internalType: "uint256" },
          { name: "consensusPercentage", type: "uint256", internalType: "uint256" },
          { name: "majorityStatus", type: "uint8", internalType: "enum GridWitness.PowerStatus" },
          { name: "finalized", type: "bool", internalType: "bool" },
          { name: "outageVerified", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRoundParticipantMeters",
    inputs: [{ name: "roundId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "string[]", internalType: "string[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVerifiedOutage",
    inputs: [{ name: "outageId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct GridWitness.VerifiedOutage",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "roundId", type: "uint256", internalType: "uint256" },
          { name: "location", type: "string", internalType: "string" },
          { name: "startTime", type: "uint256", internalType: "uint256" },
          { name: "consensusPercentage", type: "uint256", internalType: "uint256" },
          { name: "participatingMeters", type: "string[]", internalType: "string[]" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasSubmitted",
    inputs: [
      { name: "roundId", type: "uint256", internalType: "uint256" },
      { name: "meterId", type: "string", internalType: "string" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "outageCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "registerMeter",
    inputs: [
      { name: "meterId", type: "string", internalType: "string" },
      { name: "meterOwner", type: "address", internalType: "address" },
      { name: "location", type: "string", internalType: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitReport",
    inputs: [
      { name: "roundId", type: "uint256", internalType: "uint256" },
      { name: "meterId", type: "string", internalType: "string" },
      { name: "status", type: "uint8", internalType: "enum GridWitness.PowerStatus" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ConsensusReached",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "location", type: "string", indexed: false, internalType: "string" },
      {
        name: "majorityStatus",
        type: "uint8",
        indexed: false,
        internalType: "enum GridWitness.PowerStatus",
      },
      { name: "consensusPercentage", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "reportCount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "MeterRegistered",
    inputs: [
      { name: "meterId", type: "string", indexed: true, internalType: "string" },
      { name: "owner", type: "address", indexed: true, internalType: "address" },
      { name: "location", type: "string", indexed: false, internalType: "string" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OutageVerified",
    inputs: [
      { name: "outageId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "roundId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "location", type: "string", indexed: false, internalType: "string" },
      { name: "startTime", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "consensusPercentage", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ReportSubmitted",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "meterId", type: "string", indexed: true, internalType: "string" },
      { name: "reporter", type: "address", indexed: true, internalType: "address" },
      { name: "location", type: "string", indexed: false, internalType: "string" },
      {
        name: "status",
        type: "uint8",
        indexed: false,
        internalType: "enum GridWitness.PowerStatus",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RewardIssued",
    inputs: [
      { name: "meterId", type: "string", indexed: true, internalType: "string" },
      { name: "owner", type: "address", indexed: true, internalType: "address" },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
] as const;

export const gridWitnessContract = {
  address: gridWitnessContractAddress,
  abi: gridWitnessAbi,
} as const;

export const wagmiConfig = createConfig({
  chains: [gridWitnessChain],
  connectors: [injected()],
  transports: {
    [gridWitnessChain.id]: http(rpcUrlValue),
  },
  ssr: true,
});
