import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../../middleware/auth';
import { getServerEnv } from '../../utils/env';

// Mock de getServerEnv
jest.mock('../../utils/env', () => ({
    getServerEnv: jest.fn()
}));

describe('Auth Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            headers: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis() as unknown as Response['status'],
            json: jest.fn() as unknown as Response['json']
        };
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });

    describe('validateApiKey', () => {
        it('should call next() when API key is valid', () => {
            const validApiKey = 'valid-api-key';
            (getServerEnv as jest.Mock).mockReturnValue({ INTERNAL_API_KEY: validApiKey });
            mockRequest.headers = { 'x-api-key': validApiKey };

            validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
        });

        it('should return 401 when API key is missing', () => {
            (getServerEnv as jest.Mock).mockReturnValue({ INTERNAL_API_KEY: 'valid-api-key' });
            mockRequest.headers = {};

            validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'API key inválida' });
        });

        it('should return 401 when API key is invalid', () => {
            (getServerEnv as jest.Mock).mockReturnValue({ INTERNAL_API_KEY: 'valid-api-key' });
            mockRequest.headers = { 'x-api-key': 'invalid-api-key' };

            validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'API key inválida' });
        });

        it('should handle case-insensitive API key header', () => {
            const validApiKey = 'valid-api-key';
            (getServerEnv as jest.Mock).mockReturnValue({ INTERNAL_API_KEY: validApiKey });
            mockRequest.headers = { 'X-API-KEY': validApiKey };

            validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
        });

        it('should handle undefined API key in environment', () => {
            (getServerEnv as jest.Mock).mockReturnValue({ INTERNAL_API_KEY: undefined });
            mockRequest.headers = { 'x-api-key': 'any-key' };

            validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'API key inválida' });
        });

        it('should handle null API key in environment', () => {
            (getServerEnv as jest.Mock).mockReturnValue({ INTERNAL_API_KEY: null });
            mockRequest.headers = { 'x-api-key': 'any-key' };

            validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'API key inválida' });
        });
    });
}); 