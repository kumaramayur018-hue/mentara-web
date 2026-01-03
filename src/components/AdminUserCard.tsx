import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Key, UserX } from 'lucide-react';

interface AdminUserCardProps {
  user: any;
  variant: 'active' | 'banned' | 'deleted';
  onChangePassword?: (user: any) => void;
  onBanDelete?: (user: any) => void;
  onUnban?: (user: any) => void;
}

export function AdminUserCard({ user, variant, onChangePassword, onBanDelete, onUnban }: AdminUserCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
      {/* Name and Email */}
      <div className="space-y-1">
        <h4 className={variant === 'deleted' ? 'line-through text-muted-foreground' : ''}>
          {user.name}
        </h4>
        <p className="text-sm text-muted-foreground break-all">{user.email}</p>
      </div>

      {/* Password */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Password:</span>
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {user.password || '••••••'}
        </code>
      </div>

      {/* Status */}
      {variant === 'active' && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status:</span>
          {user.isOnline ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Online
            </Badge>
          ) : (
            <Badge variant="secondary">Offline</Badge>
          )}
        </div>
      )}

      {variant === 'banned' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Ban Status:</span>
            <Badge variant="destructive">
              {user.banUntil === 'forever' ? 'Permanent' : 'Temporary'}
            </Badge>
          </div>
          {user.banUntil !== 'forever' && (
            <p className="text-xs text-muted-foreground">
              Until: {new Date(user.banUntil).toLocaleDateString()}
            </p>
          )}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Reason:</span>
            <p className="text-xs bg-muted p-2 rounded">{user.banReason || 'No reason provided'}</p>
          </div>
        </div>
      )}

      {variant === 'deleted' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Can Re-register:</span>
            <Badge variant={user.allowRecreation ? 'default' : 'secondary'}>
              {user.allowRecreation ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Reason:</span>
            <p className="text-xs bg-muted p-2 rounded">{user.deleteReason || 'No reason provided'}</p>
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {variant === 'active' && (
          <>
            <div>
              <span className="text-muted-foreground">Joined:</span>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Last Active:</span>
              <p>{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}</p>
            </div>
          </>
        )}
        {variant === 'banned' && user.bannedAt && (
          <div>
            <span className="text-muted-foreground">Banned On:</span>
            <p>{new Date(user.bannedAt).toLocaleDateString()}</p>
          </div>
        )}
        {variant === 'deleted' && user.deletedAt && (
          <div>
            <span className="text-muted-foreground">Deleted On:</span>
            <p>{new Date(user.deletedAt).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t">
        {variant === 'active' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChangePassword?.(user)}
              className="flex-1 text-xs"
            >
              <Key size={14} className="mr-1" />
              Edit Password
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onBanDelete?.(user)}
              className="flex-1 text-xs"
            >
              <UserX size={14} className="mr-1" />
              Ban/Delete
            </Button>
          </>
        )}
        {variant === 'banned' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUnban?.(user)}
            className="w-full text-xs text-green-600 hover:text-green-700 border-green-600"
          >
            Unban User
          </Button>
        )}
      </div>
    </div>
  );
}
