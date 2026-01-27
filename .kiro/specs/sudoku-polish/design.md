# 設計文檔

## 概述

本設計文檔描述了數獨遊戲全面改進專案的技術實現方案。該專案將現有的單文件 HTML 數獨遊戲重構為模塊化、可維護的架構，同時添加豐富的功能增強。

### 設計目標

1. **模塊化架構**：將單體代碼重構為清晰分離的模塊
2. **狀態管理**：實現集中式狀態管理和持久化
3. **用戶體驗**：提供流暢、響應式的遊戲體驗
4. **可擴展性**：設計易於添加新功能的架構
5. **可訪問性**：確保所有用戶都能使用
6. **性能**：保持 60 FPS 的流暢體驗

### 技術棧

- **語言**：JavaScript (ES6+)
- **存儲**：localStorage API
- **樣式**：CSS3 with CSS Variables
- **可訪問性**：ARIA attributes
- **音效**：Web Audio API (可選)

## 架構

### 整體架構

系統採用模塊化架構，將功能分離為獨立的模塊，通過事件系統和明確的接口進行通信。

```
┌─────────────────────────────────────────────────────────┐
│                      UI Layer                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Grid    │ │  Keypad  │ │ Settings │ │ Victory  │  │
│  │  View    │ │  View    │ │  Panel   │ │ Animation│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                   Game Controller                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Event Bus / State Manager               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                   Core Modules                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Grid    │ │ History  │ │  Hint    │ │  Timer   │  │
│  │  Model   │ │ Manager  │ │  System  │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Statistics│ │Achievement│ │  Daily   │ │  Puzzle  │  │
│  │ Tracker  │ │  System  │ │Challenge │ │ Generator│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                  Storage Layer                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Storage Manager (localStorage)            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 模塊職責


**UI Layer**
- `GridView`: 渲染 9x9 網格，處理格子選擇和視覺反饋
- `KeypadView`: 渲染數字鍵盤和控制按鈕
- `SettingsPanel`: 渲染設置界面
- `VictoryAnimation`: 顯示勝利動畫和統計

**Game Controller**
- `GameController`: 協調所有模塊，處理用戶輸入
- `EventBus`: 發布/訂閱事件系統，用於模塊間通信
- `StateManager`: 管理全局遊戲狀態

**Core Modules**
- `GridModel`: 管理網格數據和驗證邏輯
- `HistoryManager`: 實現撤銷/重做功能
- `HintSystem`: 提供智能提示
- `Timer`: 管理遊戲計時
- `StatisticsTracker`: 追蹤和計算統計數據
- `AchievementSystem`: 管理成就解鎖
- `DailyChallenge`: 生成每日挑戰謎題
- `PuzzleGenerator`: 管理謎題庫

**Storage Layer**
- `StorageManager`: 處理所有 localStorage 操作，提供數據持久化

### 數據流

1. **用戶輸入** → UI Layer 捕獲事件
2. **事件傳遞** → GameController 處理
3. **狀態更新** → Core Modules 更新數據
4. **事件發布** → EventBus 通知訂閱者
5. **UI 更新** → UI Layer 重新渲染
6. **持久化** → StorageManager 保存狀態

## 組件和接口

### GridModel

管理數獨網格的核心數據結構和驗證邏輯。

```javascript
class GridModel {
  constructor(puzzle, solution) {
    this.puzzle = puzzle;      // 9x9 array - 初始謎題
    this.solution = solution;  // 9x9 array - 正確答案
    this.current = [...puzzle]; // 9x9 array - 當前狀態
    this.notes = Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => new Set())
    ); // 9x9 array of Sets - 筆記
    this.fixed = this.computeFixed(); // Set of "row,col" - 固定格子
  }

  // 設置格子值
  setValue(row, col, value) { }

  // 獲取格子值
  getValue(row, col) { }

  // 切換筆記
  toggleNote(row, col, number) { }

  // 獲取筆記
  getNotes(row, col) { }

  // 驗證位置是否有效
  isValid(row, col, value) { }

  // 檢查是否完成
  isComplete() { }

  // 檢查是否正確
  isCorrect() { }

  // 獲取衝突的格子
  getConflicts(row, col, value) { }

  // 克隆網格狀態
  clone() { }

  // 序列化為 JSON
  toJSON() { }

  // 從 JSON 恢復
  static fromJSON(json) { }
}
```

### HistoryManager

實現撤銷/重做功能，記錄所有可逆操作。

```javascript
class HistoryManager {
  constructor(maxSize = 100) {
    this.history = [];      // 歷史記錄棧
    this.currentIndex = -1; // 當前位置
    this.maxSize = maxSize; // 最大歷史記錄數
  }

