export default async function handler(request, response) {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: "Finnhub API key is missing." });
  }

  const symbols = ["^GSPC", "^IXIC", "^DJI", "^VIX", "NVDA", "TSLA", "AAPL", "AMD", "META"];

  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
        const result = await fetch(url);
        const quote = await result.json();

        return [symbol, quote];
      })
    );

    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return response.status(200).json({
      updatedAt: new Date().toISOString(),
      quotes: Object.fromEntries(results),
    });
  } catch {
    return response.status(500).json({ error: "Could not load market data." });
  }
}
