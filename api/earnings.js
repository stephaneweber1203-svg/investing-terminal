function dateOnly(date) {
  return date.toISOString().slice(0, 10);
}

export default async function handler(request, response) {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: "Finnhub API key is missing." });
  }

  const today = new Date();
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(today.getDate() + 14);

  try {
    const url = `https://finnhub.io/api/v1/calendar/earnings?from=${dateOnly(today)}&to=${dateOnly(twoWeeksFromNow)}&token=${apiKey}`;
    const result = await fetch(url);
    const data = await result.json();

    const upcoming = (data.earningsCalendar || [])
      .filter((item) => item.symbol && item.date >= dateOnly(today))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    response.setHeader("Cache-Control", "s-maxage=3600");
    return response.status(200).json({ earnings: upcoming });
  } catch {
    return response.status(500).json({ error: "Could not load earnings." });
  }
}