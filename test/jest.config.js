module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test', '<rootDir>/compiler'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'compiler/**/*.ts',
    '!compiler/**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  verbose: true,
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/compiler/$1',
    '^@typescript/(.*)$': '<rootDir>/TypeScript/src/$1'
  }
};