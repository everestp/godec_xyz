import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, Eye, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
  excerpt: string;
  image_url:string;
  reading_time:string
}

const BlogApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: 1,
      title: "The Art of Writing Clean Code",
      content: "Writing clean, maintainable code isn't just a best practice—it's a mindset. It involves structuring your code in a way that is easy for others (and your future self) to understand and modify. We'll explore principles like the **DRY (Don't Repeat Yourself)** principle, the importance of meaningful variable names, and how to refactor your code incrementally. A well-written codebase is like a clear instruction manual, making collaboration and debugging much smoother.",
      author: "Alice Smith",
      date: "2024-03-20",
      tags: ["programming", "best practices", "software development"],
      excerpt: "Master the principles of writing clean, maintainable, and readable code.",
      image_url: "https://example.com/images/clean-code.jpg",
      reading_time: "5 min read"
    },
    {
      id: 2,
      title: "Introduction to Machine Learning with Python",
      content: "Machine learning has moved from a niche academic field to a powerful tool accessible to every developer. This post will guide you through the basics of building your first machine learning model using Python's scikit-learn library. We'll cover supervised vs. unsupervised learning, the key stages of a machine learning project—data preprocessing, model training, and evaluation—and a simple example using a linear regression model to predict housing prices. Get ready to dive into the world of data science!",
      author: "Bob Johnson",
      date: "2024-03-18",
      tags: ["machine learning", "python", "data science", "tutorial"],
      excerpt: "A beginner's guide to the fundamentals of machine learning using Python.",
      image_url: "https://example.com/images/ml-python.jpg",
      reading_time: "8 min read"
    },
    {
      id: 3,
      title: "Exploring the World of Serverless Architecture",
      content: "Serverless computing allows developers to build and run applications without managing servers. This paradigm shifts the focus from infrastructure management to writing business logic. We'll discuss the core concepts of serverless functions (like AWS Lambda or Azure Functions), the benefits like cost savings and automatic scaling, and common use cases such as building APIs, handling real-time data processing, and creating microservices. Learn how serverless can accelerate your development process and reduce operational overhead.",
      author: "Charlie Brown",
      date: "2024-03-15",
      tags: ["cloud computing", "serverless", "aws", "architecture"],
      excerpt: "Dive into serverless computing and its benefits for modern application development.",
      image_url: "https://example.com/images/serverless.jpg",
      reading_time: "6 min read"
    },
    {
      id: 4,
      title: "The Psychology of User Experience (UX) Design",
      content: "Great UX design is about more than just aesthetics; it's about understanding human behavior. This article delves into the psychological principles that underpin effective design. We'll explore concepts like **Hick's Law**, which states that the time it takes to make a decision increases with the number of choices, and the **F-shaped pattern**, which describes how users typically scan web content. By applying these principles, you can create interfaces that are intuitive, efficient, and enjoyable for your users.",
      author: "Diana Prince",
      date: "2024-03-12",
      tags: ["ux design", "psychology", "web design"],
      excerpt: "How psychology can help you create more intuitive and engaging user experiences.",
      image_url: "https://example.com/images/ux-psychology.jpg",
      reading_time: "7 min read"
    },
    {
      id: 5,
      title: "Getting Started with GraphQL",
      content: "GraphQL is a query language for your API and a server-side runtime for executing those queries. Unlike traditional REST APIs, where you often have to make multiple requests or receive excessive data, GraphQL allows clients to request exactly the data they need. This post will introduce you to the core concepts of GraphQL, including queries, mutations, and schemas. We'll also provide a simple example of how to set up a basic GraphQL server and client, demonstrating its power in creating more efficient and flexible APIs.",
      author: "Ethan Hunt",
      date: "2024-03-10",
      tags: ["api", "graphql", "backend", "development"],
      excerpt: "Discover the benefits of GraphQL for building efficient and flexible APIs.",
      image_url: "https://example.com/images/graphql.jpg",
      reading_time: "9 min read"
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    tags: ""
  });

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content for your post",
        variant: "destructive"
      });
      return;
    }

    const post: BlogPost = {
      id: Date.now(),
      title: newPost.title,
      content: newPost.content,
      author: "You",
      date: new Date().toISOString().split('T')[0],
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      excerpt: newPost.content.substring(0, 100) + "..."
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({ title: "", content: "", tags: "" });
    setIsCreating(false);
    
    toast({
      title: "Post Created! 📝",
      description: "Your blog post has been published successfully",
      variant: "default"
    });
  };

  const handleDeletePost = (id: number) => {
    setPosts(prev => prev.filter(post => post.id !== id));
    toast({
      title: "Post Deleted",
      description: "The blog post has been removed",
      variant: "default"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (viewingPost) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewingPost(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </div>

          <article>
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{viewingPost.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {viewingPost.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(viewingPost.date)}
                </div>
              </div>
              <div className="flex gap-2">
                {viewingPost.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </header>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {viewingPost.content}
              </p>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-bitcoin bg-clip-text text-transparent">
              Decentralized Blog
            </h1>
            <p className="text-muted-foreground text-lg">
              Share your thoughts on decentralization, privacy, and the future of technology.
            </p>
          </div>
          
          <Button 
            onClick={() => setIsCreating(true)}
            size="lg"
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Post
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Post Title"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              />
              
              <Textarea
                placeholder="Write your blog post content here..."
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
              />
              
              <Input
                placeholder="Tags (comma separated)"
                value={newPost.tags}
                onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
              />
              
              <div className="flex gap-3">
                <Button onClick={handleCreatePost}>
                  Publish Post
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="card-hover">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.date)}
                      </div>
                    </div>
                    <div className="flex gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setViewingPost(post)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {post.author === "You" && (
                      <>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
                
                <Button 
                  variant="link" 
                  className="p-0 h-auto mt-3"
                  onClick={() => setViewingPost(post)}
                >
                  Read more →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {posts.length === 0 && (
          <Card className="text-center p-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share your thoughts on decentralization!
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default BlogApp;