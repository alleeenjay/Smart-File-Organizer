import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';
import type { AutoOrganizeRule, FileRecord, MovePlanItem } from './types.js';

const typeGroups: Record<string, string[]> = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
  video: ['.mp4', '.mkv', '.mov', '.avi', '.wmv', '.webm'],
  audio: ['.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg'],
  document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md', '.rtf'],
  code: ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cs', '.cpp', '.c', '.html', '.css', '.json']
};

const inferType = (ext: string): string => {
  const lowerExt = ext.toLowerCase();
  for (const [kind, exts] of Object.entries(typeGroups)) {
    if (exts.includes(lowerExt)) {
      return kind;
    }
  }
  return 'other';
};

const hashFileSample = async (filePath: string): Promise<string> => {
  const stat = await fs.stat(filePath);
  const fd = await fs.open(filePath, 'r');
  const len = Math.min(16 * 1024, stat.size);
  const buffer = Buffer.alloc(len);
  await fd.read(buffer, 0, len, 0);
  await fd.close();
  return crypto.createHash('sha1').update(buffer).update(String(stat.size)).digest('hex');
};

export class FileService {
  async scanFolders(
    roots: string[],
    metadata: Record<string, { tags: string[]; favorite: boolean }>
  ): Promise<{ files: FileRecord[]; emptyFolders: string[] }> {
    const files: FileRecord[] = [];
    const emptyFolders: string[] = [];

    const walk = async (dir: string): Promise<boolean> => {
      let entries: fssync.Dirent[];
      try {
        entries = await fs.readdir(dir, { withFileTypes: true });
      } catch {
        return false;
      }

      if (entries.length === 0) {
        emptyFolders.push(dir);
        return false;
      }

      let hasFile = false;
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const childHasFile = await walk(fullPath);
          hasFile ||= childHasFile;
        } else if (entry.isFile()) {
          try {
            const stat = await fs.stat(fullPath);
            const extension = path.extname(entry.name);
            const meta = metadata[fullPath] ?? { tags: [], favorite: false };
            files.push({
              id: fullPath,
              name: entry.name,
              path: fullPath,
              extension,
              type: inferType(extension),
              size: stat.size,
              createdAt: stat.birthtime.toISOString(),
              modifiedAt: stat.mtime.toISOString(),
              tags: meta.tags,
              favorite: meta.favorite,
              parentFolder: path.dirname(fullPath)
            });
            hasFile = true;
          } catch {
            // skip inaccessible file
          }
        }
      }

      if (!hasFile) {
        emptyFolders.push(dir);
      }
      return hasFile;
    };

    for (const root of roots) {
      await walk(root);
    }

    return { files, emptyFolders };
  }

  async detectDuplicates(files: FileRecord[]): Promise<string[][]> {
    const bySize = new Map<number, FileRecord[]>();
    for (const file of files) {
      if (!bySize.has(file.size)) {
        bySize.set(file.size, []);
      }
      bySize.get(file.size)?.push(file);
    }

    const groups: string[][] = [];
    for (const [, candidates] of bySize.entries()) {
      if (candidates.length < 2) continue;
      const byHash = new Map<string, string[]>();
      for (const file of candidates) {
        try {
          const h = await hashFileSample(file.path);
          if (!byHash.has(h)) byHash.set(h, []);
          byHash.get(h)?.push(file.path);
        } catch {
          // skip unreadable
        }
      }
      for (const paths of byHash.values()) {
        if (paths.length > 1) groups.push(paths);
      }
    }

    return groups;
  }

  async readTextPreview(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf8').then((content) => content.slice(0, 8000));
  }

  async createFolder(targetPath: string): Promise<void> {
    await fs.mkdir(targetPath, { recursive: true });
  }

  async renamePath(oldPath: string, newPath: string): Promise<void> {
    await fs.rename(oldPath, newPath);
  }

  async deletePath(targetPath: string): Promise<void> {
    await fs.rm(targetPath, { recursive: true, force: false });
  }

  async movePath(source: string, destination: string): Promise<void> {
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.rename(source, destination);
  }

  async copyPath(source: string, destination: string): Promise<void> {
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.cp(source, destination, { recursive: true });
  }

  buildAutoOrganizePlan(files: FileRecord[], rule: AutoOrganizeRule): MovePlanItem[] {
    const plans: MovePlanItem[] = [];
    for (const file of files) {
      const date = new Date(file.modifiedAt);
      let bucket = 'Other';
      if (rule.mode === 'type') bucket = file.type;
      if (rule.mode === 'extension') bucket = file.extension.replace('.', '').toUpperCase() || 'NO_EXT';
      if (rule.mode === 'month') bucket = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (rule.mode === 'year') bucket = `${date.getFullYear()}`;

      const destination = path.join(rule.destination, bucket, file.name);
      if (destination !== file.path) {
        plans.push({ source: file.path, destination });
      }
    }
    return plans;
  }

  async applyMovePlan(plan: MovePlanItem[]): Promise<void> {
    for (const item of plan) {
      await this.movePath(item.source, item.destination);
    }
  }
}
