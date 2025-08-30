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
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [operations, setOperations] = useState<string[]>([]);
  const [currentExpression, setCurrentExpression] = useState("");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const generatePuzzle = (difficulty: number) => {
    const numCount = Math.min(4 + Math.floor(difficulty / 3), 6);
    const target = Math.floor(Math.random() * (50 * difficulty)) + 10;
    
    const numbers = [];
    for (let i = 0; i < numCount; i++) {
      numbers.push(Math.floor(Math.random() * (10 * difficulty)) + 1);
    }
    
    setTargetNumber(target);
    setCurrentNumbers(numbers);
    setSelectedNumbers([]);
    setOperations([]);
    setCurrentExpression("");
  };

  useEffect(() => {
    generatePuzzle(level);
  }, [level]);

  const handleNumberClick = (number: number, index: number) => {
    if (selectedNumbers.length === 0) {
      setSelectedNumbers([number]);
      setCurrentExpression(number.toString());
    } else if (operations.length === selectedNumbers.length) {
      // Need an operation first
      return;
    } else {
      setSelectedNumbers([...selectedNumbers, number]);
      setCurrentExpression(prev => prev + " " + number);
    }
  };

  const handleOperationClick = (op: string) => {
    if (selectedNumbers.length === 0 || operations.length >= selectedNumbers.length) {
      return;
    }
    
    setOperations([...operations, op]);
    setCurrentExpression(prev => prev + " " + op);
  };

  const evaluateExpression = (expression: string): number => {
    try {
      // Simple evaluation for basic operations
      return Function('"use strict"; return (' + expression.replace(/\s/g, '') + ')')();
    } catch {
      return NaN;
    }
  };

  const checkSolution = () => {
    if (selectedNumbers.length === 0) return;
    
    const expressionToEval = currentExpression.replace(/×/g, '*').replace(/÷/g, '/');
    const result = evaluateExpression(expressionToEval);
    
    setAttempts(prev => prev + 1);
    
    if (Math.abs(result - targetNumber) < 0.001) {
      const points = Math.max(100 - attempts * 10, 10) * level;
      setScore(prev => prev + points);
      
      toast({
        title: "Correct! 🎉",
        description: `You earned ${points} points! Moving to level ${level + 1}`,
        variant: "default"
      });
      
      setLevel(prev => prev + 1);
      setAttempts(0);
      generatePuzzle(level + 1);
    } else {
      toast({
        title: "Not quite right",
        description: `Your result: ${result.toFixed(2)}, Target: ${targetNumber}`,
        variant: "destructive"
      });
    }
  };

  const clearExpression = () => {
    setSelectedNumbers([]);
    setOperations([]);
    setCurrentExpression("");
  };

  const newGame = () => {
    setLevel(1);
    setScore(0);
    setAttempts(0);
    setGameStarted(true);
    generatePuzzle(1);
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
        {/* Game Stats */}
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

        {/* Target Number */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              Target Number: <span className="text-3xl font-bold text-primary">{targetNumber}</span>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Current Expression */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Your Expression</h3>
              <div className="min-h-[60px] p-4 bg-muted rounded-lg border-2 border-dashed border-border">
                <div className="text-2xl font-mono">
                  {currentExpression || "Select numbers and operations..."}
                </div>
              </div>
              <div className="flex gap-4 justify-center mt-4">
                <Button onClick={checkSolution} disabled={selectedNumbers.length === 0}>
                  Check Solution
                </Button>
                <Button variant="outline" onClick={clearExpression}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Numbers */}
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
                  className="aspect-square text-xl font-bold hover:scale-105 transition-transform"
                >
                  {number}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Operations */}
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
                  className="aspect-square text-2xl font-bold hover:scale-105 transition-transform"
                >
                  {op}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Use the available numbers and operations to create an expression</li>
              <li>• Try to make your expression equal the target number</li>
              <li>• You can use each number multiple times</li>
              <li>• Higher levels give more points but are more challenging</li>
              <li>• Fewer attempts = higher score bonus!</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NumberGameApp;