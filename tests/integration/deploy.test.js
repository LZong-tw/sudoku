/**
 * Deploy script tests
 */

import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';

describe('Deploy Script', () => {
  const deployScript = readFileSync('./deploy.sh', 'utf-8');

  test('should use --exact-timestamps for reliable sync', () => {
    expect(deployScript).toContain('--exact-timestamps');
  });

  test('should invalidate CloudFront cache', () => {
    expect(deployScript).toContain('cloudfront create-invalidation');
    expect(deployScript).toContain('--paths "/*"');
  });

  test('should exclude node_modules and .git', () => {
    expect(deployScript).toContain('--exclude ".git/*"');
    expect(deployScript).toContain('--exclude "node_modules/*"');
  });

  test('should use --delete to remove old files', () => {
    expect(deployScript).toContain('--delete');
  });
});
