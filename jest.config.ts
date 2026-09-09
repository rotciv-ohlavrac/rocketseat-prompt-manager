import createJestConfig from 'next/jest.js';

const config = createJestConfig({
  dir: './',
})({
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {},
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/e2e/',
    '/components/ui/',
    '/lib/',
    '/app/generated/',
    '<rootDir>/.postgres_data/',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
    '<rootDir>/.postgres_data/',
  ],
  modulePathIgnorePatterns: ['<rootDir>/.postgres_data/'],
  watchPathIgnorePatterns: ['<rootDir>/.postgres_data/'],
});

export default config;
