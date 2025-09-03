import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Shield, Lock, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Program, BN } from "@project-serum/anchor";
import { getMessageAddress, getThreadAddress, useProgram } from "@/utils/solana-program";

interface ThreadAccount {
  sender: PublicKey;
  recipient: PublicKey;
}

interface MessageAccount {
  sender: PublicKey;
  thread: PublicKey;
  content: string;
  timestamp: BN;
}

const ChatApp = () => {
  const { toast } = useToast();
  const wallet = useWallet();
  const program = useProgram();
  const [selectedChat, setSelectedChat] = useState<PublicKey | null>(null);
  const [message, setMessage] = useState("");
  const [newPubkey, setNewPubkey] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [threads, setThreads] = useState<
    { publicKey: PublicKey; account: ThreadAccount }[]
  >([]);
  const [messages, setMessages] = useState<
    { publicKey: PublicKey; account: MessageAccount }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

 const loadThreads = async () => {
  if (!wallet.publicKey || !program) {
    setThreads([]);
    return;
  }
  setLoading(true);
  try {
    const allThreads = await program.account.thread.all();
    const myThreads = allThreads.filter(
      (t: any) =>
        t.account.sender.equals(wallet.publicKey) ||
        t.account.recipient.equals(wallet.publicKey)
    );
    setThreads(myThreads as { publicKey: PublicKey; account: ThreadAccount }[]);
  } catch (error) {
    console.error("Error loading threads:", error);
    toast({
      title: "Error",
      description: "Failed to load chats.",
      variant: "destructive",
    });
    setThreads([]);
  } finally {
    setLoading(false);
  }
};


  const loadMessages = async () => {
    if (!selectedChat || !program) {
      setMessages([]);
      return;
    }
    setLoading(true);
    try {
      const allMessages = await program.account.message.all([
        {
          memcmp: {
            offset: 8 + 32, // Offset for the 'thread' field
            bytes: selectedChat.toBase58(),
          },
        },
      ]);
      const sortedMessages = allMessages.sort(
        (a: any, b: any) =>
          a.account.timestamp.toNumber() - b.account.timestamp.toNumber()
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive",
      });
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.connected && program) {
      loadThreads();
    }
  }, [wallet.connected]);

  useEffect(() => {
    if (selectedChat && program) {
      loadMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInitializeThread = async () => {
    if (!wallet.publicKey || !program || !newPubkey.trim()) {
      toast({
        title: "Error",
        description: "Wallet not connected or invalid input.",
        variant: "destructive",
      });
      return;
    }

    let recipientKey: PublicKey;
    try {
      recipientKey = new PublicKey(newPubkey.trim());
    } catch (error) {
      toast({
        title: "Invalid Public Key",
        description: "Please enter a valid Solana public key.",
        variant: "destructive",
      });
      return;
    }

    if (recipientKey.equals(wallet.publicKey)) {
      toast({
        title: "Invalid Recipient",
        description: "Cannot chat with yourself.",
        variant: "destructive",
      });
      return;
    }

    try {
      const threadAddress = getThreadAddress(wallet.publicKey, recipientKey);
      const threadAccountInfo = await program.provider.connection.getAccountInfo(threadAddress);
      if (threadAccountInfo) {
        toast({
          title: "Chat Exists",
          description: "A chat with this user already exists.",
          variant: "default",
        });
        setSelectedChat(threadAddress);
        setNewPubkey("");
        return;
      }

      const minBalance = await program.provider.connection.getMinimumBalanceForRentExemption(72);
      const balance = await program.provider.connection.getBalance(wallet.publicKey);
      if (balance < minBalance) {
        toast({
          title: "Insufficient Funds",
          description: `Need at least ${(minBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL for account creation.`,
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);
      await program.methods
        .initializeThread()
        .accounts({
          thread: threadAddress,
          sender: wallet.publicKey,
          recipient: recipientKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: "confirmed" });

      toast({
        title: "Chat Created",
        description: "New decentralized chat thread initialized!",
      });
      setNewPubkey("");
      await loadThreads();
      setSelectedChat(threadAddress);
    } catch (error: any) {
      console.error("Error initializing thread:", error);
      let errorMessage = "Failed to initialize chat.";
      if (error.message) {
        errorMessage += ` Details: ${error.message}`;
      } else if (error.logs) {
        errorMessage += ` Details: ${error.logs.join(", ")}`;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !program) return;

    setIsSubmitting(true);
    try {
      const timestamp = new BN(Date.now());
      const messageAddress = getMessageAddress(
        selectedChat,
        wallet.publicKey!,
        timestamp.toNumber()
      );

      await program.methods
        .sendMessage(message ,timestamp)
        .accounts({
          message: messageAddress,
          thread: selectedChat,
          sender: wallet.publicKey!,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast({
        title: "Message Sent",
        description: "Your message is now on the blockchain.",
      });
      setMessage("");
      await loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRecipientKey = (thread: { account: ThreadAccount } | undefined): PublicKey | null => {
    if (!thread || !wallet.publicKey) return null;
    return thread.account.sender.equals(wallet.publicKey)
      ? thread.account.recipient
      : thread.account.sender;
  };

  const formatKey = (key: PublicKey): string => {
    const keyStr = key.toBase58();
    return `${keyStr.slice(0, 6)}...${keyStr.slice(-4)}`;
  };

  const formattedMessages = messages.map((msg) => ({
    id: msg.publicKey.toBase58(),
    sender: msg.account.sender.equals(wallet.publicKey) ? "You" : formatKey(msg.account.sender),
    content: msg.account.content,
    timestamp: new Date(msg.account.timestamp.toNumber()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isOwn: msg.account.sender.equals(wallet.publicKey),
  }));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4 mt-12">
          {selectedChat && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedChat(null)}
              className="flex items-center gap-2 md:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">Decentralized Chat</h1>
            <Badge variant="secondary" className="text-xs">
              Public Key Based
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex-1 w-full flex overflow-hidden">
        <div
          className={`w-full md:w-80 border-r border-border bg-card flex-shrink-0 flex-grow-0 flex flex-col ${
            selectedChat ? "hidden md:flex" : ""
          }`}
        >
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-lg">Chats</h2>
            <p className="text-muted-foreground text-sm">All identified by wallet addresses</p>
          </div>
          <div className="p-3 flex gap-2 border-b border-border">
            <Input
              value={newPubkey}
              onChange={(e) => setNewPubkey(e.target.value)}
              placeholder="Enter wallet address..."
              className="flex-1 text-sm"
              disabled={isSubmitting || !wallet.publicKey}
            />
            <Button
              size="sm"
              onClick={handleInitializeThread}
              disabled={isSubmitting || !wallet.publicKey}
            >
              {isSubmitting ? <span className="animate-pulse">...</span> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Loading chats...</div>
            ) : threads.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No chats found.</div>
            ) : (
              threads.map((thread) => {
                const recipientKey = getRecipientKey(thread);
                if (!recipientKey) return null;
                return (
                  <div
                    key={thread.publicKey.toBase58()}
                    onClick={() => setSelectedChat(thread.publicKey)}
                    className={`p-4 cursor-pointer hover:bg-muted/50 border-b border-border/50 transition-colors ${
                      selectedChat && selectedChat.equals(thread.publicKey) ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{formatKey(recipientKey)[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium truncate">{formatKey(recipientKey)}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm truncate">
                          Start chatting...
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col ${selectedChat ? "" : "hidden md:flex"}`}>
          {selectedChat ? (
            <>
              <div className="p-4 border-b border-border bg-card flex items-center gap-3 flex-shrink-0">
                {(() => {
                  const thread = threads.find((t) => t.publicKey.equals(selectedChat));
                  const recipientKey = getRecipientKey(thread);
                  if (!recipientKey) {
                    return <div className="text-muted-foreground">Invalid chat selected</div>;
                  }
                  return (
                    <>
                      <Avatar>
                        <AvatarFallback>{formatKey(recipientKey).slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{formatKey(recipientKey)}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Lock className="w-3 h-3" />
                          Messages stored on-chain
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {formattedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-border bg-card flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                    disabled={isSubmitting}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isSubmitting}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a public key to start chatting</p>
                <p className="text-sm">All chats are decentralized</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatApp;