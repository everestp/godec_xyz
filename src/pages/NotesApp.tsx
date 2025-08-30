import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit3, Trash2, FileText, Shield, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotesApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Welcome to Decentralized Notes",
      content: "This is your private, encrypted note space. All your thoughts and ideas are stored securely using blockchain technology. No one can access your notes without your private key.",
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000)
    },
    {
      id: "2", 
      title: "Benefits of Decentralization",
      content: "1. Complete privacy and ownership of your data\n2. No central authority can censor or delete your content\n3. Your notes are always available to you\n4. Built-in encryption protects your sensitive information",
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000)
    }
  ]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setIsEditing(true);
  };

  const saveNote = () => {
    if (selectedNote) {
      const updatedNote = {
        ...selectedNote,
        title: editTitle || "Untitled",
        content: editContent,
        updatedAt: new Date()
      };
      setNotes(notes.map(note => note.id === selectedNote.id ? updatedNote : note));
      setSelectedNote(updatedNote);
      setIsEditing(false);
      toast({
        title: "Note Saved",
        description: "Your note has been encrypted and stored securely.",
      });
    }
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
    toast({
      title: "Note Deleted",
      description: "Note has been permanently removed from your encrypted storage.",
    });
  };

  const startEditing = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(true);
  };

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
              <p className="text-sm text-muted-foreground">Secure note-taking with end-to-end encryption</p>
            </div>

            <Badge variant="outline" className="text-primary border-primary/30">
              <Shield className="w-3 h-3 mr-1" />
              Encrypted
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Search and New Note */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={createNewNote} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </div>

            {/* Notes List */}
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Your Notes ({filteredNotes.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className={`p-3 cursor-pointer border-l-2 transition-colors hover:bg-muted/50 ${
                        selectedNote?.id === note.id
                          ? "border-primary bg-primary/5"
                          : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm truncate">{note.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {note.content || "No content"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {note.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  
                  {filteredNotes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notes found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedNote ? (
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-lg font-semibold"
                        placeholder="Note title..."
                      />
                    ) : (
                      <CardTitle className="text-lg">{selectedNote.title}</CardTitle>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Last updated: {selectedNote.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={saveNote} size="sm">
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => startEditing(selectedNote)}
                        size="sm"
                        variant="outline"
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
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {selectedNote.content || (
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