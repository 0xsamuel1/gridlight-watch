import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import type { Address, Hash } from "viem";

import {
  blockchainEnabled,
  gridWitnessChain,
  gridWitnessContract,
  gridWitnessContractConfigured,
} from "@/lib/blockchain/gridwitness-contract";
import {
  CHAIN_NAME,
  START_BLOCK,
  WALLET_ADDRESS,
  initialTransactions,
  makeHash,
  meters as baseMeters,
  neighbourhoods as baseNeighbourhoods,
  outages as baseOutages,
  recentReports as baseReports,
} from "./mock-data";
import type { ChainTx, Meter, MeterReport, MeterStatus, Neighbourhood, Outage } from "./types";

/**
 * Demo state container.
 *
 * INTEGRATION NOTE: this replaces what will eventually be
 *  - reads: an indexer / REST API over HSK Chain events
 *  - writes: signed transactions from the connected wallet
 * The public API of this hook (`useGrid`) is intentionally the same shape a
 * real implementation would expose, so swapping the internals is enough.
 */

const STORAGE_KEY = "gridwitness.demo.v1";

export interface GridStats {
  liveMeters: number;
  onlineMeters: number;
  activeOutages: number;
  avgReliability: number;
  rewardsDistributed: number;
}

interface PersistedState {
  meters: Meter[];
  neighbourhoods: Neighbourhood[];
  outages: Outage[];
  transactions: ChainTx[];
  reports: MeterReport[];
  walletConnected: boolean;
  claimedRewards: number;
  availableRewards: number;
  pendingRewards: number;
  lifetimeRewards: number;
  rewardsDistributed: number;
  block: number;
  simulationComplete: boolean;
}

function initialState(): PersistedState {
  return {
    meters: baseMeters,
    neighbourhoods: baseNeighbourhoods,
    outages: baseOutages,
    transactions: initialTransactions,
    reports: baseReports,
    walletConnected: false,
    claimedRewards: 0,
    availableRewards: 640,
    pendingRewards: 120,
    lifetimeRewards: 4655,
    rewardsDistributed: 12480,
    block: START_BLOCK,
    simulationComplete: false,
  };
}

function initialBlockchainState(): PersistedState {
  return {
    ...initialState(),
    outages: [],
    transactions: [],
    reports: [],
    claimedRewards: 0,
    availableRewards: 0,
    pendingRewards: 0,
    lifetimeRewards: 0,
    rewardsDistributed: 0,
    simulationComplete: false,
  };
}

interface GridContextValue extends PersistedState {
  stats: GridStats;
  address: string;
  chainName: string;
  hydrated: boolean;
  blockchainEnabled: boolean;
  contractConfigured: boolean;
  expectedChainId: number;
  currentChainId?: number;
  isWrongNetwork: boolean;
  pendingAction?: string;
  txStatus: "idle" | "pending" | "success" | "rejected" | "failed";
  txMessage?: string;
  connectWallet: () => void | Promise<void>;
  disconnectWallet: () => void | Promise<void>;
  switchNetwork: () => void | Promise<void>;
  claimRewards: () => number | Promise<number>;
  registerMeter: (meterId: string, location: string, meterOwner?: Address) => Promise<void>;
  submitReport: (
    meterId: string,
    location: string,
    status: MeterStatus,
    time: string,
    roundId?: bigint,
  ) => void | Promise<void>;
  runConsensus: (
    location: string,
    roundId?: bigint,
  ) =>
    | {
        consensus: number;
        verified: boolean;
        outageId: string;
        hash: string;
        rewarded: string[];
      }
    | Promise<{
        consensus: number;
        verified: boolean;
        outageId: string;
        hash: string;
        rewarded: string[];
      }>;
  refreshBlockchainData: () => Promise<void>;
  resetDemo: () => void;
}

const GridContext = createContext<GridContextValue | null>(null);

