import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useCounselors } from './hooks/useData';
import { 
  Brain, Heart, Users, Calendar, BookOpen, MessageCircle, 
  TrendingUp, Shield, Star, CheckCircle, ArrowRight, Sparkles 
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onFeatureClick: (feature: string) => void;
}

export function LandingPage({ onGetStarted, onLogin, onFeatureClick }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const { counselors, loading: counselorsLoading } = useCounselors();

  const features = [
    {
      id: 'chat',
      icon: MessageCircle,
      title: 'AI Mental Health Assistant',
      description: 'Chat with our empathetic AI counselor trained specifically for Indian students',
      color: 'bg-blue-500',
      benefits: ['24/7 availability', 'Personalized responses', 'Privacy focused', 'Culturally aware']
    },
    {
      id: 'mood',
      icon: Heart,
      title: 'Mood Tracking & Analytics',
      description: 'Track your emotional wellbeing with detailed insights and personalized recommendations',
      color: 'bg-pink-500',
      benefits: ['Daily mood logging', 'Progress visualization', 'Pattern recognition', 'Wellness tips']
    },
    {
      id: 'community',
      icon: Users,
      title: 'Student Community',
      description: 'Connect with peers, share experiences, and support each other anonymously',
      color: 'bg-green-500',
      benefits: ['Anonymous sharing', 'Peer support', 'Safe environment', 'Moderated content']
    },
    {
      id: 'sessions',
      icon: Calendar,
      title: 'Professional Counseling',
      description: 'Book sessions with qualified mental health professionals who understand student life',
      color: 'bg-purple-500',
      benefits: ['Licensed counselors', 'Flexible scheduling', 'Student-focused', 'Affordable rates']
    },
    {
      id: 'resources',
      icon: BookOpen,
      title: 'Wellness Resources',
      description: 'Access curated content including meditation guides, study techniques, and stress management',
      color: 'bg-orange-500',
      benefits: ['Expert-curated content', 'Interactive exercises', 'Video guides', 'Progress tracking']
    },
    {
      id: 'profile',
      icon: TrendingUp,
      title: 'Personal Growth Hub',
      description: 'Set goals, track achievements, and celebrate your mental wellness journey',
      color: 'bg-indigo-500',
      benefits: ['Goal setting', 'Achievement tracking', 'Progress insights', 'Personalized recommendations']
    }
  ];

  const testimonials = [
    {
      name: 'Priya S.',
      role: 'Engineering Student',
      content: 'Mentara helped me manage my exam anxiety. The AI chatbot feels like talking to a real friend who understands.',
      rating: 5
    },
    {
      name: 'Arjun K.',
      role: 'Medical Student',
      content: 'The community feature is amazing. Knowing I\'m not alone in my struggles made all the difference.',
      rating: 5
    },
    {
      name: 'Sneha R.',
      role: 'MBA Student',
      content: 'Professional counselors who actually understand student life. Booking sessions is so easy!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={onLogin}>
              Sign In
            </Button>
            <Button onClick={onGetStarted}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="mr-1" size={16} />
            Designed for Indian Students
          </Badge>
          
          <h1 className="text-4xl md:text-6xl mb-6 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
            Your Mental Wellness Journey Starts Here
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Mentara is a comprehensive mental health platform specifically designed for Indian students. 
            Get AI-powered support, connect with peers, and access professional counseling.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onGetStarted} className="text-lg px-8">
              Start Your Journey
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button size="lg" variant="outline" onClick={() => onFeatureClick('chat')}>
              Try AI Chatbot
            </Button>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="relative max-w-4xl mx-auto">
              <img 
                src="https://images.unsplash.com/photo-1758797316165-986ec92e7ad2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIwc3R1ZGVudCUyMHdlbGxuZXNzfGVufDF8fHx8MTc1OTE2MTMwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Student practicing wellness and meditation"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Students Helped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">Everything You Need for Mental Wellness</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed specifically for the unique challenges faced by Indian students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={feature.id} 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
                  onMouseEnter={() => setActiveFeature(feature.id)}
                  onMouseLeave={() => setActiveFeature(null)}
                  onClick={() => onFeatureClick(feature.id)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="text-white" size={24} />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="mr-2 text-green-500" size={16} />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant="ghost" 
                      className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFeatureClick(feature.id);
                      }}
                    >
                      Explore Feature
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Professional Counsellors Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">Meet Our Licensed Mental Health Professionals</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our team of qualified counsellors and therapists specialize in student mental health, 
              understanding the unique challenges you face in your academic journey.
            </p>
          </div>

          {/* Featured Counsellors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {counselorsLoading ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-full bg-muted mx-auto animate-pulse"></div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-3/4 mx-auto"></div>
                      <div className="h-12 bg-muted rounded animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              counselors.slice(0, 3).map((counselor) => (
                <Card key={counselor.id} className="group hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="relative mb-4">
                      <img 
                        src={counselor.image}
                        alt={`${counselor.name}, ${counselor.credentials}`}
                        className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-primary/20 group-hover:border-primary/40 transition-colors"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="mb-1">{counselor.name}</h3>
                      <p className="text-sm text-primary mb-2">
                        {Array.isArray(counselor.specialization) ? counselor.specialization[0] : counselor.specialization}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">{counselor.credentials || counselor.experience}</p>
                      <div className="flex justify-center space-x-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`${i < Math.floor(counselor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} size={14} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">({counselor.rating})</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {counselor.bio}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {Array.isArray(counselor.specialization) ? (
                          counselor.specialization.slice(0, 3).map((spec: string) => (
                            <Badge key={spec} variant="secondary" className="text-xs">{spec}</Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="text-xs">{counselor.specialization}</Badge>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => onFeatureClick('sessions')}>
                        Book Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Counselling Approach Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl mb-6">Our Student-Centered Approach</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="text-primary" size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm mb-1">Cultural Sensitivity</h4>
                    <p className="text-sm text-muted-foreground">
                      Understanding Indian family dynamics, cultural expectations, and social pressures unique to students here.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="text-primary" size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm mb-1">Academic Focus</h4>
                    <p className="text-sm text-muted-foreground">
                      Specialized in handling exam anxiety, career uncertainty, and academic performance pressure.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="text-primary" size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm mb-1">Flexible Scheduling</h4>
                    <p className="text-sm text-muted-foreground">
                      Evening and weekend slots available to accommodate your class schedules and study time.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="text-primary" size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm mb-1">Affordable Rates</h4>
                    <p className="text-sm text-muted-foreground">
                      Student-friendly pricing with sliding scale options and insurance coverage support.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Button onClick={() => onFeatureClick('sessions')} size="lg" className="mr-4">
                  Book a Session Today
                </Button>
                <Button variant="outline" onClick={() => onFeatureClick('chat')}>
                  Talk to AI First
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1758273240360-76b908e7582a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Vuc2VsaW5nJTIwc2Vzc2lvbiUyMHRoZXJhcHklMjBtZW50YWwlMjBoZWFsdGh8ZW58MXx8fHwxNzU5MTYzMzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Counseling session showing supportive environment"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 bg-muted/30 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-xl mb-2">Trusted & Accredited</h3>
              <p className="text-muted-foreground">All our counsellors are licensed professionals with verified credentials</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl mb-2">{counselors.length}+</div>
                <div className="text-sm text-muted-foreground">Licensed Counsellors</div>
              </div>
              <div>
                <div className="text-2xl mb-2">5000+</div>
                <div className="text-sm text-muted-foreground">Sessions Completed</div>
              </div>
              <div>
                <div className="text-2xl mb-2">
                  {counselors.length > 0 ? (counselors.reduce((acc, c) => acc + c.rating, 0) / counselors.length).toFixed(1) : '4.8'}/5
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div>
                <div className="text-2xl mb-2">98%</div>
                <div className="text-sm text-muted-foreground">Student Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">Trusted by Students Across India</h2>
            <p className="text-xl text-muted-foreground">
              Real stories from students who transformed their mental health journey with Mentara
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={16} />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <div className="text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Mentara Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">Why Choose Mentara?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="mb-2">Privacy & Security</h3>
                  <p className="text-muted-foreground">
                    Your mental health data is protected with end-to-end encryption and strict privacy policies.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="mb-2">Culturally Aware AI</h3>
                  <p className="text-muted-foreground">
                    Our AI understands Indian cultural context and the unique pressures faced by students here.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="mb-2">Student-Focused</h3>
                  <p className="text-muted-foreground">
                    Designed specifically for students, understanding academic pressure, career anxiety, and social challenges.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="mb-2">Holistic Approach</h3>
                  <p className="text-muted-foreground">
                    Combines AI support, peer community, professional counseling, and self-help resources.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="p-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20">
            <CardContent className="space-y-6">
              <h2 className="text-3xl md:text-4xl">Ready to Transform Your Mental Health?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of Indian students who have already started their mental wellness journey with Mentara.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" onClick={onGetStarted} className="text-lg px-8">
                  Get Started for Free
                </Button>
                <Button size="lg" variant="outline" onClick={onLogin}>
                  Already have an account?
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Free to start • No credit card required • Privacy guaranteed
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Logo size="sm" />
              <p className="text-muted-foreground">Empowering Indian students' mental wellness</p>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <button onClick={onLogin} className="hover:text-foreground transition-colors">Privacy Policy</button>
              <button onClick={onLogin} className="hover:text-foreground transition-colors">Terms of Service</button>
              <button onClick={onLogin} className="hover:text-foreground transition-colors">Contact Support</button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 Mentara. Made with ❤️ for Indian students.
          </div>
        </div>
      </footer>
    </div>
  );
}