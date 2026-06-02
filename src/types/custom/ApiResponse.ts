export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
  unreadCount?: number;
  [key: string]: unknown;
}
