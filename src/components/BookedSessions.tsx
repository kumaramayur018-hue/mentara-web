import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Calendar, ArrowLeft, Video, Phone, MessageSquare, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useCounselors } from "./hooks/useData";
import { toast } from "sonner@2.0.3";

interface SessionBooking {
  id: string;
  bookingNumber: string;
  date: string;
  sessionDate: string;
  sessionTime: string;
  counselorId: string;
  sessionType: 'video' | 'audio' | 'chat';
  duration: number; // in minutes
  price: number;
  status: 'Upcoming' | 'Completed' | 'Cancelled' | 'Rescheduled';
  notes?: string;
  paymentInfo: {
    amount: number;
    method: string;
    transactionId: string;
  };
}

interface BookedSessionsProps {
  onBack?: () => void;
  onNavigateToBooking?: () => void;
}

export function BookedSessions({ onBack, onNavigateToBooking }: BookedSessionsProps) {
  const { counselors } = useCounselors();
  const [bookings, setBookings] = useState<SessionBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<SessionBooking | null>(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<SessionBooking | null>(null);

  useEffect(() => {
    // Load bookings from localStorage
    const savedBookings = localStorage.getItem('mentara_session_bookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }
  }, []);

  const getStatusColor = (status: SessionBooking['status']) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Rescheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  const getStatusIcon = (status: SessionBooking['status']) => {
    switch (status) {
      case 'Upcoming':
        return <Clock className="h-4 w-4" />;
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'Rescheduled':
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSessionTypeIcon = (type: SessionBooking['sessionType']) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Phone className="h-4 w-4" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCounselorById = (counselorId: string) => {
    return counselors.find(c => c.id === counselorId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleCancelBooking = (booking: SessionBooking) => {
    setBookingToCancel(booking);
    setCancelDialog(true);
  };

  const confirmCancelBooking = () => {
    if (!bookingToCancel) return;

    const updatedBookings = bookings.map(booking =>
      booking.id === bookingToCancel.id
        ? { ...booking, status: 'Cancelled' as const }
        : booking
    );

    setBookings(updatedBookings);
    localStorage.setItem('mentara_session_bookings', JSON.stringify(updatedBookings));
    
    toast.success('Session cancelled successfully');
    setCancelDialog(false);
    setBookingToCancel(null);
    if (selectedBooking?.id === bookingToCancel.id) {
      setSelectedBooking(null);
    }
  };

  // Sort bookings by date (newest first)
  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
  );

  // Separate upcoming and past bookings
  const upcomingBookings = sortedBookings.filter(b => 
    b.status === 'Upcoming' || b.status === 'Rescheduled'
  );
  const pastBookings = sortedBookings.filter(b => 
    b.status === 'Completed' || b.status === 'Cancelled'
  );

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl">My Sessions</h1>
            <p className="text-sm text-muted-foreground">Manage your counseling sessions</p>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <Calendar className="mx-auto text-muted-foreground mb-3" size={48} />
            <h3 className="mb-2">No Sessions Booked</h3>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t booked any counseling sessions yet. Book your first session now!
            </p>
            {onNavigateToBooking && (
              <Button onClick={onNavigateToBooking}>
                <Calendar className="h-4 w-4 mr-2" />
                Book a Session
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Sessions */}
            {upcomingBookings.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Upcoming Sessions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingBookings.map(booking => {
                    const counselor = getCounselorById(booking.counselorId);
                    return (
                      <Card 
                        key={booking.id} 
                        className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <div className="space-y-4">
                          {/* Counselor Info */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-base sm:text-lg">{counselor?.name || 'Unknown Counselor'}</h3>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {Array.isArray(counselor?.specialization) 
                                  ? counselor.specialization.slice(0, 2).join(', ')
                                  : counselor?.specialization}
                              </p>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>

                          {/* Session Details */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(booking.sessionDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.sessionTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getSessionTypeIcon(booking.sessionType)}
                              <span className="capitalize">{booking.sessionType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">₹{booking.price}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelBooking(booking);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info('Join session feature coming soon!');
                              }}
                            >
                              Join Session
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Sessions */}
            {pastBookings.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  Past Sessions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastBookings.map(booking => {
                    const counselor = getCounselorById(booking.counselorId);
                    return (
                      <Card 
                        key={booking.id} 
                        className="p-4 sm:p-6 opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <div className="space-y-3">
                          {/* Counselor Info */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-base">{counselor?.name || 'Unknown Counselor'}</h3>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(booking.sessionDate)} at {booking.sessionTime}
                              </p>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>

                          {/* Session Type & Price */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {getSessionTypeIcon(booking.sessionType)}
                              <span className="capitalize">{booking.sessionType}</span>
                            </div>
                            <span className="text-muted-foreground">₹{booking.price}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Booking Details Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Session Details</DialogTitle>
              <DialogDescription>
                Booking #{selectedBooking?.bookingNumber}
              </DialogDescription>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(selectedBooking.status)}
                      {selectedBooking.status}
                    </span>
                  </Badge>
                </div>

                {/* Counselor */}
                <div>
                  <h3 className="mb-2">Counselor</h3>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p>{getCounselorById(selectedBooking.counselorId)?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {Array.isArray(getCounselorById(selectedBooking.counselorId)?.specialization)
                            ? getCounselorById(selectedBooking.counselorId)?.specialization.join(', ')
                            : getCounselorById(selectedBooking.counselorId)?.specialization}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Session Details */}
                <div>
                  <h3 className="mb-2">Session Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p>{formatDate(selectedBooking.sessionDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p>{selectedBooking.sessionTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSessionTypeIcon(selectedBooking.sessionType)}
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="capitalize">{selectedBooking.sessionType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p>{selectedBooking.duration} minutes</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="mb-2">Payment Information</h3>
                  <Card className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span>₹{selectedBooking.paymentInfo.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payment Method</span>
                      <span>{selectedBooking.paymentInfo.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Transaction ID</span>
                      <span className="text-xs">{selectedBooking.paymentInfo.transactionId}</span>
                    </div>
                  </Card>
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div>
                    <h3 className="mb-2">Notes</h3>
                    <Card className="p-4">
                      <p className="text-sm">{selectedBooking.notes}</p>
                    </Card>
                  </div>
                )}

                {/* Booking Date */}
                <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                  Booked on {formatDate(selectedBooking.date)}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Session?</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this session? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setCancelDialog(false)}>
                Keep Session
              </Button>
              <Button variant="destructive" onClick={confirmCancelBooking}>
                Cancel Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}