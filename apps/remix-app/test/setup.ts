import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'node:test';

// Limpia después de cada prueba
afterEach(() => {
    cleanup();
}); 