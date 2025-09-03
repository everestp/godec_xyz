import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Lock, Shield, CheckCircle2, CircleDashed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { getTaskAddress, useProgram } from "@/utils/solana-program";
import BN from 'bn.js'; // Import BN.js library

// Type definitions for on-chain Todo
interface Todo {
  author: PublicKey;
  taskTitle: string; // Corrected field name
  isCompleted: boolean; // Corrected field name
  createdAt: BN; // Corrected type
  lastUpdate: BN; // Corrected type
}

interface TodoAccount {
  publicKey: PublicKey;
  account: Todo;
}

const TodoApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const wallet = useWallet();
  const program = useProgram();

  // State for UI and on-chain interactions
  const [todos, setTodos] = useState<TodoAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTodo, setNewTodo] = useState("");

  // Function to fetch todos from the blockchain
  const loadTodos = async () => {
    if (!wallet.publicKey || !program) {
      setTodos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetchedTodos = await program.account.todoAccount.all([
        {
          memcmp: {
            offset: 8,
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);
      setTodos(fetchedTodos as TodoAccount[]);
    } catch (error) {
      console.error("Error loading todos:", error);
      toast({
        title: "Error",
        description: "Failed to load todos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      loadTodos();
    }
  }, [wallet.connected]);

  // Add a new todo
  const addTodo = async () => {
    if (!newTodo.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a task.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      if (!program || !wallet.publicKey) throw new Error("Program or wallet not found.");

      const todoAddress = getTaskAddress(wallet.publicKey, newTodo);

      await program.methods
        .createTask(newTodo)
        .accounts({
          todoAccount: todoAddress,
          author: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast({
        title: "Success",
        description: "Task added successfully!",
      });
      setNewTodo("");
      await loadTodos();
    } catch (error) {
      console.error("Error creating todo:", error);
      toast({
        title: "Error",
        description: "Failed to add task.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle todo completion
  const toggleTodo = async (todoAccount: TodoAccount) => {
    setIsSubmitting(true);
    try {
      if (!program || !wallet.publicKey) throw new Error("Program or wallet not found.");

      await program.methods
        .markComplete()
        .accounts({
          todoAccount: todoAccount.publicKey,
          author: wallet.publicKey,
        })
        .rpc();

      toast({
        title: "Success",
        description: "Task status updated!",
      });
      await loadTodos();
    } catch (error) {
      console.error("Error toggling todo:", error);
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a todo
  const deleteTodo = async (todoAccount: TodoAccount) => {
    setIsSubmitting(true);
    try {
      if (!program || !wallet.publicKey) throw new Error("Program or wallet not found.");

      await program.methods
        .deleteTask()
        .accounts({
          todoAccount: todoAccount.publicKey,
          author: wallet.publicKey,
        })
        .rpc();

      toast({
        title: "Success",
        description: "Task deleted!",
      });
      await loadTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = todos.filter(todo => todo.account.isCompleted).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-primary">Secure Todo</h1>
              <p className="text-sm text-muted-foreground">Private task management with end-to-end encryption</p>
            </div>

            <Badge variant="outline" className="text-primary border-primary/30">
              <Shield className="w-3 h-3 mr-1" />
              Encrypted
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="text-center bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">{todos.length}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </CardContent>
            </Card>
            <Card className="text-center bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-accent">{completedCount}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card className="text-center bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-orange-500">{todos.length - completedCount}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
          </div>

          {/* Add Todo */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Add New Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Enter your task..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTodo()}
                  className="flex-1"
                  disabled={isSubmitting || !wallet.publicKey}
                />
                <Button onClick={addTodo} className="px-6 w-full sm:w-auto" disabled={isSubmitting || !wallet.publicKey}>
                  {isSubmitting ? "Adding..." : "Add Task"}
                </Button>
              </div>
              {!wallet.publicKey && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  Please connect your wallet to add tasks.
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Your tasks are stored on-chain.
              </p>
            </CardContent>
          </Card>

          {/* Todo List */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">Loading tasks...</p>
                </div>
              ) : todos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <Plus className="w-8 h-8" />
                  </div>
                  <p className="text-lg">No tasks yet.</p>
                  <p className="text-sm">Add your first task above to see it here.</p>
                </div>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.publicKey.toBase58()}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${
                      todo.account.isCompleted ? "bg-muted/50 border-accent/30" : "bg-card border-border/50"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={todo.account.isCompleted}
                        onCheckedChange={() => toggleTodo(todo)}
                        className={`rounded-full w-6 h-6 transition-colors ${
                          todo.account.isCompleted
                            ? "bg-accent border-accent"
                            : "border-border/50"
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Todo Content - Title and Date */}
                    <div className="flex-1 overflow-hidden">
                      <p
                        className={`font-medium text-base transition-colors ${
                          todo.account.isCompleted
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {todo.account.taskTitle}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {new Date(todo.account.createdAt.toNumber() * 1000).toLocaleString()}
                         Update: {new Date(todo.account.lastUpdate.toNumber() * 1000).toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTodo(todo)}
                        className="text-destructive/80 hover:text-destructive transition-colors"
                        title="Delete Todo"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>

                      {/* Status Icon */}
                      <div className="w-5 h-5 flex-shrink-0">
                        {todo.account.isCompleted ? (
                          <CheckCircle2 className="w-full h-full text-accent" />
                        ) : (
                          <CircleDashed className="w-full h-full text-orange-500 animate-spin-slow" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary mb-1">Decentralized Privacy</h3>
                  <p className="text-sm text-muted-foreground">
                    This is not just a to-do list; it's a statement. Your tasks are stored securely on a decentralized network.
                    Your private key is the only way to access and modify your data. No central database, no data breaches.
                    Just you and your data, on the blockchain.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TodoApp;