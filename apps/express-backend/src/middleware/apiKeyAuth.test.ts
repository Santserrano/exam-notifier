import { Request, Response, NextFunction } from 'express';
import { validateApiKey } from './apiKeyAuth';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

describe('validateApiKey Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            headers: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    it('debería pasar la validación con una API key válida', () => {
        process.env.INTERNAL_API_KEY = 'test-api-key';
        mockRequest.headers = {
            'x-api-key': 'test-api-key'
        };

        validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('debería rechazar la solicitud sin API key', () => {
        mockRequest.headers = {};

        validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
    });

    it('debería rechazar la solicitud con una API key inválida', () => {
        process.env.INTERNAL_API_KEY = 'test-api-key';
        mockRequest.headers = {
            'x-api-key': 'invalid-key'
        };

        validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
    });
}); 