import React, { useEffect, useMemo, useState } from "react";
import { toast as rtoast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Vote,
  Plus,
  Clock,
  Users,
  BarChart3,
  Eye,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { BN } from "@coral-xyz/anchor";
//  import { getCounter, getProvider, getReadOnlyProvider, initiize } from "../app/service/blockchain";
// import { getProgram } from "@/program/votingProgram";


export interface Poll {
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      description:
        "Should we implement a Layer 2 scaling solution to reduce transaction costs and improve speed?",
      options: ["Yes, implement Polygon", "Yes, implement Arbitrum", "No, keep current setup"],
      votes: [245, 189, 67],
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isActive: true,
      totalVotes: 501,
      creator: "0xabc...def",
      votedBy: []
    },
   
  ]);

  const filteredPolls = polls.filter((poll) => {
    if (filter === "all") return true;
    if (filter === "active") return poll.isActive;
    if (filter === "ended") return !poll.isActive;
  });

  const getTimeLeft = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
  };

  const getWinningOption = (poll: Poll) => {
    if (poll.totalVotes === 0) return null;
    const max = Math.max(...poll.votes);
    const idx = poll.votes.indexOf(max);
    return { option: poll.options[idx], votes: max };
  };

  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll((prev) => ({
        ...prev,
        options: [...prev.options, ""]
      }));
    }
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (idx: number, value: string) => {
    setNewPoll((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === idx ? value : opt))
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

    const opts = newPoll.options.filter((o) => o.trim());
    if (opts.length < 2) {
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
      options: opts,
      votes: new Array(opts.length).fill(0),
      deadline: new Date(newPoll.deadline),
      isActive: new Date(newPoll.deadline) > new Date(),
      totalVotes: 0,
      creator: publicKey!.toBase58(),
      votedBy: []
    };

    setPolls((prev) => [poll, ...prev]);
    setNewPoll({ title: "", description: "", options: ["", ""], deadline: "" });
    setIsDialogOpen(false);

    toast({
      title: "Poll Created! 🗳️",
      description: "Your poll has been created successfully"
    });
  };

  const vote = (pollId: number, optionIndex: number) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p;
        if (p.votedBy.includes(publicKey!.toBase58())) {
          toast({
            title: "Already Voted",
            description: "You have already voted on this poll",
            variant: "destructive"
          });
          return p;
        }
        if (!p.isActive) {
          toast({
            title: "Poll Ended",
            description: "This poll has already ended",
            variant: "destructive"
          });
          return p;
        }

        const votes = [...p.votes];
        votes[optionIndex]++;
        const updated = {
          ...p,
          votes,
          totalVotes: p.totalVotes + 1,
          votedBy: [...p.votedBy, publicKey!.toBase58()]
        };
        if (selectedPoll?.id === pollId) setSelectedPoll(updated);
        toast({
          title: "Vote Recorded! ✅",
          description: "Your vote has been successfully recorded"
        });
        return updated;
      })
    );






  };

 
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  


  

  if (selectedPoll) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <header className="max-w-6xl mx-auto mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPoll(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Polls
          </Button>
        </header>
        <main className="max-w-3xl mx-auto">
          <Card className="rounded-2xl shadow-lg border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {selectedPoll.title}
                <Badge variant={selectedPoll.isActive ? "default" : "secondary"}>
                  {selectedPoll.isActive ? "Active" : "Ended"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                {selectedPoll.options.map((option, idx) => {
                  const percent = selectedPoll.totalVotes
                    ? (selectedPoll.votes[idx] / selectedPoll.totalVotes) * 100
                    : 0;
                  const isWinner =
                    !selectedPoll.isActive &&
                    getWinningOption(selectedPoll)?.option === option;

                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${isWinner ? "text-accent" : ""}`}>
                          {option} {isWinner && "🏆"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {selectedPoll.votes[idx]} votes ({percent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Progress value={percent} className="flex-1" />
                        {selectedPoll.isActive && publicKey && !selectedPoll.votedBy.includes(publicKey.toBase58()) && (
                          <Button size="sm" onClick={() => vote(selectedPoll.id, idx)}>
                            Vote
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {publicKey  && (
                <div className="bg-accent/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      You have voted on this poll
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }




  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4 bg-gradient-bitcoin bg-clip-text text-transparent">
          Decentralized Voting
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Participate in transparent, blockchain-based governance. Create polls and vote on important decisions.
        </p>
      </div>
      {!publicKey && (
        <div className="text-center space-y-4 mt-10">
          <WalletMultiButton className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium" />
          <p className="text-muted-foreground">
            Please connect your wallet to get started.
          </p>
        </div>
      )}
      {!isInitialized && publicKey && (
        <div className="text-center space-y-4 mt-10">
          <Button
            // onClick={handleInit}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium"
          >
            {isLoading ? "Initializing..." : "Initialize"}
          </Button>
        </div>
      )}
      {isInitialized && publicKey && (
        <>
          <header className="max-w-6xl mx-auto mb-8">
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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                        onChange={(e) =>
                          setNewPoll((prev) => ({ ...prev, title: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what this poll is about..."
                        value={newPoll.description}
                        rows={3}
                        onChange={(e) =>
                          setNewPoll((prev) => ({
                            ...prev,
                            description: e.target.value
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Options *</Label>
                      {newPoll.options.map((opt, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            placeholder={`Option ${idx + 1}...`}
                            value={opt}
                            onChange={(e) => updateOption(idx, e.target.value)}
                          />
                          {newPoll.options.length > 2 && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeOption(idx)}
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
                        onChange={(e) =>
                          setNewPoll((prev) => ({ ...prev, deadline: e.target.value }))
                        }
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
          <main className="max-w-6xl mx-auto mt-10">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredPolls.map((poll) => {
                const statusBadge = poll.isActive
                  ? { variant: "default", text: "Active" }
                  : { variant: "secondary", text: "Ended" };
                return (
                  <Card key={poll.id} className="card-hover">
                    <CardHeader>
                      <div className="flex flex-col items-start gap-2">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{poll.title}</CardTitle>
                          <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">
                          {poll.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Created by {poll.creator}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="text-lg font-semibold">{poll.totalVotes}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Total Votes</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <BarChart3 className="w-4 h-4 text-accent" />
                            <span className="text-lg font-semibold">{poll.options.length}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Options</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4 text-secondary" />
                            <span className="text-lg font-semibold">{getTimeLeft(poll.deadline)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {poll.deadline > new Date() ? "Time Left" : "Ended"}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-center mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPoll(poll)}
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
            {filteredPolls.length === 0 && (
              <div className="text-center py-12">
                <Vote className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No polls found</h3>
                <p className="text-muted-foreground">
                  {filter === "all"
                    ? "No polls have been created yet."
                    : `No ${filter} polls available.`}
                </p>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default VotingApp;