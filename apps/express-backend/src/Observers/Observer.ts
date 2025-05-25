export interface Observer<T = unknown> {
  update(data: T): void;
}

export interface Subject<T = unknown> {
  attach(observer: Observer<T>): void;
  detach(observer: Observer<T>): void;
  notify(data: T): void;
}

export class NotificationSubject implements Subject<NotificationData> {
  private observers: Observer<NotificationData>[] = [];

  attach(observer: Observer<NotificationData>): void {
    this.observers.push(observer);
  }

  detach(observer: Observer<NotificationData>): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(data: NotificationData): void {
    for (const observer of this.observers) {
      observer.update(data);
    }
  }
}

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}

// Clase concreta de un observador que maneja notificaciones
class NotificationObserver implements Observer<NotificationData> {
  update(data: NotificationData): void {
    console.log('Notificación enviada:', data);
  }
}

// Exportamos una instancia del sujeto para que sea reutilizable
export const notificationSubject = new NotificationSubject();
export default NotificationObserver;
