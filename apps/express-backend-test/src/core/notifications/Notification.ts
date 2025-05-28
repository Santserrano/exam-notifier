export interface NotificationData {
    title: string;
    body: string;
    recipient: string;
    metadata?: Record<string, any>;
}

export interface Notification {
    send(): Promise<void>;
} 