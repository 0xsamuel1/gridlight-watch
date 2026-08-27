import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

interface GridContextValue extends PersistedState {
  stats: GridStats;
  address: string;
  chainName: string;
  hydrated: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  claimRewards: () => number;
  submitReport: (meterId: string, location: string, status: MeterStatus, time: string) => void;
  runConsensus: (location: string) => {
    consensus: number;
    verified: boolean;
    outageId: string;
    hash: string;
    rewarded: string[];
  };
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
      address: WALLET_ADDRESS,
      chainName: CHAIN_NAME,
      connectWallet,
      disconnectWallet,
      claimRewards,
      submitReport,
      runConsensus,
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

export function useGrid() {
  const ctx = useContext(GridContext);
  if (!ctx) throw new Error("useGrid must be used inside <GridProvider>");
  return ctx;
}
