import type { MMKV } from 'react-native-mmkv';
import type { MMKVEntry, MMKVValueType } from '../types';

export function resolveValue(storage: MMKV, key: string): MMKVEntry | undefined {
  const boolVal = storage.getBoolean(key);
  if (boolVal !== undefined) {
    return { key, type: 'boolean', value: boolVal };
  }

  const numVal = storage.getNumber(key);
  if (numVal !== undefined) {
    return { key, type: 'number', value: numVal };
  }

  const strVal = storage.getString(key);
  if (strVal !== undefined) {
    return { key, type: 'string', value: strVal };
  }

  const bufVal = storage.getBuffer(key);
  if (bufVal !== undefined) {
    return { key, type: 'binary', value: new Uint8Array(bufVal) };
  }

  return undefined;
}

export function setValue(storage: MMKV, key: string, type: MMKVValueType, rawValue: string): void {
  switch (type) {
    case 'string':
      storage.set(key, rawValue);
      break;
    case 'number': {
      const num = Number(rawValue);
      if (Number.isNaN(num)) {
        throw new Error(`Invalid number: "${rawValue}"`);
      }
      storage.set(key, num);
      break;
    }
    case 'boolean':
      storage.set(key, rawValue === 'true');
      break;
    case 'binary': {
      const bytes = base64ToUint8Array(rawValue);
      storage.set(key, bytes.buffer as ArrayBuffer);
      break;
    }
  }
}

export function valueToString(entry: MMKVEntry): string {
  if (entry.type === 'binary' && entry.value instanceof Uint8Array) {
    return uint8ArrayToBase64(entry.value);
  }
  return String(entry.value);
}

export function truncateValue(entry: MMKVEntry, maxLength = 80): string {
  const str = valueToString(entry);
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