  // 記錄新操作
  push(action) { }

  // 撤銷
  undo() { }

  // 重做
  redo() { }

  // 檢查是否可以撤銷
  canUndo() { }

  // 檢查是否可以重做
  canRedo() { }

  // 清空歷史
  clear() { }

  // 獲取當前狀態
  getCurrentState() { }
}

// Action 類型
const ActionType = {
  SET_VALUE: 'SET_VALUE',
  TOGGLE_NOTE: 'TOGGLE_NOTE',
  CLEAR_CELL: 'CLEAR_CELL',
  HINT_USED: 'HINT_USED'
};
```

### HintSystem

提供智能提示，選擇最有幫助的格子。

```javascript
class HintSystem {
  constructor(gridModel) {
    this.grid = gridModel;
    this.hintsUsed = 0;
  }

  // 獲取提示
  getHint() { }

  // 選擇最佳提示位置（使用啟發式算法）
  selectBestHintCell() { }

  // 計算格子的難度分數
  calculateCellDifficulty(row, col) { }

  // 重置提示計數
  reset() { }
}
```

### StatisticsTracker

追蹤遊戲統計數據。

```javascript
class StatisticsTracker {
  constructor() {
    this.stats = {
      easy: { played: 0, completed: 0, totalTime: 0, bestTime: Infinity },
      medium: { played: 0, completed: 0, totalTime: 0, bestTime: Infinity },
      hard: { played: 0, completed: 0, totalTime: 0, bestTime: Infinity }
    };
  }

  // 記錄遊戲開始
  recordGameStart(difficulty) { }

  // 記錄遊戲完成
  recordGameComplete(difficulty, time, errors, hintsUsed) { }

  // 獲取統計數據
  getStats(difficulty) { }

  // 獲取所有統計
  getAllStats() { }

  // 重置統計
  reset() { }

  // 序列化
  toJSON() { }

  // 反序列化
  static fromJSON(json) { }
}
```

### AchievementSystem

管理成就系統。

```javascript
class AchievementSystem {
  constructor() {
    this.achievements = this.initializeAchievements();
    this.unlockedAchievements = new Set();
  }

  // 初始化成就列表
  initializeAchievements() { }

  // 檢查並解鎖成就
  checkAchievements(gameData) { }

  // 解鎖成就
  unlockAchievement(achievementId) { }

  // 獲取所有成就
  getAllAchievements() { }

  // 獲取進度
  getProgress(achievementId) { }
}

// 成就定義示例
const ACHIEVEMENTS = {
  FIRST_WIN: {
    id: 'first_win',
    title: '首次勝利',
    description: '完成第一個數獨遊戲',
    condition: (data) => data.gamesCompleted >= 1
  },
  PERFECT_GAME: {
    id: 'perfect_game',
    title: '完美遊戲',
    description: '無錯誤無提示完成遊戲',
    condition: (data) => data.errors === 0 && data.hintsUsed === 0
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    title: '速度惡魔',
    description: '在 5 分鐘內完成中等難度',
    condition: (data) => data.difficulty === 'medium' && data.time < 300
  }
  // ... 更多成就
};
```

### DailyChallenge

生成每日挑戰謎題。

```javascript
class DailyChallenge {
  constructor(puzzleLibrary) {
    this.puzzleLibrary = puzzleLibrary;
    this.completedChallenges = new Map(); // date -> result
  }

  // 獲取今日挑戰
  getTodayChallenge() { }

  // 生成確定性謎題（基於日期）
  generateDailyPuzzle(date) { }

  // 記錄完成
  recordCompletion(date, time, hintsUsed) { }

  // 獲取歷史記錄
  getHistory() { }

  // 檢查今日是否已完成
  isTodayCompleted() { }
}
```

### StorageManager

處理所有數據持久化。

```javascript
class StorageManager {
  constructor() {
    this.available = this.checkAvailability();
    this.prefix = 'sudoku_';
  }

  // 檢查 localStorage 是否可用
  checkAvailability() { }

  // 保存數據
  save(key, data) { }

