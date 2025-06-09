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

  afterEach(() => {
    delete process.env.VONAGE_API_KEY;
    delete process.env.VONAGE_API_SECRET;
    jest.restoreAllMocks();
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

    await expect(enviarWhatsapp("1234567890", "Test message")).resolves.not.toThrow();
  });

  it("should handle invalid response silently", async () => {
    const invalidResponse = {
      data: null,
      status: 400,
    };
    mockedAxios.post.mockResolvedValueOnce(invalidResponse);

    await expect(enviarWhatsapp("1234567890", "Test message")).resolves.not.toThrow();
  });

  it("should log error when WhatsApp sending fails", async () => {
    const error = new Error("Failed to send WhatsApp");
    mockedAxios.post.mockRejectedValueOnce(error);
    
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    await enviarWhatsapp("1234567890", "Test message");

    expect(consoleErrorMock).toHaveBeenCalledWith("Error al enviar WhatsApp:", error);
  });

  it("should throw error when environment variables are missing", async () => {
    delete process.env.VONAGE_API_KEY;
    delete process.env.VONAGE_API_SECRET;

    await expect(enviarWhatsapp("1234567890", "Test message"))
      .rejects
      .toThrow("Las variables de entorno VONAGE_API_KEY y VONAGE_API_SECRET son requeridas");
  });
});