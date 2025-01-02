import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
  },
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/tests/backend/**/*.test.ts'], // Chemin des tests back-end
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
    '<rootDir>/src/lib/singleton.ts'
  ],
};

module.exports = createJestConfig(customJestConfig);
