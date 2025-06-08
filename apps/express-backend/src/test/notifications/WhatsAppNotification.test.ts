import { WhatsAppNotification } from '../../../src/core/notifications/WhatsAppNotification.js';
import { NotificationData } from "../../../src/core/notifications/Notification.js";
const { jest } = require('@jest/globals');
import axios from 'axios';

jest.mock('axios');

describe('WhatsAppNotification', () => {
    const mockData: NotificationData = {
        title: 'Test WhatsApp',
        body: 'This is a test WhatsApp message',
        recipient: '5491123456789'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.VONAGE_API_KEY = 'test_api_key';
    });

    it('Debería enviar un mensaje de WhatsApp con éxito.', async () => {
        (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

        const notification = new WhatsAppNotification(mockData);
        await notification.send();

        expect(axios.post).toHaveBeenCalledWith(
            'https://messages-sandbox.nexmo.com/v1/messages',
            {
                from: '14157386102',
                to: mockData.recipient,
                message_type: 'text',
                text: mockData.body,
                channel: 'whatsapp'
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Basic dGVzdF9hcGlfa2V5'
                }
            }
        );
    });

    it('should format phone numbers correctly', async () => {
        const notification = new WhatsAppNotification(mockData);
        
        // Test with different phone formats
        expect(notification['formatPhoneNumber']('11 2345-6789')).toBe('541123456789');
        expect(notification['formatPhoneNumber']('+54 9 11 2345 6789')).toBe('5491123456789');
        expect(notification['formatPhoneNumber']('5491123456789')).toBe('5491123456789');
    });

    it('should throw error when sending fails', async () => {
        const mockError = new Error('Failed to send WhatsApp');
        (axios.post as jest.Mock).mockRejectedValue(mockError);

        const notification = new WhatsAppNotification(mockData);
        await expect(notification.send()).rejects.toThrow(mockError);
    });
});