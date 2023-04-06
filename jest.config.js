// /** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const pathsToModuleNameMapper = require('ts-jest').pathsToModuleNameMapper;
const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
const stripJsonComments = require('strip-json-comments');

const tsconfigRaw = fs.readFileSync('./tsconfig.json', 'utf-8');
const tsconfig = JSON.parse(stripJsonComments(tsconfigRaw));
const compilerOptions = tsconfig.compilerOptions;
// const compilerOptions = require('./tsconfig.json').compilerOptions;

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        // relative path to the ts-jest-keys-transformer.js file
        astTransformers: { before: ['ts-jest-keys-transformer.js'] },
      },
    ],
  },
  verbose: true,
  clearMocks: true,
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  modulePathIgnorePatterns: ['./src/api/v1/__test__/mocks', './dist', './node_modules'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  // setupFilesAfterEnv: ['./src/api/v1/__test__/mocks/mockRepository.ts'],
  // globals: {
  //   'ts-jest': {
  //     // relative path to the ts-jest-keys-transformer.js file
  //     astTransformers: { before: ['ts-jest-keys-transformer.js'] },
  //   },
  // },
};
