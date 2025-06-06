import { Adapter } from '../../Adapters/Adapter.js';

describe('Adapter Interface', () => {
  // Implementación mock para probar la interfaz
  class MockAdapter<T, U> implements Adapter<T, U> {
    adapt(item: T): U {
      return {} as U;
    }
  }

  it('should correctly implement the Adapter interface', () => {
    const mockAdapter = new MockAdapter<string, number>();
    
    // Verificación básica de la interfaz
    expect(mockAdapter).toBeInstanceOf(MockAdapter);
    expect(mockAdapter.adapt).toBeDefined();
    expect(typeof mockAdapter.adapt).toBe('function');
    
    // Verificación de que se puede llamar al método
    expect(() => mockAdapter.adapt('test')).not.toThrow();
  });

  it('should return the expected type', () => {
    const mockAdapter = new MockAdapter<string, number>();
    const result = mockAdapter.adapt('test');
    
    // Aunque es un mock vacío, verificamos el tipo
    expect(typeof result).toBe('object');
  });
});