import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Shield, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

const ChatApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState<string | null>("Alice");
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contacts = [
    { name: "Alice", lastMessage: "See you tomorrow!", online: true, unread: 2 },
    { name: "Bob", lastMessage: "Thanks for the update", online: false, unread: 0 },
    { name: "Charlie", lastMessage: "Great idea!", online: true, unread: 1 },
    { name: "Diana", lastMessage: "How's the project going?", online: false, unread: 0 }
  ];

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    Alice: [
      { id: 1, sender: "Alice", content: "Hey! How are you doing?", timestamp: "10:30 AM", isOwn: false },
      { id: 2, sender: "You", content: "I'm good! Working on the new decentralized app", timestamp: "10:32 AM", isOwn: true },
      { id: 3, sender: "Alice", content: "That sounds exciting! Can't wait to see it", timestamp: "10:35 AM", isOwn: false },
      { id: 4, sender: "Alice", content: "See you tomorrow!", timestamp: "10:36 AM", isOwn: false }
    ],
    Bob: [
      { id: 1, sender: "You", content: "Here's the latest update on the project", timestamp: "Yesterday", isOwn: true },
      { id: 2, sender: "Bob", content: "Thanks for the update", timestamp: "Yesterday", isOwn: false }
    ],
    Charlie: [
      { id: 1, sender: "Charlie", content: "What do you think about implementing a DAO?", timestamp: "2 hours ago", isOwn: false },
      { id: 2, sender: "You", content: "That could be really useful for governance", timestamp: "2 hours ago", isOwn: true },
      { id: 3, sender: "Charlie", content: "Great idea!", timestamp: "2 hours ago", isOwn: false }
    ],
    Diana: [
      { id: 1, sender: "Diana", content: "How's the project going?", timestamp: "1 day ago", isOwn: false }
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessage]
    }));

    setMessage("");
    
    toast({
      title: "Message Sent 🔒",
      description: "Your encrypted message has been delivered",
      variant: "default"
    });
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
            <h1 className="text-xl font-bold">Secure Chat</h1>
            <Badge variant="secondary" className="text-xs">
              End-to-End Encrypted
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto h-[calc(100vh-80px)] flex">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r border-border bg-card">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-lg">Contacts</h2>
            <p className="text-muted-foreground text-sm">End-to-end encrypted chats</p>
          </div>
          
          <div className="overflow-y-auto">
            {contacts.map((contact) => (
              <div
                key={contact.name}
                onClick={() => setSelectedChat(contact.name)}
                className={`p-4 cursor-pointer hover:bg-muted/50 border-b border-border/50 transition-colors ${
                  selectedChat === contact.name ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>{contact.name[0]}</AvatarFallback>
                    </Avatar>
                    {contact.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium truncate">{contact.name}</h3>
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
                    Messages are end-to-end encrypted
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
                      <p className={`text-xs mt-1 ${
                        msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
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
                    placeholder="Type your encrypted message..."
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
                <p>Select a contact to start chatting</p>
                <p className="text-sm">All messages are end-to-end encrypted</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatApp;