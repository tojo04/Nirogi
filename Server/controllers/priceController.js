const path = require('path');
const { spawn } = require('child_process');
const PriceCache = require('../models/PriceCache');

// Note: Python scrapers handle SERP lookups internally. We pass the query through.
// Add a per-process timeout to avoid hanging.
function runScraper(scriptPath, query, timeoutMs = 60000) {
  // Prefer the venv interpreter in utils/Scrapers if present
  const scrapersDir = path.join(__dirname, '../utils/Scrapers');
  const venvWin = path.join(scrapersDir, '.venv', 'Scripts', 'python.exe');
  const venvNix = path.join(scrapersDir, '.venv', 'bin', 'python');
  const pythonCandidates = [venvWin, venvNix].concat(
    process.platform === 'win32' ? ['py', 'python'] : ['python3', 'python']
  );
  return new Promise((resolve, reject) => {
    let settled = false;
    let proc;
    let candidateIndex = 0;

    const start = () => {
      const cmd = pythonCandidates[candidateIndex];
      proc = spawn(cmd, [scriptPath, query]);
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

    const wireUp = (cmd) => {
      out = '';
      err = '';
      const timer = setTimeout(() => {
        try {
          proc.kill('SIGKILL');
        } catch (_) {}
        if (!settled) {
          settled = true;
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
          tryNext(`python command not found: ${cmd}`);
        } else if (!settled) {
          settled = true;
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

    // Cache hit
    const cached = await PriceCache.findOne({ medicine });
    if (cached?.data) {
      return res.json(cached.data);
    }

    const SCRAPERS = {
      '1mg': path.join(__dirname, '../utils/Scrapers/1mg.py'),
      pharmeasy: path.join(__dirname, '../utils/Scrapers/pharmEasy.py'),
      netmeds: path.join(__dirname, '../utils/Scrapers/netmeds.py'),
    };

    const rawResults = {};
    // Run all scrapers concurrently with individual timeouts
    const entries = Object.entries(SCRAPERS);
    const settled = await Promise.allSettled(
      entries.map(([key, script]) => runScraper(script, medicine))
    );
    settled.forEach((res, idx) => {
      const key = entries[idx][0];
      if (res.status === 'fulfilled') {
        rawResults[key] = res.value;
      } else {
        rawResults[key] = { error: res.reason?.message || 'scraper error' };
      }
    });

    const prices = normalizeResults(rawResults);

    const response = prices.length > 0
      ? { prices, sources: rawResults }
      : { prices, error: 'No prices found from sources', sources: rawResults };
    await PriceCache.findOneAndUpdate(
      { medicine },
      { data: response, updatedAt: new Date() },
      { upsert: true }
    );

    return res.json(response);
  } catch (err) {
    next(err);
  }
};