  // 讀取數據
  load(key, defaultValue = null) { }

  // 刪除數據
  remove(key) { }

  // 清空所有數據
  clear() { }

  // 保存遊戲狀態
  saveGameState(state) { }

  // 加載遊戲狀態
  loadGameState() { }

  // 保存設置
  saveSettings(settings) { }

  // 加載設置
  loadSettings() { }

  // 保存統計
  saveStatistics(stats) { }

  // 加載統計
  loadStatistics() { }
}
```

### EventBus

發布/訂閱事件系統。

```javascript
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  // 訂閱事件
  on(event, callback) { }

  // 取消訂閱
  off(event, callback) { }

  // 發布事件
  emit(event, data) { }

  // 一次性訂閱
  once(event, callback) { }
}

// 事件類型
const Events = {
  CELL_SELECTED: 'cell_selected',
  VALUE_CHANGED: 'value_changed',
  NOTE_TOGGLED: 'note_toggled',
  HINT_USED: 'hint_used',
  GAME_COMPLETED: 'game_completed',
  UNDO: 'undo',
  REDO: 'redo',
  THEME_CHANGED: 'theme_changed',
  SETTINGS_CHANGED: 'settings_changed',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked'
};
```

### ThemeManager

管理主題切換。

```javascript
class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.themes = {
      light: {
        '--bg-color': '#ffffff',
        '--text-color': '#000000',
        '--grid-border': '#333333',
        '--cell-bg': '#ffffff',
        '--cell-hover': '#e0e0e0',
        '--cell-selected': '#bbdefb',
        '--cell-fixed': '#f5f5f5',
        '--cell-error': '#ffcdd2',
        '--cell-hint': '#fff9c4'
      },
      dark: {
        '--bg-color': '#1e1e1e',
        '--text-color': '#ffffff',
        '--grid-border': '#cccccc',
        '--cell-bg': '#2d2d2d',
        '--cell-hover': '#3d3d3d',
        '--cell-selected': '#1565c0',
        '--cell-fixed': '#252525',
        '--cell-error': '#c62828',
        '--cell-hint': '#f9a825'
      }
    };
  }

  // 切換主題
  setTheme(themeName) { }

  // 應用主題
  applyTheme(theme) { }

  // 獲取當前主題
  getCurrentTheme() { }
}
```

## 數據模型

### GameState

全局遊戲狀態。

```javascript
const GameState = {
  // 遊戲模式
  mode: 'normal', // 'normal' | 'daily_challenge'
  
  // 難度
  difficulty: 'medium', // 'easy' | 'medium' | 'hard'
  
  // 網格模型
  grid: GridModel,
  
  // 選中的格子
  selectedCell: { row: null, col: null },
  
  // 遊戲狀態
  status: 'playing', // 'playing' | 'paused' | 'completed'
  
  // 計時器
  timer: {
    startTime: null,
    elapsedTime: 0,
    isRunning: false
  },
  
  // 錯誤計數
  errors: 0,
  
  // 提示使用次數
  hintsUsed: 0,
  
  // UI 模式
  noteMode: false,
  autoCheck: true,
  
  // 歷史管理器
  history: HistoryManager
};
```

### Settings

用戶設置。

```javascript
const Settings = {
  theme: 'light',           // 'light' | 'dark'
  autoCheck: true,          // 自動檢查模式
  soundEnabled: false,      // 音效開關
  highlightSameNumbers: true, // 高亮相同數字
  showTimer: true,          // 顯示計時器
  showErrors: true          // 顯示錯誤計數
};
```

### PuzzleData

謎題數據結構。

```javascript
const PuzzleData = {
  id: 'string',             // 謎題 ID
  difficulty: 'medium',     // 難度等級
  puzzle: Array(9).fill(null).map(() => Array(9).fill(0)), // 初始謎題
  solution: Array(9).fill(null).map(() => Array(9).fill(0)), // 解答
  clues: 30                 // 提示數量
};
```

### Achievement

成就數據結構。

```javascript
const Achievement = {
  id: 'string',             // 成就 ID
  title: 'string',          // 標題
  description: 'string',    // 描述
  icon: 'string',           // 圖標
  unlocked: false,          // 是否解鎖
  unlockedAt: null,         // 解鎖時間
  progress: 0,              // 進度 (0-100)
  condition: Function       // 解鎖條件函數
};
```


## 正確性屬性

屬性是一種特徵或行為，應該在系統的所有有效執行中保持為真——本質上是關於系統應該做什麼的正式陳述。屬性作為人類可讀規範和機器可驗證正確性保證之間的橋樑。

### 屬性 1: 提示填入正確答案

*對於任何* 有空白格子的遊戲狀態，當請求提示時，填入的值應該與該位置的正確解答相匹配。

**驗證需求：1.1**

### 屬性 2: 提示使用計數遞增

*對於任何* 遊戲狀態，使用提示後，提示計數應該比使用前增加 1。

**驗證需求：1.2**

### 屬性 3: 提示格子被正確標記

*對於任何* 遊戲狀態，當提示被使用後，被填入的格子應該被標記為提示格子。

**驗證需求：1.4**

### 屬性 4: 撤銷/重做 Round-Trip

*對於任何* 操作序列，執行操作然後撤銷應該恢復到原始狀態；撤銷然後重做應該恢復到操作後的狀態。

**驗證需求：2.1, 2.2**

### 屬性 5: 新操作清除重做歷史

*對於任何* 有重做歷史的遊戲狀態，執行新操作後，重做歷史應該被清空。

**驗證需求：2.5**

### 屬性 6: 所有操作類型被記錄

*對於任何* 操作類型（設置值、切換筆記、清除格子、使用提示），執行後應該在歷史中創建相應的記錄。

**驗證需求：2.6**

### 屬性 7: 筆記模式允許多個數字

*對於任何* 空白格子，在筆記模式下應該能夠添加多個不同的數字標記（1-9）。

**驗證需求：3.1**

### 屬性 8: 筆記切換的冪等性

*對於任何* 格子和數字，在筆記模式下切換該數字兩次應該回到原始狀態。

**驗證需求：3.2**

### 屬性 9: 填入答案清除筆記

*對於任何* 有筆記的格子，在正常模式下填入答案後，該格子的所有筆記應該被清除。

**驗證需求：3.3**

### 屬性 10: 有答案的格子不允許筆記

*對於任何* 已有答案的格子，嘗試添加筆記應該被拒絕，格子狀態保持不變。

**驗證需求：3.4**


### 屬性 11: 自動檢查驗證規則違反

*對於任何* 輸入，當自動檢查啟用時，如果輸入違反數獨規則（行、列或 3x3 宮格中重複），應該被檢測並標記為衝突。

**驗證需求：4.1, 4.5**

### 屬性 12: 衝突檢測的完整性

*對於任何* 位置和值，衝突檢測應該返回所有與該值衝突的格子（同行、同列、同宮格）。

**驗證需求：4.2**

### 屬性 13: 高亮相同數字

*對於任何* 有數字的格子，選中該格子時，返回的高亮列表應該包含所有具有相同數字的格子。

**驗證需求：5.1**

### 屬性 14: 遊戲狀態持久化 Round-Trip

*對於任何* 遊戲狀態，保存到 localStorage 然後加載應該得到等價的遊戲狀態（包括網格、計時器、錯誤計數、提示數和筆記）。

**驗證需求：6.1, 6.2, 6.4**

### 屬性 15: 統計數據正確更新

*對於任何* 難度等級，完成遊戲後，該難度的統計數據（完成數、總時間）應該相應增加。

**驗證需求：7.1**

### 屬性 16: 最佳時間記錄更新

*對於任何* 難度等級，如果完成時間優於當前記錄，該難度的最佳時間應該被更新為新時間。

**驗證需求：7.2**

### 屬性 17: 統計計算正確性

*對於任何* 統計數據，計算的平均時間應該等於總時間除以完成遊戲數；勝率應該等於完成數除以開始數。

**驗證需求：7.3**

### 屬性 18: 統計數據持久化 Round-Trip

*對於任何* 統計數據，保存到 localStorage 然後加載應該得到相同的統計數據。

**驗證需求：7.4**

### 屬性 19: 難度統計隔離

*對於任何* 難度等級，在該難度完成遊戲只應該影響該難度的統計，不應該影響其他難度的統計。

**驗證需求：7.5**

### 屬性 20: 主題應用和持久化

*對於任何* 主題（亮色或暗色），切換主題後，CSS 變量應該被更新，並且主題偏好應該被保存到 localStorage 並能正確恢復。

**驗證需求：8.1, 8.2, 8.3**

### 屬性 21: 設置立即生效

*對於任何* 設置項，更改設置後，新設置應該立即在遊戲中生效。

**驗證需求：9.3**

### 屬性 22: 設置持久化 Round-Trip

*對於任何* 設置配置，保存到 localStorage 然後加載應該得到相同的設置。

**驗證需求：9.4**

### 屬性 23: 勝利數據正確傳遞

*對於任何* 完成的遊戲，勝利界面應該顯示正確的完成時間、錯誤數和提示使用數。

**驗證需求：11.2**

### 屬性 24: 新記錄檢測

*對於任何* 完成的遊戲，如果時間優於該難度的最佳記錄，應該被正確檢測並標記為新記錄。

**驗證需求：11.3**

### 屬性 25: 謎題選擇正確性

*對於任何* 難度等級，開始新遊戲時選擇的謎題應該來自該難度的謎題庫。

**驗證需求：12.2**

### 屬性 26: 謎題唯一解

*對於任何* 謎題庫中的謎題，應該有且僅有一個有效解答。

**驗證需求：12.3**

### 屬性 27: 謎題去重

*對於任何* 已完成的謎題，在短期內（如最近 N 個遊戲）不應該再次被選中。

**驗證需求：12.4**

### 屬性 28: 每日挑戰確定性

*對於任何* 日期，多次生成該日期的每日挑戰應該產生相同的謎題。

**驗證需求：13.1, 13.4**

### 屬性 29: 每日挑戰記錄

*對於任何* 完成的每日挑戰，完成時間和提示使用情況應該被正確記錄。

**驗證需求：13.3**

### 屬性 30: 成就里程碑追蹤

*對於任何* 遊戲里程碑（如完成遊戲數、連勝等），相關數據應該被正確追蹤和更新。

**驗證需求：14.1**

### 屬性 31: 成就解鎖條件

*對於任何* 成就，當其解鎖條件被滿足時，該成就應該被標記為已解鎖。

**驗證需求：14.2**

### 屬性 32: 成就持久化 Round-Trip

*對於任何* 成就進度，保存到 localStorage 然後加載應該得到相同的成就狀態。

**驗證需求：14.5**

### 屬性 33: 無效數據使用默認值

*對於任何* 從 localStorage 讀取的無效或損壞數據，系統應該使用預定義的默認值而不是崩潰。

**驗證需求：16.2**

### 屬性 34: 數據驗證完整性

*對於任何* 從 localStorage 讀取的數據，應該經過驗證以確保類型和值的正確性。

**驗證需求：16.4**


### 屬性 35: ARIA 標籤完整性

*對於任何* 互動元素（按鈕、格子、輸入等），應該具有適當的 ARIA 標籤、角色和狀態屬性。

**驗證需求：17.1**

### 屬性 36: 鍵盤導航支持

*對於任何* 互動元素，應該能夠通過鍵盤（Tab、方向鍵、Enter、Space）進行訪問和操作。

**驗證需求：17.2**

### 屬性 37: 屏幕閱讀器描述

*對於任何* 重要的 UI 元素和狀態變化，應該提供有意義的 ARIA 描述或 live region 更新。

**驗證需求：17.3, 17.6**

### 屬性 38: 焦點管理

*對於任何* 用戶交互，焦點應該按邏輯順序移動，並且當前焦點元素應該有清晰的視覺指示。

**驗證需求：17.5**

### 屬性 39: 音效事件觸發

*對於任何* 遊戲事件（數字輸入、錯誤、完成），當音效啟用時，應該觸發相應的音效播放。

**驗證需求：18.1, 18.2, 18.3**

### 屬性 40: 音效偏好持久化

*對於任何* 音效設置，保存到 localStorage 然後加載應該得到相同的音效偏好。

**驗證需求：18.5**

### 屬性 41: 防抖節流行為

*對於任何* 頻繁觸發的操作（如輸入、滾動），防抖或節流機制應該限制實際執行頻率。

**驗證需求：19.4**

### 屬性 42: JSDoc 註釋存在

*對於任何* 公共函數和方法，應該有 JSDoc 格式的註釋說明參數、返回值和功能。

**驗證需求：20.1**

### 屬性 43: 模塊文檔存在

*對於任何* 模塊文件，應該在文件頂部有模塊級別的文檔說明其職責和用途。

**驗證需求：20.3**

### 屬性 44: 數據結構文檔

*對於任何* 重要的數據結構和接口，應該有清晰的文檔說明其結構和用途。

**驗證需求：20.4**

## 錯誤處理

### localStorage 不可用

當 localStorage 不可用時（如隱私模式、配額超限），系統應該：

1. 檢測 localStorage 可用性
2. 在內存中維護遊戲狀態
3. 向用戶顯示通知，說明進度不會被保存
4. 繼續提供完整的遊戲功能

```javascript
class StorageManager {
  checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage not available:', e);
      return false;
    }
  }

  save(key, data) {
    if (!this.available) {
      console.warn('Cannot save: localStorage not available');
      return false;
    }
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }
}
```

### 數據驗證

從 localStorage 讀取的所有數據都應該經過驗證：

```javascript
class DataValidator {
  static validateGameState(data) {
    if (!data || typeof data !== 'object') return null;
    
    // 驗證必需字段
    if (!Array.isArray(data.current) || data.current.length !== 9) return null;
    if (!Array.isArray(data.puzzle) || data.puzzle.length !== 9) return null;
    
    // 驗證數據類型
    if (typeof data.errors !== 'number' || data.errors < 0) return null;
    if (typeof data.hintsUsed !== 'number' || data.hintsUsed < 0) return null;
    
    return data;
  }

