import { jest } from "@jest/globals";
import axios from "axios";

import { enviarWhatsapp } from "../../../src/service/whatsappService";

// Mock de axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("WhatsApp Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VONAGE_API_KEY = "test-api-key";
    process.env.VONAGE_API_SECRET = "test-api-secret";
  });

  it("should send WhatsApp message successfully", async () => {
    const mockResponse = {
      data: { message_uuid: "test-uuid" },
      status: 200,
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    await enviarWhatsapp("1234567890", "Test message");

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://messages-sandbox.nexmo.com/v1/messages",
      {
        from: "14157386102",
        to: "1234567890",
        message_type: "text",
        text: "Test message",
        channel: "whatsapp",
      },
      {
        auth: {
          username: "test-api-key",
          password: "test-api-secret",
        },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );
  });

  it("should handle WhatsApp sending errors silently", async () => {
    const error = new Error("Failed to send WhatsApp");
    mockedAxios.post.mockRejectedValueOnce(error);

    // No debería lanzar error ya que el servicio lo maneja silenciosamente
    await expect(enviarWhatsapp("1234567890", "Test message")).resolves.not.toThrow();
  });

  it("should handle empty message", async () => {
    const mockResponse = {
      data: { message_uuid: "test-uuid" },
      status: 200,
    };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    await enviarWhatsapp("1234567890", "");

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://messages-sandbox.nexmo.com/v1/messages",
      {
        from: "14157386102",
        to: "1234567890",
        message_type: "text",
        text: "",
        channel: "whatsapp",
      },
      expect.any(Object),
    );
  });

  it("should handle special characters in message", async () => {
    const mockResponse = {
      data: { message_uuid: "test-uuid" },
      status: 200,
    };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const messageWithSpecialChars = "¡Hola! ¿Cómo estás? #Test";
    await enviarWhatsapp("1234567890", messageWithSpecialChars);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://messages-sandbox.nexmo.com/v1/messages",
      {
        from: "14157386102",
        to: "1234567890",
        message_type: "text",
        text: messageWithSpecialChars,
        channel: "whatsapp",
      },
      expect.any(Object),
    );
  });

  it("should handle network errors silently", async () => {
    const networkError = new Error("Network Error");
    mockedAxios.post.mockRejectedValueOnce(networkError);

    // No debería lanzar error ya que el servicio lo maneja silenciosamente
    await expect(enviarWhatsapp("1234567890", "Test message")).resolves.not.toThrow();
  });

  it("should handle invalid response silently", async () => {
    const invalidResponse = {
      data: null,
      status: 400,
    };
    mockedAxios.post.mockResolvedValueOnce(invalidResponse);

    // No debería lanzar error ya que el servicio lo maneja silenciosamente
    await expect(enviarWhatsapp("1234567890", "Test message")).resolves.not.toThrow();
  });
});
