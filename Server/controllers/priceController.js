const path = require('path');
const { spawn } = require('child_process');
const PriceCache = require('../models/PriceCache');

const SERP_API_KEY = process.env.SERP_API_KEY;

const SCRAPERS = {
  '1mg': {
    domain: '1mg.com',
    script: path.join(__dirname, '../utils/Scrapers/1mg.py'),
  },
  pharmeasy: {
    domain: 'pharmeasy.in',
    script: path.join(__dirname, '../utils/Scrapers/pharmEasy.py'),
  },
  netmeds: {
    domain: 'netmeds.com',
    script: path.join(__dirname, '../utils/Scrapers/netmeds.py'),
  },
};

async function fetchSerpLink(query, domain) {
  if (!SERP_API_KEY) {
    const msg = 'SERP API key is not set';
    console.error(msg);
    return { error: msg };
  }

  const params = new URLSearchParams({
    engine: 'google',
    q: `${query} site:${domain}`,
    api_key: SERP_API_KEY,
  });

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params}`);
    if (!res.ok) {
      const msg = `SERP API responded with status ${res.status}`;
      console.error(msg);
      return { error: msg };
    }
    const data = await res.json();
    const first = data?.organic_results?.[0];
    return { link: first ? first.link : null };
  } catch (err) {
    console.error('SERP API request failed:', err);
    return { error: err.message };
  }
}

function runScraper(scriptPath, link) {
  return new Promise((resolve, reject) => {
    const proc = spawn('python', [scriptPath, link]);
    let out = '';
    let err = '';
    proc.stdout.on('data', (d) => (out += d.toString()));
    proc.stderr.on('data', (d) => (err += d.toString()));
    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(err || 'scraper failed'));
      }
      try {
        resolve(JSON.parse(out));
      } catch (e) {
        reject(e);
      }
    });
  });
}

exports.getPrices = async (req, res, next) => {
  try {
    const { medicine } = req.params;

    let cached = await PriceCache.findOne({ medicine });
    if (cached) {
      return res.json(cached.data);
    }

    const result = {};
    for (const [key, cfg] of Object.entries(SCRAPERS)) {
      const { link, error } = await fetchSerpLink(medicine, cfg.domain);
      if (error) {
        result[key] = { error };
        continue;
      }
      if (!link) {
        result[key] = { error: 'No search results found' };
        continue;
      }
      try {
        result[key] = await runScraper(cfg.script, link);
      } catch (err) {
        result[key] = { error: err.message };
      }
    }

    await PriceCache.findOneAndUpdate(
      { medicine },
      { data: result, updatedAt: new Date() },
      { upsert: true }
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
};
