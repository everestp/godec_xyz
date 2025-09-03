import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit3, Trash2, FileText, Shield, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { Program } from "@coral-xyz/anchor";
import { getNoteAddress, useProgram } from "@/utils/solana-program";

// Type definitions
interface Note {
  author: PublicKey;
  title: string;
  content: string;
  createdAt: number;
  lastUpdate: number;
}

interface NoteAccount {
  publicKey: PublicKey;
  account: Note;
}

const NotesApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const wallet = useWallet();
  const program = useProgram();

  // State management
  const [notes, setNotes] = useState<NoteAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteAccount | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
// const [filteredNotes ,setFilteredNotes]= useState([])
  // Function to load notes from blockchain
  const loadNotes = async () => {
    if (!wallet.publicKey || !program) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetchedNotes = await program.account.noteAccount.all([
        {
          memcmp: {
            offset: 8,
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);
      setNotes(fetchedNotes as NoteAccount[]);
    } catch (error) {
      console.error("Error loading notes:", error);
      toast({
        title: "Error",
        description: "Failed to load notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch and re-fetch on dependency changes
  useEffect(() => {
    if(wallet.connected){
      loadNotes()
    }
    
  }, [wallet.connected]); // Correct dependencies

  // Update form fields when selecting a note
  useEffect(() => {
    if (selectedNote) {
      setEditTitle(selectedNote.account.title);
      setEditContent(selectedNote.account.content);
    }
  }, [selectedNote]);

  // Create a new note
  const createNote = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill both title and content.",
        variant: "destructive",
      });
      return;
    }
    if (newTitle.length > 1000 || newContent.length > 1000) {
      toast({
        title: "Validation Error",
        description: "Title (max 100 chars) or content (max 1000 chars) is too long.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!program || !wallet.publicKey) throw new Error("Program or wallet not found.");

      const noteAddress = getNoteAddress(wallet.publicKey, newTitle);

      await program.methods
        .createNote(newTitle, newContent)
        .accounts({
          noteAccount: noteAddress,
          author: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast({
        title: "Success",
        description: "Note created successfully!",
      });
      setNewTitle("");
      setNewContent("");
      await loadNotes(); // Trigger a fresh data load
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "Error",
        description: "Failed to create note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing note
  const updateNote = async () => {
    if (!selectedNote) return;
    if (!editContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Content cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (editContent.length > 1000) {
      toast({
        title: "Validation Error",
        description: "Content (max 1000 chars) is too long.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!program || !wallet.publicKey) throw new Error("Program or wallet not found.");

      await program.methods
        .updateNote(editContent)
        .accounts({
          noteAccount: selectedNote.publicKey,
          author: wallet.publicKey,
        })
        .rpc();

      toast({
        title: "Success",
        description: "Note updated successfully!",
      });
      setIsEditing(false);
      await loadNotes(); // Trigger a fresh data load
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update note.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete note
  const deleteNote = async (noteToDelete: NoteAccount) => {
    setIsSubmitting(true);
    try {
      if (!program || !wallet.publicKey) throw new Error("Program or wallet not found.");

      await program.methods
        .deleteNote()
        .accounts({
          noteAccount: noteToDelete.publicKey,
          author: wallet.publicKey,
        })
        .rpc();

      toast({
        title: "Success",
        description: "Note deleted successfully!",
      });
      if (selectedNote?.publicKey.toBase58() === noteToDelete.publicKey.toBase58()) {
        setSelectedNote(null);
        setIsEditing(false);
      }
      await loadNotes(); // Trigger a fresh data load
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter notes based on search term


    const filteredNotes = notes.filter(
      (note) =>
        note.account.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.account.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

 

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary">Private Notes</h1>
              <p className="text-sm text-muted-foreground">Secure note-taking with a decentralized backend.</p>
            </div>
            <Badge variant="outline" className="text-primary border-primary/30">
              <Shield className="w-3 h-3 mr-1" />
              On-chain
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
              <Button
                onClick={() => {
                  setIsCreating(true);
                  setSelectedNote(null);
                  setNewTitle("");
                  setNewContent("");
                }}
                className="w-full"
                disabled={isSubmitting}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </div>

            <Card className="flex-1 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Your Notes ({filteredNotes.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">Loading notes...</p>
                    </div>
                  ) : filteredNotes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notes found</p>
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <div
                        key={note.publicKey.toBase58()}
                        onClick={() => {
                          if (!isSubmitting) {
                            setSelectedNote(note);
                            setIsCreating(false);
                            setIsEditing(false);
                          }
                        }}
                        className={`p-3 cursor-pointer border-l-2 transition-colors hover:bg-muted/50 ${
                          selectedNote?.publicKey.toBase58() === note.publicKey.toBase58()
                            ? "border-primary bg-primary/5"
                            : "border-transparent"
                        } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sm truncate">{note.account.title}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isSubmitting) deleteNote(note);
                            }}
                            className="h-6 w-6 p-0"
                            disabled={isSubmitting}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {note.account.content || "No content"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(note.account.createdAt * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {isCreating ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">New Note</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={createNote} size="sm" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                      size="sm"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <Input
                    placeholder="Note title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="text-lg font-semibold"
                    disabled={isSubmitting}
                  />
                  <Textarea
                    placeholder="Write your note here..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="min-h-[400px] resize-none"
                    disabled={isSubmitting}
                  />
                </CardContent>
              </Card>
            ) : selectedNote ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-lg font-semibold"
                        placeholder="Note title..."
                        disabled
                      />
                    ) : (
                      <CardTitle className="text-lg">{selectedNote.account.title}</CardTitle>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Last updated: {new Date(selectedNote.account.lastUpdate * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={updateNote} size="sm" disabled={isSubmitting}>
                          {isSubmitting ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setEditTitle(selectedNote.account.title);
                            setEditContent(selectedNote.account.content);
                          }}
                          size="sm"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        size="sm"
                        variant="outline"
                        disabled={isSubmitting}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  {isEditing ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Write your note here..."
                      className="min-h-[400px] resize-none"
                      disabled={isSubmitting}
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {selectedNote.account.content || (
                          <span className="text-muted-foreground italic">
                            This note is empty. Click Edit to add content.
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a note to view</h3>
                  <p className="text-muted-foreground">
                    Choose a note from the sidebar or create a new one to get started.
                  </p>
                  {!wallet.publicKey && (
                    <p className="mt-4 text-red-500">
                      Please connect your wallet to see your notes.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesApp;