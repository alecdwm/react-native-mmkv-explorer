# react-native-mmkv-explorer

An interactive in-app dev tool for exploring [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) storage at runtime.

## Features

- **Browse and search** all keys with type badges and value previews
- **Full CRUD** - create, read, update, and delete key-value pairs
- **Multiple instances** - switch between named MMKV storage instances
- **Import/Export** - JSON export with clipboard/share, import with conflict modes (merge/overwrite/replace)
- **Themeable** - dark theme by default, fully customizable colors
- **Dev-only** - designed to be conditionally included with `__DEV__`

## Installation

```bash
npm install react-native-mmkv-explorer
```

### Peer dependencies

This package requires the following peer dependencies:

```bash
npm install react react-native react-native-mmkv
```

## Quick Start

```tsx
import { MMKV } from 'react-native-mmkv';
import { MMKVExplorer } from 'react-native-mmkv-explorer';
import { useState } from 'react';

const storage = new MMKV();
const userStorage = new MMKV({ id: 'user-settings' });

function App() {
  const [explorerVisible, setExplorerVisible] = useState(false);

  return (
    <>
      {/* Your app content */}
      <Button title="Open Storage Explorer" onPress={() => setExplorerVisible(true)} />

      {/* Only include in development */}
      {__DEV__ && (
        <MMKVExplorer
          instances={[
            { name: 'Default', storage },
            { name: 'User Settings', storage: userStorage },
          ]}
          visible={explorerVisible}
          onClose={() => setExplorerVisible(false)}
        />
      )}
    </>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `instances` | `InstanceDescriptor[]` | Yes | Array of `{ name: string; storage: MMKV }` objects |
| `visible` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Called when the user closes the explorer |
| `theme` | `ThemeOverrides` | No | Partial theme object to override default colors |

### `InstanceDescriptor`

```ts
interface InstanceDescriptor {
  name: string;    // Human-readable label shown in the instance picker
  storage: MMKV;   // MMKV instance to explore
}
```

## Theming

Override any color from the default dark theme:

```tsx
<MMKVExplorer
  instances={instances}
  visible={visible}
  onClose={onClose}
  theme={{
    background: '#0d1117',
    primary: '#58a6ff',
    danger: '#f85149',
  }}
/>
```

### Available theme colors

| Key | Default | Description |
|-----|---------|-------------|
| `background` | `#1a1a2e` | Main background |
| `surface` | `#16213e` | Card/modal background |
| `surfaceHighlight` | `#1f2b47` | Highlighted surface |
| `text` | `#e0e0e0` | Primary text |
| `textSecondary` | `#a0a0b0` | Secondary text |
| `textMuted` | `#606070` | Muted text |
| `border` | `#2a2a4a` | Border color |
| `primary` | `#4a9eff` | Primary action color |
| `danger` | `#ff4a6a` | Destructive action color |
| `badgeString` | `#4ade80` | String type badge |
| `badgeNumber` | `#60a5fa` | Number type badge |
| `badgeBoolean` | `#f59e0b` | Boolean type badge |
| `badgeBinary` | `#a78bfa` | Binary type badge |

## Import/Export Format

The export format is a versioned JSON envelope:

```json
{
  "version": 1,
  "instanceName": "user-settings",
  "exportedAt": "2026-04-30T03:34:00.000Z",
  "entries": {
    "username": { "type": "string", "value": "alice" },
    "loginCount": { "type": "number", "value": 42 },
    "darkMode": { "type": "boolean", "value": true },
    "avatar": { "type": "binary", "value": "base64encodeddata==" }
  }
}
```

### Import conflict modes

| Mode | Behavior |
|------|----------|
| **Overwrite** (default) | Update existing keys + add new keys |
| **Merge** | Only add keys that don't already exist |
| **Replace All** | Clear all existing keys, then import |

A preview showing the number of new, updated, and unchanged keys is displayed before applying.

## Interactions

- **Tap** a key to view its full value
- **Long-press** a key to delete it (with confirmation)
- **Pull down** to refresh the key list
- **Search** to filter keys by name
- **+ Add Key** to create a new key-value pair with explicit type selection

## Type Detection

MMKV does not expose value types directly. The explorer detects types by trying each getter in order: `getBoolean`, `getNumber`, `getString`, `getBuffer`. The first to return a non-undefined value determines the type. When editing, you can explicitly select the type.

## License

MIT