  static validateSettings(data) {
    const defaults = {
      theme: 'light',
      autoCheck: true,
      soundEnabled: false,
      highlightSameNumbers: true,
      showTimer: true,
      showErrors: true
    };
    
    if (!data || typeof data !== 'object') return defaults;
    
    return {
      theme: ['light', 'dark'].includes(data.theme) ? data.theme : defaults.theme,
      autoCheck: typeof data.autoCheck === 'boolean' ? data.autoCheck : defaults.autoCheck,
      soundEnabled: typeof data.soundEnabled === 'boolean' ? data.soundEnabled : defaults.soundEnabled,
      highlightSameNumbers: typeof data.highlightSameNumbers === 'boolean' ? data.highlightSameNumbers : defaults.highlightSameNumbers,
      showTimer: typeof data.showTimer === 'boolean' ? data.showTimer : defaults.showTimer,
      showErrors: typeof data.showErrors === 'boolean' ? data.showErrors : defaults.showErrors
    };
  }
}
```

### 錯誤邊界

對於意外錯誤，實現全局錯誤處理：

```javascript
class ErrorHandler {
  static init() {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      ErrorHandler.showUserMessage('發生了一個錯誤，但遊戲可以繼續。');
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      ErrorHandler.showUserMessage('操作失敗，請重試。');
    });
  }

  static showUserMessage(message) {
    // 顯示用戶友好的錯誤消息
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}
```

## 測試策略

### 雙重測試方法

本專案採用單元測試和基於屬性的測試相結合的方法：

**單元測試**：
- 驗證特定示例和邊緣情況
- 測試錯誤條件和異常處理
- 測試組件之間的集成點
- 使用具體的輸入和預期輸出

**基於屬性的測試**：
- 驗證跨所有輸入的通用屬性
- 通過隨機化提供全面的輸入覆蓋
- 測試不變量和 round-trip 屬性
- 每個測試最少運行 100 次迭代

兩種測試方法是互補的：單元測試捕獲具體的錯誤，基於屬性的測試驗證一般正確性。

### 測試框架

- **單元測試框架**：Jest 或 Vitest
- **基於屬性的測試庫**：fast-check (JavaScript)
- **測試配置**：每個屬性測試最少 100 次迭代

### 屬性測試標記

每個基於屬性的測試必須用註釋標記，引用設計文檔中的屬性：

```javascript
// Feature: sudoku-polish, Property 1: 提示填入正確答案
test('hint fills correct answer', () => {
  fc.assert(
    fc.property(
      gameStateArbitrary,
      (gameState) => {
        if (gameState.hasEmptyCells()) {
          const hint = hintSystem.getHint(gameState);
          const correctValue = gameState.solution[hint.row][hint.col];
          expect(hint.value).toBe(correctValue);
        }
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: sudoku-polish, Property 4: 撤銷/重做 Round-Trip
test('undo/redo round-trip', () => {
  fc.assert(
    fc.property(
      gameStateArbitrary,
      actionArbitrary,
      (initialState, action) => {
        const afterAction = applyAction(initialState, action);
        const afterUndo = historyManager.undo(afterAction);
        expect(afterUndo).toEqual(initialState);
        
        const afterRedo = historyManager.redo(afterUndo);
        expect(afterRedo).toEqual(afterAction);
      }
    ),
    { numRuns: 100 }
  );
});
```

### 測試覆蓋目標

- **核心邏輯模塊**：90%+ 代碼覆蓋率
- **UI 組件**：70%+ 代碼覆蓋率（重點測試邏輯而非渲染）
- **所有正確性屬性**：必須有對應的基於屬性的測試
- **關鍵路徑**：100% 覆蓋（遊戲開始、輸入、驗證、完成）

### 測試組織

```
tests/
├── unit/
│   ├── grid-model.test.js
│   ├── history-manager.test.js
│   ├── hint-system.test.js
│   ├── statistics-tracker.test.js
│   ├── achievement-system.test.js
│   ├── daily-challenge.test.js
│   ├── storage-manager.test.js
│   └── theme-manager.test.js
├── property/
│   ├── grid-properties.test.js
│   ├── history-properties.test.js
│   ├── persistence-properties.test.js
│   ├── statistics-properties.test.js
│   └── validation-properties.test.js
├── integration/
│   ├── game-flow.test.js
│   ├── persistence-flow.test.js
│   └── achievement-flow.test.js
└── helpers/
    ├── arbitraries.js  // fast-check 生成器
    └── test-utils.js   // 測試工具函數
```

### 關鍵測試場景

**單元測試示例**：
- 空網格時請求提示
- 網格已滿時請求提示
- localStorage 不可用時保存數據
- 無效數據驗證
- 成就解鎖條件

**基於屬性的測試示例**：
- 所有提示都填入正確答案
- 撤銷/重做保持狀態一致性
- 持久化 round-trip 保持數據完整性
- 統計計算的數學正確性
- 衝突檢測的完整性

### 性能測試

雖然不是自動化測試的一部分，但應該手動驗證：
- 網格渲染在 16ms 內完成（60 FPS）
- 輸入驗證在 10ms 內完成
- 大量筆記不影響性能
- 長時間遊戲不導致內存洩漏

### 可訪問性測試

使用工具驗證可訪問性：
- axe-core 自動化測試
- 鍵盤導航手動測試
- 屏幕閱讀器（NVDA/JAWS）手動測試
- 顏色對比度檢查

## 實現注意事項

### 模塊化策略

1. **從核心開始**：先實現 GridModel、HistoryManager 等核心模塊
2. **逐步添加功能**：每個功能模塊獨立開發和測試
3. **最後集成 UI**：核心邏輯完成後再連接 UI

### 性能優化

1. **事件委託**：在網格容器上使用單個事件監聽器
2. **虛擬 DOM 或最小化 DOM 操作**：批量更新 DOM
3. **防抖/節流**：對頻繁操作（如自動保存）使用防抖
4. **懶加載**：按需加載音效和動畫資源

### 漸進增強

1. **核心功能優先**：確保基本遊戲功能在所有環境下工作
2. **可選功能**：音效、動畫等作為增強功能
3. **優雅降級**：localStorage 不可用時仍能遊戲

### 代碼組織

```
src/
├── core/
│   ├── grid-model.js
│   ├── history-manager.js
│   ├── hint-system.js
│   ├── timer.js
│   └── validator.js
├── features/
│   ├── statistics-tracker.js
│   ├── achievement-system.js
│   ├── daily-challenge.js
│   └── puzzle-library.js
├── storage/
│   ├── storage-manager.js
│   └── data-validator.js
├── ui/
│   ├── grid-view.js
│   ├── keypad-view.js
│   ├── settings-panel.js
│   ├── victory-animation.js
│   └── theme-manager.js
├── utils/
│   ├── event-bus.js
│   ├── error-handler.js
│   └── sound-manager.js
├── game-controller.js
└── main.js
```

### 瀏覽器兼容性

- **目標瀏覽器**：現代瀏覽器（Chrome、Firefox、Safari、Edge）最新兩個版本
- **必需功能**：ES6+、localStorage、CSS Grid、CSS Variables
- **可選功能**：Web Audio API（音效）

### 移動端考慮

1. **觸控目標**：最小 44x44 像素
2. **視口設置**：`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">`
3. **響應式佈局**：使用 CSS Grid 和 Flexbox
4. **觸控優化**：防止雙擊縮放、優化觸控反饋
