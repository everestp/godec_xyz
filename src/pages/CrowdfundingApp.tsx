import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, Users, Clock, Bitcoin, CheckCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CrowdfundingApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for all campaigns
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      title: "Decentralized Education Platform",
      description: "Building the future of peer-to-peer learning with blockchain technology",
      raised: 45.7,
      goal: 100,
      contributors: 234,
      daysLeft: 15,
      category: "Education"
    },
    {
      id: 2,
      title: "Privacy-First Social Network",
      description: "A social platform where users own their data completely",
      raised: 78.3,
      goal: 150,
      contributors: 456,
      daysLeft: 8,
      category: "Technology"
    },
    {
      id: 3,
      title: "Green Mining Initiative",
      description: "Sustainable cryptocurrency mining using renewable energy",
      raised: 23.1,
      goal: 75,
      contributors: 89,
      daysLeft: 22,
      category: "Environment"
    }
  ]);

  // State to manage input for each campaign
  const [contributionAmounts, setContributionAmounts] = useState<{ [key: number]: string }>({});

  const handleContribute = (campaignId: number) => {
    const contributionAmount = contributionAmounts[campaignId];
    const amount = parseFloat(contributionAmount);

    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount.",
        variant: "destructive"
      });
      return;
    }

    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, raised: campaign.raised + amount, contributors: campaign.contributors + 1 }
          : campaign
      )
    );

    setContributionAmounts(prev => ({ ...prev, [campaignId]: "" }));

    toast({
      title: "Contribution Successful! 🎉",
      description: `You've contributed ${amount} BTC.`,
    });
  };

  const handleInputChange = (campaignId: number, value: string) => {
    setContributionAmounts(prev => ({ ...prev, [campaignId]: value }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <Badge variant="outline" className="text-primary border-primary/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Blockchain Powered
          </Badge>
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-bitcoin bg-clip-text text-transparent">
            Decentralized Crowdfunding
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Support innovative projects with cryptocurrency. Transparent, secure, and decentralized funding for the future.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid gap-8">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="card-hover p-6 rounded-xl border border-border/50 shadow-md transition-all duration-300 hover:shadow-xl">
              <CardHeader className="p-0 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold mb-2">{campaign.title}</CardTitle>
                    <Badge variant="outline" className="text-sm font-normal text-muted-foreground border-border/50 px-2 py-1">
                      {campaign.category}
                    </Badge>
                    <p className="text-muted-foreground mt-2">{campaign.description}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary font-semibold">{Math.round((campaign.raised / campaign.goal) * 100)}% funded</span>
                    <span className="font-semibold text-foreground">
                      {campaign.raised} / {campaign.goal} BTC
                    </span>
                  </div>
                  <Progress 
                    value={(campaign.raised / campaign.goal) * 100} 
                    className="h-2.5 bg-muted rounded-full overflow-hidden " 
                   
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center border-t border-border/50 pt-6">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Bitcoin className="w-5 h-5 text-bitcoin-orange" />
                      <span className="text-lg font-semibold">{campaign.raised}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">BTC Raised</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-lg font-semibold">{campaign.contributors}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Contributors</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-5 h-5 text-secondary" />
                      <span className="text-lg font-semibold">{campaign.daysLeft}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Days Left</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
                  <Input
                    type="number"
                    placeholder="Amount in BTC"
                    value={contributionAmounts[campaign.id] || ""}
                    onChange={(e) => handleInputChange(campaign.id, e.target.value)}
                    className="flex-1"
                    step="0.001"
                    min="0"
                  />
                  <Button 
                    onClick={() => handleContribute(campaign.id)}
                    className="px-6 w-full sm:w-auto"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Contribute
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" className="px-8">
            <Plus className="w-4 h-4 mr-2" />
            Create New Campaign
          </Button>
          <p className="text-muted-foreground text-sm mt-3">
            Start your own decentralized crowdfunding campaign
          </p>
        </div>
      </main>
    </div>
  );
};

export default CrowdfundingApp;