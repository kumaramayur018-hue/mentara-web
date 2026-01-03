import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthProvider';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface Session {
  id: string;
  userId: string;
  counselorId: string;
  counselorName: string;
  counselorImage: string;
  sessionType: 'video' | 'audio' | 'chat' | 'in-person';
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
  topic?: string;
  price: number;
  transactionId: string;
  bookingDate: string;
  notes?: string;
  feedback?: {
    rating: number;
    comment: string;
  };
  cancellationReason?: string;
  rescheduledFrom?: string;
}

interface SessionContextType {
  sessions: Session[];
  loading: boolean;
  refreshSessions: () => Promise<void>;
  bookSession: (session: Omit<Session, 'id' | 'bookingDate' | 'transactionId'>) => Promise<string>;
  updateSessionStatus: (sessionId: string, status: Session['status'], reason?: string) => Promise<void>;
  rescheduleSession: (sessionId: string, newDate: string, newTime: string) => Promise<void>;
  changeSessionType: (sessionId: string, newType: Session['sessionType']) => Promise<void>;
  cancelSession: (sessionId: string, reason: string) => Promise<void>;
  addSessionNotes: (sessionId: string, notes: string) => Promise<void>;
  addSessionFeedback: (sessionId: string, rating: number, comment: string) => Promise<void>;
  getUserSessions: (userId: string) => Session[];
  getCounselorSessions: (counselorId: string) => Session[];
  getTodaySessions: (counselorId: string) => Session[];
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all sessions from backend
  const refreshSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/sessions`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Book a new session
  const bookSession = useCallback(async (sessionData: Omit<Session, 'id' | 'bookingDate' | 'transactionId'>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/sessions/book`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(sessionData),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        await refreshSessions();
        return result.sessionId;
      } else {
        throw new Error(result.error || 'Failed to book session');
      }
    } catch (error) {
      console.error('Error booking session:', error);
      throw error;
    }
  }, [refreshSessions]);

  // Update session status
  const updateSessionStatus = useCallback(async (sessionId: string, status: Session['status'], reason?: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/sessions/${sessionId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ status, reason }),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        await refreshSessions();
      } else {
        throw new Error(result.error || 'Failed to update session status');
      }
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  }, [refreshSessions]);

  // Reschedule session
  const rescheduleSession = useCallback(async (sessionId: string, newDate: string, newTime: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/sessions/${sessionId}/reschedule`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ newDate, newTime }),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        await refreshSessions();
      } else {
        throw new Error(result.error || 'Failed to reschedule session');
      }
    } catch (error) {
      console.error('Error rescheduling session:', error);
      throw error;
    }
  }, [refreshSessions]);

  // Change session type
  const changeSessionType = useCallback(async (sessionId: string, newType: Session['sessionType']) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/sessions/${sessionId}/type`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ sessionType: newType }),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        await refreshSessions();
      } else {
        throw new Error(result.error || 'Failed to change session type');
      }
    } catch (error) {
      console.error('Error changing session type:', error);
      throw error;
    }
  }, [refreshSessions]);

  // Cancel session
  const cancelSession = useCallback(async (sessionId: string, reason: string) => {
    try {
      await updateSessionStatus(sessionId, 'cancelled', reason);
    } catch (error) {
      console.error('Error cancelling session:', error);
      throw error;
    }
  }, [updateSessionStatus]);

  // Add session notes (counselor)
  const addSessionNotes = useCallback(async (sessionId: string, notes: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/sessions/${sessionId}/notes`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ notes }),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        await refreshSessions();
      } else {
        throw new Error(result.error || 'Failed to add notes');
      }
    } catch (error) {
      console.error('Error adding session notes:', error);
      throw error;
    }
  }, [refreshSessions]);

  // Add session feedback (user)
  const addSessionFeedback = useCallback(async (sessionId: string, rating: number, comment: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/sessions/${sessionId}/feedback`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        await refreshSessions();
      } else {
        throw new Error(result.error || 'Failed to add feedback');
      }
    } catch (error) {
      console.error('Error adding session feedback:', error);
      throw error;
    }
  }, [refreshSessions]);

  // Helper functions to filter sessions
  const getUserSessions = useCallback((userId: string) => {
    return sessions.filter(s => s.userId === userId);
  }, [sessions]);

  const getCounselorSessions = useCallback((counselorId: string) => {
    return sessions.filter(s => s.counselorId === counselorId);
  }, [sessions]);

  const getTodaySessions = useCallback((counselorId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter(s => s.counselorId === counselorId && s.date === today);
  }, [sessions]);

  // Initial load and periodic refresh
  useEffect(() => {
    refreshSessions();
    
    // Refresh every 30 seconds to simulate real-time updates
    const interval = setInterval(refreshSessions, 30000);
    
    return () => clearInterval(interval);
  }, [refreshSessions]);

  const value: SessionContextType = {
    sessions,
    loading,
    refreshSessions,
    bookSession,
    updateSessionStatus,
    rescheduleSession,
    changeSessionType,
    cancelSession,
    addSessionNotes,
    addSessionFeedback,
    getUserSessions,
    getCounselorSessions,
    getTodaySessions,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
