import { describe, it, expect } from '@jest/globals';

describe('Prueba de ejemplo', () => {
    it('debería pasar una prueba básica', () => {
        expect(true).toBe(true);
    });

    it('debería realizar operaciones matemáticas básicas', () => {
        expect(1 + 1).toBe(2);
        expect(2 * 2).toBe(4);
    });
}); 