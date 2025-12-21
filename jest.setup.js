// Jest setup file
// Add any global mocks or setup here

// Mock react-native-get-random-values for uuid
jest.mock('react-native-get-random-values', () => ({}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
