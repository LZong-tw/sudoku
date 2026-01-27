import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom for DOM testing
    environment: 'jsdom',
    
    // Global test setup
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'dist/'
      ],
      // Coverage thresholds
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70
    },
    
    // Test file patterns
    include: ['tests/**/*.test.js'],
    
    // Test timeout
    testTimeout: 10000,
    
    // Hook timeout
    hookTimeout: 10000
  }
});
