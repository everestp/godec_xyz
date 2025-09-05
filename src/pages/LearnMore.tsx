import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bitcoin, Github, Linkedin, Code, Layers, ShieldCheck, Zap, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const LearnMore = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 py-20 relative text-center">
          <Badge variant="outline" className="mb-6 text-primary text-md border-primary/30 animate-pulse-glow">
            <Bitcoin className="w-4 h-4 mr-2" />
            GoDec: The Vision
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-bitcoin bg-clip-text text-transparent">
            Learn More About Us
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Welcome to the future of decentralized applications.
          </p>
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-6 text-lg"
            onClick={() => navigate('/')}
          >
            Go Back Home
          </Button>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="container mx-auto px-4 py-16">
        
        {/* The Vision Section */}
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">The Vision: <span className="text-primary">Go Decentralized</span></h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            The core objective of godec.xyz is to make the power of decentralized applications accessible to everyone. The name **"GoDec"** stands for **"Go Decentralized,"** representing our mission to build simple, everyday tools on a decentralized network. We believe that users should have complete ownership and control over their data, free from censorship and central authorities.
          </p>
        </section>

        {/* Your Digital Identity Section */}
        <section className="mb-16">
          <Card className="p-8">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Your Digital Identity</CardTitle>
              <CardDescription className="text-lg mt-2">How it Works: Public Key as Your Login</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-md text-muted-foreground mb-6 text-center max-w-3xl mx-auto">
                In this ecosystem, your **public key is your identity**. It acts as your unique, decentralized key to access data and services. Instead of creating a username and password, you simply connect your crypto wallet. Your public key is then used to cryptographically sign transactions and prove ownership of your data, ensuring that only you can access it. This method provides superior security and eliminates the need for a central database of personal information.
              </p>
              <div className="flex justify-center items-center">
                <img 
                  src="https://placehold.co/400x200/292524/a5b4fc?text=Wallet+Login" 
                  alt="Diagram of a decentralized login process" 
                  className="rounded-lg shadow-xl"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Technology Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-2">How It's Built</h2>
            <p className="text-lg text-muted-foreground">A Modern and Robust Technology Stack</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <div className="flex justify-center mb-4">
                <Layers className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold mb-2">Solana Blockchain</CardTitle>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We leverage the **Solana blockchain** for its high throughput and extremely low transaction fees. This makes it a perfect foundation for building scalable, everyday applications where a fast and affordable user experience is key.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <div className="flex justify-center mb-4">
                <Code className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold mb-2">Rust & TypeScript</CardTitle>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The core logic and smart contracts are written in **Rust**, a language known for its performance and security. The frontend is built with **TypeScript** and **React**, ensuring a type-safe, robust, and highly maintainable codebase.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <div className="flex justify-center mb-4">
                <ShieldCheck className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold mb-2">Decentralized Security</CardTitle>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All data is stored on-chain, eliminating central points of failure and censorship. Your data is always owned by you and is cryptographically secured, ensuring unmatched privacy and control.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* About the Developer Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-2">About the Developer</h2>
          </div>
          <Card className="p-8 max-w-2xl mx-auto transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <img src="https://avatars.githubusercontent.com/u/145990676?v=4" alt="Everest Paudel" className="w-full h-full object-cover"/>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold">Everest Paudel</h3>
                <p className="text-md text-muted-foreground mb-4">Creator of godec.xyz</p>
                <p className="text-sm text-muted-foreground mb-4">
    Everest Paudel is a passionate software developer specializing in decentralized applications (dApps) and infrastructure automation. With a focus on the Solana ecosystem, I build performant, user-friendly, and privacy-focused tools that push the boundaries of Web3 and cloud computing.
</p>
                 <div className="flex justify-center md:justify-start space-x-4">
      <a href="https://github.com/everestp" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" className="flex items-center gap-2">
          <Github className="w-5 h-5" /> GitHub
        </Button>
      </a>
      <a href="https://linkedin.com/in/everestp" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" className="flex items-center gap-2">
          <Linkedin className="w-5 h-5" /> LinkedIn
        </Button>
      </a>
    </div>
              </div>
            </div>
          </Card>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-16">
    <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 text-center md:text-left">
            <h3 className="text-3xl font-extrabold  text-primary">
                Ready to Go Decentralized?
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                Connect your wallet today and take your first step into a world of true digital freedom and privacy.
            </p>
         <WalletMultiButton style={{ background: 'orange', color: "white" }} />
        </div>
        
        <div className="md:col-span-1 text-center md:text-right">
            <div className="flex justify-center md:justify-end space-x-4 mb-4">
                <a href="#" className="text-muted-foreground hover:text-white transition-colors duration-300">Terms of Service</a>
                <a href="#" className="text-muted-foreground hover:text-white transition-colors duration-300">Privacy Policy</a>
            </div>
            <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} godec.xyz - Empowering decentralization, one app at a time.
            </p>
        </div>
    </div>
</footer>
    </div>
  );
};

export default LearnMore;
