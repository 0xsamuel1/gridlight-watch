import { useState } from "react";
import { Check, ChevronDown, Copy, LogOut, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGrid } from "@/lib/grid-store";
import { shortHash } from "@/lib/mock-data";

/**
 * Simulated wallet connection.
 * INTEGRATION NOTE: swap the store calls for wagmi's `useConnect` /
 * `useDisconnect` and read the live chain id from HSK Chain.
 */
export function WalletButton({ compact = false }: { compact?: boolean }) {
  const {
    walletConnected,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    address,
    chainName,
    blockchainEnabled,
    contractConfigured,
    isWrongNetwork,
    txStatus,
    txMessage,
  } = useGrid();
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleConnect() {
    setConnecting(true);
    try {
      await connectWallet();
      toast.success(blockchainEnabled ? "Wallet connected" : "Wallet connected", {
        description: `${shortHash(address)} on ${chainName}`,
      });
    } catch (error) {
      toast.error(
        txStatus === "rejected" ? "Wallet request rejected" : "Wallet connection failed",
        {
          description: error instanceof Error ? error.message : txMessage,
        },
      );
    } finally {
      setConnecting(false);
    }
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy the address");
    }
  }

  if (!walletConnected) {
    return (
      <Button onClick={handleConnect} disabled={connecting} size={compact ? "sm" : "default"}>
        <Wallet className="h-4 w-4" />
        {connecting ? "Connecting…" : blockchainEnabled ? "Connect Wallet" : "Connect Demo Wallet"}
      </Button>
    );
  }

  if (blockchainEnabled && isWrongNetwork) {
    return (
      <Button
        variant="outline"
        size={compact ? "sm" : "default"}
        onClick={async () => {
          try {
            await switchNetwork();
            toast.success(`Switched to ${chainName}`);
          } catch (error) {
            toast.error("Network switch failed", {
              description: error instanceof Error ? error.message : undefined,
            });
          }
        }}
      >
        Switch Network
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={compact ? "sm" : "default"} aria-label="Wallet menu">
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
          <span className="font-mono text-xs">{shortHash(address, 6, 4)}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-1">
          <span className="block text-xs font-normal text-muted-foreground">Connected to</span>
          <span className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
            {chainName}
          </span>
          {blockchainEnabled && !contractConfigured && (
            <span className="block text-xs font-normal text-danger">Contract address missing</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={copyAddress}>
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          <span className="font-mono text-xs">{shortHash(address, 10, 6)}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            void disconnectWallet();
            toast("Wallet disconnected");
          }}
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
