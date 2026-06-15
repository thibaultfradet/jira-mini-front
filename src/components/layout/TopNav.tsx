import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/useAuth';
import { useTeamPreference } from '@/contexts/useTeamPreference';
import { Plus, Search, Bell, Check, UsersRound } from 'lucide-react';
import CreateModal from './CreateModal';
import { notificationService } from '@/services/notification';
import { getNotificationVisual } from '@/utils/notificationUtils';
import { formatDatetime } from '@/utils/dateUtils';
import type { Notification } from '@/types/notification';

export default function TopNav() {
  const { logout } = useAuth();
  const { teams, selectedTeamId, setSelectedTeamId } = useTeamPreference();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [exitingIds, setExitingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    notificationService.getAll(logout).then(({ notifications: n, unreadCount: c }) => {
      setNotifications(n);
      setUnreadCount(c);
    });
  }, [logout]);

  // Joue l'animation de sortie (glisse vers la droite) puis retire réellement les notifs
  const animateOut = (ids: number[]) => {
    setExitingIds((prev) => new Set([...prev, ...ids]));
    setTimeout(() => {
      setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n)));
      setExitingIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }, 300);
  };

  const handleMarkRead = async (id: number) => {
    await notificationService.markRead(logout, id);
    setUnreadCount((c) => Math.max(0, c - 1));
    animateOut([id]);
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead(logout);
    const ids = notifications.filter((n) => !n.isRead).map((n) => n.id);
    setUnreadCount(0);
    animateOut(ids);
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return (
    <>
      <header className="h-14 border-b bg-white relative flex items-center px-4">
        {/* Left: brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0 z-10">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="font-semibold text-base hidden sm:block">Mini Jira</span>
        </Link>

        {/* Center: search — truly centered on the full header width */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
          <div className="flex items-center gap-0 pointer-events-auto w-full max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Rechercher..." className="pl-9 h-10 rounded-r-none border-r-0" />
            </div>
            <Button className="h-10 rounded-l-none gap-1.5" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Créer</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto z-10">
          {/* Team preference selector — shown only when user belongs to multiple teams */}
          {teams.length > 1 && selectedTeamId && (
            <Select
              value={String(selectedTeamId)}
              onValueChange={(v) => {
                if (Number(v) === selectedTeamId) return;
                setSelectedTeamId(Number(v));
                // Rafraîchit la page pour recharger toutes les données liées à l'équipe
                window.location.reload();
              }}
            >
              <SelectTrigger className="h-8 gap-1.5 border-border/60 bg-muted/40 hover:bg-muted text-sm focus:ring-0 w-auto min-w-27.5 max-w-45 [&>span]:truncate">
                <UsersRound className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {teams.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Notifications */}
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] leading-none flex items-center justify-center rounded-full bg-red-500 border-0 ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 p-0">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-base font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary hover:bg-transparent" onClick={handleMarkAllRead}>
                    Tout marquer lu
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator className="m-0" />
              <div className="max-h-96 overflow-y-auto overflow-x-hidden">
                {unreadNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <div className="rounded-full bg-muted p-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Aucune notification non lue</p>
                  </div>
                ) : (
                  unreadNotifications.slice(0, 10).map((notif) => {
                    const visual = getNotificationVisual(notif.type);
                    return (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 bg-primary/5 transition-all duration-300 ease-in ${
                          exitingIds.has(notif.id) ? 'translate-x-full opacity-0' : ''
                        }`}
                      >
                        <div className={`shrink-0 rounded-full p-2 ${visual.className}`}>{visual.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatDatetime(notif.createdAt)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-primary"
                          title="Marquer comme lu"
                          onClick={() => handleMarkRead(notif.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
              <DropdownMenuSeparator className="m-0" />
              <div className="px-4 py-3">
                <Link to="/notifications" onClick={() => setNotifOpen(false)} className="text-sm text-primary hover:underline font-medium">
                  Voir toutes les notifications
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      <CreateModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </>
  );
}
