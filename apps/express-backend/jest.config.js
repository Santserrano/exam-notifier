/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest/presets/default-esm', // Usar el preset ESM
  testEnvironment: 'node',
  roots: ['<rootDir>/test', '<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  
  // Configuración transform específica para ESM
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json'
      }
    ]
  },
  
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  extensionsToTreatAsEsm: ['.ts'], // Tratar archivos .ts como ESM
  
  setupFiles: ['<rootDir>/test/setup.ts'],
  
  // Mapeo de módulos
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1.ts', // Mapear imports .js a archivos .ts
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@prisma/client$': '<rootDir>/src/test/__mocks__/prismaMock.ts'
  },
  
  // Configuración de coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/**/interfaces/**/*',
    '!src/**/__mocks__/**/*',
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Limpieza de mocks
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

export default config;