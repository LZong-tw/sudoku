# Sound Manager Requirements

## Overview
Defines requirements for sound management.

## Requirements

### REQ-SOUND-001: Instance EventBus
- **Description**: Use instance eventBus, not static class
- **Acceptance Criteria**:
  - enable() calls this.eventBus.emit('sound:enabled')
  - disable() calls this.eventBus.emit('sound:disabled')
  - Handle null eventBus gracefully

### REQ-SOUND-002: Enable/Disable
- **Description**: Toggle sound on/off
- **Acceptance Criteria**:
  - enable() sets enabled to true
  - disable() sets enabled to false
  - Save preferences on change
