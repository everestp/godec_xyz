import React, { useEffect, useState } from "react";
import { toast as rtoast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft, Vote, Plus, Clock, Users, BarChart3, Eye, Badge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { BN } from "bn.js";
import { SystemProgram, PublicKey } from '@solana/web3.js';
import { getCounterAddress, getPollAddress, getRegistrationAddress, getCandidateAddress, getVoterAddress, useProgram } from "@/utils/solana-program";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader } from "@/components/ui/dialog";

interface PollAccount {
  id: number;
  description: string;
  start: string;
  end: string;
  candidates: string;
  creator: PublicKey;
}

interface CandidateAccount {
  cid: number;
  pollId: number;
  name: string;
  votes: BN; // Changed to BN to match blockchain data
  hasRegistered: boolean;
}

interface VoterAccount {
  cid: string;
  pollId: number;
  hasVoted: boolean;
}

const VotingApp = () => {
  const { toast } = useToast();
  const program = useProgram();
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [polls, setPolls] = useState<PollAccount[]>([]);
  const [candidates, setCandidates] = useState<CandidateAccount[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<PollAccount | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPoll, setNewPoll] = useState({ description: "", deadline: "" });
  const [newCandidateName, setNewCandidateName] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  const fetchBlockchainData = async () => {
    if (!program) return;
    setIsLoading(true);
    try {
      const allPolls = await program.account.poll.all();
      console.log("All post ",allPolls)
      const formattedPolls = allPolls.map(pol => {
        const p = pol.account;
        return {
          id: p.id.toNumber(),
          description: p.description,
          start: p.start.toNumber(),
          end: p.end.toNumber(),
          creator: p.creator.toString(),
        };
      });

      const allCandidates = await program.account.candidate.all();
      const formattedCandidates = allCandidates.map(c => {
        const candidate = c.account;
        return {
          cid: candidate.cid.toNumber(),
          pollId: candidate.pollId.toNumber(),
          name: candidate.name,
          votes: candidate.votes,
          hasRegistered: candidate.hasRegistered,
        };
      });

      setPolls(formattedPolls);
      setCandidates(formattedCandidates);
console.log("formated candidate and poll",polls , candidates)
      const counterPda = getCounterAddress();
      try {
        await program.account.counter.fetch(counterPda);
        setIsInitialized(true);
      } catch (err) {
        setIsInitialized(false);
      }
    } catch (error) {
      console.error("Failed to fetch blockchain data:", error);
      toast({ title: "Error", description: "Could not fetch data from the blockchain.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchainData();
    // const interval = setInterval(fetchBlockchainData, 10000);
    // return () => clearInterval(interval);
  }, [wallet.publicKey   ]);

  useEffect(() => {
    const checkVoterStatus = async () => {
      if (!program || !wallet.publicKey || !selectedPoll) return;
      try {
        const voterPda = getVoterAddress(selectedPoll.id, wallet.publicKey);
        const voterAccount = await program.account.voter.fetch(voterPda);
        setHasVoted(voterAccount.hasVoted);
      } catch (error) {
        setHasVoted(false);
      }
    };
    checkVoterStatus();
  }, [wallet.publicKey, selectedPoll]);

  const handleInitialize = async () => {
    if (!program || !wallet.publicKey) return;
    setIsLoading(true);
    try {
      const counterPda = getCounterAddress();
      const registrationsPda = getRegistrationAddress();

      await program.methods
        .initializeVote()
        .accounts({
          user: wallet.publicKey,
          counter: counterPda,
          registerations: registrationsPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await fetchBlockchainData();
      toast({ title: "Success", description: "Program initialized!" });
    } catch (error) {
      console.error("Initialization failed:", error);
      toast({ title: "Error", description: "Initialization failed.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!program || !wallet.publicKey || !newPoll.description || !newPoll.deadline) {
      toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const deadlineTimestamp = new Date(newPoll.deadline).getTime() / 1000;
      const counterPda = getCounterAddress();
      const counterAccount = await program.account.counter.fetch(counterPda);
      const nextPollId = counterAccount.count.toNumber() + 1;

      const pollPda = getPollAddress(nextPollId);

      await program.methods
        .createPoll(
          new BN(nextPollId),
          newPoll.description,
          new BN(Date.now() / 1000),
          new BN(deadlineTimestamp)
        )
        .accounts({
          user: wallet.publicKey,
          poll: pollPda,
          counter: counterPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await fetchBlockchainData();
      setNewPoll({ description: "", deadline: "" });
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Poll created successfully!" });
    } catch (error) {
      console.error("Poll creation failed:", error);
      toast({ title: "Error", description: "Poll creation failed. Check console for details.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegisterCandidate = async () => {
    if (!program || !wallet.publicKey || !newCandidateName || !selectedPoll) return;
    setIsLoading(true);
    try {
      const pollPda = getPollAddress(selectedPoll.id);
      const registrationPda = getRegistrationAddress();
      const registrationAccount = await program.account.registerations.fetch(registrationPda);
      const nextCandidateId = registrationAccount.count.toNumber() + 1;
      const candidatePda = getCandidateAddress(selectedPoll.id, nextCandidateId);

      await program.methods
        .registerCandidate(new BN(selectedPoll.id), newCandidateName)
        .accounts({
          user: wallet.publicKey,
          poll: pollPda,
          candidate: candidatePda,
          registerations: registrationPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setNewCandidateName("");
      await fetchBlockchainData();
      toast({ title: "Success", description: "Candidate registered successfully!" });
    } catch (error) {
      console.error("Candidate registration failed:", error);
      toast({ title: "Error", description: "Failed to register candidate.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (cid: number) => {
    if (!program || !wallet.publicKey || !selectedPoll || hasVoted) return;
    setIsLoading(true);
    try {
      const pollPda = getPollAddress(selectedPoll.id);
      const candidatePda = getCandidateAddress(selectedPoll.id, cid);
      const voterPda = getVoterAddress(selectedPoll.id, wallet.publicKey);

      await program.methods
        .vote(new BN(selectedPoll.id), new BN(cid))
        .accounts({
          user: wallet.publicKey,
          poll: pollPda,
          candidate: candidatePda,
          voter: voterPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setHasVoted(true);
      await fetchBlockchainData();
      toast({ title: "Success", description: "Vote cast successfully!" });
    } catch (error) {
      console.error("Vote failed:", error);
      toast({ title: "Error", description: "Vote failed.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getPollCandidates = (pollId: number) => candidates.filter(c => c.pollId === pollId);
  const getPollTotalVotes = (pollId: number) => getPollCandidates(pollId).reduce((sum, c) => sum + c.votes.toNumber(), 0);

  const getTimeLeft = (deadline: number) => {
    const diff = deadline * 1000 - Date.now();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
  };

  const renderPollDetails = (poll: PollAccount) => {
    const isActive = poll.end * 1000 > Date.now();
    const pollCandidates = getPollCandidates(poll.id);
    const totalVotes = getPollTotalVotes(poll.id);
const isOwner = new PublicKey(poll.creator).equals(wallet.publicKey);

;

    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => setSelectedPoll(null)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Polls
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{poll.description}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-lg font-semibold">{totalVotes}</span>
                </div>
                <p className="text-xs text-muted-foreground">Total Votes</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <BarChart3 className="w-4 h-4 text-accent" />
                  <span className="text-lg font-semibold">{pollCandidates.length}</span>
                </div>
                <p className="text-xs text-muted-foreground">Candidates</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span className="text-lg font-semibold">{getTimeLeft(poll.end)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{isActive ? "Time Left" : "Ended"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Candidates</h3>
              {pollCandidates.map((candidate) => (
                <div key={candidate.cid} className="flex justify-between items-center p-4 border rounded-lg">
                  <span>{candidate.name}</span>
                  <div className="flex items-center gap-4">
                    <span>{candidate.votes.toString()} votes</span>
                    {isActive && !hasVoted && (
                      <Button
                        onClick={() => handleVote(candidate.cid)}
                        disabled={isLoading || !wallet.publicKey}
                        size="sm"
                      >
                        Vote
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isOwner && (
                <div className="flex gap-2">
                  <Input
                    placeholder="New candidate name"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                  />
                  <Button onClick={handleRegisterCandidate} disabled={isLoading || !newCandidateName}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Candidate
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPollList = () => {
    const filteredPolls = polls.filter((poll) => {
      const isActive = poll.end * 1000 > Date.now();
      if (filter === "all") return true;
      if (filter === "active") return isActive;
      if (filter === "ended") return !isActive;
    });

    return (
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
                    <label htmlFor="description" className="text-sm font-medium">Description *</label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this poll is about..."
                      value={newPoll.description}
                      rows={3}
                      onChange={(e) => setNewPoll((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="deadline" className="text-sm font-medium">Deadline *</label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={newPoll.deadline}
                      onChange={(e) => setNewPoll((prev) => ({ ...prev, deadline: e.target.value }))}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <Button onClick={handleCreatePoll} className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Poll"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        <main className="max-w-6xl mx-auto mt-10">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredPolls.map((poll) => {
              const isActive = poll.end * 1000 > Date.now();
              const statusBadge = isActive ? { variant: "default", text: "Active" } : { variant: "secondary", text: "Ended" };
              const pollCandidates = getPollCandidates(poll.id);
              const totalVotes = getPollTotalVotes(poll.id);

              return (
                <Card key={poll.id} className="card-hover">
                  <CardHeader>
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{poll.description}</CardTitle>
                        <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-lg font-semibold">{totalVotes}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Total Votes</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1">
                          <BarChart3 className="w-4 h-4 text-accent" />
                          <span className="text-lg font-semibold">{pollCandidates.length}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Candidates</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-secondary" />
                          <span className="text-lg font-semibold">{getTimeLeft(poll.end)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isActive ? "Time Left" : "Ended"}
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
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <ToastContainer />
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4 bg-gradient-bitcoin bg-clip-text text-transparent">
          Decentralized Voting
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Participate in transparent, blockchain-based governance. Create polls and vote on important decisions.
        </p>
      </div>
      {!wallet.publicKey && (
        <div className="text-center space-y-4 mt-10">
          <WalletMultiButton />
          <p className="text-muted-foreground">
            Please connect your wallet to get started.
          </p>
        </div>
      )}
      {!isInitialized && wallet.publicKey && (
        <div className="text-center space-y-4 mt-10">
          <Button onClick={handleInitialize} disabled={isLoading}>
            {isLoading ? "Initializing..." : "Initialize"}
          </Button>
        </div>
      )}
      {isInitialized && wallet.publicKey && (
        selectedPoll ? renderPollDetails(selectedPoll) : renderPollList()
      )}
    </div>
  );
};

export default VotingApp;