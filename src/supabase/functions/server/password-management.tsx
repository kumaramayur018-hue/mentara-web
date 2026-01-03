// Secure password management endpoints for admin portal
import type { Context } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Generate cryptographically secure random password
function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => charset[byte % charset.length]).join('');
}

// Generate secure token for password reset/set
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Log audit entry
async function logAuditEntry(
  adminId: string,
  targetUserId: string,
  action: string,
  metadata?: Record<string, any>
) {
  const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await kv.set(auditId, {
    id: auditId,
    adminId,
    targetUserId,
    action,
    metadata: metadata || {},
    timestamp: new Date().toISOString(),
    ip: metadata?.ip || 'unknown',
  });
}

// Get password status for a user
export async function getPasswordStatus(c: Context) {
  try {
    const userId = c.req.param('userId');
    const user = await kv.get(`user_${userId}`);
    
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Check if user has password
    const hasPassword = user.password && user.password !== '';
    const lastPasswordChange = user.lastPasswordChange || user.createdAt;
    const passwordSetVia = user.passwordSetVia || 'unknown';
    
    let status = 'not_set';
    if (hasPassword) {
      status = 'set';
    } else if (user.ssoProvider) {
      status = 'sso_managed';
    } else if (user.pendingPasswordSet) {
      status = 'pending_invite';
    }

    return c.json({
      success: true,
      status: {
        status,
        hasPassword,
        lastPasswordChange,
        passwordSetVia,
        ssoProvider: user.ssoProvider || null,
        passwordStrengthPolicy: 'Minimum 8 characters, mix of letters, numbers and symbols',
      }
    });
  } catch (error) {
    console.error('Error getting password status:', error);
    return c.json({ success: false, error: 'Failed to get password status' }, 500);
  }
}

// Send set password link to user
export async function sendSetPasswordLink(c: Context) {
  try {
    const userId = c.req.param('userId');
    const { adminId, reason } = await c.req.json();
    
    const user = await kv.get(`user_${userId}`);
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Generate secure token
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token
    const tokenId = `pwd_token_${userId}_${Date.now()}`;
    await kv.set(tokenId, {
      id: tokenId,
      userId,
      token,
      type: 'set_password',
      expiresAt: expiresAt.toISOString(),
      used: false,
      createdBy: adminId,
    });

    // Update user with pending status
    await kv.set(`user_${userId}`, {
      ...user,
      pendingPasswordSet: true,
      passwordTokenId: tokenId,
    });

    // Log audit entry
    await logAuditEntry(adminId, userId, 'SEND_SET_PASSWORD_LINK', {
      reason,
      tokenId,
      expiresAt: expiresAt.toISOString(),
    });

    // In a real app, send email here
    // await sendEmail(user.email, 'Set Your Password', `Use this link: ${generateSetPasswordUrl(token)}`);

    return c.json({
      success: true,
      message: 'Set password link sent to user',
      expiresAt: expiresAt.toISOString(),
      // For demo purposes, return the token (in production, only send via email)
      setPasswordUrl: `/set-password?token=${token}`,
    });
  } catch (error) {
    console.error('Error sending set password link:', error);
    return c.json({ success: false, error: 'Failed to send set password link' }, 500);
  }
}

