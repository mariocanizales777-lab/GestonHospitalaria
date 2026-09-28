module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/controllers/citas.controller.js',
    'src/controllers/recetas.controller.js',
    'src/controllers/pedidos.controller.js',
  ],
  coverageThreshold: {
    global: { statements: 80, branches: 70, functions: 80, lines: 80 },
  },
};