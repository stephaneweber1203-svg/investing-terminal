export default async function handler(request, response) {
  const apiKey = process.env.FINNHUB_API_KEY;
  const symbol = String(request.query?.symbol || "").trim().toUpperCase();

  if (!apiKey) {
    return response.status(500).json({ error: "Finnhub API key is missing." });
  }

  if (!symbol) {
    return response.status(400).json({ error: "Enter a stock symbol." });
  }

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
    const result = await fetch(url);
    const quote = await result.json();

    if (!quote.c) {
      return response.status(404).json({ error: `No price found for ${symbol}.` });
    }

    response.setHeader("Cache-Control", "s-maxage=60");
    return response.status(200).json({ symbol, quote });
  } catch {
    return response.status(500).json({ error: "Could not load this stock." });
  }
}
