import axios from "axios";

import { Notification, NotificationData } from "./Notification.js";

export class WhatsAppNotification implements Notification {
  private readonly VONAGE_API_URL =
    "https://messages-sandbox.nexmo.com/v1/messages";
  private readonly VONAGE_API_KEY = process.env.VONAGE_API_KEY!;
  private readonly VONAGE_FROM = "14157386102";

  constructor(private data: NotificationData) {}

  async send(): Promise<void> {
    try {
      // Formatear el número de teléfono si es necesario
      const to = this.formatPhoneNumber(this.data.recipient);

      await axios.post(
        this.VONAGE_API_URL,
        {
          from: this.VONAGE_FROM,
          to,
          message_type: "text",
          text: this.data.body,
          channel: "whatsapp",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${Buffer.from(this.VONAGE_API_KEY).toString("base64")}`,
          },
        },
      );
    } catch (error) {
      console.error("Error al enviar WhatsApp:", error);
      throw error;
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Eliminar cualquier carácter que no sea número
    const cleaned = phone.replace(/\D/g, "");

    // Si el número no comienza con el código de país, agregarlo
    if (!cleaned.startsWith("54")) {
      return `54${cleaned}`;
    }

    return cleaned;
  }
}
