import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Clock, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface LogicPuzzle {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const LogicGameApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentPuzzle, setCurrentPuzzle] = useState<LogicPuzzle | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const puzzles: LogicPuzzle[] = [
    {
      question: "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies.",
      options: ["True", "False", "Cannot be determined"],
      correctAnswer: 0,
      explanation: "This is a valid logical syllogism. If A→B and B→C, then A→C.",
      difficulty: "Easy"
    },
    {
      question: "A man lives on the 20th floor of an apartment building. Every morning he takes the elevator down to the first floor. When he comes home, he takes the elevator to the 10th floor and walks the rest of the way... except on rainy days, when he takes the elevator all the way to the 20th floor. Why?",
      options: ["He's trying to get exercise", "He's short and can't reach the 20th floor button", "The elevator is broken above the 10th floor", "He forgets which floor he lives on"],
      correctAnswer: 1,
      explanation: "He's too short to reach the 20th floor button, except when he has an umbrella on rainy days.",
      difficulty: "Medium"
    },
    {
      question: "You have 12 balls that look identical. One of them weighs slightly more than the others. Using a balance scale only 3 times, how can you identify the heavier ball?",
      options: ["Divide into groups of 4", "Divide into groups of 6", "Weigh them one by one", "It's impossible with only 3 weighings"],
      correctAnswer: 0,
      explanation: "Divide into 3 groups of 4. Compare two groups - if balanced, the heavier ball is in the third group. Then use similar logic to narrow down.",
      difficulty: "Hard"
    },
    {
      question: "If you're running a race and you pass the person in 2nd place, what place are you in now?",
      options: ["1st place", "2nd place", "3rd place", "It depends on how many people were ahead"],
      correctAnswer: 1,
      explanation: "If you pass the person in 2nd place, you take their position and become 2nd place.",
      difficulty: "Easy"
    },
    {
      question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
      options: ["$0.10", "$0.05", "$0.50", "$1.00"],
      correctAnswer: 1,
      explanation: "If the ball costs $0.05, then the bat costs $1.05 ($1.00 more), totaling $1.10.",
      difficulty: "Medium"
    },
    {
      question: "Every day, a monk walks up a mountain path starting at 6 AM and reaches the top at 6 PM. The next day, he walks down the same path starting at 6 AM and reaches the bottom at 6 PM. Is there a point on the path where the monk was at the exact same time on both days?",
      options: ["Yes, definitely", "No, impossible", "Only if he walks at constant speed", "Depends on the path"],
      correctAnswer: 0,
      explanation: "Yes! Imagine both journeys happening on the same day - the two monks must meet at some point.",
      difficulty: "Hard"
    }
  ];

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStarted]);

  const startNewGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setTimer(0);
    setGameStarted(true);
    loadPuzzle();
  };

  const loadPuzzle = () => {
    const availablePuzzles = puzzles.filter(p => {
      if (currentLevel <= 2) return p.difficulty === "Easy";
      if (currentLevel <= 4) return p.difficulty === "Medium";
      return p.difficulty === "Hard";
    });
    
    const randomPuzzle = availablePuzzles[Math.floor(Math.random() * availablePuzzles.length)];
    setCurrentPuzzle(randomPuzzle);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || !currentPuzzle) return;

    const isCorrect = selectedAnswer === currentPuzzle.correctAnswer;
    const points = isCorrect ? (currentLevel * 100) : 0;
    
    if (isCorrect) {
      setScore(prev => prev + points);
      toast({
        title: "Correct! 🧠",
        description: `You earned ${points} points!`,
        variant: "default"
      });
      setCurrentLevel(prev => prev + 1);
    } else {
      toast({
        title: "Incorrect 🤔",
        description: "Read the explanation and try the next puzzle!",
        variant: "destructive"
      });
    }

    setShowExplanation(true);
  };

  const nextPuzzle = () => {
    loadPuzzle();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-500";
      case "Medium": return "text-yellow-500";
      case "Hard": return "text-red-500";
      default: return "text-muted-foreground";
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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-bitcoin bg-clip-text text-transparent">
            Logic Challenge
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Test your logical reasoning and critical thinking skills with challenging puzzles and brain teasers.
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
                <Lightbulb className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{currentLevel}</span>
              </div>
              <p className="text-sm text-muted-foreground">Level</p>
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
              <Button onClick={startNewGame} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                New Game
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Puzzle */}
        {currentPuzzle && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">Logic Puzzle #{currentLevel}</CardTitle>
                <Badge className={getDifficultyColor(currentPuzzle.difficulty)}>
                  {currentPuzzle.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg leading-relaxed p-4 bg-muted rounded-lg">
                {currentPuzzle.question}
              </div>

              <div className="space-y-3">
                {currentPuzzle.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={`w-full p-4 text-left border rounded-lg transition-all ${
                      selectedAnswer === index
                        ? showExplanation
                          ? index === currentPuzzle.correctAnswer
                            ? "border-green-500 bg-green-500/20"
                            : "border-red-500 bg-red-500/20"
                          : "border-primary bg-primary/20"
                        : showExplanation && index === currentPuzzle.correctAnswer
                          ? "border-green-500 bg-green-500/20"
                          : "border-border hover:border-primary/50"
                    } ${showExplanation ? "cursor-default" : "hover:scale-[1.02]"}`}
                  >
                    <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </button>
                ))}
              </div>

              {!showExplanation ? (
                <Button 
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full"
                  size="lg"
                >
                  Submit Answer
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-lg border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Explanation:
                    </h4>
                    <p className="text-muted-foreground">{currentPuzzle.explanation}</p>
                  </div>
                  
                  <Button onClick={nextPuzzle} className="w-full" size="lg">
                    Next Puzzle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!gameStarted && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Play</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Read each logic puzzle carefully and think through the problem</li>
                <li>• Select your answer from the multiple choice options</li>
                <li>• Each correct answer earns points based on the current level</li>
                <li>• Difficulty increases as you progress through levels</li>
                <li>• Learn from explanations to improve your logical reasoning skills</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default LogicGameApp;