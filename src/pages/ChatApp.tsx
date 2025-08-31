import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Shield, Lock, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface Contact {
  pubkey: string;
  lastMessage: string;
  unread: number;
}

const ChatApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [newPubkey, setNewPubkey] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [contacts, setContacts] = useState<Contact[]>([
    { pubkey: "F93xk...QZ12", lastMessage: "See you tomorrow!", unread: 2 },
    { pubkey: "8DKj1...Wf99", lastMessage: "Thanks for the update", unread: 0 }
  ]);

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    "F93xk...QZ12": [
      { id: 1, sender: "F93xk...QZ12", content: "Hey! How are you doing?", timestamp: "10:30 AM", isOwn: false },
      { id: 2, sender: "You", content: "I'm good! Working on the decentralized chat app", timestamp: "10:32 AM", isOwn: true }
    ],
    "8DKj1...Wf99": [
      { id: 1, sender: "You", content: "Here’s the latest update", timestamp: "Yesterday", isOwn: true },
      { id: 2, sender: "8DKj1...Wf99", content: "Thanks for the update", timestamp: "Yesterday", isOwn: false }
    ]
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "You",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOwn: true
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessage]
    }));

    setContacts((prev) =>
      prev.map((c) =>
        c.pubkey === selectedChat ? { ...c, lastMessage: message, unread: 0 } : c
      )
    );

    setMessage("");
    toast({
      title: "Message Sent 🔒",
      description: "Your encrypted message has been delivered",
      variant: "default"
    });
  };

  const handleAddContact = () => {
    if (!newPubkey.trim()) return;

    const formatted = newPubkey.slice(0, 6) + "..." + newPubkey.slice(-4);

    if (!contacts.find((c) => c.pubkey === formatted)) {
      setContacts((prev) => [
        ...prev,
        { pubkey: formatted, lastMessage: "New chat started", unread: 0 }
      ]);
      setMessages((prev) => ({
        ...prev,
        [formatted]: []
      }));
    }
    setNewPubkey("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">Decentralized Chat</h1>
            <Badge variant="secondary" className="text-xs">
              Public Key Based
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto h-[calc(100vh-80px)] flex">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-lg">Chats</h2>
            <p className="text-muted-foreground text-sm">All identified by wallet addresses</p>
          </div>

          {/* Add Contact by Public Key */}
          <div className="p-3 flex gap-2 border-b border-border">
            <Input
              value={newPubkey}
              onChange={(e) => setNewPubkey(e.target.value)}
              placeholder="Enter wallet address..."
              className="flex-1 text-sm"
            />
            <Button size="sm" onClick={handleAddContact}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {contacts.map((contact) => (
              <div
                key={contact.pubkey}
                onClick={() => setSelectedChat(contact.pubkey)}
                className={`p-4 cursor-pointer hover:bg-muted/50 border-b border-border/50 transition-colors ${
                  selectedChat === contact.pubkey ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{contact.pubkey[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium truncate">{contact.pubkey}</h3>
                      {contact.unread > 0 && (
                        <Badge variant="default" className="text-xs">
                          {contact.unread}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm truncate">
                      {contact.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{selectedChat[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedChat}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    Messages stored on-chain
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages[selectedChat]?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.isOwn
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!message.trim()}>
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
