import { User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getInitials, getAvatarColor } from '@/utils/avatarUtils';

interface UserAvatarProps {
  /** Utilisateur à afficher — `null`/`undefined` rend un avatar vide (rond gris + icône) */
  user: { firstName: string; lastName: string } | null | undefined;
  /** Taille du rond, ex: "h-6 w-6" */
  className?: string;
  /** Taille du texte des initiales, ex: "text-[10px]" */
  textClassName?: string;
  /** Taille de l'icône de l'avatar vide (défaut: 55% du rond) */
  iconClassName?: string;
}

export default function UserAvatar({ user, className, textClassName, iconClassName }: UserAvatarProps) {
  if (user?.firstName && user?.lastName) {
    const initials = getInitials(user.firstName, user.lastName);
    return (
      <Avatar className={className}>
        <AvatarFallback className={cn('text-white', getAvatarColor(initials), textClassName)}>
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-muted text-muted-foreground">
        <User className={cn('size-[68%]', iconClassName)} strokeWidth={2.5} />
      </AvatarFallback>
    </Avatar>
  );
}
