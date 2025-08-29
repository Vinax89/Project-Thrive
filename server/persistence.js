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
    // Disk write helpers
    this._writeToDisk = atomicWrite;
    this._writeQueue = Promise.resolve();
    this._pending = null;
    this._timer = null;
    this._debounceMs = opts.debounceMs || 500;
  }

  async load() {
    this.db = await loadDB(this.dataDir);
  }

  save() {
    // If a save is already scheduled or in progress, reuse its promise
    if (!this._pending) {
      this._pending = new Promise((resolve, reject) => {
        this._resolvePending = resolve;
        this._rejectPending = reject;
      });
    }

    // Reset debounce timer
    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this._timer = null;
      const { dbFile, tmpFile } = this.paths;
      const run = this._writeQueue.then(() =>
        this._writeToDisk(dbFile, tmpFile, this.db)
      );
      this._writeQueue = run.catch(() => {});
      run
        .then(this._resolvePending, this._rejectPending)
        .finally(() => {
          this._pending = null;
          this._resolvePending = null;
          this._rejectPending = null;
        });
    }, this._debounceMs);

    return this._pending;
  }

  createUser(email, passwordHash) {
    if (!this.db.users[email]) {
      this.db.users[email] = {
        passwordHash,
        budgets: [],
        debts: [],
        goals: [],
        obligations: [],
        bnpl: []
      };
    }
  }

  getUser(email) {
    return this.db.users[email];
  }

  async setUser(email, userData) {
    this.db.users[email] = userData;
    await this.save();
  }
}

module.exports = { Store };
