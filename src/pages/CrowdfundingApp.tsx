import { useEffect, useState, useMemo } from "react";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Search,
  Plus,
  Bitcoin,
  Users,
  Clock,
  Target,
  Wallet,
  Eye,
  Trash2,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { createCampaign, deleteCampaign, donateToCampaign, getProgramStateAddress, useProgram, withdrawFromCampaign } from "@/utils/solana-program";


const CrowdfundingApp = () => {
  const { toast } = useToast();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [programState, setProgramState] = useState(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    description: "",
    goal: "",
    imageUrl: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
const program = useProgram()
const wallet = useWallet()

  const fetchCampaigns = async () => {
    if (!program) return;
    setLoading(true);
    try {
      const allCampaigns = await  program.account.campaign.all();;
      const programState = await program.account.programState.fetch(getProgramStateAddress());
      setCampaigns(allCampaigns.map(c => ({
          ...c.account,
          publicKey: c.publicKey,
          isGoalReached: c.account.amountRaised.toNumber() >= c.account.goal.toNumber(),
      })));
      setProgramState(programState);
    } catch (error) {
      toast({
        title: "Error fetching data",
        description: "Failed to fetch campaigns from the blockchain.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (program) {
  //     fetchCampaigns();
  //   }
  // }, []);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!wallet || !wallet.publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a campaign.",
        variant: "destructive",
      });
      return;
    }

    if (!newCampaign.title || !newCampaign.description || !newCampaign.goal || !newCampaign.imageUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      await createCampaign(
        program,
        newCampaign.title,
        newCampaign.description,
        newCampaign.imageUrl,
        parseFloat(newCampaign.goal) * anchor.web3.LAMPORTS_PER_SOL,
        wallet,
        programState
      );
      toast({
        title: "Campaign Created! 🚀",
        description: "Your campaign has been created successfully",
      });
      await fetchCampaigns();
      setShowCreateForm(false);
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (campaign) => {
    if (!wallet || !wallet.publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to contribute.",
        variant: "destructive",
      });
      return;
    }

    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await donateToCampaign(program, campaign.cid.toNumber(), parseFloat(contributionAmount) * anchor.web3.LAMPORTS_PER_SOL, wallet);
      toast({
        title: "Contribution Successful! 🎉",
        description: `You've contributed ${contributionAmount} SOL to the campaign`,
      });
      await fetchCampaigns();
      setSelectedCampaign(null); // Return to main view after donation
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (campaign) => {
    if (!wallet || !wallet.publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to withdraw.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if the user is the creator before allowing withdrawal
    if (campaign.creator.toString() !== wallet.publicKey.toString()) {
      toast({
        title: "Unauthorized",
        description: "Only the campaign creator can withdraw funds.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      await withdrawFromCampaign(program, campaign.cid.toNumber(), wallet);
      toast({
        title: "Withdrawal Successful! 💰",
        description: `Funds have been transferred to your wallet`,
      });
      await fetchCampaigns();
      setSelectedCampaign(null);
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteCampaign = async (campaign) => {
    if (!wallet || !wallet.publicKey) {
        toast({
            title: "Wallet Not Connected",
            description: "Please connect your wallet.",
            variant: "destructive",
        });
        return;
    }

    if (campaign.creator.toString() !== wallet.publicKey.toString()) {
        toast({
            title: "Unauthorized",
            description: "Only the creator can delete this campaign.",
            variant: "destructive",
        });
        return;
    }
    
    setLoading(true);
    try {
        await deleteCampaign(program, campaign.cid.toNumber(), wallet);
        toast({
            title: "Campaign Deleted",
            description: "The campaign has been successfully deleted.",
        });
        await fetchCampaigns();
        setSelectedCampaign(null);
    } catch (error) {
        toast({
            title: "Transaction Failed",
            description: `Error: ${error.message}`,
            variant: "destructive"
        });
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isActive = campaign.active;
      const isGoalReached = campaign.amountRaised.toNumber() >= campaign.goal.toNumber();

      if (filter === "active") return isActive && !isGoalReached && matchesSearch;
      if (filter === "funded") return isGoalReached && matchesSearch;
      if (filter === "expired") return !isActive && matchesSearch;
      return matchesSearch;
    });
  }, [campaigns, filter, searchTerm]);

  if (false) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-t-4 border-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading campaigns from the blockchain...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (campaign) => {
    if (!campaign.active) return { text: "Expired", variant: "secondary" };
    if (campaign.amountRaised.toNumber() >= campaign.goal.toNumber()) return { text: "Funded", variant: "default" };
    return { text: "Active", variant: "outline" };
  };

  const getProgressValue = (campaign) => {
      if (campaign.goal.isZero()) return 0;
      return Math.min(100, (campaign.amountRaised.toNumber() / campaign.goal.toNumber()) * 100);
  };

  const getRemainingAmount = (campaign) => {
    const goal = campaign.goal.toNumber();
    const raised = campaign.amountRaised.toNumber();
    return Math.max(0, goal - raised) / 10**9;
  }

  if (selectedCampaign) {
    const status = getStatusBadge(selectedCampaign);
    return (
      <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
        <header className="max-w-6xl mx-auto mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedCampaign(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Button>
        </header>

        <main className="max-w-4xl mx-auto">
          <Card className="rounded-2xl shadow-lg border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
                {selectedCampaign.title}
                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                  <Badge variant={status.variant}>{status.text}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <img 
                    src={selectedCampaign.imageUrl} 
                    alt={selectedCampaign.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  
                  <p className="text-muted-foreground">{selectedCampaign.description}</p>
                  
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Creator:</span> {selectedCampaign.creator.toBase58()}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {(selectedCampaign.amountRaised.toNumber() / 10**9).toFixed(2)} / {(selectedCampaign.goal.toNumber() / 10**9).toFixed(2)} SOL
                      </span>
                    </div>
                    <Progress 
                      value={getProgressValue(selectedCampaign)}
                      className="h-3"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{Math.round(getProgressValue(selectedCampaign))}% funded</span>
                      <span>{getRemainingAmount(selectedCampaign).toFixed(2)} SOL to go</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Bitcoin className="w-4 h-4 text-bitcoin-orange" />
                        <span className="text-lg font-semibold">{(selectedCampaign.amountRaised.toNumber() / 10**9).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">SOL Raised</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-lg font-semibold">{selectedCampaign.donors.toNumber()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Donors</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span className="text-lg font-semibold">{selectedCampaign.active ? "Active" : "Expired"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Status</p>
                    </div>
                  </div>
                    
                  {wallet && selectedCampaign.creator.toBase58() === wallet.publicKey.toBase58() && (
                    <Button
                      onClick={() => handleDeleteCampaign(selectedCampaign)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                      disabled={!selectedCampaign.active}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deactivate Campaign
                    </Button>
                  )}

                  {wallet && selectedCampaign.active && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        type="number"
                        placeholder="Amount in SOL"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        className="flex-1"
                        step="0.001"
                        min="0"
                      />
                      <Button 
                        onClick={() => handleDonate(selectedCampaign)}
                        className="w-full sm:w-auto px-6"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Contribute
                      </Button>
                    </div>
                  )}

                  {wallet && selectedCampaign.creator.toBase58() === wallet.publicKey.toBase58() && 
                   !selectedCampaign.active && (
                    <Button
                      onClick={() => handleWithdraw(selectedCampaign)}
                      className="w-full bg-accent hover:bg-accent/90"
                      disabled={selectedCampaign.withdrawals.toNumber() > 0}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Withdraw {(selectedCampaign.amountRaised.toNumber() / 10**9).toFixed(2)} SOL
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
        <header className="max-w-6xl mx-auto mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowCreateForm(false)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Button>
        </header>

        <main className="max-w-2xl mx-auto">
          <Card className="rounded-2xl shadow-lg border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleCreateCampaign} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter campaign title..."
                    value={newCampaign.title}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your campaign..."
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Funding Goal (SOL) *</Label>
                  <Input
                    id="goal"
                    type="number"
                    placeholder="100"
                    value={newCampaign.goal}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, goal: e.target.value }))}
                    step="0.001"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL *</Label>
                  <Input
                    id="image"
                    placeholder="https://example.com/image.jpg"
                    value={newCampaign.imageUrl}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, imageUrl: e.target.value }))}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Create Campaign
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <header className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Solana Crowdfunding
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
            Support innovative projects with SOL. Transparent, secure, and decentralized funding on the Solana blockchain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("active")}
              >
                Active
              </Button>
              <Button
                variant={filter === "funded" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("funded")}
              >
                Funded
              </Button>
              <Button
                variant={filter === "expired" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("expired")}
              >
                Expired
              </Button>
            </div>
          </div>

          <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto flex items-center gap-2 mt-2 sm:mt-0">
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign) => {
            const status = getStatusBadge(campaign);
            return (
              <Card key={campaign.cid.toString()} className="card-hover">
                <CardHeader>
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{campaign.title}</CardTitle>
                      <Badge variant={status.variant}>{status.text}</Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{campaign.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created by {campaign.creator.toBase58().slice(0, 4)}...{campaign.creator.toBase58().slice(-4)}
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Bitcoin className="w-4 h-4 text-bitcoin-orange" />
                        <span className="text-lg font-semibold">{(campaign.amountRaised.toNumber() / 10**9).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">SOL Raised</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-lg font-semibold">{campaign.donors.toNumber()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Donors</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span className="text-lg font-semibold">{campaign.active ? "Active" : "Expired"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Status</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCampaign(campaign)}
                      className="w-full"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? `No campaigns match "${searchTerm}"` : 
               filter === "all" ? "No campaigns have been created yet." : 
               `No ${filter} campaigns available.`}
            </p>
            {wallet && (
                <Button onClick={() => setShowCreateForm(true)} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Campaign
                </Button>
            )}
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
};
 export default  CrowdfundingApp
