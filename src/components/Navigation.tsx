import { Home, MessageSquare, BarChart, Users, Calendar, BookOpen, ShoppingBag, User } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'chat', icon: MessageSquare, label: 'AI Chat' },
    { id: 'mood', icon: BarChart, label: 'Mood' },
    { id: 'community', icon: Users, label: 'Community' },
    { id: 'sessions', icon: Calendar, label: 'Sessions' },
    { id: 'resources', icon: BookOpen, label: 'Resources' },
    { id: 'products', icon: ShoppingBag, label: 'Products' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 flex justify-around items-center z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-lg transition-colors ${
              isActive 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}