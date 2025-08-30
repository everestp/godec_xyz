import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Ticket, Trophy, Users, Bitcoin, Shuffle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Lottery {
  id: number;
  name: string;
  jackpot: number;
  ticketPrice: number;
  participants: number;
  endDate: string;
  status: "active" | "ended";
  winningNumbers?: number[];
  winner?: string;
}

interface UserTicket {
  id: number;
  lotteryId: number;
  numbers: number[];
  purchaseDate: string;
}

const LotteryApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lotteries, setLotteries] = useState<Lottery[]>([
    {
      id: 1,
      name: "Bitcoin Mega Jackpot",
      jackpot: 15.75,
      ticketPrice: 0.001,
      participants: 1247,
      endDate: "2024-02-01",
      status: "active"
    },
    {
      id: 2,
      name: "Decentralized Weekly Draw",
      jackpot: 5.23,
      ticketPrice: 0.0005,
      participants: 834,
      endDate: "2024-01-25",
      status: "active"
    },
    {
      id: 3,
      name: "Last Week's Lottery",
      jackpot: 8.91,
      ticketPrice: 0.001,
      participants: 956,
      endDate: "2024-01-15",
      status: "ended",
      winningNumbers: [7, 15, 23, 31, 42],
      winner: "0x1234...5678"
    }
  ]);

  const [userTickets, setUserTickets] = useState<UserTicket[]>([
    {
      id: 1,
      lotteryId: 1,
      numbers: [7, 15, 23, 31, 42],
      purchaseDate: "2024-01-20"
    }
  ]);

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [selectedLottery, setSelectedLottery] = useState<number | null>(null);

  const generateRandomNumbers = () => {
    const numbers = [];
    while (numbers.length < 5) {
      const num = Math.floor(Math.random() * 50) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b));
  };

  const handleNumberSelect = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(prev => prev.filter(n => n !== number));
    } else if (selectedNumbers.length < 5) {
      setSelectedNumbers(prev => [...prev, number].sort((a, b) => a - b));
    }
  };

  const buyTicket = (lotteryId: number) => {
    if (selectedNumbers.length !== 5) {
      toast({
        title: "Invalid Selection",
        description: "Please select exactly 5 numbers",
        variant: "destructive"
      });
      return;
    }

    const lottery = lotteries.find(l => l.id === lotteryId);
    if (!lottery) return;

    const newTicket: UserTicket = {
      id: Date.now(),
      lotteryId,
      numbers: [...selectedNumbers],
      purchaseDate: new Date().toISOString().split('T')[0]
    };

    setUserTickets(prev => [...prev, newTicket]);
    
    // Update lottery participants
    setLotteries(prev => prev.map(l => 
      l.id === lotteryId 
        ? { ...l, participants: l.participants + 1, jackpot: l.jackpot + l.ticketPrice }
        : l
    ));

    setSelectedNumbers([]);
    setSelectedLottery(null);

    toast({
      title: "Ticket Purchased! 🎟️",
      description: `You bought a ticket for ${lottery.name}`,
      variant: "default"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilEnd = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
        
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-bitcoin bg-clip-text text-transparent">
            Decentralized Lottery
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Try your luck with blockchain-powered lotteries. Transparent, fair, and decentralized gaming.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        {/* Active Lotteries */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Active Lotteries</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {lotteries.filter(l => l.status === "active").map((lottery) => {
              const daysLeft = getDaysUntilEnd(lottery.endDate);
              return (
                <Card key={lottery.id} className="card-hover">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-2">{lottery.name}</CardTitle>
                        <Badge variant={daysLeft > 3 ? "default" : "destructive"}>
                          {daysLeft > 0 ? `${daysLeft} days left` : "Ending soon"}
                        </Badge>
                      </div>
                      <Trophy className="w-8 h-8 text-bitcoin-orange" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1">
                          <Bitcoin className="w-5 h-5 text-bitcoin-orange" />
                          <span className="text-2xl font-bold">{lottery.jackpot}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Jackpot (BTC)</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-5 h-5 text-primary" />
                          <span className="text-2xl font-bold">{lottery.participants}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Participants</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Ticket Price: {lottery.ticketPrice} BTC
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Draw Date: {formatDate(lottery.endDate)}
                      </p>
                    </div>

                    <Button 
                      onClick={() => setSelectedLottery(lottery.id)}
                      className="w-full"
                      size="lg"
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Buy Ticket
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Ticket Purchase Interface */}
        {selectedLottery && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Select Your Numbers</CardTitle>
              <p className="text-muted-foreground">
                Choose 5 numbers from 1 to 50 for {lotteries.find(l => l.id === selectedLottery)?.name}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 50 }, (_, i) => i + 1).map(number => (
                  <Button
                    key={number}
                    variant={selectedNumbers.includes(number) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNumberSelect(number)}
                    className="aspect-square p-0"
                  >
                    {number}
                  </Button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={generateRandomNumbers}
                    className="flex items-center gap-2"
                  >
                    <Shuffle className="w-4 h-4" />
                    Quick Pick
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedNumbers.join(", ") || "None"}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedLottery(null);
                      setSelectedNumbers([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => buyTicket(selectedLottery)}
                    disabled={selectedNumbers.length !== 5}
                  >
                    Buy Ticket ({lotteries.find(l => l.id === selectedLottery)?.ticketPrice} BTC)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Your Tickets */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Your Tickets</h2>
          {userTickets.length > 0 ? (
            <div className="grid gap-4">
              {userTickets.map((ticket) => {
                const lottery = lotteries.find(l => l.id === ticket.lotteryId);
                return (
                  <Card key={ticket.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{lottery?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Purchased: {formatDate(ticket.purchaseDate)}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex gap-1 mb-2">
                            {ticket.numbers.map(num => (
                              <Badge key={num} variant="outline" className="w-8 h-8 flex items-center justify-center">
                                {num}
                              </Badge>
                            ))}
                          </div>
                          <Badge variant={lottery?.status === "active" ? "secondary" : "outline"}>
                            {lottery?.status === "active" ? "Pending Draw" : "Draw Complete"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center p-8">
                <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Tickets Yet</h3>
                <p className="text-muted-foreground">
                  Purchase tickets for active lotteries to participate!
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Recent Results */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Recent Results</h2>
          {lotteries.filter(l => l.status === "ended").map((lottery) => (
            <Card key={lottery.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{lottery.name}</h3>
                    <p className="text-muted-foreground">Draw Date: {formatDate(lottery.endDate)}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex gap-1 mb-2">
                      {lottery.winningNumbers?.map(num => (
                        <Badge key={num} variant="default" className="w-8 h-8 flex items-center justify-center">
                          {num}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Winner: {lottery.winner}
                    </p>
                    <p className="text-sm font-semibold">
                      Prize: {lottery.jackpot} BTC
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
};

export default LotteryApp;