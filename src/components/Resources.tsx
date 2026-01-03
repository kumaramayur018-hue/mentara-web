import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { BookOpen, Search, Clock, ArrowLeft, X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useResources } from "./hooks/useData";
import { ScrollArea } from "./ui/scroll-area";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  image: string;
  author: string;
  tags: string[];
  content: string;
}

const wellnessTips = [
  {
    title: "Take Regular Breaks",
    description: "Use the 25-5 rule: study for 25 minutes, then take a 5-minute break.",
    icon: "⏰"
  },
  {
    title: "Stay Hydrated",
    description: "Drink at least 8 glasses of water daily to maintain optimal brain function.",
    icon: "💧"
  },
  {
    title: "Practice Gratitude",
    description: "Write down 3 things you're grateful for each day to boost positivity.",
    icon: "🙏"
  },
  {
    title: "Get Enough Sleep",
    description: "Aim for 7-9 hours of sleep to improve memory and concentration.",
    icon: "😴"
  }
];

interface ResourcesProps {
  onBack?: () => void;
}

export function Resources({ onBack }: ResourcesProps) {
  const { resources, loading: resourcesLoading } = useResources();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Generate categories dynamically from resources
  const categories = ['All', ...Array.from(new Set(resources.map(r => r.category)))];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (resource.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground hover:bg-primary/90">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl">Resources</h1>
              <p className="text-sm sm:text-base text-primary-foreground/90">Mental health guides & articles</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles and guides..."
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="flex-shrink-0 cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Quick Tips */}
        <Card className="p-6">
          <h3 className="mb-4">Daily Wellness Tips 💡</h3>
          <div className="grid gap-3">
            {wellnessTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                <span className="text-2xl">{tip.icon}</span>
                <div>
                  <h4 className="text-sm mb-1">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Articles Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3>Featured Articles</h3>
            <span className="text-sm text-muted-foreground">
              {filteredResources.length} {filteredResources.length === 1 ? 'article' : 'articles'}
            </span>
          </div>
          
          <div className="space-y-4">
            {resourcesLoading ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="h-48 bg-muted animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                    <div className="h-12 bg-muted rounded animate-pulse"></div>
                  </div>
                </Card>
              ))
            ) : filteredResources.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="mb-2">No articles found</h4>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </Card>
            ) : (
              filteredResources.map(resource => (
                <Card key={resource.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <ImageWithFallback 
                    src={resource.image}
                    alt={resource.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {resource.category}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock size={12} />
                        <span>{resource.duration}</span>
                      </div>
                    </div>
                    
                    <h3 className="mb-2">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">By {resource.author}</p>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            onClick={() => setSelectedResource(resource)}
                          >
                            <BookOpen size={14} className="mr-1" />
                            Read Article
                          </Button>
                        </DialogTrigger>
                        {selectedResource?.id === resource.id && (
                          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                            <button
                              onClick={() => setSelectedResource(null)}
                              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10 bg-background/80 backdrop-blur-sm p-2"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Close</span>
                            </button>
                            
                            <ScrollArea className="max-h-[90vh]">
                              {/* Header Image */}
                              <div className="relative h-64 w-full">
                                <ImageWithFallback 
                                  src={selectedResource.image}
                                  alt={selectedResource.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                  <Badge variant="secondary" className="mb-2">
                                    {selectedResource.category}
                                  </Badge>
                                  <h2 className="text-white mb-2">{selectedResource.title}</h2>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <span>By {selectedResource.author}</span>
                                    <div className="flex items-center space-x-1">
                                      <Clock size={12} />
                                      <span>{selectedResource.duration}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Article Content */}
                              <div className="p-8">
                                <DialogHeader className="sr-only">
                                  <DialogTitle>{selectedResource.title}</DialogTitle>
                                  <DialogDescription>{selectedResource.description}</DialogDescription>
                                </DialogHeader>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                  {selectedResource.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>

                                {/* Main Content */}
                                <div className="prose prose-slate max-w-none">
                                  {selectedResource.content.split('\n\n').map((paragraph, index) => {
                                    // Check if paragraph is a heading (starts with **)
                                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                      const heading = paragraph.replace(/\*\*/g, '');
                                      return (
                                        <h3 key={index} className="text-lg mt-6 mb-3 text-foreground">
                                          {heading}
                                        </h3>
                                      );
                                    }
                                    
                                    // Check for numbered or bulleted lists
                                    if (paragraph.match(/^[\d]+\./m) || paragraph.match(/^[-*]/m)) {
                                      const items = paragraph.split('\n').filter(line => line.trim());
                                      const isOrdered = items[0].match(/^\d+\./);
                                      
                                      return isOrdered ? (
                                        <ol key={index} className="list-decimal pl-6 space-y-2 mb-4">
                                          {items.map((item, i) => (
                                            <li key={i} className="text-sm text-foreground/90">
                                              {item.replace(/^\d+\.\s*/, '').replace(/^\*\*/g, '').replace(/\*\*$/g, '')}
                                            </li>
                                          ))}
                                        </ol>
                                      ) : (
                                        <ul key={index} className="list-disc pl-6 space-y-2 mb-4">
                                          {items.map((item, i) => (
                                            <li key={i} className="text-sm text-foreground/90">
                                              {item.replace(/^[-*]\s*/, '').replace(/^\*\*/g, '').replace(/\*\*$/g, '')}
                                            </li>
                                          ))}
                                        </ul>
                                      );
                                    }
                                    
                                    // Regular paragraph with bold text support
                                    const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                                    return (
                                      <p key={index} className="text-sm leading-relaxed mb-4 text-foreground/90">
                                        {parts.map((part, i) => {
                                          if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={i}>{part.replace(/\*\*/g, '')}</strong>;
                                          }
                                          return part;
                                        })}
                                      </p>
                                    );
                                  })}
                                </div>

                                {/* Author Info Footer */}
                                <div className="mt-8 pt-6 border-t">
                                  <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                      <BookOpen className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-sm">Written by</p>
                                      <p className="text-sm text-muted-foreground">{selectedResource.author}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        )}
                      </Dialog>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Mental Health Quote */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <blockquote className="space-y-2">
            <p className="text-sm italic text-foreground/90">
              "Taking care of your mental health is just as important as taking care of your physical health. 
              Small daily practices can lead to profound long-term benefits."
            </p>
            <footer className="text-xs text-muted-foreground">— Mental Health Foundation</footer>
          </blockquote>
        </Card>
      </div>
    </div>
  );
}