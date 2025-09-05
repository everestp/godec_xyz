import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const NumberGameApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [targetNumber, setTargetNumber] = useState(0);
  const [currentNumbers, setCurrentNumbers] = useState<number[]>([]);
  const [usedNumberIndices, setUsedNumberIndices] = useState<number[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [operations, setOperations] = useState<string[]>([]);
  const [currentExpression, setCurrentExpression] = useState("");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem("highScore") || "0");
  });

  const finalLevel = 5;
  const MAX_ATTEMPTS = 5;

  const generatePuzzle = (difficulty: number) => {
    const numCount = Math.min(4 + Math.floor(difficulty / 2), 6);
    const maxTarget = 50 * difficulty + 50;
    const minTarget = 10 * difficulty;
    const target = Math.floor(Math.random() * (maxTarget - minTarget + 1)) + minTarget;

    const numbers = [];
    for (let i = 0; i < numCount; i++) {
      const isSmallNumber = Math.random() < 0.5;
      const maxNum = isSmallNumber ? 10 : 25 * difficulty;
      numbers.push(Math.floor(Math.random() * maxNum) + 1);
    }

    setTargetNumber(target);
    setCurrentNumbers(numbers);
    setUsedNumberIndices([]);
    setSelectedNumbers([]);
    setOperations([]);
    setCurrentExpression("");
  };

  useEffect(() => {
    if (gameStarted) {
      generatePuzzle(level);
    }
  }, [level, gameStarted]);

  const handleNumberClick = (number: number, index: number) => {
    if (usedNumberIndices.includes(index)) {
      return;
    }

    if (selectedNumbers.length === 0) {
      setSelectedNumbers([number]);
      setUsedNumberIndices([index]);
      setCurrentExpression(number.toString());
    } else {
      setSelectedNumbers([...selectedNumbers, number]);
      setUsedNumberIndices([...usedNumberIndices, index]);
      const lastOp = operations[operations.length - 1];
      setCurrentExpression((prev) => `${prev} ${lastOp} ${number}`);
    }
  };

  const handleOperationClick = (op: string) => {
    if (selectedNumbers.length === 0 || operations.length >= selectedNumbers.length - 1) {
      return;
    }

    setOperations([...operations, op]);
    setCurrentExpression((prev) => `${prev} ${op}`);
  };

  const calculateResult = (): number | null => {
    let result = selectedNumbers[0];
    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      const nextNum = selectedNumbers[i + 1];

      switch (op) {
        case "+":
          result += nextNum;
          break;
        case "-":
          result -= nextNum;
          break;
        case "×":
          result *= nextNum;
          break;
        case "÷":
          if (nextNum === 0) {
            toast({
              title: "Invalid Operation",
              description: "Cannot divide by zero.",
              variant: "destructive",
            });
            return null;
          }
          if (result % nextNum !== 0) {
            toast({
              title: "Invalid Operation",
              description: "Division must result in an integer.",
              variant: "destructive",
            });
            return null;
          }
          result /= nextNum;
          break;
        default:
          break;
      }
    }
    return result;
  };

  const checkSolution = () => {
    if (selectedNumbers.length <= operations.length) {
      toast({
        title: "Incomplete Expression",
        description: "Please select another number to complete the expression.",
        variant: "destructive",
      });
      return;
    }

    const result = calculateResult();
    if (result === null) {
      clearExpression();
      return;
    }

    setAttempts((prev) => prev + 1);

    if (Math.abs(result - targetNumber) < 0.001) {
      const points = Math.max(100 - attempts * 10, 10) * level;
      setScore((prev) => prev + points);

      toast({
        title: "Correct! 🎉",
        description: `You earned ${points} points!`,
        variant: "default",
      });

      if (level >= finalLevel) {
        setGameOver(true);
        setGameStarted(false);
      } else {
        setTimeout(() => {
          setLevel((prev) => prev + 1);
          setAttempts(0);
        }, 1000);
      }
    } else {
      if (attempts + 1 >= MAX_ATTEMPTS) {
        toast({
          title: "Out of Attempts",
          description: `You didn't reach ${targetNumber}. Try again!`,
          variant: "destructive",
        });
        setAttempts(0);
        generatePuzzle(level);
      } else {
        toast({
          title: "Not quite right",
          description: `Your result: ${result.toFixed(0)}, Target: ${targetNumber}`,
          variant: "destructive",
        });
        clearExpression();
      }
    }
  };

  const clearExpression = () => {
    setSelectedNumbers([]);
    setUsedNumberIndices([]);
    setOperations([]);
    setCurrentExpression("");
  };

  const undo = () => {
    if (operations.length > 0 && selectedNumbers.length > operations.length) {
      setSelectedNumbers((prev) => prev.slice(0, -1));
      setUsedNumberIndices((prev) => prev.slice(0, -1));
      setCurrentExpression((prev) => prev.substring(0, prev.lastIndexOf(" ")));
    } else if (operations.length > 0) {
      setOperations((prev) => prev.slice(0, -1));
      setCurrentExpression((prev) => prev.substring(0, prev.lastIndexOf(" ")));
    } else if (selectedNumbers.length > 0) {
      setSelectedNumbers([]);
      setUsedNumberIndices([]);
      setCurrentExpression("");
    }
  };

  const newGame = () => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("highScore", score.toString());
    }
    setLevel(1);
    setScore(0);
    setAttempts(0);
    setGameStarted(true);
    setGameOver(false);
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
            Number Challenge
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Use the given numbers and operations to reach the target number. Test your mathematical skills!
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-bitcoin-orange" />
                <span className="text-2xl font-bold">{score}</span>
              </div>
              <p className="text-sm text-muted-foreground">Score</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{level}</span>
              </div>
              <p className="text-sm text-muted-foreground">Level</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-secondary" />
                <span className="text-2xl font-bold">{attempts}</span>
              </div>
              <p className="text-sm text-muted-foreground">Attempts</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Button onClick={newGame} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                New Game
              </Button>
            </CardContent>
          </Card>
        </div>

        {!gameStarted && !gameOver && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">How to Play</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Use the available numbers and operations to create an expression</li>
                <li>• Try to make your expression equal the target number</li>
                <li>• Each number can be used only once per attempt</li>
                <li>• Division must result in an integer</li>
                <li>• Higher levels give more points but are more challenging</li>
                <li>• You have {MAX_ATTEMPTS} attempts per level</li>
              </ul>
              <div className="mt-6 text-center">
                <Button onClick={newGame} size="lg">
                  Start Game
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {gameStarted && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-center">
                  Target Number: <span className="text-3xl font-bold text-primary">{targetNumber}</span>
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Your Expression</h3>
                  <div className="min-h-[60px] p-4 bg-muted rounded-lg border-2 border-dashed border-border">
                    <div className="text-2xl font-mono">
                      {currentExpression || "Select numbers and operations..."}
                    </div>
                    {selectedNumbers.length > operations.length && (
                      <div className="text-lg text-muted-foreground mt-2">
                        Current Result: {calculateResult()?.toFixed(0) ?? "Invalid"}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 justify-center mt-4">
                    <Button onClick={checkSolution} disabled={selectedNumbers.length === 0}>
                      Check Solution
                    </Button>
                    <Button variant="outline" onClick={clearExpression}>
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      onClick={undo}
                      disabled={selectedNumbers.length === 0 && operations.length === 0}
                    >
                      Undo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Available Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {currentNumbers.map((number, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      onClick={() => handleNumberClick(number, index)}
                      disabled={usedNumberIndices.includes(index)}
                      className="aspect-square text-xl font-bold hover:scale-105 transition-transform"
                    >
                      {number}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                  {["+", "-", "×", "÷"].map((op) => (
                    <Button
                      key={op}
                      variant="secondary"
                      size="lg"
                      onClick={() => handleOperationClick(op)}
                      disabled={selectedNumbers.length === 0 || operations.length >= selectedNumbers.length - 1}
                      className="aspect-square text-2xl font-bold hover:scale-105 transition-transform"
                    >
                      {op}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {gameOver && (
          <Card className="mt-6 border-green-500 bg-green-500/10 text-center">
            <CardContent className="p-6">
              <Trophy className="w-12 h-12 text-bitcoin-orange mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-muted-foreground mb-4">
                You completed all levels! Your final score is:
              </p>
              <Badge variant="secondary" className="text-lg px-4 py-2 mb-2">
                Score: {score}
              </Badge>
              <p className="text-muted-foreground mb-4">
                High Score: {highScore}
              </p>
              <Button onClick={newGame} className="w-full" size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default NumberGameApp;