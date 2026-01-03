import { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from './AuthProvider';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Avatar } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Star, MapPin, Clock, Video, Phone, MessageSquare, Calendar as CalendarIcon, ArrowLeft, CreditCard, CheckCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useCounselors } from "./hooks/useData";
import { toast } from "sonner";

interface Counselor {
  id: string;
  name: string;
  specialization: string[];
  rating: number;
  experience: string;
  languages: string[];
  price: number;
  availability: string[];
  image: string;
  bio: string;
  sessionTypes: ('video' | 'audio' | 'chat')[];
}

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

const upcomingSessions = [
  {
    id: '1',
    counselor: 'Dr. Priya Sharma',
    date: 'Tomorrow',
    time: '3:00 PM',
    type: 'video' as const,
    topic: 'Anxiety Management'
  },
  {
    id: '2',
    counselor: 'Dr. Sneha Patel',
    date: 'Oct 5',
    time: '11:00 AM',
    type: 'chat' as const,
    topic: 'Study Strategies'
  }
];

interface SessionBookingProps {
  onBack?: () => void;
}

export function SessionBooking({ onBack }: SessionBookingProps) {
  const { counselors, loading: counselorsLoading } = useCounselors();
  const { bookSession: bookSessionContext, refreshSessions } = useSession();
  const { user } = useAuth();
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [sessionType, setSessionType] = useState<'video' | 'audio' | 'chat'>('video');
  const [sessionTopic, setSessionTopic] = useState('');
  const [filter, setFilter] = useState('');
  const [view, setView] = useState<'browse' | 'upcoming'>('browse');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const filteredCounselors = counselors.filter(counselor => {
    const searchTerm = filter.toLowerCase();
    const nameMatch = counselor.name.toLowerCase().includes(searchTerm);
    const specMatch = Array.isArray(counselor.specialization) 
      ? counselor.specialization.some((spec: string) => spec.toLowerCase().includes(searchTerm))
      : counselor.specialization.toLowerCase().includes(searchTerm);
    return nameMatch || specMatch;
  });

  const bookSession = () => {
    if (!selectedCounselor || !selectedDate || !selectedTime) return;
    
    // Move to payment screen
    setIsPaymentOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedCounselor || !selectedDate || !selectedTime || !user) return;

    // Validate payment info
    if (!paymentInfo.name || !paymentInfo.email || !paymentInfo.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Book session using centralized context
      await bookSessionContext({
        userId: user.id,
        counselorId: selectedCounselor.id,
        counselorName: selectedCounselor.name,
        counselorImage: selectedCounselor.image,
        sessionType: sessionType,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        status: 'pending',
        topic: sessionTopic,
        price: selectedCounselor.price + 50,
      });

      // Reset form and show success
      setIsPaymentOpen(false);
      setIsSuccessOpen(true);
      
      // Reset all form states
      setTimeout(() => {
        setSelectedCounselor(null);
        setSelectedDate(new Date());
        setSelectedTime('');
        setSessionTopic('');
        setSessionType('video');
        setPaymentInfo({
          name: '',
          email: '',
          phone: '',
          cardNumber: '',
          expiryDate: '',
          cvv: ''
        });
      }, 500);

      toast.success('Session booked successfully!');
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book session. Please try again.');
    }
  };

  const getSessionTypeIcon = (type: 'video' | 'audio' | 'chat') => {
    switch (type) {
      case 'video': return <Video size={16} />;
      case 'audio': return <Phone size={16} />;
      case 'chat': return <MessageSquare size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground hover:bg-primary/90">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl">Book a Session</h1>
              <p className="text-sm sm:text-base text-primary-foreground/90">Connect with professional counselors</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {view === 'browse' ? (
          <>
            {/* Search & Filter */}
            <div className="space-y-3">
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search by name or specialization..."
              />
              <div className="flex space-x-2 overflow-x-auto">
                {['All', 'Anxiety', 'Depression', 'Stress', 'Academic', 'Career'].map(tag => (
                  <Badge 
                    key={tag}
                    variant="outline" 
                    className="flex-shrink-0 cursor-pointer"
                    onClick={() => setFilter(tag === 'All' ? '' : tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Counselors List */}
            <div className="space-y-4">
              {counselorsLoading ? (
                // Loading skeleton
                [...Array(3)].map((_, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex space-x-4">
                      <div className="w-16 h-16 rounded-full bg-muted animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                        <div className="h-12 bg-muted rounded animate-pulse"></div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                filteredCounselors.map(counselor => (
                  <Card key={counselor.id} className="p-4">
                    <div className="flex space-x-4">
                      <ImageWithFallback 
                        src={counselor.image}
                        alt={counselor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4>{counselor.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Star className="fill-yellow-400 text-yellow-400" size={12} />
                                <span>{counselor.rating}</span>
                              </div>
                              <span>•</span>
                              <span>{counselor.experience}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">₹{counselor.price}</p>
                            <p className="text-xs text-muted-foreground">per session</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(counselor.specialization) ? (
                              counselor.specialization.map((spec: string) => (
                                <Badge key={spec} variant="secondary" className="text-xs">
                                  {spec}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {counselor.specialization}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <MapPin size={12} />
                              <span>{(counselor.languages || ['English', 'Hindi']).join(', ')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span>Available {(counselor.availability || ['Mon', 'Wed', 'Fri']).join(', ')}</span>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            {(counselor.sessionTypes || ['video', 'audio', 'chat']).map((type: 'video' | 'audio' | 'chat') => (
                              <div key={type} className="flex items-center space-x-1 text-xs text-muted-foreground">
                                {getSessionTypeIcon(type)}
                                <span className="capitalize">{type}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedCounselor(counselor)} className="w-full">
                              Book Session
                            </Button>
                          </DialogTrigger>
                          {selectedCounselor?.id === counselor.id && (
                            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Book Session with {selectedCounselor.name}</DialogTitle>
                                <DialogDescription>
                                  Select your preferred date, time, and session type to book your appointment.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                {/* Counselor Info */}
                                <div className="flex space-x-3 p-3 bg-muted rounded-lg">
                                  <ImageWithFallback 
                                    src={selectedCounselor.image}
                                    alt={selectedCounselor.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                  <div>
                                    <h4 className="text-sm">{selectedCounselor.name}</h4>
                                    <p className="text-xs text-muted-foreground">{selectedCounselor.bio}</p>
                                  </div>
                                </div>

                                {/* Session Type */}
                                <div>
                                  <label className="text-sm mb-2 block">Session Type</label>
                                  <Select value={sessionType} onValueChange={(value: 'video' | 'audio' | 'chat') => setSessionType(value)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {selectedCounselor.sessionTypes.map(type => (
                                        <SelectItem key={type} value={type}>
                                          <div className="flex items-center space-x-2">
                                            {getSessionTypeIcon(type)}
                                            <span className="capitalize">{type} Session</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Date Selection */}
                                <div>
                                  <label className="text-sm mb-2 block">Select Date</label>
                                  <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="rounded-md border"
                                    disabled={(date) => date < new Date()}
                                  />
                                </div>

                                {/* Time Selection */}
                                <div>
                                  <label className="text-sm mb-2 block">Select Time</label>
                                  <div className="grid grid-cols-3 gap-2">
                                    {timeSlots.map(time => (
                                      <Button
                                        key={time}
                                        variant={selectedTime === time ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedTime(time)}
                                        className="text-xs"
                                      >
                                        {time}
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                {/* Session Topic */}
                                <div>
                                  <label className="text-sm mb-2 block">What would you like to discuss? (Optional)</label>
                                  <Textarea
                                    value={sessionTopic}
                                    onChange={(e) => setSessionTopic(e.target.value)}
                                    placeholder="Brief description of what you'd like to work on..."
                                    rows={3}
                                  />
                                </div>

                                {/* Pricing */}
                                <div className="p-3 bg-green-50 rounded-lg">
                                  <div className="flex justify-between text-sm">
                                    <span>Session Fee:</span>
                                    <span>₹{selectedCounselor.price}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Platform Fee:</span>
                                    <span>₹50</span>
                                  </div>
                                  <div className="flex justify-between text-sm border-t pt-2 mt-2">
                                    <span>Total:</span>
                                    <span>₹{selectedCounselor.price + 50}</span>
                                  </div>
                                </div>

                                <Button 
                                  onClick={bookSession} 
                                  className="w-full"
                                  disabled={!selectedDate || !selectedTime}
                                >
                                  Confirm Booking
                                </Button>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Sessions */}
            <div>
              <h3 className="mb-4">Upcoming Sessions</h3>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map(session => (
                    <Card key={session.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {getSessionTypeIcon(session.type)}
                          </div>
                          <div>
                            <h4 className="text-sm">{session.counselor}</h4>
                            <p className="text-xs text-muted-foreground">{session.topic}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                              <CalendarIcon size={12} />
                              <span>{session.date} at {session.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Reschedule</Button>
                          <Button size="sm">Join</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <CalendarIcon className="mx-auto text-muted-foreground mb-3" size={48} />
                  <h3 className="mb-2">No Upcoming Sessions</h3>
                  <p className="text-muted-foreground mb-4">Book your first session to get started</p>
                  <Button onClick={() => setView('browse')}>Browse Counselors</Button>
                </Card>
              )}
            </div>

            {/* Session History */}
            <div>
              <h3 className="mb-4">Recent Sessions</h3>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Video className="text-green-600" size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm">Dr. Priya Sharma</h4>
                      <p className="text-xs text-muted-foreground">Stress Management Session</p>
                      <p className="text-xs text-muted-foreground">Sep 28, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="text-yellow-400 fill-current" size={12} />
                      ))}
                    </div>
                    <Button variant="outline" size="sm">Review</Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Emergency Resources */}
            <Card className="p-4 bg-red-50 border-red-200">
              <h4 className="text-red-800 mb-2">🚨 Need Immediate Help?</h4>
              <p className="text-sm text-red-700 mb-3">
                If you're experiencing a mental health emergency, please reach out immediately:
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full text-red-700 border-red-300">
                  Call National Suicide Prevention: 1-800-273-8255
                </Button>
                <Button variant="outline" size="sm" className="w-full text-red-700 border-red-300">
                  Text Crisis Line: Text HOME to 741741
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Enter your payment information to complete the booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={paymentInfo.name}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, name: e.target.value })}
                placeholder="Full Name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={paymentInfo.email}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, email: e.target.value })}
                placeholder="Email Address"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={paymentInfo.phone}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, phone: e.target.value })}
                placeholder="Phone Number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={paymentInfo.cardNumber}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                placeholder="Card Number"
                className="mt-1"
              />
            </div>
            <div className="flex space-x-2">
              <div className="w-1/2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  value={paymentInfo.expiryDate}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                  placeholder="MM/YY"
                  className="mt-1"
                />
              </div>
              <div className="w-1/2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  value={paymentInfo.cvv}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                  placeholder="CVV"
                  className="mt-1"
                />
              </div>
            </div>
            <Button 
              onClick={handlePayment} 
              className="w-full"
            >
              Pay and Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Successful</DialogTitle>
            <DialogDescription>
              Your session has been booked successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500" size={24} />
              <p className="text-sm">Your session is confirmed and will be scheduled on {selectedDate?.toLocaleDateString()} at {selectedTime}.</p>
            </div>
            <Button 
              onClick={() => setView('upcoming')} 
              className="w-full"
            >
              View Upcoming Sessions
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}