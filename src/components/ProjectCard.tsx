import { Link } from 'react-router-dom';

const BORDER_COLORS = [
  'border-l-yellow-400',
  'border-l-purple-400',
  'border-l-orange-400',
  'border-l-gray-400',
  'border-l-violet-300',
];

interface ProjectCardProps {
  project: {
    id: number;
    name: string;
    description?: string | null;
    openedIssueCount?: number;
    finishedIssueCount?: number;
  };
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className={`block border rounded-lg bg-white hover:shadow-md transition-shadow border-l-4 ${BORDER_COLORS[index % BORDER_COLORS.length]}`}
    >
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-sm truncate">{project.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{project.description}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span>Tickets ouverts</span>
            <span className="bg-muted px-1.5 py-0.5 rounded font-medium">{project.openedIssueCount ?? 0}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Tickets terminés</span>
            <span className="bg-muted px-1.5 py-0.5 rounded font-medium">{project.finishedIssueCount ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
