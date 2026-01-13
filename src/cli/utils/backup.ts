import * as fs from 'fs'
import * as path from 'path'

const BACKUP_DIR = '.autoblogger-backup'

export function createBackup(files: string[], cwd: string = process.cwd()): string {
  const backupPath = path.join(cwd, BACKUP_DIR)
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true })
  }

  // Add timestamp to backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const timestampedBackupPath = path.join(backupPath, timestamp)
  fs.mkdirSync(timestampedBackupPath, { recursive: true })

  // Copy each file
  for (const file of files) {
    const sourcePath = path.join(cwd, file)
    if (fs.existsSync(sourcePath)) {
      const destPath = path.join(timestampedBackupPath, file)
      const destDir = path.dirname(destPath)
      
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true })
      }
      
      fs.copyFileSync(sourcePath, destPath)
    }
  }

  return timestampedBackupPath
}

export function restoreBackup(backupPath: string, cwd: string = process.cwd()): void {
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup not found: ${backupPath}`)
  }

  // Walk through backup and restore files
  function restoreDir(dir: string, relativePath: string = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const sourcePath = path.join(dir, entry.name)
      const relPath = path.join(relativePath, entry.name)
      const destPath = path.join(cwd, relPath)
      
      if (entry.isDirectory()) {
        restoreDir(sourcePath, relPath)
      } else {
        const destDir = path.dirname(destPath)
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true })
        }
        fs.copyFileSync(sourcePath, destPath)
      }
    }
  }

  restoreDir(backupPath)
}

export function listBackups(cwd: string = process.cwd()): string[] {
  const backupPath = path.join(cwd, BACKUP_DIR)
  
  if (!fs.existsSync(backupPath)) {
    return []
  }

  return fs.readdirSync(backupPath)
    .filter(name => fs.statSync(path.join(backupPath, name)).isDirectory())
    .sort()
    .reverse() // Most recent first
}
