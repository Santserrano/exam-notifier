export interface NotificationData {
  title: string;
  body: string;
  recipient: string;
  metadata?: Record<string, unknown>;
}

export interface Notification {
  send(): Promise<void>;
}
