const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs/promises');
const Medicine = require('../models/Medicine');

async function runScraper(scriptPath, query) {
  return new Promise((resolve, reject) => {
    const proc = spawn('python', [scriptPath, query], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => {
      stdout += d.toString();
    });

    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `Exit code ${code}`));
      }
      try {
        const data = JSON.parse(stdout);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function upsertMedicine(data) {
  let doc = await Medicine.findOne({ name: data.name });
  if (!doc) {
    doc = new Medicine({ name: data.name, pricing: [data] });
  } else {
    const idx = doc.pricing.findIndex((p) => p.pharmacy === data.pharmacy);
    if (idx >= 0) {
      doc.pricing[idx] = data;
    } else {
      doc.pricing.push(data);
    }
  }
  await doc.save();
  return doc;
}

async function importPricing(query) {
  const dir = path.join(__dirname, '../utils/Scrapers');
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.py'));
  const results = [];
  for (const file of files) {
    try {
      const scriptPath = path.join(dir, file);
      const data = await runScraper(scriptPath, query);
      await upsertMedicine(data);
      results.push(data);
    } catch (err) {
      console.error(`Failed to run ${file}:`, err.message);
    }
  }
  return results;
}

module.exports = { importPricing };

