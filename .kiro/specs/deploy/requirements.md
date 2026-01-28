# Deploy Script Requirements

## Overview
Defines requirements for deployment to S3/CloudFront.

## Requirements

### REQ-DEPLOY-001: Reliable Sync
- **Description**: All file changes must be uploaded
- **Acceptance Criteria**:
  - Use --exact-timestamps to detect content changes
  - Use --delete to remove old files
  - Exclude .git and node_modules

### REQ-DEPLOY-002: Cache Invalidation
- **Description**: CloudFront cache must be invalidated
- **Acceptance Criteria**:
  - Invalidate all paths (/*) after upload
  - Users see latest version after deploy
