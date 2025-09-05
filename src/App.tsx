import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, HashRouter, BrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TodoApp from "./pages/TodoApp";
import NotesApp from "./pages/NotesApp";
import CrowdfundingApp from "./pages/CrowdfundingApp";
import ChatApp from "./pages/ChatApp";
import MemoryGameApp from "./pages/MemoryGameApp";
import PuzzleGameApp from "./pages/PuzzleGameApp";
import NumberGameApp from "./pages/NumberGameApp";
import LogicGameApp from "./pages/LogicGameApp";
import BlogApp from "./pages/BlogApp";
import LotteryApp from "./pages/LotteryApp";
import LearnMore from "./pages/LearnMore";
import Navbar from "./components/Navbar";
import VotingApp from "./pages/VotingApp";
import Dashboard from "./pages/DashBoard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
          <Navbar/>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/todo" element={<TodoApp />} />
          <Route path="/notes" element={<NotesApp />} />
          <Route path="/crowdfunding" element={<CrowdfundingApp />} />
          <Route path="/chat" element={<ChatApp />} />
          <Route path="game/memory-game" element={<MemoryGameApp />} />
          <Route path="game/puzzle-game" element={<PuzzleGameApp />} />
          <Route path="game/number-game" element={<NumberGameApp />} />
          <Route path="/number-game" element={<NumberGameApp />} />
          <Route path="game/logic-game" element={<LogicGameApp />} />
          <Route path="/blog" element={<BlogApp />} />
          <Route path="/lottery" element={<LotteryApp />} />
          <Route path="/vote-app" element={<VotingApp />} />
            <Route path="/learn-more" element={<LearnMore />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;