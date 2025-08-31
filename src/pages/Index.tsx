import { AppCard } from "@/components/AppCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bitcoin, Shield, Zap, Users, Brain, Coins } from "lucide-react";

// Import images
import todoImage from "@/assets/todo-card.jpg";
import notesImage from "@/assets/notes-card.jpg";
import crowdfundingImage from "@/assets/crowdfunding-card.jpg";
import chatImage from "@/assets/chat-card.jpg";
import memoryGameImage from "@/assets/memory-game-card.jpg";
import puzzleGameImage from "@/assets/puzzle-game-card.jpg";
import numberGameImage from "@/assets/number-game-card.jpg";
import logicGameImage from "@/assets/logic-game-card.jpg";
import blogImage from "@/assets/blog-card.jpg";
import lotteryImage from "@/assets/lottery-card.jpg";
import {  useNavigate } from "react-router";
import { Link } from "react-router-dom";

const Index = () => {
  const apps = [
    {
      title: "Secure Todo",
      description: "Manage your tasks with complete privacy. Data is stored on the Solana blockchain and accessed with your wallet.",
      image: todoImage,
      route: "/todo",
      category: "Productivity"
    },
    {
      title: "Private Notes",
      description: "Write and store notes securely. Your thoughts are private and tied to your wallet, not a central server.",
      image: notesImage,
      route: "/notes",
      category: "Productivity"
    },
    {
      title: "Crypto Crowdfunding",
      description: "Fund projects with cryptocurrency. Transparent, decentralized funding on Solana for innovative ideas.",
      image: crowdfundingImage,
      route: "/crowdfunding",
      category: "Finance"
    },
    {
      title: "Voting Dapp",
      description: "Fund projects with cryptocurrency. Transparent, decentralized funding on Solana for innovative ideas.",
      image: crowdfundingImage,
      route: "/vote-app",
      category: "Vote"
    },
    {
      title: "Encrypted Chat",
      description: "Secure messaging with friends. Conversations are end-to-end encrypted and managed on-chain.",
      image: chatImage,
      route: "/chat",
      category: "Social"
    },
    {
      title: "Memory Challenge",
      description: "Boost your cognitive abilities with memory games. Train your brain while having fun with on-chain scores.",
      image: memoryGameImage,
      route: "game/memory-game",
      category: "Mind Training"
    },
    {
      title: "Puzzle Solver",
      description: "Enhance logical thinking with challenging puzzles. Progress is saved directly to your wallet.",
      image: puzzleGameImage,
      route: "game/puzzle-game",
      category: "Mind Training"
    },
    {
      title: "Number Games",
      description: "Sharpen mathematical skills with engaging number challenges. Your progress is completely decentralized.",
      image: numberGameImage,
      route: "game/number-game",
      category: "Mind Training"
    },
    {
      title: "Logic Challenges",
      description: "Develop critical thinking through complex logical puzzles. Ideal for career advancement with verifiable on-chain progress.",
      image: logicGameImage,
      route: "game/logic-game",
      category: "Mind Training"
    },
    {
      title: "Decentralized Blog",
      description: "Publish content without censorship. Your voice, your platform, with content stored on the blockchain.",
      image: blogImage,
      route: "/blog",
      category: "Content"
    },
    {
      title: "Crypto Lottery",
      description: "Fair and transparent lottery games. Create or join lotteries with cryptocurrency rewards, powered by Solana.",
      image: lotteryImage,
      route: "/lottery",
      category: "Entertainment"
    }
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Your Data, Your Wallet",
      description: "All your data is stored on-chain, accessible only by your wallet."
    },
    {
      icon: <Bitcoin className="w-6 h-6" />,
      title: "Built on Solana",
      description: "Powered by a fast, scalable, and low-cost blockchain."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized for speed and performance, without compromising security."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Driven",
      description: "Built by the community, for the community, on an open network."
    }
  ];
const navigate = useNavigate()
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 text-primary text-md border-primary/30 animate-pulse-glow">
              <Coins className="w-4 h-4 mr-2" />
              Your First Step to the Decentralized World
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-bitcoin bg-clip-text text-transparent">
              godec.fun
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Experience true digital freedom with a suite of mini-apps built on the **Solana blockchain**. 
              Simply connect your wallet to access your data and progress across all our tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="px-8 py-6 text-lg bitcoin-glow">
                <Brain className="w-5 h-5 mr-2" />
                Connect Wallet
              </Button>
              <Link to={"/learn-more"}>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg" >
                Learn More
              </Button>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-16">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/50 card-hover"
                >
                  <div className="text-primary">
                    {feature.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Apps Grid */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Our <span className="text-primary">Mini-Apps</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Each app is built with Rust and deployed on Solana, ensuring your data is always secure, private, and yours alone. 
            No sign-ups, no central servers—just connect and go.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apps.map((app, index) => (
            <div key={index} className="animate-float" style={{ animationDelay: `${index * 0.1}s` }}>
              <AppCard
                title={app.title}
                description={app.description}
                image={app.image}
                route={app.route}
                category={app.category}
                status={index < 10? "live" : index < 8 ? "beta" : "coming-soon"}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Go Decentralized?</h3>
            <p className="text-muted-foreground mb-6">
              Connect your wallet today and take your first step into a world of true digital freedom and privacy.
            </p>
            <Button className="bitcoin-glow">
              <Bitcoin className="w-4 h-4 mr-2" />
              Get Started Today
            </Button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/30 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} godec.fun - Empowering decentralization, one app at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;