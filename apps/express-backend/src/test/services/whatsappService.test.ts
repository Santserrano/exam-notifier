import { jest } from '@jest/globals';
import axios from 'axios';
import { enviarWhatsapp } from '../../../src/service/whatsappService';

// Mock de axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WhatsApp Service', () => {
    beforeEach(() => {
        process.env.VONAGE_API_KEY = 'test-api-key';
        process.env.VONAGE_API_SECRET = 'test-api-secret';
        jest.clearAllMocks();
    });

    it('should send WhatsApp message successfully', async () => {
        const mockResponse = { data: { message_uuid: 'test-uuid' } };
        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        await enviarWhatsapp('1234567890', 'Test message');

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://messages-sandbox.nexmo.com/v1/messages',
            {
                from: '14157386102',
                to: '1234567890',
                message_type: 'text',
                text: 'Test message',
                channel: 'whatsapp'
            },
            {
                auth: {
                    username: process.env.VONAGE_API_KEY,
                    password: process.env.VONAGE_API_SECRET
                },
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            }
        );
    });

    it('should handle WhatsApp sending errors', async () => {
        const error = new Error('Failed to send WhatsApp');
        mockedAxios.post.mockRejectedValueOnce(error);

        await enviarWhatsapp('1234567890', 'Test message');

        // La función no debería lanzar el error, solo registrarlo
        expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should throw error if VONAGE_API_KEY is not set', async () => {
        delete process.env.VONAGE_API_KEY;

        await expect(enviarWhatsapp('1234567890', 'Test message'))
            .rejects.toThrow('VONAGE_API_KEY is not defined');
    });

    it('should throw error if VONAGE_API_SECRET is not set', async () => {
        delete process.env.VONAGE_API_SECRET;

        await expect(enviarWhatsapp('1234567890', 'Test message'))
            .rejects.toThrow('VONAGE_API_SECRET is not defined');
    });
}); 