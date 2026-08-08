import fs from 'fs';
import path from 'path';

const LOG_FILE = process.env.AUDIT_LOG_FILE || path.resolve(process.cwd(), 'audit.log');

export const logEvent = async (event) => {
  const entry = { ts: new Date().toISOString(), ...event };
  const line = JSON.stringify(entry) + '\n';
  try {
    fs.appendFileSync(LOG_FILE, line);
  } catch (err) {
    // fallback to console
    console.log('AUDIT', entry);
  }
};
