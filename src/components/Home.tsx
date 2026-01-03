import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { MessageSquare, Heart, Users, Calendar, TrendingUp, ShoppingBag } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthProvider";

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const moodData = [
    { day: 'Mon', mood: 4 },
    { day: 'Tue', mood: 3 },
    { day: 'Wed', mood: 5 },
    { day: 'Thu', mood: 4 },
    { day: 'Fri', mood: 3 },
  ];

  const quickActions = [
    { 
      icon: MessageSquare, 
      title: 'Talk to AI', 
      subtitle: 'Get instant support',
      color: 'bg-primary/10 text-primary',
      action: () => onNavigate('chat')
    },
    { 
      icon: Heart, 
      title: 'Track Mood', 
      subtitle: 'Log your feelings',
      color: 'bg-red-50 text-red-600',
      action: () => onNavigate('mood')
    },
    { 
      icon: Users, 
      title: 'Community', 
      subtitle: 'Connect with peers',
      color: 'bg-primary/10 text-primary',
      action: () => onNavigate('community')
    },
    { 
      icon: Calendar, 
      title: 'Book Session', 
      subtitle: 'Professional help',
      color: 'bg-accent text-secondary-foreground',
      action: () => onNavigate('sessions')
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Logo size="md" showText={false} />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl">{getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}!</h1>
                <p className="text-sm sm:text-base text-primary-foreground/90">How are you feeling today?</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Quick Actions */}
        <div>
          <h3 className="mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={index} 
                  className="p-4 cursor-pointer transition-all hover:shadow-md"
                  onClick={action.action}
                >
                  <div className="space-y-2">
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm">{action.title}</h4>
                      <p className="text-xs text-muted-foreground">{action.subtitle}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Mood This Week */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3>Mood This Week</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('mood')}>
              View All
            </Button>
          </div>
          <div className="flex justify-between items-end space-x-2">
            {moodData.map((data, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div 
                  className="w-6 bg-primary rounded-full"
                  style={{ height: `${data.mood * 10}px` }}
                />
                <span className="text-xs text-muted-foreground">{data.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Wellness Tip */}
        <Card className="p-4">
          <div className="flex items-start space-x-3">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1687180948607-9ba1dd045e10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMG1lZGl0YXRpb24lMjB3ZWxsbmVzc3xlbnwxfHx8fDE3NTkxNTg3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Wellness tip"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="mb-1">Daily Wellness Tip</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Take 5 deep breaths when you feel overwhelmed. Focus on the sensation of air entering and leaving your body.
              </p>
              <Button variant="outline" size="sm" onClick={() => onNavigate('resources')}>
                More Tips
              </Button>
            </div>
          </div>
        </Card>

        {/* Therapeutic Products */}
        <Card className="p-4">
          <div className="flex items-start space-x-3">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBwbGVtZW50JTIwY2Fwc3VsZXMlMjB3ZWxsbmVzc3xlbnwxfHx8fDE3NTkxNjMzNjB8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Therapeutic products"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <ShoppingBag className="text-primary" size={18} />
                <h4>Wellness Products</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Explore curated supplements, books, and therapeutic tools to support your mental health journey.
              </p>
              <Button variant="outline" size="sm" onClick={() => onNavigate('products')}>
                Browse Products
              </Button>
            </div>
          </div>
        </Card>

        {/* Progress */}
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="text-green-600" size={20} />
            <h3>Your Progress</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Weekly Check-ins</span>
                <span>4/7</span>
              </div>
              <Progress value={57} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Mindfulness Minutes</span>
                <span>45/60</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}