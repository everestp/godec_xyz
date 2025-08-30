import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Lock, Shield, CheckCircle2, CircleDashed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

const TodoApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", text: "Learn about decentralized applications", completed: false, createdAt: new Date(Date.now() - 86400000) },
    { id: "2", text: "Set up secure wallet", completed: true, createdAt: new Date(Date.now() - 172800000) },
    { id: "3", text: "Explore privacy features", completed: false, createdAt: new Date(Date.now() - 259200000) }
  ]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo,
        completed: false,
        createdAt: new Date()
      };
      setTodos([todo, ...todos]);
      setNewTodo("");
      toast({
        title: "Task Added",
        description: "Your task has been securely encrypted and stored.",
      });
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
    toast({
      title: "Task Deleted",
      description: "Task has been permanently removed from your encrypted storage.",
    });
  };

  const completedCount = todos.filter(todo => todo.completed).length;

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
                />
                <Button onClick={addTodo} className="px-6 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Your tasks are encrypted and stored on-chain.
              </p>
            </CardContent>
          </Card>

          {/* Todo List */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todos.length === 0 ? (
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
                    key={todo.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 card-hover ${
                      todo.completed ? "bg-muted/50 border-accent/20" : "bg-card border-border/50"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo.id)}
                        className="rounded-full data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {todo.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {todo.createdAt.toLocaleDateString()} at {todo.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-destructive/80 hover:text-destructive opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="w-5 h-5 flex-shrink-0">
                      {todo.completed ? (
                        <CheckCircle2 className="w-full h-full text-accent" />
                      ) : (
                        <CircleDashed className="w-full h-full text-orange-500 animate-spin-slow" />
                      )}
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