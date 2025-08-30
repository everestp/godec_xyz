import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shuffle, Trophy, Clock, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const PuzzleGameApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [grid, setGrid] = useState<(number | null)[]>(Array(9).fill(null));
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timer, setTimer] = useState(0);

  const WINNING_STATE = [1, 2, 3, 4, 5, 6, 7, 8, null];

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
    if (JSON.stringify(grid) === JSON.stringify(WINNING_STATE) && gameStarted) {
      setGameWon(true);
      setGameStarted(false);
      toast({
        title: "Puzzle Solved! 🎉",
        description: `You solved it in ${moves} moves and ${timer} seconds!`,
        variant: "default"
      });
    }
  }, [grid, moves, timer, gameStarted, toast]);

  const shuffleArray = (array: (number | null)[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const isSolvable = (puzzle: (number | null)[]) => {
    const flatPuzzle = puzzle.filter(x => x !== null) as number[];
    let inversions = 0;
    
    for (let i = 0; i < flatPuzzle.length - 1; i++) {
      for (let j = i + 1; j < flatPuzzle.length; j++) {
        if (flatPuzzle[i] > flatPuzzle[j]) {
          inversions++;
        }
      }
    }
    
    return inversions % 2 === 0;
  };

  const initializeGame = () => {
    let shuffled;
    do {
      shuffled = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, null]);
    } while (!isSolvable(shuffled) || JSON.stringify(shuffled) === JSON.stringify(WINNING_STATE));
    
    setGrid(shuffled);
    setMoves(0);
    setGameStarted(false);
    setGameWon(false);
    setTimer(0);
  };

  const getEmptyIndex = () => grid.indexOf(null);

  const getValidMoves = (emptyIndex: number) => {
    const validMoves = [];
    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;

    // Up
    if (row > 0) validMoves.push(emptyIndex - 3);
    // Down
    if (row < 2) validMoves.push(emptyIndex + 3);
    // Left
    if (col > 0) validMoves.push(emptyIndex - 1);
    // Right
    if (col < 2) validMoves.push(emptyIndex + 1);

    return validMoves;
  };

  const handleTileClick = (index: number) => {
    if (!gameStarted) setGameStarted(true);
    
    const emptyIndex = getEmptyIndex();
    const validMoves = getValidMoves(emptyIndex);

    if (validMoves.includes(index)) {
      const newGrid = [...grid];
      [newGrid[emptyIndex], newGrid[index]] = [newGrid[index], newGrid[emptyIndex]];
      setGrid(newGrid);
      setMoves(prev => prev + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-bitcoin bg-clip-text text-transparent">
            Sliding Puzzle
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Arrange the numbered tiles in order from 1 to 8. Click on tiles adjacent to the empty space to move them.
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
                <Clock className="w-5 h-5 text-secondary" />
                <span className="text-2xl font-bold">{formatTime(timer)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Badge 
                variant={gameWon ? "default" : gameStarted ? "secondary" : "outline"}
                className="text-lg px-4 py-2"
              >
                {gameWon ? "Solved!" : gameStarted ? "Playing" : "Ready"}
              </Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Button onClick={initializeGame} className="w-full">
                <Shuffle className="w-4 h-4 mr-2" />
                New Puzzle
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <Card className="p-6">
            <div className="grid grid-cols-3 gap-2 w-72 h-72">
              {grid.map((tile, index) => (
                <div
                  key={index}
                  onClick={() => handleTileClick(index)}
                  className={`
                    aspect-square rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all duration-200
                    ${tile === null 
                      ? "border-dashed border-border/50 bg-background" 
                      : "border-border bg-card cursor-pointer hover:border-primary hover:scale-105 hover:shadow-lg"
                    }
                  `}
                >
                  {tile}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Winning Message */}
        {gameWon && (
          <Card className="mb-6 border-green-500 bg-green-500/10">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-bitcoin-orange mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Puzzle Solved!</h2>
              <p className="text-muted-foreground mb-4">
                You solved the puzzle in {moves} moves and {formatTime(timer)}!
              </p>
              <div className="flex gap-4 justify-center">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Moves: {moves}
                </Badge>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Time: {formatTime(timer)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Solution Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Goal Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="grid grid-cols-3 gap-1 w-24 h-24">
                {WINNING_STATE.map((tile, index) => (
                  <div
                    key={index}
                    className={`
                      aspect-square rounded border flex items-center justify-center text-xs font-bold
                      ${tile === null 
                        ? "border-dashed border-border/50 bg-background" 
                        : "border-border bg-card"
                      }
                    `}
                  >
                    {tile}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>• Click on tiles adjacent to the empty space to move them</p>
              <p>• Arrange numbers from 1 to 8 in order with the empty space in the bottom-right</p>
              <p>• Challenge yourself to solve it in the fewest moves possible!</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PuzzleGameApp;