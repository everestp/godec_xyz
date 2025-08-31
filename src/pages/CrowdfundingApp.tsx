import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Target, Users, Clock, Bitcoin, Plus, Wallet, Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  contributors: number;
  daysLeft: number;
  category: string;
  creator: string;
  image: string;
  deadline: Date;
  isActive: boolean;
  contributorsList: { address: string; amount: number; timestamp: Date }[];
  isGoalReached: boolean;
  hasWithdrawn: boolean;
}

const CrowdfundingApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [userWallet] = useState("0x1234...5678"); // Mock wallet address
  const [filter, setFilter] = useState<"all" | "active" | "funded" | "expired">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    description: "",
    goal: "",
    deadline: "",
    category: "",
    image: ""
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 1,
      title: "Decentralized Education Platform",
      description: "Building the future of peer-to-peer learning with blockchain technology. This platform will enable students to learn directly from experts while earning tokens for their progress and contributions.",
      raised: 45.7,
      goal: 100,
      contributors: 234,
      daysLeft: 15,
      category: "Education",
      creator: "0xabc...def",
      image: "/placeholder.svg",
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isActive: true,
      contributorsList: [
        { address: "0x789...123", amount: 5.5, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { address: "0x456...789", amount: 10.2, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { address: "0x123...456", amount: 3.8, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) }
      ],
      isGoalReached: false,
      hasWithdrawn: false
    },
    {
      id: 2,
      title: "Privacy-First Social Network",
      description: "A social platform where users own their data completely. Built on decentralized infrastructure with end-to-end encryption and token-based incentives for quality content creation.",
      raised: 150.3,
      goal: 150,
      contributors: 456,
      daysLeft: 8,
      category: "Technology",
      creator: "0x123...456",
      image: "/placeholder.svg",
      deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      isActive: true,
      contributorsList: [
        { address: "0x789...123", amount: 25.0, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { address: "0x456...789", amount: 50.0, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { address: "0x111...222", amount: 15.5, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
      ],
      isGoalReached: true,
      hasWithdrawn: false
    },
    {
      id: 3,
      title: "Green Mining Initiative",
      description: "Sustainable cryptocurrency mining using 100% renewable energy sources. Building solar-powered mining farms that reduce environmental impact while maintaining profitability.",
      raised: 23.1,
      goal: 75,
      contributors: 89,
      daysLeft: -2,
      category: "Environment",
      creator: "0x789...abc",
      image: "/placeholder.svg",
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isActive: false,
      contributorsList: [
        { address: "0x333...444", amount: 8.1, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { address: "0x555...666", amount: 12.5, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      ],
      isGoalReached: false,
      hasWithdrawn: false
    }
  ]);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.creator.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "active") return campaign.isActive && matchesSearch;
    if (filter === "funded") return campaign.isGoalReached && matchesSearch;
    if (filter === "expired") return !campaign.isActive && matchesSearch;
    return matchesSearch;
  });

  const handleContribute = (campaignId: number) => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount",
        variant: "destructive"
      });
      return;
    }

    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    if (!campaign.isActive) {
      toast({
        title: "Campaign Ended",
        description: "This campaign is no longer active",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(contributionAmount);
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const newRaised = c.raised + amount;
        const newContributor = {
          address: userWallet,
          amount,
          timestamp: new Date()
        };
        
        return {
          ...c,
          raised: newRaised,
          contributors: c.contributors + 1,
          contributorsList: [newContributor, ...c.contributorsList],
          isGoalReached: newRaised >= c.goal
        };
      }
      return c;
    }));

    toast({
      title: "Contribution Successful! 🎉",
      description: `You've contributed ${contributionAmount} BTC to the campaign`,
    });
    setContributionAmount("");
  };

  const handleWithdraw = (campaignId: number) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    if (campaign.creator !== userWallet) {
      toast({
        title: "Unauthorized",
        description: "Only the campaign creator can withdraw funds",
        variant: "destructive"
      });
      return;
    }

    if (!campaign.isGoalReached) {
      toast({
        title: "Goal Not Reached",
        description: "Cannot withdraw funds until the goal is reached",
        variant: "destructive"
      });
      return;
    }

    if (campaign.isActive) {
      toast({
        title: "Campaign Still Active",
        description: "Cannot withdraw funds while campaign is still active",
        variant: "destructive"
      });
      return;
    }

    if (campaign.hasWithdrawn) {
      toast({
        title: "Already Withdrawn",
        description: "Funds have already been withdrawn",
        variant: "destructive"
      });
      return;
    }

    setCampaigns(prev => prev.map(c => 
      c.id === campaignId ? { ...c, hasWithdrawn: true } : c
    ));

    toast({
      title: "Withdrawal Successful! 💰",
      description: `${campaign.raised} BTC has been transferred to your wallet`,
    });
  };

  const createCampaign = () => {
    if (!newCampaign.title || !newCampaign.description || !newCampaign.goal || !newCampaign.deadline) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const goal = parseFloat(newCampaign.goal);
    if (goal <= 0) {
      toast({
        title: "Invalid Goal",
        description: "Please enter a valid funding goal",
        variant: "destructive"
      });
      return;
    }

    const deadline = new Date(newCampaign.deadline);
    if (deadline <= new Date()) {
      toast({
        title: "Invalid Deadline",
        description: "Deadline must be in the future",
        variant: "destructive"
      });
      return;
    }

    const daysLeft = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    const campaign: Campaign = {
      id: campaigns.length + 1,
      title: newCampaign.title,
      description: newCampaign.description,
      goal,
      raised: 0,
      contributors: 0,
      daysLeft,
      category: newCampaign.category || "Other",
      creator: userWallet,
      image: newCampaign.image || "/placeholder.svg",
      deadline,
      isActive: true,
      contributorsList: [],
      isGoalReached: false,
      hasWithdrawn: false
    };

    setCampaigns(prev => [campaign, ...prev]);
    setNewCampaign({
      title: "",
      description: "",
      goal: "",
      deadline: "",
      category: "",
      image: ""
    });
    setShowCreateForm(false);

    toast({
      title: "Campaign Created! 🚀",
      description: "Your campaign has been created successfully",
    });
  };

  const getStatusBadge = (campaign: Campaign) => {
    if (!campaign.isActive && campaign.isGoalReached) return { text: "Funded", variant: "default" as const };
    if (!campaign.isActive && !campaign.isGoalReached) return { text: "Expired", variant: "secondary" as const };
    if (campaign.isGoalReached) return { text: "Goal Reached", variant: "default" as const };
    return { text: "Active", variant: "outline" as const };
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-bitcoin bg-clip-text text-transparent">
            Decentralized Crowdfunding
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Support innovative projects with cryptocurrency. Transparent, secure, and decentralized funding for the future.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
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

          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid gap-6">
          {filteredCampaigns.map((campaign) => {
            const status = getStatusBadge(campaign);
            return (
            <Card key={campaign.id} className="card-hover">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{campaign.title}</CardTitle>
                      <Badge variant={status.variant}>{status.text}</Badge>
                      <Badge variant="outline">{campaign.category}</Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{campaign.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created by {campaign.creator}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCampaign(campaign)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    
                    {campaign.creator === userWallet && 
                     campaign.isGoalReached && 
                     !campaign.isActive && 
                     !campaign.hasWithdrawn && (
                      <Button
                        size="sm"
                        onClick={() => handleWithdraw(campaign.id)}
                        className="bg-accent hover:bg-accent/90"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      {campaign.raised} / {campaign.goal} BTC
                    </span>
                  </div>
                  <Progress 
                    value={(campaign.raised / campaign.goal) * 100} 
                    className="h-3"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{Math.round((campaign.raised / campaign.goal) * 100)}% funded</span>
                    <span>{campaign.goal - campaign.raised} BTC to go</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Bitcoin className="w-4 h-4 text-bitcoin-orange" />
                      <span className="text-lg font-semibold">{campaign.raised}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">BTC Raised</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-lg font-semibold">{campaign.contributors}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Contributors</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4 text-secondary" />
                      <span className="text-lg font-semibold">{campaign.daysLeft}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Days Left</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder="Amount in BTC"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="flex-1"
                    step="0.001"
                    min="0"
                  />
                  <Button 
                    onClick={() => handleContribute(campaign.id)}
                    className="px-6"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Contribute
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
          </div>
        )}
      </main>

      {/* Create Campaign Modal */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Funding Goal (BTC) *</Label>
                <Input
                  id="goal"
                  type="number"
                  placeholder="100"
                  value={newCampaign.goal}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, goal: e.target.value }))}
                  step="0.1"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="Technology, Education, etc."
                  value={newCampaign.category}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={newCampaign.deadline}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, deadline: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                placeholder="https://example.com/image.jpg"
                value={newCampaign.image}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, image: e.target.value }))}
              />
            </div>

            <Button onClick={createCampaign} className="w-full">
              Create Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedCampaign.title}
                <Badge variant={getStatusBadge(selectedCampaign).variant}>
                  {getStatusBadge(selectedCampaign).text}
                </Badge>
                <Badge variant="outline">{selectedCampaign.category}</Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <img 
                    src={selectedCampaign.image} 
                    alt={selectedCampaign.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  
                  <p className="text-muted-foreground">{selectedCampaign.description}</p>
                  
                  <div className="text-sm">
                    <p><span className="font-medium">Creator:</span> {selectedCampaign.creator}</p>
                    <p><span className="font-medium">Deadline:</span> {selectedCampaign.deadline.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {selectedCampaign.raised} / {selectedCampaign.goal} BTC
                      </span>
                    </div>
                    <Progress 
                      value={(selectedCampaign.raised / selectedCampaign.goal) * 100} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{Math.round((selectedCampaign.raised / selectedCampaign.goal) * 100)}% funded</span>
                      <span>{Math.max(0, selectedCampaign.goal - selectedCampaign.raised).toFixed(1)} BTC to go</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Bitcoin className="w-4 h-4 text-bitcoin-orange" />
                        <span className="text-lg font-semibold">{selectedCampaign.raised}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">BTC Raised</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-lg font-semibold">{selectedCampaign.contributors}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Contributors</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span className="text-lg font-semibold">{selectedCampaign.daysLeft}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Days {selectedCampaign.daysLeft > 0 ? 'Left' : 'Ago'}</p>
                    </div>
                  </div>

                  {selectedCampaign.isActive && (
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder="Amount in BTC"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        className="flex-1"
                        step="0.001"
                        min="0"
                      />
                      <Button 
                        onClick={() => handleContribute(selectedCampaign.id)}
                        className="px-6"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Contribute
                      </Button>
                    </div>
                  )}

                  {selectedCampaign.creator === userWallet && 
                   selectedCampaign.isGoalReached && 
                   !selectedCampaign.isActive && 
                   !selectedCampaign.hasWithdrawn && (
                    <Button
                      onClick={() => handleWithdraw(selectedCampaign.id)}
                      className="w-full bg-accent hover:bg-accent/90"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Withdraw {selectedCampaign.raised} BTC
                    </Button>
                  )}

                  {selectedCampaign.hasWithdrawn && (
                    <div className="bg-accent/10 p-3 rounded-lg">
                      <p className="text-accent text-sm font-medium">
                        ✅ Funds have been withdrawn by the creator
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Contributors ({selectedCampaign.contributorsList.length})</h4>
                {selectedCampaign.contributorsList.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedCampaign.contributorsList.map((contributor, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span className="text-sm font-mono">{contributor.address}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">{contributor.amount} BTC</div>
                          <div className="text-xs text-muted-foreground">
                            {contributor.timestamp.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No contributions yet</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CrowdfundingApp;