import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Key, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Copy, 
  Eye, 
  EyeOff,
  History,
  Lock,
  Unlock
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';

interface PasswordStatus {
  status: 'not_set' | 'set' | 'sso_managed' | 'pending_invite';
  hasPassword: boolean;
  lastPasswordChange: string;
  passwordSetVia: string;
  ssoProvider: string | null;
  isActive: boolean;
  requiresPasswordChange: boolean;
}

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  metadata: any;
  timestamp: string;
}

interface SecurePasswordManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  adminId: string;
}

export function SecurePasswordManager({ open, onOpenChange, user, adminId }: SecurePasswordManagerProps) {
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [tempPasswordExpiry, setTempPasswordExpiry] = useState<string | null>(null);
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [emailToUser, setEmailToUser] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState('actions');

  // Fetch password status
  useEffect(() => {
    if (open && user) {
      fetchPasswordStatus();
      fetchAuditLogs();
    }
  }, [open, user]);

  const fetchPasswordStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/users/${user.id}/password-status`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setPasswordStatus(result.status);
      }
    } catch (error) {
      console.error('Error fetching password status:', error);
      toast.error('Failed to fetch password status');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/users/${user.id}/audit-logs`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setAuditLogs(result.audits || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const handleSendSetPasswordLink = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for this action');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/users/${user.id}/send-set-password-link`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ adminId, reason }),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('Set password link sent successfully');
        setReason('');
        fetchPasswordStatus();
        fetchAuditLogs();
      } else {
        toast.error(result.error || 'Failed to send set password link');
      }
    } catch (error) {
      console.error('Error sending set password link:', error);
      toast.error('Failed to send set password link');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTempPassword = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for this action');
      return;
    }

    if (!confirm('Are you sure you want to generate a temporary password? This will be shown only once.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/users/${user.id}/generate-temp-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ adminId, reason, emailToUser }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setTempPassword(result.tempPassword);
        setTempPasswordExpiry(result.expiresAt);
        setShowTempPassword(true);
        toast.success('Temporary password generated');
        setReason('');
        fetchPasswordStatus();
        fetchAuditLogs();
      } else {
        toast.error(result.error || 'Failed to generate temporary password');
      }
    } catch (error) {
      console.error('Error generating temp password:', error);
      toast.error('Failed to generate temporary password');
    } finally {
      setLoading(false);
    }
  };

  const handleForcePasswordReset = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for this action');
      return;
    }

    if (!confirm('This will invalidate the user\'s current password and require them to reset it. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/users/${user.id}/force-password-reset`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ adminId, reason }),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('Password reset forced successfully');
        setReason('');
        fetchPasswordStatus();
        fetchAuditLogs();
      } else {
        toast.error(result.error || 'Failed to force password reset');
      }
    } catch (error) {
      console.error('Error forcing password reset:', error);
      toast.error('Failed to force password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccess = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for this action');
      return;
    }

    if (!confirm('This will deactivate the user\'s access to the platform. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/users/${user.id}/deactivate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ adminId, reason }),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('User access deactivated');
        setReason('');
        fetchPasswordStatus();
        fetchAuditLogs();
      } else {
        toast.error(result.error || 'Failed to deactivate user');
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Failed to deactivate user');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateAccess = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for this action');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/users/${user.id}/reactivate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ adminId, reason }),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('User access reactivated');
        setReason('');
        fetchPasswordStatus();
        fetchAuditLogs();
      } else {
        toast.error(result.error || 'Failed to reactivate user');
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast.error('Failed to reactivate user');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusBadge = () => {
    if (!passwordStatus) return null;

    const statusConfig = {
      not_set: { label: 'Not Set', variant: 'outline' as const, icon: <AlertTriangle size={14} /> },
      set: { label: 'Password Set', variant: 'default' as const, icon: <CheckCircle2 size={14} /> },
      sso_managed: { label: 'SSO Managed', variant: 'secondary' as const, icon: <Shield size={14} /> },
      pending_invite: { label: 'Pending Invite', variant: 'outline' as const, icon: <Clock size={14} /> },
    };

    const config = statusConfig[passwordStatus.status];
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getActionMessage = () => {
    if (!passwordStatus) return null;

    if (passwordStatus.ssoProvider) {
      return (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This user authenticates via {passwordStatus.ssoProvider}. Password management is handled by the SSO provider.
          </AlertDescription>
        </Alert>
      );
    }

    if (passwordStatus.status === 'not_set' || passwordStatus.status === 'pending_invite') {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This user has not set a password yet. You can send them a secure link to set their password or generate a temporary one-time password.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield size={20} />
              Secure Password Management
            </DialogTitle>
            <DialogDescription>
              Manage password and access for <strong>{user?.name}</strong> ({user?.email})
            </DialogDescription>
          </DialogHeader>

          {loading && !passwordStatus ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="audit">Audit Log</TabsTrigger>
              </TabsList>

              <TabsContent value="actions" className="space-y-4 mt-4">
                {/* Security Notice */}
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security Notice:</strong> Passwords are never stored in plaintext or displayed. All actions are logged and auditable.
                  </AlertDescription>
                </Alert>

                {getActionMessage()}

                {/* Reason Input */}
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Action *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Enter the reason for this password action (required for audit trail)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {!passwordStatus?.ssoProvider && (
                    <>
                      <Card className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm mb-1">Send Set Password Link</h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              Email a secure link that allows the user to set their own password. Link expires in 1 hour.
                            </p>
                            <Button
                              onClick={handleSendSetPasswordLink}
                              disabled={loading || !reason.trim()}
                              className="w-full"
                              variant="outline"
                            >
                              <Mail size={16} className="mr-2" />
                              Send Link
                            </Button>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <Key className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm mb-1">Generate Temporary Password</h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              Generate a secure one-time password (shown once). Expires in 15 minutes.
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                id="emailTemp"
                                checked={emailToUser}
                                onChange={(e) => setEmailToUser(e.target.checked)}
                                className="rounded"
                              />
                              <label htmlFor="emailTemp" className="text-xs">
                                Email to user
                              </label>
                            </div>
                            <Button
                              onClick={handleGenerateTempPassword}
                              disabled={loading || !reason.trim()}
                              className="w-full"
                              variant="outline"
                            >
                              <Key size={16} className="mr-2" />
                              Generate
                            </Button>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm mb-1">Force Password Reset</h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              Invalidate current password and require user to reset on next login.
                            </p>
                            <Button
                              onClick={handleForcePasswordReset}
                              disabled={loading || !reason.trim() || !passwordStatus?.hasPassword}
                              className="w-full"
                              variant="outline"
                            >
                              <AlertTriangle size={16} className="mr-2" />
                              Force Reset
                            </Button>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          {passwordStatus?.isActive ? (
                            <Lock className="h-5 w-5 text-red-500 mt-0.5" />
                          ) : (
                            <Unlock className="h-5 w-5 text-green-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className="text-sm mb-1">
                              {passwordStatus?.isActive ? 'Deactivate Access' : 'Reactivate Access'}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              {passwordStatus?.isActive 
                                ? 'Disable user login and access to the platform.'
                                : 'Restore user access to the platform.'}
                            </p>
                            <Button
                              onClick={passwordStatus?.isActive ? handleDeactivateAccess : handleReactivateAccess}
                              disabled={loading || !reason.trim()}
                              className="w-full"
                              variant={passwordStatus?.isActive ? 'destructive' : 'outline'}
                            >
                              {passwordStatus?.isActive ? (
                                <>
                                  <Lock size={16} className="mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Unlock size={16} className="mr-2" />
                                  Reactivate
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="status" className="space-y-4 mt-4">
                {passwordStatus && (
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Password Status</span>
                          {getStatusBadge()}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Account Status</span>
                          <Badge variant={passwordStatus.isActive ? 'default' : 'destructive'}>
                            {passwordStatus.isActive ? 'Active' : 'Deactivated'}
                          </Badge>
                        </div>

                        {passwordStatus.lastPasswordChange && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Last Password Change</span>
                            <span className="text-sm">
                              {new Date(passwordStatus.lastPasswordChange).toLocaleString()}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Password Set Via</span>
                          <Badge variant="outline">{passwordStatus.passwordSetVia}</Badge>
                        </div>

                        {passwordStatus.ssoProvider && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">SSO Provider</span>
                            <Badge variant="secondary">{passwordStatus.ssoProvider}</Badge>
                          </div>
                        )}

                        {passwordStatus.requiresPasswordChange && (
                          <Alert className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              User is required to change password on next login.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </Card>

                    <Card className="p-4 bg-muted">
                      <h4 className="text-sm mb-2">Password Policy</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Minimum 8 characters</li>
                        <li>• Mix of uppercase and lowercase letters</li>
                        <li>• At least one number</li>
                        <li>• At least one special character</li>
                        <li>• Passwords are hashed using industry-standard algorithms</li>
                        <li>• Passwords are never stored in plaintext</li>
                      </ul>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="audit" className="space-y-4 mt-4">
                <div className="space-y-2">
                  {auditLogs.length === 0 ? (
                    <Card className="p-8 text-center">
                      <History className="mx-auto text-muted-foreground mb-3" size={48} />
                      <h3 className="mb-2">No Audit Logs</h3>
                      <p className="text-muted-foreground text-sm">
                        No password-related actions have been performed on this account yet.
                      </p>
                    </Card>
                  ) : (
                    auditLogs.map((log) => (
                      <Card key={log.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{log.action.replace(/_/g, ' ')}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {log.metadata?.reason && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Reason: {log.metadata.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Temporary Password Display Dialog */}
      <Dialog open={showTempPassword && !!tempPassword} onOpenChange={(open) => {
        if (!open) {
          setShowTempPassword(false);
          setTempPassword(null);
          setTempPasswordExpiry(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle size={20} />
              Temporary Password Generated
            </DialogTitle>
            <DialogDescription>
              This password is shown ONLY ONCE and cannot be retrieved again.
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Copy this password now. Once you close this dialog, it cannot be retrieved. Admin actions are logged.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-sm text-muted-foreground mb-2 block">Temporary Password</Label>
              <div className="flex items-center gap-2">
                <code className="text-lg font-mono bg-background px-4 py-3 rounded border flex-1 break-all">
                  {tempPassword}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(tempPassword!)}
                >
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            {tempPasswordExpiry && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                <span>Expires: {new Date(tempPasswordExpiry).toLocaleString()} (15 minutes)</span>
              </div>
            )}

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Password is single-use only</p>
              <p>✓ User will be required to change it on first login</p>
              <p>✓ {emailToUser ? 'Password has been emailed to user' : 'Remember to share this password securely with the user'}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={() => {
              setShowTempPassword(false);
              setTempPassword(null);
              setTempPasswordExpiry(null);
            }}>
              I Have Saved the Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
