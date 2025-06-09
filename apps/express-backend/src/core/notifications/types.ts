export type NotificationType = "push" | "whatsapp" | "email";

export interface NotificationConfig {
  webPushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  avisoPrevioHoras: number;
}