function nowLabel() {
  return new Date().toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function GridProvider({ children }: { children: ReactNode }) {
  return blockchainEnabled ? (
    <BlockchainGridProvider>{children}</BlockchainGridProvider>
  ) : (
    <MockGridProvider>{children}</MockGridProvider>
  );
}

function MockGridProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  // localStorage is read after mount so SSR and first client render match.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState(), ...(JSON.parse(raw) as PersistedState) });
    } catch {
      /* corrupted demo state — fall back to defaults */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable (private mode) — demo still works in memory */
    }
  }, [state, hydrated]);

  const pushTx = useCallback(
    (tx: Omit<ChainTx, "id" | "block" | "timestamp"> & { blockOffset?: number }) => {
      setState((s) => {
        const block = s.block + 1;
        return {
          ...s,
          block,
          transactions: [
            {
              id: `${block}-${tx.hash.slice(2, 8)}`,
              kind: tx.kind,
              label: tx.label,
              detail: tx.detail,
              hash: tx.hash,
              block,
              timestamp: nowLabel(),
            },
            ...s.transactions,
          ].slice(0, 40),
        };
      });
    },
    [],
  );

  const connectWallet = useCallback(() => {
    // INTEGRATION NOTE: replace with wagmi/viem `connect()` against HSK Chain.
    setState((s) => ({ ...s, walletConnected: true }));
  }, []);

  const disconnectWallet = useCallback(() => {
    setState((s) => ({ ...s, walletConnected: false }));
  }, []);

  const claimRewards = useCallback(() => {
    let claimed = 0;
    setState((s) => {
      claimed = s.availableRewards;
      if (claimed <= 0) return s;
      return {
        ...s,
        availableRewards: 0,
        claimedRewards: s.claimedRewards + claimed,
        lifetimeRewards: s.lifetimeRewards,
      };
    });
    const hash = makeHash(`claim-${Date.now()}`);
    pushTx({
      kind: "reward_issued",
      label: "Reward claimed",
      detail: `${claimed} GRID demo points claimed to ${WALLET_ADDRESS.slice(0, 6)}...`,
      hash,
    });
    return claimed;
  }, [pushTx]);

  const submitReport = useCallback(
    (meterId: string, location: string, status: MeterStatus, time: string) => {
      const meter = baseMeters.find((m) => m.id === meterId);
      const hash = makeHash(`report-${meterId}-${status}-${time}`);
      setState((s) => ({
        ...s,
        reports: [
          {
            id: `${meterId}-${Date.now()}`,
            meterId,
            meterName: meter?.name ?? meterId,
            location,
            status,
            time,
          },
          ...s.reports,
        ].slice(0, 30),
        meters: s.meters.map((m) =>
          m.id === meterId
            ? { ...m, status, lastReport: time, totalReports: m.totalReports + 1 }
            : m,
        ),
      }));
      // INTEGRATION NOTE: this is where a signed `submitReport()` call to the
      // GridWitness contract will be broadcast.
      pushTx({
        kind: "report_submitted",
        label: "Report submitted",
        detail: `${meter?.name ?? meterId} (${meterId}) reported Power ${status === "off" ? "OFF" : "ON"} in ${location}`,
        hash,
      });
    },
    [pushTx],
  );

  const runConsensus = useCallback(
    (location: string) => {
      const relevant = baseMeters.filter((m) => m.location === location).map((m) => m.id);
      let consensus = 0;
      let verified = false;
      const outageId = `OUT-${2300 + Math.floor(Math.random() * 90)}`;
      const hash = makeHash(`consensus-${location}-${Date.now()}`);
      const rewarded: string[] = [];

      setState((s) => {
        const reports = s.reports.filter(
          (r) => r.location === location && relevant.includes(r.meterId),
        );
        const seen = new Set<string>();
        const latest = reports.filter((r) => {
          if (seen.has(r.meterId)) return false;
          seen.add(r.meterId);
          return true;
        });
        const total = latest.length || 1;
        const off = latest.filter((r) => r.status === "off").length;
        consensus = Math.round((off / total) * 100);
        verified = consensus > 50;

        latest.forEach((r) => {
          if ((verified && r.status === "off") || (!verified && r.status === "on")) {
            rewarded.push(r.meterId);
          }
        });

        const startTime = latest[latest.length - 1]?.time ?? nowLabel();
        const outage: Outage = {
          id: outageId,
          area: location,
          status: verified ? "active" : "pending",
          verified,
          startTime,
          durationMinutes: 0,
          reports: total,
          consensus,
          prediction: verified
            ? "Power may return between 4:30 PM and 5:15 PM"
            : "Awaiting neighbourhood consensus before an estimate is issued",
          confidence: verified ? 81 : 42,
          txHash: hash,
          block: s.block + 1,
        };

        return {
          ...s,
          outages: [
            outage,
            ...s.outages.filter((o) => !(o.area === location && o.status !== "restored")),
          ],
          neighbourhoods: s.neighbourhoods.map((n) =>
            n.name === location
              ? {
                  ...n,
                  state: verified ? "outage" : "conflict",
                  consensus,
                  outageStart: startTime,
                  predictedRestoration: verified ? "4:30 PM – 5:15 PM" : undefined,
                  lastBlock: s.block + 1,
                  txHash: hash,
                  reliability: verified ? Math.max(35, n.reliability - 5) : n.reliability,
                }
              : n,
          ),
          meters: s.meters.map((m) => {
            if (!rewarded.includes(m.id)) {
              return relevant.includes(m.id) ? { ...m, trust: Math.max(40, m.trust - 3) } : m;
            }
            return {
              ...m,
              trust: Math.min(99, m.trust + 1),
              rewards: m.rewards + 25,
            };
          }),
          availableRewards: s.availableRewards + rewarded.length * 25,
          lifetimeRewards: s.lifetimeRewards + rewarded.length * 25,
          rewardsDistributed: s.rewardsDistributed + rewarded.length * 25,
          simulationComplete: true,
        };
      });

      // INTEGRATION NOTE: consensus + verification + reward payout will each be
      // separate on-chain events emitted by the GridWitness contract.
      pushTx({
        kind: "consensus_reached",
        label: "Consensus reached",
        detail: `${location} — ${consensus}% agreement across neighbourhood meters`,
        hash: makeHash(`consensus-tx-${location}-${Date.now()}`),
      });
      pushTx({
        kind: verified ? "outage_verified" : "report_submitted",
        label: verified ? "Outage verified" : "Outage pending verification",
        detail: verified
          ? `${location} recorded as a verified outage on ${CHAIN_NAME}`
          : `${location} did not reach the outage threshold`,
        hash,
      });
      if (rewarded.length) {
        pushTx({
          kind: "reward_issued",
          label: "Reward issued",
          detail: `${rewarded.length * 25} GRID demo points issued to ${rewarded.length} accurate meters`,
          hash: makeHash(`reward-${location}-${Date.now()}`),
        });
      }

      return { consensus, verified, outageId, hash, rewarded };
    },
    [pushTx],
  );

  const resetDemo = useCallback(() => setState(initialState()), []);

  const stats = useMemo<GridStats>(() => {
    const activeOutages = state.outages.filter((o) => o.status === "active").length;
    const avg = Math.round(
      state.neighbourhoods.filter((n) => n.reliability > 0).reduce((a, n) => a + n.reliability, 0) /
        Math.max(1, state.neighbourhoods.filter((n) => n.reliability > 0).length),
    );
    return {
      liveMeters: 248,
      onlineMeters: 221,
      activeOutages,
      avgReliability: avg,
      rewardsDistributed: state.rewardsDistributed,
    };
  }, [state.outages, state.neighbourhoods, state.rewardsDistributed]);

  const value = useMemo<GridContextValue>(
    () => ({
      ...state,
      stats,
      hydrated,
      blockchainEnabled: false,
      contractConfigured: false,
      expectedChainId: gridWitnessChain.id,
      currentChainId: undefined,
      isWrongNetwork: false,
      pendingAction: undefined,
      txStatus: "idle",
      txMessage: undefined,
      address: WALLET_ADDRESS,
      chainName: CHAIN_NAME,
      connectWallet,
      disconnectWallet,
      switchNetwork: async () => {},
      claimRewards,
      registerMeter: async () => {},
      submitReport,
      runConsensus,
      refreshBlockchainData: async () => {},
      resetDemo,
    }),
    [
      state,
      stats,
      hydrated,
      connectWallet,
      disconnectWallet,
      claimRewards,
      submitReport,
      runConsensus,
      resetDemo,
    ],
  );

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
}

