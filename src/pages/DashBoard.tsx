import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import * as anchor from "@coral-xyz/anchor";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  DollarSign,
  Users,
  RefreshCcw,
  Clock,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// This is a simple reusable component for the metric cards
const MetricCard = ({ title, value, description, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const wallet = useWallet();
  const [appState, setAppState] = useState("loading"); // 'loading', 'wallet-not-connected', 'dashboard'
  const [accountBalance, setAccountBalance] = useState("Loading...");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Fictional metrics, these would be fetched from a custom on-chain program in a real dApp
  const metrics = [
    {
      title: "Active Users",
      value: "15,450",
      description: "Based on recent activity",
      icon: Users,
    },
    {
      title: "Average Tx Time",
      value: "0.4s",
      description: "Average network confirmation",
      icon: Clock,
    },
    {
      title: "Last Refresh",
      value: "Just now",
      description: "Data last fetched",
      icon: RefreshCcw,
    },
  ];

  const connection = new anchor.web3.Connection(
    anchor.web3.clusterApiUrl("devnet"), // Change to 'mainnet-beta' for production
    "confirmed"
  );

  const fetchBalance = async () => {
    if (wallet.publicKey) {
      try {
        const balance = await connection.getBalance(wallet.publicKey);
        setAccountBalance(`${(balance / anchor.web3.LAMPORTS_PER_SOL).toFixed(4)} SOL`);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setAccountBalance("Error fetching balance");
      }
    }
  };

  const fetchRecentTransactions = async () => {
    if (!wallet.publicKey) return;

    setLoadingTransactions(true);
    try {
      // Step 1: Get the list of transaction signatures for the public key
      const signatures = await connection.getSignaturesForAddress(wallet.publicKey, {
        limit: 10,
      });

      // Step 2: Fetch the full transaction details for each signature
      const transactions = await connection.getParsedTransactions(
        signatures.map((sig) => sig.signature),
        {
          maxSupportedTransactionVersion: 0, // Set to 0 for legacy transactions
        }
      );

      // Step 3: Parse and format the transaction data
      const formattedTransactions = transactions
        .filter(Boolean) // Filter out any null or undefined transactions
        .map((tx) => {
          const signature = tx.transaction.signatures[0];
          const feePayer = tx.transaction.message.accountKeys[0].pubkey;
          const instructions = tx.transaction.message.instructions;

          // Find the SystemProgram transfer instruction to get sender, receiver, and amount
          const transferInstruction = instructions.find(
            (inst) => inst.programId.toBase58() === anchor.web3.SystemProgram.programId.toBase58()
          );

          let from = "N/A";
          let to = "N/A";
          let amount = 0;

          if (transferInstruction) {
            const transferData = transferInstruction.parsed.info;
            from = transferData.source;
            to = transferData.destination;
            amount = transferData.lamports / anchor.web3.LAMPORTS_PER_SOL;
          }

          return {
            signature,
            feePayer: feePayer.toBase58(),
            amount: amount,
            from: from.slice(0, 4) + '...' + from.slice(-4),
            to: to.slice(0, 4) + '...' + to.slice(-4),
            date: new Date(tx.blockTime * 1000).toLocaleDateString(),
            status: tx.meta.err ? "Failed" : "Success",
          };
        });

      setRecentTransactions(formattedTransactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setRecentTransactions([]); // Clear transactions on error
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleRefresh = () => {
    fetchBalance();
    fetchRecentTransactions();
  };

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      setAppState("dashboard");
      handleRefresh(); // Initial fetch on connect
    } else {
      setAppState("wallet-not-connected");
    }
  }, [wallet.connected, wallet.publicKey]);

  // Main rendering logic based on app state
  if (appState === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (appState === "wallet-not-connected") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
          <p className="text-muted-foreground">Please connect your wallet to view the dashboard.</p>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  // Full dashboard view
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <Toaster />
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Here's a summary of your activity on Devnet.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <p className="text-sm text-muted-foreground">Connected as:</p>
            <p className="text-base font-medium">
              {wallet.publicKey?.toBase58().slice(0, 4)}...
              {wallet.publicKey?.toBase58().slice(-4)}
            </p>
          </div>
          <WalletMultiButton />
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="grid gap-6">
        {/* Metric Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Balance"
            value={accountBalance}
            description="Your current SOL balance"
            icon={DollarSign}
          />
          {metrics.map((metric) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              description={metric.description}
              icon={metric.icon}
            />
          ))}
        </div>

        {/* Recent Transactions and Other Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <button
                onClick={handleRefresh}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Refresh transactions"
              >
                <RefreshCcw className={`w-4 h-4 ${loadingTransactions ? 'animate-spin' : ''}`} />
              </button>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <p>Fetching transactions...</p>
                </div>
              ) : recentTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">From</TableHead>
                      <TableHead className="hidden md:table-cell">To</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((tx) => (
                      <TableRow key={tx.signature}>
                        <TableCell>
                          <ArrowUpRight
                            className={`w-4 h-4 inline-block mr-2 ${
                              tx.feePayer === wallet.publicKey.toBase58() ? "text-red-500" : "text-green-500"
                            }`}
                          />
                          {tx.feePayer === wallet.publicKey.toBase58() ? "Sent" : "Received"}
                        </TableCell>
                        <TableCell>{tx.amount.toFixed(4)} SOL</TableCell>
                        <TableCell className="hidden md:table-cell">{tx.from}</TableCell>
                        <TableCell className="hidden md:table-cell">{tx.to}</TableCell>
                        <TableCell>
                          <Badge variant={tx.status === "Success" ? "default" : "destructive"}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground p-8">
                  No recent transactions found.
                </p>
              )}
            </CardContent>
          </Card>

          {/* User Profile / Info Card */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
              <CardDescription>
                Details about your connected wallet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Public Key</p>
                <p className="text-sm text-muted-foreground break-all">
                  {wallet.publicKey?.toBase58() || "Not Connected"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Wallet Type</p>
                <p className="text-sm text-muted-foreground">
                  {wallet.wallet?.adapter.name || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Network</p>
                <p className="text-sm text-muted-foreground">Devnet</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;