# Supply Verify

The ledger is public. Nobody's reading it.

Supply Verify checks a token's supply against the chain itself instead of the issuer's docs or an aggregator field. Every figure is read live from public nodes in the visitor's browser, and every call is listed in the page's receipts.

It covers the top 10 by market cap (BTC, ETH, USDT, BNB, XRP, USDC, SOL, TRX, ZEC, HYPE) plus XMR, LINK, UNI, SHIB, PEPE and any ERC-20 contract on nine EVM chains. CoinGecko's live figures are the claims under test.

Single static file, no build step. Open `index.html` or serve the folder from any static host.
