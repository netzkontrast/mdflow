import os from 'os';
import path from 'path';
export function getSuperpowersDir(): string {
  if (process.env.PERSONAL_SUPERPOWERS_DIR) {
    return process.env.PERSONAL_SUPERPOWERS_DIR;
  }
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    return path.join(xdgConfigHome, 'superpowers');
  }
  return path.join(os.homedir(), '.config', 'superpowers');
}
export function getArchiveDir(): string {
  if (process.env.TEST_ARCHIVE_DIR) {
    return process.env.TEST_ARCHIVE_DIR;
  }
  return path.join(getSuperpowersDir(), 'conversation-archive');
}
export function getIndexDir(): string {
  return path.join(getSuperpowersDir(), 'conversation-index');
}
export function getDbPath(): string {
  return path.join(getIndexDir(), 'db.sqlite');
}
export function getExcludeConfigPath(): string {
  return path.join(getIndexDir(), 'exclude.txt');
}
