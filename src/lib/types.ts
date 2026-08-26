export type PowerState = "on" | "outage" | "conflict" | "predicted" | "unknown";

export type MeterStatus = "on" | "off";

export interface Neighbourhood {
  id: string;
  name: string;
  lga: string;
  lat: number;
  lng: number;
  state: PowerState;
  meters: number;
  consensus: number;
  reliability: number;
  outageStart?: string;
  predictedRestoration?: string;
  lastBlock: number;
  txHash: string;
}

export interface Meter {
  id: string;
  name: string;
  location: string;
  status: MeterStatus;
  trust: number;
  lastReport: string;
  totalReports: number;
  rewards: number;
  online: boolean;
  owner: string;
  accuracy: number;
  registeredBlock: number;
}

export type OutageStatus = "active" | "pending" | "restored";

export interface Outage {
  id: string;
  area: string;
  status: OutageStatus;
  verified: boolean;
  startTime: string;
  durationMinutes: number;
  reports: number;
  consensus: number;
  prediction: string;
  confidence: number;
  txHash: string;
  block: number;
}

export type TxKind =
  | "meter_registered"
  | "report_submitted"
  | "consensus_reached"
  | "outage_verified"
  | "reward_issued";

export interface ChainTx {
  id: string;
  kind: TxKind;
  label: string;
  detail: string;
  hash: string;
  block: number;
  timestamp: string;
}

export interface MeterReport {
  id: string;
  meterId: string;
  meterName: string;
  location: string;
  status: MeterStatus;
  time: string;
}
