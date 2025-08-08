const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const PriceCache = require('../models/PriceCache');

// Note: Python scrapers handle SERP lookups internally. We pass the query through.
// Add a per-process timeout to avoid hanging.
// Resolve Python interpreter once per process
function resolvePythonInterpreter() {
  const scrapersDir = path.join(__dirname, '../utils/Scrapers');
  const candidates = [
    process.env.PYTHON_PATH,
    path.join(scrapersDir, 'venv', 'Scripts', 'python.exe'),
    path.join(scrapersDir, '.venv', 'Scripts', 'python.exe'),
    path.join(scrapersDir, 'venv', 'bin', 'python'),
    path.join(scrapersDir, '.venv', 'bin', 'python'),
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch (_) {}
  }
  // Fallbacks to PATH commands
  return process.platform === 'win32' ? 'py' : 'python3';
}

const resolvedPython = resolvePythonInterpreter();
console.log(`[prices] Using Python interpreter: ${resolvedPython}`);

function runScraper(scriptPath, query, timeoutMs = 40000) {
  // Prefer the venv interpreter in utils/Scrapers if present
  const scrapersDir = path.join(__dirname, '../utils/Scrapers');
  const venvWinDot = path.join(scrapersDir, '.venv', 'Scripts', 'python.exe');
  const venvNixDot = path.join(scrapersDir, '.venv', 'bin', 'python');
  const venvWin = path.join(scrapersDir, 'venv', 'Scripts', 'python.exe');
  const venvNix = path.join(scrapersDir, 'venv', 'bin', 'python');
  const envPython = process.env.PYTHON_PATH;
  const pythonCandidates = [resolvedPython, envPython, venvWin, venvWinDot, venvNix, venvNixDot]
    .concat(process.platform === 'win32' ? ['py', 'python'] : ['python3', 'python'])
    .filter(Boolean);
  return new Promise((resolve, reject) => {
    let settled = false;
    let proc;
    let candidateIndex = 0;

    const start = () => {
      const cmd = pythonCandidates[candidateIndex];
      console.log(`[prices] Starting scraper: cmd="${cmd}" script="${scriptPath}" query="${query}"`);
      proc = spawn(cmd, [scriptPath, query], {
        cwd: path.dirname(scriptPath),
        env: { ...process.env },
        stdio: ['ignore', 'pipe', 'pipe']
      });
      wireUp(cmd);
    };

    const tryNext = (errMsg) => {
      candidateIndex += 1;
      if (candidateIndex < pythonCandidates.length) {
        start();
      } else if (!settled) {
        settled = true;
        reject(new Error(errMsg || 'unable to start python process'));
      }
    };

    let out = '';
    let err = '';

    const killProcess = () => {
      try {
        if (process.platform === 'win32') {
          // Force kill on Windows
          spawn('taskkill', ['/PID', String(proc.pid), '/T', '/F']);
        } else {
          proc.kill('SIGKILL');
        }
      } catch (_) {}
    };

    const wireUp = (cmd) => {
      out = '';
      err = '';
      const timer = setTimeout(() => {
        killProcess();
        if (!settled) {
          settled = true;
          console.warn(`[prices] Scraper timeout: cmd="${cmd}" script="${scriptPath}"`);
          reject(new Error('scraper timeout'));
        }
      }, timeoutMs);

      proc.stdout.removeAllListeners();
      proc.stderr.removeAllListeners();
      proc.removeAllListeners();

      proc.stdout.on('data', (d) => (out += d.toString()));
      proc.stderr.on('data', (d) => (err += d.toString()));
      proc.on('error', (e) => {
        clearTimeout(timer);
        if ((e.code === 'ENOENT' || /not found/i.test(String(e))) && !settled) {
          console.warn(`[prices] Python not found at "${cmd}". Trying next candidate...`);
          tryNext(`python command not found: ${cmd}`);
        } else if (!settled) {
          settled = true;
          console.error(`[prices] Scraper process error for cmd="${cmd}"`, e);
          reject(e);
        }
      });
      proc.on('close', (code) => {
        clearTimeout(timer);
        if (settled) return;
        if (code !== 0) {
          // If the command failed to run due to ENOENT, try next
          if (err && /python|py/i.test(err) && /not found|is not recognized/.test(err)) {
            tryNext(err);
          } else {
            settled = true;
            console.error(`[prices] Scraper exited with code ${code}. stderr=\n${err}\nstdout=\n${out}`);
            reject(new Error(err || 'scraper failed'));
          }
          return;
        }
        try {
          const parsed = JSON.parse(out);
          settled = true;
          resolve(parsed);
        } catch (e) {
          settled = true;
          console.error(`[prices] Failed to parse scraper output. stderr=\n${err}\nstdout=\n${out}`);
          reject(e);
        }
      });
    };

    start();
  });
}

// Normalize outputs from scrapers into a simple array for the UI
function normalizeResults(rawBySource) {
  const items = [];
  for (const [source, payload] of Object.entries(rawBySource)) {
    if (!payload || payload.error) continue;

    const pharmacy = payload.pharmacy || source;
    const price = typeof payload.price === 'number' ? payload.price : null;
    const mrp = typeof payload.mrp === 'number' ? payload.mrp : null;
    const discountPercent =
      typeof payload.discountPercent === 'number'
        ? payload.discountPercent
        : typeof payload.discount_percent === 'number'
        ? payload.discount_percent
        : null;
    const url = payload.url || payload.link || null;

    items.push({ pharmacy, price, mrp, discountPercent, url });
  }
  return items
    .filter((i) => i.price !== null && !Number.isNaN(i.price))
    .sort((a, b) => a.price - b.price);
}

exports.getPrices = async (req, res, next) => {
  try {
    const { medicine } = req.params;
    const { source } = req.query || {};
    const noCache = String(req.query?.noCache || '') === '1';

    // Cache hit
    const cached = !noCache ? await PriceCache.findOne({ medicine }) : null;
    if (!noCache && cached?.data?.prices && Array.isArray(cached.data.prices) && cached.data.prices.length > 0) {
      return res.json(cached.data);
    }

    const SCRAPERS = {
      '1mg': path.join(__dirname, '../utils/Scrapers/1mg.py'),
      pharmeasy: path.join(__dirname, '../utils/Scrapers/pharmEasy.py'),
      netmeds: path.join(__dirname, '../utils/Scrapers/netmeds.py'),
    };

    const rawResults = {};
    // Optionally run a single source for debugging
    const entries = source && SCRAPERS[source]
      ? [[source, SCRAPERS[source]]]
      : Object.entries(SCRAPERS);
    // Run scrapers sequentially to avoid concurrent Chromium launches on Windows
    for (const [key, script] of entries) {
      try {
        rawResults[key] = await runScraper(script, medicine);
      } catch (e) {
        rawResults[key] = { error: e?.message || 'scraper error' };
      }
    }

    const prices = normalizeResults(rawResults);

    const response = prices.length > 0
      ? { prices, sources: rawResults }
      : { prices, error: 'No prices found from sources', sources: rawResults };

    // Only cache successful results to avoid pinning transient failures
    if (!noCache && prices.length > 0) {
      await PriceCache.findOneAndUpdate(
        { medicine },
        { data: response, updatedAt: new Date() },
        { upsert: true }
      );
    }

    return res.json(response);
  } catch (err) {
    next(err);
  }
};
