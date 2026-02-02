export const statusConfig: Record<string, { label: string; className: string }> = {
  todo: {
    label: "A FAIRE",
    className: "bg-gray-100 text-gray-700 border border-gray-300",
  },
  in_progress: {
    label: "EN COURS",
    className: "bg-blue-100 text-blue-700 border border-blue-300",
  },
  done: {
    label: "TERMINE",
    className: "bg-green-100 text-green-700 border border-green-300",
  },
};