// Generate temporary password
export async function generateTempPassword(c: Context) {
  try {
    const userId = c.req.param('userId');
    const { adminId, reason, emailToUser } = await c.req.json();
    
    const user = await kv.get(`user_${userId}`);
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    if (user.ssoProvider) {
      return c.json({ 
        success: false, 
        error: 'User uses SSO authentication. Password changes are managed through SSO provider.' 
      }, 400);
    }

    // Generate secure temporary password
    const tempPassword = generateSecurePassword(16);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Invalidate any previous temp passwords
    const existingTempPwd = await kv.get(`temp_pwd_${userId}`);
    if (existingTempPwd) {
      await kv.del(`temp_pwd_${userId}`);
    }

    // Store temp password (hashed in production - storing plain for demo)
    const tempPwdId = `temp_pwd_${userId}`;
    await kv.set(tempPwdId, {
      id: tempPwdId,
      userId,
      password: tempPassword, // In production: hash this with bcrypt/argon2
      expiresAt: expiresAt.toISOString(),
      singleUse: true,
      used: false,
      createdBy: adminId,
    });

    // Update user
    await kv.set(`user_${userId}`, {
      ...user,
      tempPasswordActive: true,
      tempPasswordId: tempPwdId,
      requiresPasswordChange: true, // Force change on next login
    });

    // Log audit entry (NEVER log the actual password)
    await logAuditEntry(adminId, userId, 'GENERATE_TEMP_PASSWORD', {
      reason,
      emailToUser,
      expiresAt: expiresAt.toISOString(),
      tempPasswordId: tempPwdId,
    });

    // In production, optionally email the temp password to user
    // if (emailToUser) {
    //   await sendEmail(user.email, 'Temporary Password', `Your temporary password: ${tempPassword}`);
    // }

    // Return temp password ONLY ONCE in the response
    // Frontend should show this once and never retrieve it again
    return c.json({
      success: true,
      message: 'Temporary password generated',
      tempPassword, // SHOWN ONLY ONCE
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes: 15,
      singleUse: true,
      warning: 'This password is shown only once and cannot be retrieved again. Consider emailing it to the user.',
    });
  } catch (error) {
    console.error('Error generating temp password:', error);
    return c.json({ success: false, error: 'Failed to generate temporary password' }, 500);
  }
}