function isRejected(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /reject|denied|declined|cancel/i.test(message);
}

function toTimeLabel(seconds: bigint) {
  return new Date(Number(seconds) * 1000).toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function txLabel(kind: ChainTx["kind"]) {
  return {
    meter_registered: "Meter registered",
    report_submitted: "Report submitted",
    consensus_reached: "Consensus reached",
    outage_verified: "Outage verified",
    reward_issued: "Reward issued",
  }[kind];
}

function BlockchainGridProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialBlockchainState);
  const [hydrated, setHydrated] = useState(false);
  const [txStatus, setTxStatus] = useState<GridContextValue["txStatus"]>("idle");
  const [txMessage, setTxMessage] = useState<string | undefined>();
  const [pendingAction, setPendingAction] = useState<string | undefined>();
  const activeRounds = useRef<Record<string, bigint>>({});

  const { address, isConnected, chainId } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: gridWitnessChain.id });

  const isWrongNetwork = isConnected && chainId !== gridWitnessChain.id;

  useEffect(() => setHydrated(true), []);

  const pushTx = useCallback(
    (tx: Omit<ChainTx, "id" | "block" | "timestamp"> & { block?: number }) => {
      setState((s) => {
        const block = tx.block ?? s.block + 1;
        return {
          ...s,
          block,
          transactions: [
            {
              id: `${block}-${tx.hash.slice(2, 8)}`,
              kind: tx.kind,
              label: tx.label,
              detail: tx.detail,
              hash: tx.hash,
              block,
              timestamp: nowLabel(),
            },
            ...s.transactions.filter((existing) => existing.hash !== tx.hash),
          ].slice(0, 40),
        };
      });
    },
    [],
  );

  const ensureReady = useCallback(async () => {
    if (!gridWitnessContractConfigured) throw new Error("Contract address is not configured");
    if (!address) throw new Error("Connect a wallet first");
    if (chainId !== gridWitnessChain.id) {
      await switchChainAsync({ chainId: gridWitnessChain.id });
    }
    if (!publicClient) throw new Error("Blockchain client is not ready");
  }, [address, chainId, publicClient, switchChainAsync]);

  const getRoundId = useCallback((location: string, supplied?: bigint) => {
    if (supplied != null) return supplied;
    if (!activeRounds.current[location]) {
      activeRounds.current[location] = BigInt(Math.floor(Date.now() / 1000));
    }
    return activeRounds.current[location];
  }, []);

  const runTransaction = useCallback(
    async (label: string, action: () => Promise<Hash>) => {
      try {
        await ensureReady();
        setPendingAction(label);
        setTxStatus("pending");
        setTxMessage("Waiting for wallet");
        const hash = await action();
        setTxMessage("Transaction submitted");
        await new Promise((resolve) => globalThis.setTimeout(resolve, 250));
        setTxMessage("Confirming");
        const receipt = await publicClient!.waitForTransactionReceipt({ hash });
        if (receipt.status !== "success") throw new Error("Transaction failed on-chain");
        setTxStatus("success");
        setTxMessage("Confirmed");
        return receipt;
      } catch (error) {
        setTxStatus(isRejected(error) ? "rejected" : "failed");
        setTxMessage(
          `${isRejected(error) ? "Rejected" : "Failed"}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        throw error;
      } finally {
        setPendingAction(undefined);
      }
    },
    [ensureReady, publicClient],
  );

  const refreshBlockchainData = useCallback(async () => {
    if (!publicClient || !gridWitnessContractConfigured) return;

    const registeredMeters = await Promise.all(
      baseMeters.map(async (meter) => {
        try {
          const chainMeter = await publicClient.readContract({
            ...gridWitnessContract,
            functionName: "getMeter",
            args: [meter.id],
          });
          const registered = chainMeter.registered;
          if (!registered) return meter;
          return {
            ...meter,
            owner: chainMeter.owner,
            location: chainMeter.location || meter.location,
            rewards: Number(chainMeter.rewardPoints),
            totalReports: Number(chainMeter.totalReports),
            online: true,
          };
        } catch {
          return meter;
        }
      }),
    );

    const outageTotal = await publicClient
      .readContract({ ...gridWitnessContract, functionName: "outageCount" })
      .catch(() => 0n);
    const chainOutages: Outage[] = [];
    for (let i = 1n; i <= outageTotal; i++) {
      const outage = await publicClient
        .readContract({ ...gridWitnessContract, functionName: "getVerifiedOutage", args: [i] })
        .catch(() => null);
      if (!outage || outage.id === 0n) continue;
      chainOutages.push({
        id: `OUT-${outage.id.toString().padStart(4, "0")}`,
        area: outage.location,
        status: "active",
        verified: true,
        startTime: toTimeLabel(outage.startTime),
        durationMinutes: 0,
        reports: outage.participatingMeters.length,
        consensus: Number(outage.consensusPercentage),
        prediction: "On-chain outage verified; AI estimate remains off-chain for now",
        confidence: 0,
        txHash: gridWitnessContract.address,
        block: Number(outage.roundId),
      });
    }

    const eventSpecs = [
      ["MeterRegistered", "meter_registered"] as const,
      ["ReportSubmitted", "report_submitted"] as const,
      ["ConsensusReached", "consensus_reached"] as const,
      ["OutageVerified", "outage_verified"] as const,
      ["RewardIssued", "reward_issued"] as const,
    ];
    const eventGroups = await Promise.all(
      eventSpecs.map(async ([eventName, kind]) => {
        const logs = await publicClient
          .getContractEvents({
            address: gridWitnessContract.address,
            abi: gridWitnessContract.abi,
            eventName,
            fromBlock: 0n,
          })
          .catch(() => []);
        return logs.map((log) => {
          const args = log.args as Record<string, unknown>;
          const detail =
            eventName === "MeterRegistered"
              ? `${String(args.meterId)} registered in ${String(args.location)}`
              : eventName === "ReportSubmitted"
                ? `${String(args.meterId)} submitted ${Number(args.status) === 0 ? "Power OFF" : "Power ON"} in ${String(args.location)}`
                : eventName === "ConsensusReached"
                  ? `${String(args.location)} — ${String(args.consensusPercentage)}% consensus`
                  : eventName === "OutageVerified"
                    ? `${String(args.location)} verified on-chain`
                    : `${String(args.amount)} GRID demo points issued to ${String(args.meterId)}`;
          return {
            id: `${String(log.blockNumber)}-${log.transactionHash}`,
            kind,
            label: txLabel(kind),
            detail,
            hash: log.transactionHash,
            block: Number(log.blockNumber ?? 0n),
            timestamp: "On-chain",
          } satisfies ChainTx;
        });
      }),
    );

    const transactions = eventGroups
      .flat()
      .sort((a, b) => b.block - a.block)
      .slice(0, 40);

    setState((s) => ({
      ...s,
      meters: registeredMeters,
      outages: chainOutages,
      transactions,
      walletConnected: isConnected,
      simulationComplete: chainOutages.length > 0 || s.simulationComplete,
    }));
  }, [isConnected, publicClient]);

  useEffect(() => {
    void refreshBlockchainData();
  }, [refreshBlockchainData]);

  const connectWallet = useCallback(async () => {
    const connector = connectors[0];
    if (!connector) throw new Error("No browser wallet connector found");
    setTxStatus("pending");
    setTxMessage("Waiting for wallet");
    try {
      await connectAsync({ connector, chainId: gridWitnessChain.id });
      setTxStatus("success");
      setTxMessage("Confirmed");
    } catch (error) {
      setTxStatus(isRejected(error) ? "rejected" : "failed");
      setTxMessage(
        `${isRejected(error) ? "Rejected" : "Failed"}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }, [connectAsync, connectors]);

  const disconnectWallet = useCallback(async () => {
    await disconnectAsync();
    setTxStatus("idle");
    setTxMessage(undefined);
  }, [disconnectAsync]);

  const switchNetwork = useCallback(async () => {
    await switchChainAsync({ chainId: gridWitnessChain.id });
  }, [switchChainAsync]);

  const registerMeter = useCallback(
    async (meterId: string, location: string, meterOwner?: Address) => {
      const owner = meterOwner ?? address;
      if (!owner) throw new Error("Connect a wallet before registering a meter");
      const receipt = await runTransaction("Registering meter", () =>
        writeContractAsync({
          ...gridWitnessContract,
          functionName: "registerMeter",
          args: [meterId, owner, location],
        }),
      );
      pushTx({
        kind: "meter_registered",
        label: "Meter registered",
        detail: `${meterId} registered in ${location}`,
        hash: receipt.transactionHash,
        block: Number(receipt.blockNumber),
      });
      await refreshBlockchainData();
    },
    [address, pushTx, refreshBlockchainData, runTransaction, writeContractAsync],
  );

  const submitReport = useCallback(
    async (
      meterId: string,
      location: string,
      status: MeterStatus,
      time: string,
      roundId?: bigint,
    ) => {
      const txRoundId = getRoundId(location, roundId);
      const receipt = await runTransaction("Submitting report", () =>
        writeContractAsync({
          ...gridWitnessContract,
          functionName: "submitReport",
          args: [txRoundId, meterId, status === "off" ? 0 : 1],
        }),
      );
      const meter = baseMeters.find((m) => m.id === meterId);
      setState((s) => ({
        ...s,
        reports: [
          {
            id: `${meterId}-${receipt.transactionHash}`,
            meterId,
            meterName: meter?.name ?? meterId,
            location,
            status,
            time,
          },
          ...s.reports,
        ].slice(0, 30),
      }));
      pushTx({
        kind: "report_submitted",
        label: "Report submitted",
        detail: `${meter?.name ?? meterId} (${meterId}) reported Power ${status === "off" ? "OFF" : "ON"} in ${location}`,
        hash: receipt.transactionHash,
        block: Number(receipt.blockNumber),
      });
      await refreshBlockchainData();
    },
    [getRoundId, pushTx, refreshBlockchainData, runTransaction, writeContractAsync],
  );

  const runConsensus = useCallback(
    async (location: string, roundId?: bigint) => {
      const txRoundId = getRoundId(location, roundId);
      const receipt = await runTransaction("Finalizing consensus", () =>
        writeContractAsync({
          ...gridWitnessContract,
          functionName: "finalizeRound",
          args: [txRoundId],
        }),
      );
      const round = await publicClient!.readContract({
        ...gridWitnessContract,
        functionName: "getRound",
        args: [txRoundId],
      });
      const participants = await publicClient!.readContract({
        ...gridWitnessContract,
        functionName: "getRoundParticipantMeters",
        args: [txRoundId],
      });
      const reports = await Promise.all(
        participants.map((meterId) =>
          publicClient!.readContract({
            ...gridWitnessContract,
            functionName: "getReport",
            args: [txRoundId, meterId],
          }),
        ),
      );
      const rewarded = participants.filter((_, i) => reports[i]?.status === round.majorityStatus);
      const outageId = `ROUND-${txRoundId.toString()}`;
      const consensus = Number(round.consensusPercentage);
      const verified = round.outageVerified;

      pushTx({
        kind: verified ? "outage_verified" : "consensus_reached",
        label: verified ? "Outage verified" : "Consensus reached",
        detail: `${location} — ${consensus}% consensus finalized on-chain`,
        hash: receipt.transactionHash,
        block: Number(receipt.blockNumber),
      });
      setState((s) => ({
        ...s,
        neighbourhoods: s.neighbourhoods.map((n) =>
          n.name === location
            ? {
                ...n,
                state: verified ? "outage" : "on",
                consensus,
                lastBlock: Number(receipt.blockNumber),
                txHash: receipt.transactionHash,
              }
            : n,
        ),
        simulationComplete: true,
      }));
      delete activeRounds.current[location];
      await refreshBlockchainData();
      return {
        consensus,
        verified,
        outageId,
        hash: receipt.transactionHash,
        rewarded: Array.from(rewarded),
      };
    },
    [getRoundId, publicClient, pushTx, refreshBlockchainData, runTransaction, writeContractAsync],
  );

  const claimRewards = useCallback(async () => {
    setTxStatus("success");
    setTxMessage("Rewards are issued automatically by finalizeRound on-chain");
    return state.availableRewards;
  }, [state.availableRewards]);

  const resetDemo = useCallback(() => setState(initialBlockchainState()), []);

  const stats = useMemo<GridStats>(() => {
    const activeOutages = state.outages.filter((o) => o.status === "active").length;
    const avg = Math.round(
      state.neighbourhoods.filter((n) => n.reliability > 0).reduce((a, n) => a + n.reliability, 0) /
        Math.max(1, state.neighbourhoods.filter((n) => n.reliability > 0).length),
    );
    return {
      liveMeters: state.meters.length,
      onlineMeters: state.meters.filter((m) => m.online).length,
      activeOutages,
      avgReliability: avg,
      rewardsDistributed: state.meters.reduce((total, meter) => total + meter.rewards, 0),
    };
  }, [state.meters, state.neighbourhoods, state.outages]);

  const value = useMemo<GridContextValue>(
    () => ({
      ...state,
      stats,
      hydrated,
      walletConnected: isConnected,
      blockchainEnabled: true,
      contractConfigured: gridWitnessContractConfigured,
      expectedChainId: gridWitnessChain.id,
      currentChainId: chainId,
      isWrongNetwork,
      pendingAction,
      txStatus,
      txMessage,
      address: address ?? "",
      chainName: gridWitnessChain.name,
      connectWallet,
      disconnectWallet,
      switchNetwork,
      claimRewards,
      registerMeter,
      submitReport,
      runConsensus,
      refreshBlockchainData,
      resetDemo,
    }),
    [
      address,
      chainId,
      claimRewards,
      connectWallet,
      disconnectWallet,
      hydrated,
      isConnected,
      isWrongNetwork,
      pendingAction,
      refreshBlockchainData,
      registerMeter,
      resetDemo,
      runConsensus,
      state,
      stats,
      submitReport,
      switchNetwork,
      txMessage,
      txStatus,
    ],
  );

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
}

export function useGrid() {
  const ctx = useContext(GridContext);
  if (!ctx) throw new Error("useGrid must be used inside <GridProvider>");
  return ctx;
}
