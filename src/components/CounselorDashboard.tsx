import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar } from "./ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { 
  Video, Phone, MessageSquare, MapPin, Bell, Calendar, 
  Clock, CheckCircle, AlertCircle, User, RefreshCw, X, 
  Edit3, ChevronRight, CalendarDays, LogOut, ArrowLeft
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";

interface SessionClient {
  id: string;
  name: string;
  profileImage?: string;
  isNewClient: boolean;
}

interface CounselorSession {
  id: string;
  client: SessionClient;
  sessionType: 'video' | 'audio' | 'chat' | 'in-person';
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'completed';
  notes?: string;
}

const mockCounselor = {
  name: "Dr. Priya Sharma",
  profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  unreadNotifications: 3
};

const mockSessions: CounselorSession[] = [
  {
    id: '1',
    client: {
      id: 'c1',
      name: 'Rahul Verma',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      isNewClient: false
    },
    sessionType: 'video',
    startTime: '09:00 AM',
    endTime: '09:50 AM',
    status: 'confirmed'
  },
  {
    id: '2',
    client: {
      id: 'c2',
      name: 'Ananya Desai',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      isNewClient: true
    },
    sessionType: 'audio',
    startTime: '10:30 AM',
    endTime: '11:20 AM',
    status: 'confirmed'
  },
  {
    id: '3',
    client: {
      id: 'c3',
      name: 'Arjun Patel',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      isNewClient: false
    },
    sessionType: 'chat',
    startTime: '02:00 PM',
    endTime: '02:50 PM',
    status: 'pending'
  },
  {
    id: '4',
    client: {
      id: 'c4',
      name: 'Neha Krishnan',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      isNewClient: false
    },
    sessionType: 'video',
    startTime: '04:00 PM',
    endTime: '04:50 PM',
    status: 'confirmed'
  },
  {
    id: '5',
    client: {
      id: 'c5',
      name: 'Vikram Singh',
      profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      isNewClient: true
    },
    sessionType: 'in-person',
    startTime: '05:30 PM',
    endTime: '06:20 PM',
    status: 'confirmed'
  }
];

export function CounselorDashboard({ onLogout, onBackToApp }: CounselorDashboardProps) {
  const [sessions, setSessions] = useState<CounselorSession[]>(mockSessions);
  const [selectedSession, setSelectedSession] = useState<CounselorSession | null>(null);
  const [isChangeTypeModalOpen, setIsChangeTypeModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'video' | 'audio' | 'chat' | 'in-person'>('video');

  const getSessionTypeIcon = (type: CounselorSession['sessionType']) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Phone className="h-4 w-4" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      case 'in-person':
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getSessionTypeLabel = (type: CounselorSession['sessionType']) => {
    switch (type) {
      case 'video':
        return 'Video Call';
      case 'audio':
        return 'Audio Call';
      case 'chat':
        return 'Chat';
      case 'in-person':
        return 'In-person';
    }
  };

  const getStatusColor = (status: CounselorSession['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  const getStatusIcon = (status: CounselorSession['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <AlertCircle className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
    }
  };

  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const upcomingCount = sessions.filter(s => s.status === 'confirmed' || s.status === 'pending').length;

  const handleReschedule = (session: CounselorSession) => {
    toast.info('Reschedule feature coming soon!');
  };

  const handleCancel = (session: CounselorSession) => {
    if (confirm(`Are you sure you want to cancel the session with ${session.client.name}?`)) {
      setSessions(sessions.filter(s => s.id !== session.id));
      toast.success('Session cancelled successfully');
    }
  };

  const handleChangeType = (session: CounselorSession) => {
    setSelectedSession(session);
    setSelectedType(session.sessionType);
    setIsChangeTypeModalOpen(true);
  };

  const saveSessionTypeChange = () => {
    if (selectedSession) {
      setSessions(sessions.map(s => 
        s.id === selectedSession.id 
          ? { ...s, sessionType: selectedType }
          : s
      ));
      toast.success('Session type updated successfully');
      setIsChangeTypeModalOpen(false);
      setSelectedSession(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Counselor Info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <ImageWithFallback
                  src={mockCounselor.profileImage}
                  alt={mockCounselor.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/10"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div>
                <h2 className="text-lg">{mockCounselor.name}</h2>
                <p className="text-sm text-muted-foreground">Counselor Dashboard</p>
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {mockCounselor.unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {mockCounselor.unreadNotifications}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Title & Actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl">Today&apos;s Schedule</h1>
          </div>
          
          <div className="flex gap-2">
            {onBackToApp && (
              <Button variant="outline" size="sm" onClick={onBackToApp}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Button>
            )}
            {onLogout && (
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>

        {/* Daily Summary Card */}
        <Card className="p-6">
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-1">{sessions.length}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Sessions</p>
            </div>
            <div className="text-center border-l border-r border-border">
              <div className="text-3xl sm:text-4xl text-green-600 dark:text-green-400 mb-1">{completedCount}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl text-blue-600 dark:text-blue-400 mb-1">{upcomingCount}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </Card>

        {/* Session List */}
        {sessions.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Sessions
            </h3>
            <div className="space-y-3">
              {sessions.map(session => (
                <Card key={session.id} className="p-4 sm:p-5 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    {/* Session Header */}
                    <div className="flex items-start justify-between gap-3">
                      {/* Client Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <ImageWithFallback
                            src={session.client.profileImage || ''}
                            alt={session.client.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="truncate">{session.client.name}</h4>
                            {session.client.isNewClient && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                                New Client
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              {getSessionTypeIcon(session.sessionType)}
                              <span>{getSessionTypeLabel(session.sessionType)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{session.startTime} - {session.endTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <Badge className={`${getStatusColor(session.status)} flex items-center gap-1 whitespace-nowrap`}>
                        {getStatusIcon(session.status)}
                        <span className="capitalize">{session.status}</span>
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none rounded-full"
                        onClick={() => handleReschedule(session)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reschedule
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none rounded-full"
                        onClick={() => handleChangeType(session)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Change Type
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => handleCancel(session)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Empty State
          <Card className="p-12 text-center">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <CalendarDays className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="mb-2">No sessions scheduled today</h3>
                <p className="text-sm text-muted-foreground">
                  You have no sessions scheduled for today. Take some time to rest or check your upcoming week.
                </p>
              </div>
              <Button className="rounded-full">
                <Calendar className="h-4 w-4 mr-2" />
                View Upcoming Week
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Session Type Change Modal */}
      <Dialog open={isChangeTypeModalOpen} onOpenChange={setIsChangeTypeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Session Type</DialogTitle>
            <DialogDescription>
              Select the new session type for {selectedSession?.client.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Session Type Options */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'video' as const, icon: Video, label: 'Video Call' },
                { type: 'audio' as const, icon: Phone, label: 'Audio Call' },
                { type: 'chat' as const, icon: MessageSquare, label: 'Chat' },
                { type: 'in-person' as const, icon: MapPin, label: 'In-person' }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${
                    selectedType === type
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`p-3 rounded-full ${
                      selectedType === type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm">{label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Save Button */}
            <Button 
              onClick={saveSessionTypeChange}
              className="w-full rounded-full"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CounselorDashboardProps {
  onLogout?: () => void;
  onBackToApp?: () => void;
}