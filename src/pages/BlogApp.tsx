import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Calendar,
  User,
  Loader2,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getPostAddress,
  getUserAddress,
  useProgram,
} from "@/utils/solana-program";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram } from "@solana/web3.js";

interface BlogPost {
  title: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
}

const BlogApp = () => {
  const { toast } = useToast();
  const wallet = useWallet();
  const program = useProgram();

  const [isUserInitialized, setIsUserInitialized] = useState<boolean | null>(
    null
  );
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    imageUrl: "",
  });
  const [userForm, setUserForm] = useState({ name: "", avatar: "" });
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // States for form visibility and loading
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [isInitializingUser, setIsInitializingUser] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [deletingPostTitle, setDeletingPostTitle] = useState<string | null>(
    null
  );

  const fetchPosts = useCallback(async () => {
    if (!program) return;
    setIsGlobalLoading(true);
    try {
      const postAccounts = await program.account.postAccount.all();
      const userAccounts = await program.account.userAccount.all();

      console.log("This is the post Account", postAccounts);
      console.log("This is the user Account", userAccounts);
      const loaded: BlogPost[] = postAccounts.map(({ account }) => ({
        title: account.title.trim(),
        content: account.content,
        author: (account.authority as PublicKey).toBase58(),
        imageUrl: account.imageUrl,
        date: new Date().toLocaleDateString(),
      }));
      setPosts(
        loaded.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to load posts.", variant: "destructive" });
    } finally {
      setIsGlobalLoading(false);
    }
  }, [ wallet.publicKey ,posts]);

  const checkUser = useCallback(async () => {
    if (!wallet.publicKey || !program) {
      setIsUserInitialized(false);
      setIsGlobalLoading(false);
      return;
    }
    try {
      const user = await program.account.userAccount.fetchNullable(
        getUserAddress(wallet.publicKey)
      );
      setIsUserInitialized(!!user);
    } catch (err) {
      console.error("Error checking user:", err);
      setIsUserInitialized(false);
    } finally {
      setIsGlobalLoading(false);
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    if (wallet.publicKey) {
      checkUser();
      fetchPosts();
    }
  }, [wallet.publicKey]);

  const initializeUser = async () => {
    if (!wallet.publicKey || !program || !userForm.name) {
      return toast({
        title: "Please enter a name.",
        variant: "destructive",
      });
    }

    setIsInitializingUser(true);
    try {
      const userAccount = getUserAddress(wallet.publicKey);
      await program.methods
        .initUser(userForm.name, userForm.avatar)
        .accounts({
          userAccount: userAccount,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setIsUserInitialized(true);
      toast({ title: "Account initialized successfully!" });
    } catch (error) {
      console.error("Error initializing user:", error);
      toast({
        title: "Error",
        description: "Failed to initialize user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInitializingUser(false);
    }
  };

  const createPostOnChain = async () => {
    if (!wallet.publicKey || !program || !newPost.title || !newPost.content) {
      return toast({
        title: "Please fill out the title and content.",
        variant: "destructive",
      });
    }
    setIsCreatingPost(true);

    try {
      const userPDA = getUserAddress(wallet.publicKey);
      const postPDA = getPostAddress(wallet.publicKey, newPost.title.trim());

      await program.methods
        .createPost(newPost.title.trim(), newPost.content.trim(), newPost.imageUrl || "")
        .accounts({
          postAccount: postPDA,
          userAccount: userPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setNewPost({ title: "", content: "", imageUrl: "" });
      setShowNewPostForm(false);
      await fetchPosts();
      toast({ title: "Post created successfully!" });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPost(false);
    }
  };

  const updatePostOnChain = async () => {
    if (!wallet.publicKey || !program || !editingPost) return;

    setIsUpdatingPost(true);
    try {
      const userPDA = getUserAddress(wallet.publicKey);
      const postPDA = getPostAddress(wallet.publicKey, editingPost.title.trim());

      await program.methods
        .updatePost(editingPost.content, editingPost.imageUrl)
        .accounts({
          postAccount: postPDA,
          userAccount: userPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setEditingPost(null);
      await fetchPosts();
      toast({ title: "Post updated successfully!" });
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update blog. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPost(false);
    }
  };

  const deletePost = (post: BlogPost) => async () => {
    if (!wallet.publicKey || !program) return;

    setDeletingPostTitle(post.title);
    try {
      const userPDA = getUserAddress(wallet.publicKey);
      const postPDA = getPostAddress(wallet.publicKey, post.title);

      await program.methods
        .deletePost(post.title)
        .accounts({
          postAccount: postPDA,
          userAccount: userPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await fetchPosts();
      toast({ title: "Post deleted successfully!" });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingPostTitle(null);
    }
  };

  // Helper functions for UI interactions
  const handleNewPostClick = () => {
    setEditingPost(null);
    setSelectedPost(null);
    setShowNewPostForm(true);
  };

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post);
    setEditingPost(null);
    setShowNewPostForm(false);
  };

  // UI Rendering
  if (!wallet.publicKey) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <WalletMultiButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isGlobalLoading || isUserInitialized === null) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isUserInitialized === false) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="max-w-md w-full space-y-4">
          <CardHeader>
            <CardTitle>Initialize Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Name"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm({ ...userForm, name: e.target.value })
                }
                disabled={isInitializingUser}
              />
              <Input
                placeholder="Avatar URL (optional)"
                value={userForm.avatar}
                onChange={(e) =>
                  setUserForm({ ...userForm, avatar: e.target.value })
                }
                disabled={isInitializingUser}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={initializeUser} disabled={isInitializingUser}>
                {isInitializingUser ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Initializing...
                  </>
                ) : (
                  "Initialize"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => wallet.disconnect()}
                disabled={isInitializingUser}
              >
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 mt-10">
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-3xl text-primary font-bold">Decentralized Blog</h1>
        <div className="flex gap-4 items-center">
          <Button
            onClick={handleNewPostClick}
            disabled={isCreatingPost || isUpdatingPost}
          >
            <Plus className="mr-2 h-4 w-4" /> New Post
          </Button>
          <WalletMultiButton />
        </div>
      </header>

      {/* Conditional rendering for the forms */}
      {showNewPostForm && !editingPost ? (
        <Card className="max-w-7xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Title"
              value={newPost.title}
              onChange={(e) =>
                setNewPost({ ...newPost, title: e.target.value })
              }
              disabled={isCreatingPost}
            />
            <Textarea
              placeholder="Content"
              value={newPost.content}
              onChange={(e) =>
                setNewPost({ ...newPost, content: e.target.value })
              }
              rows={10}
              disabled={isCreatingPost}
            />
            <Input
              placeholder="Image URL (optional)"
              value={newPost.imageUrl}
              onChange={(e) =>
                setNewPost({ ...newPost, imageUrl: e.target.value })
              }
              disabled={isCreatingPost}
            />
            <div className="flex gap-3">
              <Button
                onClick={createPostOnChain}
                disabled={isCreatingPost || !newPost.title || !newPost.content}
              >
                {isCreatingPost ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Publishing...
                  </>
                ) : (
                  "Publish Post"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setNewPost({ title: "", content: "", imageUrl: "" });
                  setShowNewPostForm(false);
                }}
                disabled={isCreatingPost}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : editingPost ? (
        <Card className="max-w-7xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>Edit Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={editingPost.title} disabled />
            <Textarea
              value={editingPost.content}
              onChange={(e) =>
                setEditingPost({ ...editingPost, content: e.target.value })
              }
              rows={10}
              disabled={isUpdatingPost}
            />
            <Input
              value={editingPost.imageUrl}
              onChange={(e) =>
                setEditingPost({ ...editingPost, imageUrl: e.target.value })
              }
              disabled={isUpdatingPost}
            />
            <div className="flex gap-3">
              <Button onClick={updatePostOnChain} disabled={isUpdatingPost}>
                {isUpdatingPost ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Updating...
                  </>
                ) : (
                  "Update Post"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingPost(null)}
                disabled={isUpdatingPost}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : selectedPost ? (
        <div className="max-w-4xl mx-auto p-6">
          <Button variant="ghost" onClick={() => setSelectedPost(null)} className="mb-4">
            <X className="mr-2 h-4 w-4" /> Go Back
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>{selectedPost.title}</CardTitle>
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <User className="w-4 h-4" />{" "}
                {selectedPost.author.substring(0, 4)}...
                {selectedPost.author.slice(-4)} &nbsp;
                <Calendar className="w-4 h-4" /> {selectedPost.date}
              </div>
            </CardHeader>
            {selectedPost.imageUrl && (
              <img
                src={selectedPost.imageUrl}
                alt={selectedPost.title}
                className="w-full object-cover rounded-md mb-4"
              />
            )}
            <CardContent>
              <p className="text-lg leading-relaxed">{selectedPost.content}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto">
          {isGlobalLoading ? (
            <Card className="text-center p-12">
              <CardContent className="space-y-4">
                <Loader2 className="animate-spin mx-auto h-8 w-8" />
                <p>Loading posts...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {posts.length === 0 && (
                <div className="text-center p-12">
                  <h3 className="text-2xl font-semibold mb-4">No Posts Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to create a post on the decentralized blog.
                  </p>
                  <Button onClick={handleNewPostClick}>
                    <Plus className="mr-2 h-4 w-4" /> Create First Post
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Card
                    key={post.title}
                    className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
                    onClick={() => handlePostClick(post)}
                  >
                    {post.imageUrl && (
                      <div className="relative overflow-hidden w-full h-48 rounded-t-md">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="flex-grow">
                      <CardTitle>{post.title}</CardTitle>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <User className="w-4 h-4" />{" "}
                        {post.author.substring(0, 4)}...
                        {post.author.slice(-4)} &nbsp;
                        <Calendar className="w-4 h-4" /> {post.date}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                      <p className="line-clamp-3 text-sm">
                        {post.content}
                      </p>
                      {wallet.publicKey?.toBase58() === post.author && (
                        <div className="flex gap-2 mt-4 self-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPost(post);
                              setShowNewPostForm(false);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePost(post)();
                            }}
                            disabled={deletingPostTitle === post.title}
                          >
                            {deletingPostTitle === post.title ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </main>
      )}
    </div>
  );
};

export default BlogApp;