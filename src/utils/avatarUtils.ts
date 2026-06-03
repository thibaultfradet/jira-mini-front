const avatarColors = [
  'bg-red-700',
  'bg-orange-700',
  'bg-amber-700',
  'bg-green-700',
  'bg-emerald-700',
  'bg-teal-700',
  'bg-cyan-700',
  'bg-sky-700',
  'bg-blue-700',
  'bg-indigo-700',
  'bg-violet-700',
  'bg-purple-700',
  'bg-fuchsia-700',
  'bg-pink-700',
  'bg-rose-700',
  'bg-slate-700',
];

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}
