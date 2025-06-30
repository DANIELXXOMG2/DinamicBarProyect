import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Definición del tipo User para TypeScript
type UserRole = 'ADMIN' | 'CASHIER' | 'WAITER';

interface User {
  readonly username: string;
  readonly role: UserRole;
}

interface UserProfileProps {
  readonly collapsed: boolean;
  readonly currentUser: User | null;
  readonly translateRole: (role: UserRole) => string;
}

export function UserProfile({
  collapsed,
  currentUser,
  translateRole,
}: UserProfileProps) {
  if (!currentUser) return null;

  return (
    <div
      className={`mb-4 flex items-center gap-2 rounded-md bg-gray-50 p-2 ${collapsed ? 'justify-center' : ''}`}
    >
      <Avatar className="size-8">
        <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{currentUser.username}</span>
          <span className="text-xs text-gray-500">
            {translateRole(currentUser.role)}
          </span>
        </div>
      )}
    </div>
  );
}
