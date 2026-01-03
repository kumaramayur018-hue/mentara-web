// Session management endpoints for Mentara
import type { Context } from 'npm:hono';
import * as kv from './kv_store.tsx';

// Get all sessions
export async function getSessions(c: Context) {
  try {
    const sessions = await kv.getByPrefix('session_');
    return c.json({ success: true, sessions: sessions || [] });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return c.json({ success: false, error: 'Failed to fetch sessions' }, 500);
  }
}

// Book a new session
export async function bookSession(c: Context) {
  try {
    const sessionData = await c.req.json();
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const newSession = {
      id: sessionId,
      ...sessionData,
      transactionId,
      bookingDate: new Date().toISOString(),
      status: sessionData.status || 'pending',
    };
    
    await kv.set(sessionId, newSession);
    
    // Send notifications
    // Notify user
    const userNotificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(userNotificationId, {
      id: userNotificationId,
      userId: sessionData.userId,
      type: 'session_booked',
      title: 'Session Booked Successfully',
      message: `Your session with ${sessionData.counselorName} has been booked for ${sessionData.date} at ${sessionData.time}.`,
      read: false,
      createdAt: new Date().toISOString(),
      sessionId: sessionId,
    });
    
    // Notify counselor
    const counselorNotificationId = `notif_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(counselorNotificationId, {
      id: counselorNotificationId,
      userId: sessionData.counselorId,
      type: 'session_booked',
      title: 'New Session Booked',
      message: `A new session has been booked for ${sessionData.date} at ${sessionData.time}.`,
      read: false,
      createdAt: new Date().toISOString(),
      sessionId: sessionId,
    });
    
    return c.json({ success: true, sessionId, transactionId });
  } catch (error) {
    console.error('Error booking session:', error);
    return c.json({ success: false, error: 'Failed to book session' }, 500);
  }
}

// Update session status
export async function updateSessionStatus(c: Context) {
  try {
    const sessionId = c.req.param('sessionId');
    const { status, reason } = await c.req.json();
    
    const session = await kv.get(sessionId);
    if (!session) {
      return c.json({ success: false, error: 'Session not found' }, 404);
    }
    
    const updatedSession = {
      ...session,
      status,
      ...(reason && { cancellationReason: reason }),
    };
    
    await kv.set(sessionId, updatedSession);
    
    // Send notifications based on status change
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType: 'session_confirmed' | 'session_cancelled' | 'session_started' | 'session_completed' = 'session_confirmed';
    
    switch (status) {
      case 'confirmed':
        notificationTitle = 'Session Confirmed';
        notificationMessage = `Your session on ${session.date} at ${session.time} has been confirmed.`;
        notificationType = 'session_confirmed';
        break;
      case 'cancelled':
        notificationTitle = 'Session Cancelled';
        notificationMessage = `Your session on ${session.date} at ${session.time} has been cancelled. ${reason || ''}`;
        notificationType = 'session_cancelled';
        break;
      case 'in-progress':
        notificationTitle = 'Session Started';
        notificationMessage = `Your session has started.`;
        notificationType = 'session_started';
        break;
      case 'completed':
        notificationTitle = 'Session Completed';
        notificationMessage = `Your session has been completed. Please provide feedback.`;
        notificationType = 'session_completed';
        break;
    }
    
    if (notificationTitle) {
      const userNotificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await kv.set(userNotificationId, {
        id: userNotificationId,
        userId: session.userId,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        read: false,
        createdAt: new Date().toISOString(),
        sessionId: sessionId,
      });
      
      // Also notify counselor
      const counselorNotificationId = `notif_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`;
      await kv.set(counselorNotificationId, {
        id: counselorNotificationId,
        userId: session.counselorId,
        type: notificationType,
        title: notificationTitle.replace('Your', 'Session'),
        message: notificationMessage.replace('Your', 'The'),
        read: false,
        createdAt: new Date().toISOString(),
        sessionId: sessionId,
      });
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating session status:', error);
    return c.json({ success: false, error: 'Failed to update session status' }, 500);
  }
}

// Reschedule session
export async function rescheduleSession(c: Context) {
  try {
    const sessionId = c.req.param('sessionId');
    const { newDate, newTime } = await c.req.json();
    
    const session = await kv.get(sessionId);
    if (!session) {
      return c.json({ success: false, error: 'Session not found' }, 404);
    }
    
    const oldDateTime = `${session.date} at ${session.time}`;
    
    const updatedSession = {
      ...session,
      date: newDate,
      time: newTime,
      status: 'rescheduled',
      rescheduledFrom: oldDateTime,
    };
    
    await kv.set(sessionId, updatedSession);
    
    // Notify user
    const userNotificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(userNotificationId, {
      id: userNotificationId,
      userId: session.userId,
      type: 'session_rescheduled',
      title: 'Session Rescheduled',
      message: `Your session has been rescheduled from ${oldDateTime} to ${newDate} at ${newTime}.`,
      read: false,
      createdAt: new Date().toISOString(),
      sessionId: sessionId,
    });
    
    // Notify counselor
    const counselorNotificationId = `notif_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(counselorNotificationId, {
      id: counselorNotificationId,
      userId: session.counselorId,
      type: 'session_rescheduled',
      title: 'Session Rescheduled',
      message: `A session has been rescheduled from ${oldDateTime} to ${newDate} at ${newTime}.`,
      read: false,
      createdAt: new Date().toISOString(),
      sessionId: sessionId,
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error rescheduling session:', error);
    return c.json({ success: false, error: 'Failed to reschedule session' }, 500);
  }
}

// Change session type
export async function changeSessionType(c: Context) {
  try {
    const sessionId = c.req.param('sessionId');
    const { sessionType } = await c.req.json();
    
    const session = await kv.get(sessionId);
    if (!session) {
      return c.json({ success: false, error: 'Session not found' }, 404);
    }
    
    const updatedSession = {
      ...session,
      sessionType,
    };
    
    await kv.set(sessionId, updatedSession);
    
    // Notify both parties
    const userNotificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(userNotificationId, {
      id: userNotificationId,
      userId: session.userId,
      type: 'session_rescheduled',
      title: 'Session Type Changed',
      message: `Your session type has been changed to ${sessionType}.`,
      read: false,
      createdAt: new Date().toISOString(),
      sessionId: sessionId,
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error changing session type:', error);
    return c.json({ success: false, error: 'Failed to change session type' }, 500);
  }
}

// Add session notes (counselor)
export async function addSessionNotes(c: Context) {
  try {
    const sessionId = c.req.param('sessionId');
    const { notes } = await c.req.json();
    
    const session = await kv.get(sessionId);
    if (!session) {
      return c.json({ success: false, error: 'Session not found' }, 404);
    }
    
    const updatedSession = {
      ...session,
      notes,
    };
    
    await kv.set(sessionId, updatedSession);
    
    // Notify user
    const userNotificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(userNotificationId, {
      id: userNotificationId,
      userId: session.userId,
      type: 'notes_added',
      title: 'Session Notes Added',
      message: `Your counselor has added notes to your session.`,
      read: false,
      createdAt: new Date().toISOString(),
      sessionId: sessionId,
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error adding session notes:', error);
    return c.json({ success: false, error: 'Failed to add session notes' }, 500);
  }
}

// Add session feedback (user)
export async function addSessionFeedback(c: Context) {
  try {
    const sessionId = c.req.param('sessionId');
    const { rating, comment } = await c.req.json();
    
    const session = await kv.get(sessionId);
    if (!session) {
      return c.json({ success: false, error: 'Session not found' }, 404);
    }
    
    const updatedSession = {
      ...session,
      feedback: { rating, comment },
    };
    
    await kv.set(sessionId, updatedSession);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error adding session feedback:', error);
    return c.json({ success: false, error: 'Failed to add session feedback' }, 500);
  }
}
