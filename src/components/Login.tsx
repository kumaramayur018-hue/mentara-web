import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner@2.0.3';

interface LoginProps {
  onToggleMode: () => void;
  mode: 'login' | 'signup';
  onForgotPassword: () => void;
}

export function Login({ onToggleMode, mode, onForgotPassword }: LoginProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (mode === 'login') {
        result = await signIn(email, password);
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        result = await signUp(email, password, name);
      }

      if (result.error) {
        setError(result.error);
      } else if (mode === 'signup') {
        // Show success message for registration
        toast.success('🎉 Registration Successful!', {
          description: 'Your account has been created. You can now sign in.',
          duration: 4000,
        });
        
        // Clear form fields
        setName('');
        setEmail('');
        setPassword('');
        
        // Wait a moment before switching to login mode
        setTimeout(() => {
          onToggleMode();
        }, 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <Logo size="lg" />
          <div>
            <h1>{mode === 'login' ? 'Welcome Back' : 'Join Mentara'}</h1>
            <CardDescription>
              {mode === 'login' 
                ? 'Sign in to continue your wellness journey' 
                : 'Start your mental wellness journey today'
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {mode === 'login' && (
            <div className="text-center mt-3">
              <Button
                variant="link"
                onClick={onForgotPassword}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Forgot Password?
              </Button>
            </div>
          )}

          <div className="text-center mt-2">
            <Button
              variant="link"
              onClick={onToggleMode}
              className="text-sm"
            >
              {mode === 'login' 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}