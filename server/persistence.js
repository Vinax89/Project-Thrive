const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const DEFAULT_STRUCTURE = () => ({
  users: {}
});

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getDataPaths(dataDir) {
  const dir = path.resolve(process.cwd(), dataDir || './data');
  ensureDir(dir);
  return {
    dir,
    dbFile: path.join(dir, 'db.json'),
    tmpFile: path.join(dir, 'db.tmp.json'),
  };
}

async function loadDB(dataDir) {
  const { dbFile } = getDataPaths(dataDir);
  try {
    await fsp.access(dbFile);
  } catch {
    return DEFAULT_STRUCTURE();
  }
  try {
    const raw = await fsp.readFile(dbFile, 'utf-8');
    const parsed = JSON.parse(raw);
    // Basic shape check
    if (!parsed || typeof parsed !== 'object' || !parsed.users) {
      return DEFAULT_STRUCTURE();
    }
    return parsed;
  } catch (e) {
    console.error('[persistence] Failed to load DB, starting fresh:', e.message);
    return DEFAULT_STRUCTURE();
  }
}

async function atomicWrite(filePath, tmpPath, data) {
  await fsp.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  await fsp.rename(tmpPath, filePath);
}

class Store {
  constructor(opts = {}) {
    this.dataDir = opts.dataDir || './data';
    const paths = getDataPaths(this.dataDir);
    this.paths = paths;
    this.db = DEFAULT_STRUCTURE();
  }

  async load() {
    this.db = await loadDB(this.dataDir);
  }

  async save() {
    const { dbFile, tmpFile } = this.paths;
    await atomicWrite(dbFile, tmpFile, this.db);
  }

  ensureUser(email) {
    if (!this.db.users[email]) {
      this.db.users[email] = {
        budgets: [],
        debts: [],
        goals: [],
        obligations: [],
        bnpl: []
      };
    }
  }

  getUser(email) {
    this.ensureUser(email);
    return this.db.users[email];
  }

  async setUser(email, userData) {
    this.db.users[email] = userData;
    await this.save();
  }
}

module.exports = { Store };
