# Token Explorer JavaScript Architecture

This document describes the refactored JavaScript architecture for the Token Explorer, following SOLID principles and DRY practices.

## 🏗️ Architecture Overview

The Token Explorer is built using a modular, class-based architecture that follows SOLID principles for maintainability and scalability.

```
TokenExplorerApp (Main Coordinator)
├── TokenDataService (Data Management)
├── TokenRenderer (DOM Rendering)
├── ThemeManager (Theme State)
└── UIManager (UI Interactions)
    └── DOMUtils, CSSUtils, TokenUtils, StorageUtils
```

## 📁 Module Structure

### `config.js`
**Purpose**: Centralized configuration constants
- DOM selectors
- CSS classes
- Token types and themes
- API endpoints
- Storage keys

**SOLID Principle**: Single Responsibility - Only handles configuration

### `utils.js`
**Purpose**: Reusable utility functions
- `DOMUtils`: DOM manipulation helpers
- `CSSUtils`: CSS variable resolution
- `TokenUtils`: Token processing utilities
- `StorageUtils`: Local storage abstraction

**SOLID Principle**: Single Responsibility - Each utility class has one specific purpose

### `token-data-service.js`
**Purpose**: Data loading and management
- Loads tokens from JSON
- Processes and transforms token data
- Provides filtering capabilities

**SOLID Principle**:
- Single Responsibility: Only handles data operations
- Open/Closed: Easy to extend with new data sources

### `token-renderer.js`
**Purpose**: DOM rendering and UI updates
- Renders component cards
- Renders foundation token tables
- Manages visual representation

**SOLID Principle**:
- Single Responsibility: Only handles rendering
- Dependency Inversion: Depends on abstractions (data service)

### `app.js`
**Purpose**: Main application coordinator
- Initializes all components
- Coordinates between services
- Handles application lifecycle

**SOLID Principle**:
- Single Responsibility: Only coordinates components
- Dependency Inversion: Depends on abstractions

## 🎯 SOLID Principles Applied

### 1. Single Responsibility Principle (SRP)
Each class has one reason to change:
- `TokenDataService`: Only manages data
- `TokenRenderer`: Only renders UI
- `ThemeManager`: Only manages themes
- `UIManager`: Only handles user interactions

### 2. Open/Closed Principle (OCP)
Classes are open for extension, closed for modification:
- New token types can be added without changing existing code
- New renderers can be added for different views
- New data sources can be integrated

### 3. Liskov Substitution Principle (LSP)
Not directly applicable in this JavaScript context, but interfaces are consistent.

### 4. Interface Segregation Principle (ISP)
Not directly applicable, but utilities are focused and minimal.

### 5. Dependency Inversion Principle (DIP)
High-level modules don't depend on low-level modules:
- `TokenExplorerApp` depends on abstractions (interfaces)
- Components communicate through well-defined APIs

## 🔄 DRY (Don't Repeat Yourself)

### Eliminated Repetition:
- **DOM Manipulation**: Centralized in `DOMUtils`
- **CSS Variable Resolution**: Centralized in `CSSUtils`
- **Token Processing**: Centralized in `TokenUtils`
- **Storage Operations**: Centralized in `StorageUtils`

### Reusable Patterns:
- **Element Creation**: `DOMUtils.createElement()` for consistent element creation
- **Event Handling**: `DOMUtils.addEventListener()` for safe event binding
- **Token Rendering**: Common patterns for color previews and token display

## 🚀 Benefits of This Architecture

### Maintainability
- **Clear Separation**: Each class has a single responsibility
- **Easy Testing**: Classes can be unit tested independently
- **Bug Isolation**: Issues are contained within specific modules

### Scalability
- **Extensible**: New features can be added without modifying existing code
- **Modular**: Components can be replaced or upgraded independently
- **Configurable**: Behavior can be changed through configuration

### Developer Experience
- **Readable**: Code is self-documenting with clear class names
- **Debuggable**: Issues can be traced to specific modules
- **Reusable**: Utilities can be used across different parts of the app

## 📋 Usage Examples

### Adding a New Token Type
```javascript
// In config.js
TOKEN_TYPES: {
    BORDER_RADIUS: 'borderRadius',
    // ... existing types
}

// In token-data-service.js - automatically handled
// No changes needed due to OCP
```

### Adding a New Renderer
```javascript
class CustomRenderer {
    render(tokens) {
        // Custom rendering logic
    }
}

// In app.js
const customRenderer = new CustomRenderer();
app.setRenderer(customRenderer);
```

### Adding Theme Persistence
```javascript
// Already handled by ThemeManager + StorageUtils
// No additional code needed
```

## 🔧 Extension Points

### Data Sources
- JSON files (current)
- REST APIs
- GraphQL endpoints
- Local storage

### Renderers
- HTML table view (current)
- Canvas visualization
- Chart.js graphs
- Custom components

### Themes
- Light/dark (current)
- High contrast
- Color blind friendly
- Custom themes

## 🧪 Testing Strategy

Each module can be tested independently:
- `TokenDataService`: Test data loading and filtering
- `TokenRenderer`: Test DOM manipulation
- `ThemeManager`: Test theme switching
- `UIManager`: Test user interactions

## 📚 API Documentation

### TokenDataService
```javascript
const service = new TokenDataService();
await service.loadTokens();
const components = service.getComponentTokens();
const filtered = service.filterFoundationTokens('color', 'light');
```

### TokenRenderer
```javascript
const renderer = new TokenRenderer();
renderer.setDataService(dataService);
renderer.renderComponentTokens();
renderer.renderFoundationTokens(tokens);
```

### ThemeManager
```javascript
const themeManager = new ThemeManager();
themeManager.setTheme('dark');
const current = themeManager.getCurrentTheme();
```

This architecture provides a solid foundation for maintaining and extending the Token Explorer as the design system grows.


