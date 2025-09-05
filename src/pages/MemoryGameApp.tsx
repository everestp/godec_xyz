import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Clock, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
    Connection,
    Keypair,
    PublicKey,
    LAMPORTS_PER_SOL,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    
  }  from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
interface CardData {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGameApp = () => {
  const wallet = useWallet();
  const navigate = useNavigate();
  const { toast } = useToast();
   const [signature, setSignature] = useState();
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timer, setTimer] = useState(0);

 
  const symbols = ["🚀", "⚡", "🎯", "🔥", "💎", "🌟", "🎮", "🏆"];

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameWon) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameWon]);

  useEffect(() => {
    if (matches === 8) {
      setGameWon(true);
      setGameStarted(false);
      toast({
        title: "Congratulations! 🎉",
        description: `You won in ${moves} moves and ${timer} seconds!`,
        variant: "default"
      });
    }
  }, [matches, moves, timer, toast]);

  const initializeGame = () => {
    const gameSymbols = [...symbols, ...symbols];
    const shuffled = gameSymbols
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        value: symbol,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameStarted(false);
    setGameWon(false);
    setTimer(0);
  };

  const handleClaimTrophy = () => {
    transferSolWithPrivateKey(0.001)
    toast({
      title: "Blanace Transfered Sucessfull 0.001 Sol",
      description: "A new game is starting now. Good luck!",
      variant: "default"
    });
    initializeGame();
  };

  const handleCardClick = async (cardId: number) => {
    
    if (!gameStarted) setGameStarted(true);
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length === 2) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      if (firstCard?.value === secondCard?.value) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstCardId || c.id === secondCardId 
              ? { ...c, isMatched: true }
              : c
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstCardId || c.id === secondCardId 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };



// Helper function to convert a hex string to a Uint8Array


const transferSolWithPrivateKey = async (amountInSol, recipientPublicKey=wallet.publicKey) => {
  try {
    const privateKeyHex = import.meta.env.VITE_PRIVATE_KEY;
    if (!privateKeyHex) {
      throw new Error("VITE_PRIVATE_KEY is not defined in the environment variables.");
    }

    const connection = new Connection("https://api.devnet.solana.com");

    const secretKey = Uint8Array.from(Buffer.from(privateKeyHex, "hex"));
    const sender = Keypair.fromSecretKey(secretKey);
    
    // Ensure the recipient's public key is provided and is a valid PublicKey object
    if (!recipientPublicKey) {
      throw new Error("Recipient's public key is not provided.");
    }
    const toPubkey = new PublicKey(recipientPublicKey);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey,
        lamports: Math.floor(amountInSol * LAMPORTS_PER_SOL),
      })
    );
    
    const signature = await sendAndConfirmTransaction(connection, transaction, [sender]);
    
    console.log("✅ Transaction confirmed with signature:", signature);
    
    return signature;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
};
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
    <header className="max-w-4xl mx-auto mb-8">
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
        <h1 className="text-4xl text-primary">
            Memory Challenge
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Test your memory by matching pairs of cards. Flip cards to reveal symbols, find matching pairs, and earn **0.001 SOL** on every game completion.
        </p>
    </div>
</header>

      <main className="max-w-4xl mx-auto">
        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{moves}</span>
              </div>
              <p className="text-sm text-muted-foreground">Moves</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-bitcoin-orange" />
                <span className="text-2xl font-bold">{matches}/8</span>
              </div>
              <p className="text-sm text-muted-foreground">Matches</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-secondary" />
                <span className="text-2xl font-bold">{formatTime(timer)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Button onClick={initializeGame} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                New Game
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <Card className="p-6">
          <div className="grid grid-cols-4 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  aspect-square rounded-lg border-2 cursor-pointer transition-all duration-300 flex items-center justify-center text-3xl
                  ${card.isMatched 
                    ? "border-green-500 bg-green-500/20 cursor-default" 
                    : card.isFlipped 
                      ? "border-primary bg-primary/20" 
                      : "border-border bg-card hover:border-primary/50 hover:scale-105"
                  }
                  ${card.isFlipped || card.isMatched ? "" : "hover:shadow-lg"}
                `}
              >
                {card.isFlipped || card.isMatched ? (
                  <span className={card.isMatched ? "animate-pulse" : ""}>
                    {card.value}
                  </span>
                ) : (
                  <div className="text-4xl opacity-30">❓</div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Game Status */}
        {gameWon && (
          <Card className="mt-6 border-green-500 bg-green-500/10">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-bitcoin-orange mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-muted-foreground mb-4">
                You completed the memory challenge in {moves} moves and {formatTime(timer)}!
              </p>
              <div className="flex gap-4 justify-center mb-6">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Moves: {moves}
                </Badge>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Time: {formatTime(timer)}
                </Badge>
              </div>
              <Button onClick={handleClaimTrophy} className="w-full" size="lg">
                <Trophy className="w-4 h-4 mr-2" />
                Claim Your 0.1 Sol !
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent>
    <ul className="space-y-2 text-muted-foreground">
      <li>• Click on cards to flip them and reveal the symbols</li>
      <li>• Find matching pairs by remembering where symbols are located</li>
      <li>• Match all 8 pairs to win the game and earn **0.001 SOL**</li>
      <li>• Try to complete the challenge in the fewest moves possible</li>
    </ul>
</CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MemoryGameApp;
