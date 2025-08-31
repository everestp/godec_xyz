import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Vote, Plus, Clock, Users, BarChart3, Eye, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Poll {
  id: number;
  title: string;
  description: string;
  options: string[];
  votes: number[];
  deadline: Date;
  isActive: boolean;
  totalVotes: number;
  creator: string;
  votedBy: string[];
}

const VotingApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [userWallet] = useState("0x1234...5678"); // Mock wallet address
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");
  const [newPoll, setNewPoll] = useState({
    title: "",
    description: "",
    options: ["", ""],
    deadline: ""
  });

  const [polls, setPolls] = useState<Poll[]>([
    {
      id: 1,
      title: "Implement Layer 2 Scaling Solution",
      description: "Should we implement a Layer 2 scaling solution to reduce transaction costs and improve speed?",
      options: ["Yes, implement Polygon", "Yes, implement Arbitrum", "No, keep current setup"],
      votes: [245, 189, 67],
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isActive: true,
      totalVotes: 501,
      creator: "0xabc...def",
      votedBy: []
    },
    {
      id: 2,
      title: "Governance Token Distribution",
      description: "How should we distribute the governance tokens for the upcoming DAO launch?",
      options: ["70% Community, 20% Team, 10% Treasury", "60% Community, 25% Team, 15% Treasury", "80% Community, 15% Team, 5% Treasury"],
      votes: [123, 89, 234],
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      isActive: true,
      totalVotes: 446,
      creator: "0x123...456",
      votedBy: ["0x1234...5678"]
    },
    {
      id: 3,
      title: "Platform Fee Structure",
      description: "What should be the platform fee for transactions?",
      options: ["0.5%", "1%", "1.5%", "2%"],
      votes: [89, 156, 98, 45],
      deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isActive: false,
      totalVotes: 388,
      creator: "0x789...abc",
      votedBy: []
    }
  ]);

  const filteredPolls = polls.filter(poll => {
    if (filter === "active") return poll.isActive;
    if (filter === "ended") return !poll.isActive;
    return true;
  });

  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll(prev => ({
        ...prev,
        options: [...prev.options, ""]
      }));
    }
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const createPoll = () => {
    if (!newPoll.title || !newPoll.description || !newPoll.deadline) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const validOptions = newPoll.options.filter(option => option.trim() !== "");
    if (validOptions.length < 2) {
      toast({
        title: "Invalid Options",
        description: "Please provide at least 2 valid options",
        variant: "destructive"
      });
      return;
    }

    const poll: Poll = {
      id: polls.length + 1,
      title: newPoll.title,
      description: newPoll.description,
      options: validOptions,
      votes: new Array(validOptions.length).fill(0),
      deadline: new Date(newPoll.deadline),
      isActive: new Date(newPoll.deadline) > new Date(),
      totalVotes: 0,
      creator: userWallet,
      votedBy: []
    };

    setPolls(prev => [poll, ...prev]);
    setNewPoll({
      title: "",
      description: "",
      options: ["", ""],
      deadline: ""
    });

    toast({
      title: "Poll Created! 🗳️",
      description: "Your poll has been created successfully",
    });
  };

  const vote = (pollId: number, optionIndex: number) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;

    if (poll.votedBy.includes(userWallet)) {
      toast({
        title: "Already Voted",
        description: "You have already voted on this poll",
        variant: "destructive"
      });
      return;
    }

    if (!poll.isActive) {
      toast({
        title: "Poll Ended",
        description: "This poll has already ended",
        variant: "destructive"
      });
      return;
    }

    setPolls(prev => prev.map(p => {
      if (p.id === pollId) {
        const newVotes = [...p.votes];
        newVotes[optionIndex]++;
        return {
          ...p,
          votes: newVotes,
          totalVotes: p.totalVotes + 1,
          votedBy: [...p.votedBy, userWallet]
        };
      }
      return p;
    }));

    toast({
      title: "Vote Recorded! ✅",
      description: "Your vote has been successfully recorded",
    });

    // Update selected poll if it's the same one
    if (selectedPoll && selectedPoll.id === pollId) {
      const updatedPoll = polls.find(p => p.id === pollId);
      if (updatedPoll) {
        const newVotes = [...updatedPoll.votes];
        newVotes[optionIndex]++;
        setSelectedPoll({
          ...updatedPoll,
          votes: newVotes,
          totalVotes: updatedPoll.totalVotes + 1,
          votedBy: [...updatedPoll.votedBy, userWallet]
        });
      }
    }
  };

  const getTimeLeft = (deadline: Date) => {
    const now = new Date();
    const timeLeft = deadline.getTime() - now.getTime();
    
    if (timeLeft <= 0) return "Ended";
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getWinningOption = (poll: Poll) => {
    if (poll.totalVotes === 0) return null;
    const maxVotes = Math.max(...poll.votes);
    const winningIndex = poll.votes.indexOf(maxVotes);
    return { option: poll.options[winningIndex], votes: maxVotes };
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
            Decentralized Voting
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Participate in transparent, blockchain-based governance. Create polls and vote on important decisions.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All Polls
            </Button>
            <Button
              variant={filter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={filter === "ended" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("ended")}
            >
              Ended
            </Button>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Poll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Poll</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Poll Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter poll title..."
                    value={newPoll.title}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this poll is about..."
                    value={newPoll.description}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Options *</Label>
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}...`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                      />
                      {newPoll.options.length > 2 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  {newPoll.options.length < 6 && (
                    <Button variant="outline" size="sm" onClick={addOption}>
                      Add Option
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={newPoll.deadline}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, deadline: e.target.value }))}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <Button onClick={createPoll} className="w-full">
                  Create Poll
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid gap-6">
          {filteredPolls.map((poll) => (
            <Card key={poll.id} className="card-hover">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{poll.title}</CardTitle>
                      <Badge variant={poll.isActive ? "default" : "secondary"}>
                        {poll.isActive ? "Active" : "Ended"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{poll.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{poll.totalVotes} votes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span>{getTimeLeft(poll.deadline)}</span>
                      </div>
                      {poll.votedBy.includes(userWallet) && (
                        <div className="flex items-center gap-1 text-accent">
                          <CheckCircle className="w-4 h-4" />
                          <span>Voted</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPoll(poll)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {poll.options.map((option, index) => {
                    const percentage = poll.totalVotes > 0 ? (poll.votes[index] / poll.totalVotes) * 100 : 0;
                    const isWinning = !poll.isActive && getWinningOption(poll)?.option === option;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${isWinning ? 'text-accent' : ''}`}>
                            {option}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {poll.votes[index]} votes ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Progress value={percentage} className="flex-1" />
                          {poll.isActive && !poll.votedBy.includes(userWallet) && (
                            <Button
                              size="sm"
                              onClick={() => vote(poll.id, index)}
                            >
                              Vote
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPolls.length === 0 && (
          <div className="text-center py-12">
            <Vote className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No polls found</h3>
            <p className="text-muted-foreground">
              {filter === "all" ? "No polls have been created yet." : `No ${filter} polls available.`}
            </p>
          </div>
        )}
      </main>

      {/* Poll Details Modal */}
      {selectedPoll && (
        <Dialog open={!!selectedPoll} onOpenChange={() => setSelectedPoll(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedPoll.title}
                <Badge variant={selectedPoll.isActive ? "default" : "secondary"}>
                  {selectedPoll.isActive ? "Active" : "Ended"}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <p className="text-muted-foreground">{selectedPoll.description}</p>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-lg font-semibold">{selectedPoll.totalVotes}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Votes</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <BarChart3 className="w-4 h-4 text-accent" />
                    <span className="text-lg font-semibold">{selectedPoll.options.length}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Options</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span className="text-lg font-semibold">{getTimeLeft(selectedPoll.deadline)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Time Left</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Poll Results</h4>
                {selectedPoll.options.map((option, index) => {
                  const percentage = selectedPoll.totalVotes > 0 ? (selectedPoll.votes[index] / selectedPoll.totalVotes) * 100 : 0;
                  const isWinning = !selectedPoll.isActive && getWinningOption(selectedPoll)?.option === option;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${isWinning ? 'text-accent' : ''}`}>
                          {option} {isWinning && '🏆'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {selectedPoll.votes[index]} votes ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Progress value={percentage} className="flex-1" />
                        {selectedPoll.isActive && !selectedPoll.votedBy.includes(userWallet) && (
                          <Button
                            size="sm"
                            onClick={() => vote(selectedPoll.id, index)}
                          >
                            Vote
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedPoll.votedBy.includes(userWallet) && (
                <div className="bg-accent/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">You have voted on this poll</span>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default VotingApp;