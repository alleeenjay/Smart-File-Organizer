import fs from 'node:fs';
import path from 'node:path';
import type { Settings } from './types.js';

const defaultSettings: Settings = {
  scanRoots: [],
  theme: 'dark',
  viewMode: 'table'
};

export class AppStore {
  private readonly dir: string;
  private readonly settingsFile: string;
  private readonly metadataFile: string;

  constructor(baseDir: string) {
    this.dir = baseDir;
    this.settingsFile = path.join(baseDir, 'settings.json');
    this.metadataFile = path.join(baseDir, 'metadata.json');
    fs.mkdirSync(baseDir, { recursive: true });
  }

  loadSettings(): Settings {
    if (!fs.existsSync(this.settingsFile)) {
      this.saveSettings(defaultSettings);
      return defaultSettings;
    }

    try {
      const parsed = JSON.parse(fs.readFileSync(this.settingsFile, 'utf-8')) as Settings;
      return { ...defaultSettings, ...parsed };
    } catch {
      return defaultSettings;
    }
  }

  saveSettings(settings: Settings): Settings {
    fs.writeFileSync(this.settingsFile, JSON.stringify(settings, null, 2));
    return settings;
  }

  loadMetadata(): Record<string, { tags: string[]; favorite: boolean }> {
    if (!fs.existsSync(this.metadataFile)) {
      this.saveMetadata({});
      return {};
    }

    try {
      return JSON.parse(fs.readFileSync(this.metadataFile, 'utf-8'));
    } catch {
      return {};
    }
  }

  saveMetadata(metadata: Record<string, { tags: string[]; favorite: boolean }>): void {
    fs.writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2));
  }
}
