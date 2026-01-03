import React, { useState } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { SessionProvider } from './contexts/SessionContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { AIChatbotWrapper } from './components/AIChatbotWrapper';
import { MoodTracker } from './components/MoodTracker';
import { Community } from './components/Community';
import { SessionBooking } from './components/SessionBooking';
import { BookedSessions } from './components/BookedSessions';
import { Resources } from './components/Resources';
import { TherapeuticProducts } from './components/TherapeuticProducts';
import { Profile } from './components/Profile';
import { Orders } from './components/Orders';
import { Login } from './components/Login';
import { AdminLogin } from './components/AdminLogin';
import { AdminPortal } from './components/AdminPortal';
import { CounselorLogin } from './components/CounselorLogin';
import { CounselorDashboard } from './components/CounselorDashboard';
import { LandingPage } from './components/LandingPage';
import { Logo } from './components/Logo';
import { ForgotPassword } from './components/ForgotPassword';
import { Toaster } from './components/ui/sonner';
import { DataInitializer } from './components/DataInitializer';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [showCounselor, setShowCounselor] = useState(false);
  const [counselorAuthenticated, setCounselorAuthenticated] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [pendingFeature, setPendingFeature] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // ALL HOOKS MUST BE AT THE TOP LEVEL - BEFORE ANY CONDITIONAL LOGIC

  // Handle user login - navigate to pending feature if any
  React.useEffect(() => {
    if (user && pendingFeature) {
      setActiveTab(pendingFeature);
      setPendingFeature(null);
      setShowLanding(false);
    }
  }, [user, pendingFeature]);

  // Handle admin login
  const handleAdminLogin = React.useCallback(async (credentials: { email: string; password: string }) => {
    try {
      // Get the project info
      const { projectId, publicAnonKey } = await import('./utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();
      
      if (result.success) {
        setAdminAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }, []);

  const handleAdminLogout = React.useCallback(() => {
    setAdminAuthenticated(false);
    setShowAdmin(false);
  }, []);

  // Handle counselor login
  const handleCounselorLogin = React.useCallback(async (credentials: { email: string; password: string }) => {
    try {
      // Get the project info
      const { projectId, publicAnonKey } = await import('./utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/counselor/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();
      
      if (result.success) {
        setCounselorAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }, []);

  const handleCounselorLogout = React.useCallback(() => {
    setCounselorAuthenticated(false);
    setShowCounselor(false);
  }, []);

  // Handle feature access - redirect unauthenticated users to login
  const handleFeatureAccess = React.useCallback((feature: string) => {
    if (!user) {
      setPendingFeature(feature);
      setShowLanding(false);
      return;
    }
    
    setActiveTab(feature);
    setShowLanding(false);
  }, [user]);

  // Main app interface for authenticated users
  const renderActiveComponent = React.useCallback(() => {
    const handleBack = () => setActiveTab('home');
    
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={setActiveTab} />;
      case 'chat':
        return <AIChatbotWrapper onBack={handleBack} />;
      case 'mood':
        return <MoodTracker onBack={handleBack} />;
      case 'community':
        return <Community onBack={handleBack} />;
      case 'sessions':
        return <SessionBooking onBack={handleBack} />;
      case 'booked':
        return <BookedSessions onBack={handleBack} onNavigateToBooking={() => setActiveTab('sessions')} />;
      case 'resources':
        return <Resources onBack={handleBack} />;
      case 'products':
        return <TherapeuticProducts onBack={handleBack} />;
      case 'profile':
        return <Profile onBack={handleBack} onNavigateToOrders={() => setActiveTab('orders')} onNavigateToBookedSessions={() => setActiveTab('booked')} />;
      case 'orders':
        return <Orders onBack={handleBack} onNavigateToProducts={() => setActiveTab('products')} />;
      default:
        return <Home onNavigate={setActiveTab} />;
    }
  }, [activeTab]);

  // CONDITIONAL RENDERING LOGIC - NO MORE HOOKS AFTER THIS POINT

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="animate-zoom">
            <Logo size="xl" showText={false} />
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading Mentara...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show admin portal if admin is authenticated
  if (showAdmin && adminAuthenticated) {
    return (
      <AdminPortal 
        key="admin-portal"
        onLogout={handleAdminLogout}
        onBackToApp={() => setShowAdmin(false)}
      />
    );
  }

  // Show admin login if admin portal is requested but not authenticated
  if (showAdmin && !adminAuthenticated) {
    return (
      <AdminLogin 
        key="admin-login"
        onLogin={handleAdminLogin}
        onBackToApp={() => setShowAdmin(false)}
      />
    );
  }

  // Show counselor dashboard if counselor is authenticated
  if (showCounselor && counselorAuthenticated) {
    return (
      <CounselorDashboard 
        key="counselor-dashboard"
        onLogout={handleCounselorLogout}
        onBackToApp={() => setShowCounselor(false)}
      />
    );
  }

  // Show counselor login if counselor dashboard is requested but not authenticated
  if (showCounselor && !counselorAuthenticated) {
    return (
      <CounselorLogin 
        key="counselor-login"
        onLogin={handleCounselorLogin}
        onBackToApp={() => setShowCounselor(false)}
      />
    );
  }

  // Show landing page for unauthenticated users
  if (!user && showLanding) {
    return (
      <div className="relative" key="landing-page">
        <LandingPage 
          onGetStarted={() => {
            setLoginMode('signup');
            setShowLanding(false);
          }}
          onLogin={() => {
            setLoginMode('login');
            setShowLanding(false);
          }}
          onFeatureClick={handleFeatureAccess}
        />
      </div>
    );
  }

  // Show forgot password screen
  if (!user && showForgotPassword) {
    return (
      <div key="forgot-password-page">
        <ForgotPassword onBack={() => setShowForgotPassword(false)} />
      </div>
    );
  }

  // Show login screen if user is not authenticated and not showing landing
  if (!user && !showLanding) {
    return (
      <div className="relative" key="login-page">
        {/* Admin access button */}
        <button
          onClick={() => setShowAdmin(true)}
          className="fixed bottom-4 left-4 text-xs text-muted-foreground hover:text-foreground transition-colors z-50"
        >
          Admin
        </button>
        
        {/* Counselor access button */}
        <button
          onClick={() => setShowCounselor(true)}
          className="fixed bottom-4 left-20 text-xs text-muted-foreground hover:text-foreground transition-colors z-50"
        >
          Counselor
        </button>
        
        {/* Back to landing button */}
        <button
          onClick={() => setShowLanding(true)}
          className="fixed bottom-4 right-4 text-xs text-muted-foreground hover:text-foreground transition-colors z-50"
        >
          ← Back to Home
        </button>
        
        <Login 
          onToggleMode={() => setLoginMode(loginMode === 'login' ? 'signup' : 'login')}
          mode={loginMode}
          onForgotPassword={() => setShowForgotPassword(true)}
        />
      </div>
    );
  }

  // Main authenticated app
  return (
    <div className="min-h-screen bg-background" key="main-app">
      <div className="flex">
        {/* Desktop Sidebar Navigation - hidden on mobile */}
        {activeTab !== 'chat' && (
          <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-border lg:bg-card">
            <div className="flex flex-col flex-1 min-h-0 pt-6 pb-4">
              <div className="flex items-center flex-shrink-0 px-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-xl">🧠</span>
                  </div>
                  <div>
                    <h3 className="text-lg">Mentara</h3>
                    <p className="text-xs text-muted-foreground">Mental Wellbeing</p>
                  </div>
                </div>
              </div>
              <nav className="flex-1 px-3 space-y-1">
                {[
                  { id: 'home', icon: 'Home', label: 'Home' },
                  { id: 'chat', icon: 'MessageSquare', label: 'AI Chat' },
                  { id: 'mood', icon: 'BarChart', label: 'Mood Tracker' },
                  { id: 'community', icon: 'Users', label: 'Community' },
                  { id: 'sessions', icon: 'Calendar', label: 'Sessions' },
                  { id: 'booked', icon: 'CheckCircle', label: 'Booked Sessions' },
                  { id: 'resources', icon: 'BookOpen', label: 'Resources' },
                  { id: 'products', icon: 'ShoppingBag', label: 'Products' },
                  { id: 'orders', icon: 'Package', label: 'My Orders' },
                  { id: 'profile', icon: 'User', label: 'Profile' }
                ].map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
        
        {/* Main Content Area */}
        <div className={`flex-1 ${activeTab !== 'chat' ? 'lg:pl-64' : ''}`}>
          <div className="max-w-[1920px] mx-auto">
            {renderActiveComponent()}
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation - hidden on desktop */}
      {activeTab !== 'chat' && <Navigation activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mentara-ui-theme">
      <AuthProvider>
        <SessionProvider>
          <NotificationProvider>
            <DataInitializer />
            <AppContent />
            <Toaster />
          </NotificationProvider>
        </SessionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}