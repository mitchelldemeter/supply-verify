// Cached, whitelisted relay to public chain endpoints that block browsers.
// No API keys. Only the upstreams listed here can be reached, so this is not an open proxy.
const UP = {
  sol: { post: ["https://api.mainnet-beta.solana.com", "https://solana-rpc.publicnode.com", "https://solana.drpc.org"] },
  ton: { get: q => `https://toncenter.com/api/v3/jetton/masters?address=${encodeURIComponent(q)}&limit=1` },
  zec: { get: () => "https://api.blockchair.com/zcash/stats" }
};
const SOL_METHODS = new Set(["getSupply", "getTokenSupply", "getSlot", "getEpochInfo", "getInflationRate"]);

export default async function handler(req, res) {
  const net = String(req.query.net || "");
  const cfg = UP[net];
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (!cfg) return res.status(400).json({ error: "unknown net" });
  try {
    const tried = [];
    if (cfg.post) {
      let body;
      try { body = JSON.parse(String(req.query.body || "")); } catch (e) { return res.status(400).json({ error: "bad body" }); }
      if (net === "sol" && !SOL_METHODS.has(body.method)) return res.status(400).json({ error: "method not allowed" });
      for (const u of cfg.post) {
        try {
          const r = await fetch(u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
          const j = await r.json();
          tried.push(`${new URL(u).host}:${r.status}`);
          if (j && j.result !== undefined) {
            res.setHeader("Cache-Control", "public, s-maxage=20, stale-while-revalidate=60");
            res.setHeader("X-Upstream", new URL(u).host);
            return res.status(200).json(j);
          }
          tried.push(JSON.stringify(j && j.error || {}).slice(0, 120));
        } catch (e) { tried.push(`${new URL(u).host}:ERR ${e.message}`); }
      }
      return res.status(502).json({ error: "no upstream answered", tried });
    }
    const url = cfg.get(String(req.query.q || ""));
    const r = await fetch(url, { headers: { accept: "application/json" } });
    const t = await r.text();
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
    res.setHeader("X-Upstream", new URL(url).host);
    res.setHeader("content-type", "application/json");
    return res.status(r.status).send(t);
  } catch (e) {
    return res.status(502).json({ error: String(e && e.message || e) });
  }
}
