import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Avatar } from "./ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Heart, MessageCircle, Share, Plus, Search, Filter, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BackToHomeIcon } from "./BackToHome";

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
}

const samplePosts: Post[] = [
  {
    id: '1',
    author: 'Priya M.',
    avatar: 'P',
    content: 'Just finished my midterms and feeling so relieved! 📚 To everyone still preparing - you got this! Remember to take breaks and be kind to yourself. What helped me was breaking study sessions into 25-minute chunks.',
    tags: ['exams', 'motivation', 'study-tips'],
    likes: 24,
    comments: 8,
    timeAgo: '2h',
    isLiked: false
  },
  {
    id: '2',
    author: 'Arjun K.',
    avatar: 'A',
    content: 'Dealing with some anxiety about my final year project. Anyone else feeling overwhelmed? Sometimes I wonder if I chose the right field. Would love to hear how others cope with these doubts.',
    tags: ['anxiety', 'career', 'support'],
    likes: 16,
    comments: 12,
    timeAgo: '4h',
    isLiked: true
  },
  {
    id: '3',
    author: 'Neha S.',
    avatar: 'N',
    content: 'Started meditation 30 days ago and wow, what a difference! My focus has improved and I feel more centered. If you\'re on the fence about trying it, this is your sign! 🧘‍♀️',
    tags: ['meditation', 'success', 'mindfulness'],
    likes: 31,
    comments: 6,
    timeAgo: '6h',
    isLiked: false
  }
];

const trendingTopics = [
  { tag: 'exam-stress', count: 156 },
  { tag: 'meditation', count: 89 },
  { tag: 'study-tips', count: 67 },
  { tag: 'anxiety', count: 43 },
  { tag: 'motivation', count: 38 }
];

interface CommunityProps {
  onBack?: () => void;
}

export function Community({ onBack }: CommunityProps) {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [newPost, setNewPost] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'feed' | 'trending'>('feed');

  const allTags = ['motivation', 'anxiety', 'study-tips', 'meditation', 'career', 'support', 'exams', 'success', 'mindfulness', 'stress-relief'];

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const createPost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: 'You',
      avatar: 'Y',
      content: newPost,
      tags: selectedTags,
      likes: 0,
      comments: 0,
      timeAgo: 'now',
      isLiked: false
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setSelectedTags([]);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 pb-20 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && <BackToHomeIcon onBack={onBack} size="md" />}
            <h1>Community</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={view === 'feed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('feed')}
            >
              Feed
            </Button>
            <Button
              variant={view === 'trending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('trending')}
            >
              Trending
            </Button>
          </div>
        </div>

        {view === 'feed' ? (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, users, or topics..."
                className="pl-10"
              />
            </div>

            {/* Create Post */}
            <Dialog>
              <DialogTrigger asChild>
                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 bg-primary text-primary-foreground">
                      Y
                    </Avatar>
                    <p className="text-muted-foreground flex-1">Share your thoughts with the community...</p>
                    <Plus size={20} className="text-muted-foreground" />
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share with Community</DialogTitle>
                  <DialogDescription>
                    Create a new post to share your thoughts, experiences, or ask for support from the community.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind? Share your thoughts, experiences, or ask for support..."
                    rows={4}
                  />
                  <div>
                    <p className="text-sm mb-2">Add tags to help others find your post:</p>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button onClick={createPost} className="w-full" disabled={!newPost.trim()}>
                    Share Post
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Community Guidelines */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h4 className="mb-2">⭐ Community Guidelines</h4>
              <p className="text-sm text-muted-foreground">
                Be kind, supportive, and respectful. Share experiences, not advice as a medical professional. 
                Report any content that makes you uncomfortable.
              </p>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <Card key={post.id} className="p-4">
                  <div className="flex space-x-3">
                    <Avatar className="w-10 h-10 bg-primary text-primary-foreground">
                      {post.avatar}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm">{post.author}</h4>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                      </div>
                      <p className="text-sm mb-3">{post.content}</p>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center space-x-1 text-sm ${
                            post.isLiked ? 'text-red-500' : 'text-muted-foreground'
                          }`}
                        >
                          <Heart size={16} className={post.isLiked ? 'fill-current' : ''} />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <MessageCircle size={16} />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Share size={16} />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="text-primary" size={20} />
                <h3>Trending Topics</h3>
              </div>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={topic.tag} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground">#{index + 1}</span>
                      <div>
                        <p className="text-sm">#{topic.tag}</p>
                        <p className="text-xs text-muted-foreground">{topic.count} posts</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Weekly Highlights */}
            <Card className="p-6">
              <h3 className="mb-4">This Week's Highlights</h3>
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1758270703813-2ecf235a6462?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwdG9nZXRoZXIlMjBjb21tdW5pdHl8ZW58MXx8fHwxNzU5MTU4Nzg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Community highlight"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm mb-1">Study Group Success Stories</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      15 students shared how forming study groups helped them through exams
                    </p>
                    <Button variant="outline" size="sm">Read More</Button>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1642557581366-539b6fed5998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB3ZWxsbmVzcyUyMG1pbmRmdWxuZXNzfGVufDF8fHx8MTc1OTEwOTQzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Wellness highlight"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm mb-1">Mindfulness Challenge Results</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Over 50 students completed the 7-day mindfulness challenge
                    </p>
                    <Button variant="outline" size="sm">Join Next</Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Community Stats */}
            <Card className="p-6">
              <h3 className="mb-4">Community Impact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl text-blue-600">1,247</p>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl text-green-600">3,829</p>
                  <p className="text-sm text-muted-foreground">Support Messages</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl text-purple-600">156</p>
                  <p className="text-sm text-muted-foreground">Daily Posts</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl text-yellow-600">94%</p>
                  <p className="text-sm text-muted-foreground">Feel Supported</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}