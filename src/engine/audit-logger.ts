import { AuditEvent } from '../types/index.js';
import winston from 'winston';
import fs from 'fs';
import path from 'path';

const logDir = 'logs';
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'audit.log') }),
    new winston.transports.Console({ level: 'warn' })
  ]
});

export class AuditLogger {
  log(event: AuditEvent): void {
    logger.info('ukg_wfm_mcp_audit', event);
  }

  getRecent(limit = 50): any[] {
    // In production would tail file or use DB. For now, simple.
    return [];
  }
}
