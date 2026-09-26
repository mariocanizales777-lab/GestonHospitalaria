module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/controllers/**/*.js'],
  coverageThreshold: {
    global: { statements: 80, branches: 70, functions: 80, lines: 80 },
  },
};
