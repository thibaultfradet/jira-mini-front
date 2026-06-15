import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { notificationService } from '@/services/notification';
import { getNotificationVisual } from '@/utils/notificationUtils';
import { formatDatetime } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import type { Notification } from '@/types/notification';
import IssueDialog from './project/IssueDialog';

type Filter = 'all' | 'unread' | 'read';

export default function Notifications() {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('unread');
  const [exitingIds, setExitingIds] = useState<Set<number>>(new Set());
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    notificationService.getAll(logout).then(({ notifications: n, unreadCount: c }) => {
      setNotifications(n);
      setUnreadCount(c);
      setLoading(false);
    });
  }, [logout]);

  // Marque les notifs comme lues. Sous le filtre "Non lues" elles vont quitter la liste,
  // on joue donc l'animation de sortie (glisse vers la droite) avant le retrait réel.
  const markRead = (ids: number[]) => {
    const apply = () =>
      setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n)));
    if (filter === 'unread') {
      setExitingIds((prev) => new Set([...prev, ...ids]));
      setTimeout(() => {
        apply();
        setExitingIds((prev) => {
          const next = new Set(prev);
          ids.forEach((id) => next.delete(id));
          return next;
        });
      }, 300);
    } else {
      apply();
    }
  };

  const handleMarkRead = async (id: number) => {
    await notificationService.markRead(logout, id);
    setUnreadCount((c) => Math.max(0, c - 1));
    markRead([id]);
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead(logout);
    const ids = notifications.filter((n) => !n.isRead).map((n) => n.id);
    setUnreadCount(0);
    markRead(ids);
  };

  const handleOpen = (notif: Notification) => {
    if (!notif.isRead) handleMarkRead(notif.id);
    if (notif.relatedIssueId) {
      setSelectedIssueId(notif.relatedIssueId);
      setDialogOpen(true);
    }
  };

  const filtered = notifications.filter((n) =>
    filter === 'all' ? true : filter === 'unread' ? !n.isRead : n.isRead,
  );

  const filters: { key: Filter; label: string }[] = [
    { key: 'unread', label: `Non lues${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { key: 'all', label: 'Toutes' },
    { key: 'read', label: 'Lues' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            {unreadCount} non lue{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-1.5">
            <Check className="h-4 w-4" />
            Tout marquer lu
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1 border-b">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
              filter === f.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <Bell className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Aucune notification</p>
        </div>
      ) : (
        <div className="border rounded-lg divide-y overflow-hidden">
          {filtered.map((notif) => {
            const visual = getNotificationVisual(notif.type);
            return (
              <div
                key={notif.id}
                onClick={() => handleOpen(notif)}
                className={`flex items-start gap-3 px-4 py-3 transition-all duration-300 ease-in ${
                  notif.relatedIssueId ? 'cursor-pointer hover:bg-muted/40' : ''
                } ${!notif.isRead ? 'bg-primary/5' : ''} ${
                  exitingIds.has(notif.id) ? 'translate-x-full opacity-0' : ''
                }`}
              >
                <div className={`shrink-0 rounded-full p-2.5 ${visual.className}`}>{visual.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDatetime(notif.createdAt)}</p>
                </div>
                {!notif.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
                    title="Marquer comme lu"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notif.id);
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <IssueDialog
        issueId={selectedIssueId}
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setSelectedIssueId(null);
        }}
      />
    </div>
  );
}
