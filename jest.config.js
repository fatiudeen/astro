/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const pathsToModuleNameMapper = require('ts-jest').pathsToModuleNameMapper;
const compilerOptions = require('./tsconfig.json').compilerOptions;

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  clearMocks: true,
  modulePathIgnorePatterns: ['./src/api/v1/__test__/mocks', './dist'],
  moduleDirectories: ['node_modules', 'src'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  setupFilesAfterEnv: ['./src/api/v1/__test__/mocks/mockRepository.ts'],
};
