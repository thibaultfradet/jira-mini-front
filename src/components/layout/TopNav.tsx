import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/useAuth';
import { Plus, Search, Settings, User, LogOut, Bell, Check } from 'lucide-react';
import CreateModal from './CreateModal';
import { getInitials, getAvatarColor } from '@/utils/avatarUtils';
import { notificationService } from '@/services/notification';
import type { Notification } from '@/types/notification';

export default function TopNav() {
  const { user, isAdmin, logout } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user ? getInitials(user.firstName, user.lastName) : '??';
  const avatarColor = getAvatarColor(initials);

  useEffect(() => {
    notificationService.getAll(logout).then(({ notifications: n, unreadCount: c }) => {
      setNotifications(n);
      setUnreadCount(c);
    });
  }, [logout]);

  const handleMarkRead = async (id: number) => {
    await notificationService.markRead(logout, id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead(logout);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <>
      <header className="h-14 border-b bg-white flex items-center justify-between px-4 gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="font-semibold text-lg hidden sm:block">Mini Jira</span>
        </Link>

        <div className="flex-1 max-w-2xl flex items-center gap-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="text" placeholder="Rechercher..." className="pl-9 h-10 rounded-r-none border-r-0" />
          </div>
          <Button className="h-10 rounded-l-none gap-1.5" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Créer</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Notifications */}
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center bg-red-500 border-0">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary" onClick={handleMarkAllRead}>
                    Tout marquer lu
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucune notification</p>
                ) : (
                  notifications.slice(0, 10).map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-2 px-3 py-2 hover:bg-muted/50 ${!notif.isRead ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground leading-snug">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(notif.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={() => handleMarkRead(notif.id)}>
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-3 py-2">
                    <Link to="/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-primary hover:underline">
                      Voir toutes les notifications
                    </Link>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {isAdmin && (
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer focus:outline-none">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={`${avatarColor} text-white text-sm font-medium`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Mon profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CreateModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </>
  );
}
