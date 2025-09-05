import React, { useEffect, useState, useMemo } from "react";
import { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { BN } from 'bn.js';
import {
  ArrowLeft, Search, Plus, Bitcoin, Users, Clock,
  Target, Wallet, Trash2,
  Badge,
} from "lucide-react";
import {
  getProgramStateAddress,
  getCampaignAddress,
  getDonorTransactionAddress,
  getWithdrawTransactionAddress, // Import the new function for withdrawal transactions
  useProgram,
} from "@/utils/solana-program"; // Make sure to update your utils file
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const CrowdfundingApp = () => {
  const { toast } = useToast();
  const wallet = useWallet();
  const program = useProgram()
  const [appState, setAppState] = useState("loading"); // 'loading', 'wallet-not-connected', 'uninitialized', 'initialized'
  const [programState, setProgramState] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: "", description: "", goal: "", imageUrl: ""
  });
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchProgramStateAndCampaigns = async () => {
    if (!program) return;
    try {
      const state = await program.account.programState.fetch(getProgramStateAddress());
      if (state.initialized) {
        const allCampaigns = await program.account.campaign.all();
        setCampaigns(allCampaigns.map(c => ({
          ...c.account,
          publicKey: c.publicKey,
          isGoalReached: c.account.amountRaised.toNumber() >= c.account.goal.toNumber(),
        })));
        setProgramState(state);
        setAppState("initialized");
      } else {
        setAppState("uninitialized");
      }
    } catch (err: any) {
      if (err.message.includes("Account does not exist")) {
        setAppState("uninitialized");
      } else {
        console.error("Failed to fetch program state or campaigns:", err);
        setAppState("error");
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    }
  };

  useEffect(() => {
    if (program && wallet.publicKey) {
      setAppState("loading");
      fetchProgramStateAndCampaigns();
    } else if (!wallet.publicKey) {
      setAppState("wallet-not-connected");
    }
  }, [ wallet.publicKey]);

  const initialize = async () => {
    if (!program || !wallet.publicKey) {
      return toast({ title: "Wallet Not Connected", description: "Please connect your wallet to initialize.", variant: "destructive" });
    }
    setAppState("loading");
    try {
      await program.methods.initialize()
        .accounts({
          programState: getProgramStateAddress(),
          deployer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      toast({ title: "Program Initialized", description: "You can now create campaigns.", variant: "success" });
      await fetchProgramStateAndCampaigns();
    } catch (err: any) {
      console.error("Initialization failed:", err);
      toast({ title: "Initialization Failed", description: err.message, variant: "destructive" });
      setAppState("uninitialized");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey || !program || !programState) return;
    if (!newCampaign.title || !newCampaign.description || !newCampaign.goal || !newCampaign.imageUrl) {
      return toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
    }
    try {
      const goalInLamports = new BN(parseFloat(newCampaign.goal) * anchor.web3.LAMPORTS_PER_SOL);
      const newCampaignId = programState.campaignCount.toNumber() + 1;
      const campaignPda = getCampaignAddress(newCampaignId);
      
      await program.methods.createCampaign(
        newCampaign.title,
        newCampaign.description,
        newCampaign.imageUrl,
        goalInLamports
      )
        .accounts({
          programState: getProgramStateAddress(),
          campaign: campaignPda,
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      toast({ title: "Campaign Created!", description: "Your campaign is now live.", variant: "success" });
      await fetchProgramStateAndCampaigns();
      setShowCreateForm(false);
      setNewCampaign({ title: "", description: "", goal: "", imageUrl: "" });
    } catch (err: any) {
      console.error("Create campaign failed:", err);
      toast({ title: "Error Creating Campaign", description: err.message, variant: "destructive" });
    }
  };

  const handleDonate = async (campaign: any) => {
    if (!wallet.publicKey || !program) return toast({ title: "Wallet", description: "Please connect your wallet.", variant: "destructive" });
    const amt = parseFloat(contributionAmount);
    if (isNaN(amt) || amt <= 0) return toast({ title: "Invalid Amount", description: "Please enter a valid SOL amount.", variant: "destructive" });

    try {
      const campaignId = campaign.cid.toNumber();
      const amountInLamports = new BN(amt * anchor.web3.LAMPORTS_PER_SOL);
      const transactionPda = getDonorTransactionAddress(wallet.publicKey, campaignId, campaign.donors.toNumber() + 1);

      await program.methods
        .donate(new BN(campaignId), amountInLamports)
        .accounts({
          campaign: getCampaignAddress(campaignId),
          transaction: transactionPda,
          donor: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      toast({ title: "Thanks for your support!", description: `Donated ${amt} SOL`, variant: "success" });
      await fetchProgramStateAndCampaigns();
      setSelectedCampaign(null);
      setContributionAmount("");
    } catch (err: any) {
      console.error("Donation failed:", err);
      toast({ title: "Donation Failed", description: err.message, variant: "destructive" });
    }
  };
  
  const handleWithdraw = async (campaign: any) => {
    if (!wallet.publicKey || !program) return;
    if (!wallet.publicKey.equals(campaign.creator)) {
      return toast({ title: "Unauthorized", description: "Only the campaign creator can withdraw funds.", variant: "destructive" });
    }
    
    // The amount to withdraw should be the entire balance, not a specific amount
    const amountToWithdraw = campaign.balance.toNumber();

    try {
      const campaignId = campaign.cid.toNumber();
      const withdrawCount = campaign.withdrawals.toNumber() + 1;
      const withdrawTransactionPda = getWithdrawTransactionAddress(wallet.publicKey, campaignId, withdrawCount);

      await program.methods
        .withdraw(new BN(campaignId), new BN(amountToWithdraw))
        .accounts({
          campaign: getCampaignAddress(campaignId),
          transaction: withdrawTransactionPda,
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          programState: getProgramStateAddress(),
          platformAddress: programState.platformAddress, // Pass the platform address from state
        })
        .rpc();
      
      toast({ title: "Funds Withdrawn", description: "Your funds have been successfully withdrawn.", variant: "success" });
      await fetchProgramStateAndCampaigns();
      setSelectedCampaign(null);
    } catch (err: any) {
      console.error("Withdrawal failed:", err);
      toast({ title: "Withdrawal Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (campaign: any) => {
    if (!wallet.publicKey || !wallet.publicKey.equals(campaign.creator)) {
      return toast({ title: "Unauthorized", description: "Only the campaign creator can delete this campaign.", variant: "destructive" });
    }

    try {
      await program.methods
        .deleteCampaign(new BN(campaign.cid.toNumber()))
        .accounts({
          campaign: getCampaignAddress(campaign.cid.toNumber()),
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast({ title: "Campaign Deleted", description: "The campaign has been removed.", variant: "success" });
      await fetchProgramStateAndCampaigns();
      setSelectedCampaign(null);
    } catch (err: any) {
      console.error("Deletion failed:", err);
      toast({ title: "Deletion Failed", description: err.message, variant: "destructive" });
    }
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (filter === "all") return matchesSearch;
      if (filter === "active") return c.active && !c.isGoalReached && matchesSearch;
      if (filter === "funded") return c.isGoalReached && matchesSearch;
      return matchesSearch;
    });
  }, [campaigns, searchTerm, filter]);

  const getStatus = (c: any) => {
    if (c.isGoalReached) return { text: "Funded", variant: "default" };
    if (!c.active) return { text: "Inactive", variant: "secondary" };
    return { text: "Active", variant: "outline" };
  };

  const getProgress = (c: any) =>
    c.goal.isZero() ? 0 : Math.min(100, (c.amountRaised.toNumber() / c.goal.toNumber()) * 100);

  const getRemaining = (c: any) => {
    const remaining = c.goal.toNumber() - c.amountRaised.toNumber();
    return (remaining > 0 ? remaining / 1e9 : 0).toFixed(2);
  };
  
  if (appState === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Toaster />
      </div>
    );
  }

  if (appState === "wallet-not-connected") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
          <p>Please connect your Solana wallet to get started.</p>
        <WalletMultiButton style={{background :'orange', color:"white" }} />
        </div>
        <Toaster />
      </div>
    );
  }

  if (appState === "uninitialized") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <h2 className="text-2xl font-bold">Program Not Initialized</h2>
          <p>Please initialize the program to start using the platform.</p>
          <Button className="w-full" onClick={initialize}>Initialize Program</Button>
        </div>
        <Toaster />
      </div>
    );
  }

  if (selectedCampaign) {
    const c = selectedCampaign;
    const status = getStatus(c);
    const isCreator = wallet.publicKey?.equals(c.creator);
    
    return (
      <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
        <header className="max-w-4xl mx-auto mb-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(null)} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </header>
        <main className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {c.title} <Badge variant={status.variant}>{status.text}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <img src={c.imageUrl} alt={c.title} className="w-full h-48 object-cover rounded-lg" />
              <p className="text-muted-foreground">{c.description}</p>
              <div className="space-y-2">
                <p><strong>Creator:</strong> {c.creator.toBase58()}</p>
                <div>
                  <span className="font-semibold">
                    { (c.amountRaised.toNumber() / 1e9).toFixed(2) } / { (c.goal.toNumber() / 1e9).toFixed(2) } SOL
                  </span>
                  <Progress value={getProgress(c)} className="h-3 mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    { getProgress(c).toFixed(0) }% funded — { getRemaining(c) } SOL to go
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Bitcoin className="mx-auto w-5 h-5 text-bitcoin-orange" />
                  <p className="text-lg font-semibold">{ (c.amountRaised.toNumber() / 1e9).toFixed(2) }</p>
                  <p className="text-xs text-muted-foreground">SOL Raised</p>
                </div>
                <div>
                  <Users className="mx-auto w-5 h-5 text-primary" />
                  <p className="text-lg font-semibold">{ c.donors.toNumber() }</p>
                  <p className="text-xs text-muted-foreground">Donors</p>
                </div>
                <div>
                  <Clock className="mx-auto w-5 h-5 text-secondary" />
                  <p className="text-lg font-semibold">{ c.active ? "Active" : "Inactive" }</p>
                  <p className="text-xs text-muted-foreground">Status</p>
                </div>
              </div>
              {isCreator && c.active && (
                <div className="flex flex-col space-y-2">
                   <Button className="w-full bg-blue-500 text-white" onClick={() => handleWithdraw(c)}>
                    <Wallet className="w-4 h-4 mr-2" /> Withdraw { (c.balance.toNumber() / 1e9).toFixed(2) } SOL
                  </Button>
                  <Button className="w-full bg-red-500 text-white" onClick={() => handleDelete(c)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Deactivate Campaign
                  </Button>
                </div>
              )}
              {c.active && !isCreator && (
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Amount in SOL"
                    value={contributionAmount}
                    onChange={e => setContributionAmount(e.target.value)}
                    className="flex-1"
                    step="0.001"
                    min="0"
                  />
                  <Button onClick={() => handleDonate(c)}>
                    <Target className="w-4 h-4 mr-1" /> Contribute
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <header className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <div className="space-y-4 md:space-y-0 md:flex md:space-x-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
            </div>
            <div className="flex space-x-2">
              {["all", "active", "funded"].map(key => (
                <Button
                  key={key}
                  variant={filter === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>Create Campaign</span>
          </Button>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">
            Solana Crowdfunding
          </h1>
          <p className="text-muted-foreground mt-2">Support great ideas with SOL</p>
        </div>
      </header>

      {showCreateForm && (
        <div className="max-w-2xl mx-auto mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCreate} className="space-y-4">
                <div><Label>Title *</Label><Input value={newCampaign.title} onChange={e => setNewCampaign(prev => ({ ...prev, title: e.target.value }))} /></div>
                <div><Label>Description *</Label><Textarea value={newCampaign.description} onChange={e => setNewCampaign(prev => ({ ...prev, description: e.target.value }))} rows={3} /></div>
                <div><Label>Goal (in SOL) *</Label><Input type="number" step="0.001" min="0" value={newCampaign.goal} onChange={e => setNewCampaign(prev => ({ ...prev, goal: e.target.value }))} /></div>
                <div><Label>Image URL *</Label><Input value={newCampaign.imageUrl} onChange={e => setNewCampaign(prev => ({ ...prev, imageUrl: e.target.value }))} /></div>
                <div className="flex space-x-2"><Button type="submit" className="flex-1">Submit</Button><Button variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Button></div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <main className="max-w-6xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((c: any) => {
            const s = getStatus(c);
            return (
              <Card key={c.cid.toString()} className="hover:shadow-lg cursor-pointer" onClick={() => setSelectedCampaign(c)}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{c.title}</CardTitle>
                    <Badge variant={s.variant}>{s.text}</Badge>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{c.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Creator: {c.creator.toBase58().slice(0, 4)}...{c.creator.toBase58().slice(-4)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 text-center">
                    <div><Bitcoin className="mx-auto w-5 h-5 text-bitcoin-orange" /><p>{(c.amountRaised.toNumber() / 1e9).toFixed(2)}</p><p className="text-xs text-muted-foreground">Raised</p></div>
                    <div><Users className="mx-auto w-5 h-5 text-primary" /><p>{c.donors.toNumber()}</p><p className="text-xs text-muted-foreground">Donors</p></div>
                    <div><Clock className="mx-auto w-5 h-5 text-secondary" /><p>{c.active ? "Active" : "Inactive"}</p><p className="text-xs text-muted-foreground">Status</p></div>
                  </div>
                  <div className="mt-2 text-center">
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-lg">No campaigns found{searchTerm ? ` for “${searchTerm}”` : filter !== "all" ? ` (${filter})` : ""}.</p>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
};

export default CrowdfundingApp;