// Force password reset
export async function forcePasswordReset(c: Context) {
  try {
    const userId = c.req.param('userId');
    const { adminId, reason } = await c.req.json();
    
    const user = await kv.get(`user_${userId}`);
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    if (user.ssoProvider) {
      return c.json({ 
        success: false, 
        error: 'User uses SSO authentication. Password changes are managed through SSO provider.' 
      }, 400);
    }

    // Generate reset token
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    const tokenId = `pwd_reset_${userId}_${Date.now()}`;
    await kv.set(tokenId, {
      id: tokenId,
      userId,
      token,
      type: 'force_reset',
      expiresAt: expiresAt.toISOString(),
      used: false,
      createdBy: adminId,
    });

    // Invalidate current credentials
    await kv.set(`user_${userId}`, {
      ...user,
      requiresPasswordChange: true,
      passwordResetRequired: true,
      passwordResetTokenId: tokenId,
      currentPasswordInvalidated: true,
    });

    // Invalidate any active sessions (in production)
    // await invalidateUserSessions(userId);

    // Log audit entry
    await logAuditEntry(adminId, userId, 'FORCE_PASSWORD_RESET', {
      reason,
      tokenId,
      expiresAt: expiresAt.toISOString(),
    });

    // Send email to user
    // await sendEmail(user.email, 'Password Reset Required', `Reset your password: ${generateResetUrl(token)}`);

    return c.json({
      success: true,
      message: 'Password reset forced. User must reset password on next login.',
      resetUrl: `/reset-password?token=${token}`,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error forcing password reset:', error);
    return c.json({ success: false, error: 'Failed to force password reset' }, 500);
  }
}

// Deactivate user access
export async function deactivateUserAccess(c: Context) {
  try {
    const userId = c.req.param('userId');
    const { adminId, reason } = await c.req.json();
    
    const user = await kv.get(`user_${userId}`);
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Deactivate user
    await kv.set(`user_${userId}`, {
      ...user,
      isActive: false,
      deactivatedAt: new Date().toISOString(),
      deactivatedBy: adminId,
      deactivationReason: reason,
    });

    // Log audit entry
    await logAuditEntry(adminId, userId, 'DEACTIVATE_USER', {
      reason,
    });

    return c.json({
      success: true,
      message: 'User access deactivated',
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return c.json({ success: false, error: 'Failed to deactivate user' }, 500);
  }
}

// Reactivate user access
export async function reactivateUserAccess(c: Context) {
  try {
    const userId = c.req.param('userId');
    const { adminId, reason } = await c.req.json();
    
    const user = await kv.get(`user_${userId}`);
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Reactivate user
    await kv.set(`user_${userId}`, {
      ...user,
      isActive: true,
      reactivatedAt: new Date().toISOString(),
      reactivatedBy: adminId,
      deactivationReason: null,
    });

    // Log audit entry
    await logAuditEntry(adminId, userId, 'REACTIVATE_USER', {
      reason,
    });

    return c.json({
      success: true,
      message: 'User access reactivated',
    });
  } catch (error) {
    console.error('Error reactivating user:', error);
    return c.json({ success: false, error: 'Failed to reactivate user' }, 500);
  }
}

// Get audit logs for a user
export async function getUserAuditLogs(c: Context) {
  try {
    const userId = c.req.param('userId');
    const allAudits = await kv.getByPrefix('audit_');
    
    // Filter audits for this user
    const userAudits = allAudits.filter((audit: any) => audit.targetUserId === userId);
    
    // Sort by timestamp (newest first)
    userAudits.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return c.json({
      success: true,
      audits: userAudits,
    });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return c.json({ success: false, error: 'Failed to get audit logs' }, 500);
  }
}

// Get all audit logs (super admin only)
export async function getAllAuditLogs(c: Context) {
  try {
    const allAudits = await kv.getByPrefix('audit_');
    
    // Sort by timestamp (newest first)
    allAudits.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return c.json({
      success: true,
      audits: allAudits,
    });
  } catch (error) {
    console.error('Error getting all audit logs:', error);
    return c.json({ success: false, error: 'Failed to get audit logs' }, 500);
  }
}

// Verify and use a password token (for user-facing password set/reset)
export async function verifyPasswordToken(c: Context) {
  try {
    const { token } = await c.req.json();
    
    // Find token
    const allTokens = await kv.getByPrefix('pwd_token_');
    const resetTokens = await kv.getByPrefix('pwd_reset_');
    const allPasswordTokens = [...allTokens, ...resetTokens];
    
    const tokenData = allPasswordTokens.find((t: any) => t.token === token);
    
    if (!tokenData) {
      return c.json({ success: false, error: 'Invalid token' }, 400);
    }

    // Check if expired
    if (new Date(tokenData.expiresAt) < new Date()) {
      return c.json({ success: false, error: 'Token expired' }, 400);
    }

    // Check if already used
    if (tokenData.used) {
      return c.json({ success: false, error: 'Token already used' }, 400);
    }

    return c.json({
      success: true,
      valid: true,
      userId: tokenData.userId,
      type: tokenData.type,
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return c.json({ success: false, error: 'Failed to verify token' }, 500);
  }
}

// Set password using token
export async function setPasswordWithToken(c: Context) {
  try {
    const { token, newPassword } = await c.req.json();
    
    // Find and verify token
    const allTokens = await kv.getByPrefix('pwd_token_');
    const resetTokens = await kv.getByPrefix('pwd_reset_');
    const allPasswordTokens = [...allTokens, ...resetTokens];
    
    const tokenData = allPasswordTokens.find((t: any) => t.token === token);
    
    if (!tokenData) {
      return c.json({ success: false, error: 'Invalid token' }, 400);
    }

    if (new Date(tokenData.expiresAt) < new Date()) {
      return c.json({ success: false, error: 'Token expired' }, 400);
    }

    if (tokenData.used) {
      return c.json({ success: false, error: 'Token already used' }, 400);
    }

    // Mark token as used
    await kv.set(tokenData.id, {
      ...tokenData,
      used: true,
      usedAt: new Date().toISOString(),
    });

    // Update user password
    const user = await kv.get(`user_${tokenData.userId}`);
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    await kv.set(`user_${tokenData.userId}`, {
      ...user,
      password: newPassword, // In production: hash with bcrypt/argon2
      lastPasswordChange: new Date().toISOString(),
      passwordSetVia: tokenData.type === 'set_password' ? 'invite' : 'reset',
      pendingPasswordSet: false,
      requiresPasswordChange: false,
      passwordResetRequired: false,
      currentPasswordInvalidated: false,
      passwordTokenId: null,
      passwordResetTokenId: null,
    });

    return c.json({
      success: true,
      message: 'Password set successfully',
    });
  } catch (error) {
    console.error('Error setting password with token:', error);
    return c.json({ success: false, error: 'Failed to set password' }, 500);
  }
}
