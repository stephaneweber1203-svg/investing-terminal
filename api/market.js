export default async function handler(request, response) {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: "Finnhub API key is missing." });
  }

const symbols = [
  "^GSPC", "^IXIC", "^DJI", "^VIX",

  "NVDA", "AAPL", "GOOG", "MSFT", "AMZN", "SPCX", "AVGO", "META", "TSLA", "MU",
  "BRK-B", "LLY", "JPM", "WMT", "AMD", "V", "JNJ", "XOM", "MA", "INTC",
  "ORCL", "ABBV", "BAC", "CSCO", "PLTR", "CVX", "COST", "LRCX", "KO", "CAT",
  "MRK", "AMAT", "UNH", "GE", "PG", "MS", "DELL", "NFLX", "HD", "GS", "PM",
  "PANW", "WFC", "RTX", "GEV", "SNDK", "KLAC", "ANET", "AMGN", "TXN", "C",
  "TMO", "IBM", "AXP", "CRWD", "CRM", "VZ", "APH", "MRVL", "TMUS", "ABT",
  "SCHW", "PEP", "DE", "GILD", "BLK", "DIS", "MCD", "QCOM", "T", "ADI", "NEE",
  "UNP", "WELL", "SCCO", "BA", "WDC", "BX", "PFE", "COP", "IBKR", "UBER",
  "TJX", "DHR", "NOW", "BKNG", "VRTX", "BMY", "NEM", "COF", "PLD", "ISRG",
  "GLW", "SPGI", "PGR", "CVS", "PH", "LMT", "SBUX", "SNOW"
];

export default async function handler(request, response) {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: "Finnhub API key is missing." });
  }

  try {
    const results = [];

    // Requests are sent in small batches to respect Finnhub's rate limits.
    for (let index = 0; index < symbols.length; index += 20) {
      const batch = symbols.slice(index, index + 20);

      const batchResults = await Promise.all(
        batch.map(async (symbol) => {
          const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
          const result = await fetch(url);
          const quote = await result.json();

          return [symbol, quote];
        })
      );

      results.push(...batchResults);

      if (index + 20 < symbols.length) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
    }

    response.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );

    return response.status(200).json({
      updatedAt: new Date().toISOString(),
      quotes: Object.fromEntries(results),
    });
  } catch {
    return response.status(500).json({ error: "Could not load market data." });
  }
}

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
