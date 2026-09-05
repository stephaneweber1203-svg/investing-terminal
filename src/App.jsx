import { useEffect, useState } from "react";
import "./App.css";

const marketCards = [
  { symbol: "^GSPC", name: "S&P 500", value: "5,248.49", change: "+0.8%" },
  { symbol: "^IXIC", name: "NASDAQ", value: "16,428.82", change: "+1.2%" },
  { symbol: "^DJI", name: "DOW", value: "38,778.10", change: "+0.5%" },
  { symbol: "^VIX", name: "VIX", value: "14.22", change: "-2.1%" },
];

const stockList = [
  { symbol: "NVDA", company: "NVIDIA", price: "$118.42", change: "+5.84%" },
  { symbol: "TSLA", company: "Tesla", price: "$176.21", change: "+3.17%" },
  { symbol: "AAPL", company: "Apple", price: "$189.98", change: "+1.42%" },
  { symbol: "AMD", company: "AMD", price: "$164.09", change: "-1.26%" },
  { symbol: "META", company: "Meta", price: "$493.50", change: "-2.04%" },
];

const earnings = [
  ["NVIDIA", "NVDA", "Today, after close"],
  ["Apple", "AAPL", "Tomorrow, after close"],
  ["Tesla", "TSLA", "Coming soon"],
  ["Disney", "DIS", "Coming soon"],
  ["Walmart", "WMT", "Coming soon"],
];

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatChange(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default function App() {
  const [search, setSearch] = useState("");
  const [quotes, setQuotes] = useState({});
  const [dataStatus, setDataStatus] = useState("Loading live data…");
  const [searchResult, setSearchResult] = useState(null);
  const [searchStatus, setSearchStatus] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [upcomingEarnings, setUpcomingEarnings] = useState(earnings);
  useEffect(() => {
    async function loadMarketData() {
      try {
        const result = await fetch("/api/market");
        if (!result.ok) throw new Error();

        const data = await result.json();
        setQuotes(data.quotes);
        setDataStatus(`Live data · Updated ${new Date(data.updatedAt).toLocaleTimeString()}`);
      } catch {
        setDataStatus("Showing example data");
      }
    }

    loadMarketData();
    async function loadEarnings() {
  try {
    const result = await fetch("/api/earnings");
    if (!result.ok) throw new Error();

    const data = await result.json();

    if (data.earnings?.length) {
      setUpcomingEarnings(
        data.earnings.map((item) => {
          const date = new Date(`${item.date}T12:00:00`).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric" }
          );

          const time =
            item.hour === "bmo" ? "Before open" :
            item.hour === "amc" ? "After close" :
            "During market hours";

          return [item.symbol, item.symbol, `${date} · ${time}`];
        })
      );
    }
  } catch {
    // Keep the example list if the live calendar is temporarily unavailable.
  }
}

loadEarnings();
  }, []);

  async function handleSearch(event) {
    event.preventDefault();

    const symbol = search.trim().toUpperCase();
    if (!symbol) return;

    setIsSearching(true);
    setSearchResult(null);
    setSearchStatus("");

    try {
      const result = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
      const data = await result.json();

      if (!result.ok) throw new Error(data.error || "Could not find this stock.");

      setSearchResult(data);
    } catch (error) {
      setSearchStatus(error.message);
    } finally {
      setIsSearching(false);
    }
  }

  const markets = marketCards.map((market) => {
    const quote = quotes[market.symbol];

    if (!quote?.c) {
      return { ...market, positive: market.change.startsWith("+") };
    }

    return {
      ...market,
      value: market.symbol === "^VIX"
        ? quote.c.toFixed(2)
        : new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(quote.c),
      change: formatChange(quote.dp),
      positive: quote.dp >= 0,
    };
  });

  const liveMovers = Object.entries(quotes)
  .filter(([symbol, quote]) => !symbol.startsWith("^") && quote?.c && Number.isFinite(quote.dp))
  .map(([symbol, quote]) => ({
    symbol,
    company: "Top 100 market-cap universe",
    price: formatPrice(quote.c),
    change: formatChange(quote.dp),
    changeValue: quote.dp,
    positive: quote.dp >= 0,
  }))
  .sort((first, second) => Math.abs(second.changeValue) - Math.abs(first.changeValue))
  .slice(0, 5);

const movers = liveMovers.length > 0
  ? liveMovers
  : stockList.map((stock) => ({
      ...stock,
      positive: stock.change.startsWith("+"),
    }));


  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #0b1020; color: #edf2ff; font-family: Arial, sans-serif; }
        #root { min-height: 100vh; }
        .app { max-width: 1200px; margin: auto; padding: 24px; }
        header { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 28px; }
        h1 { margin: 0; font-size: 22px; letter-spacing: 1px; }
        .search { display: flex; gap: 8px; }
        input { width: 220px; background: #151c31; border: 1px solid #2b3555; border-radius: 8px; color: white; padding: 11px 14px; }
        button { background: #4ade80; border: 0; border-radius: 8px; color: #06120b; cursor: pointer; font-weight: bold; padding: 11px 14px; }
        .status { color: #9aa8c7; font-size: 13px; margin: -14px 0 22px; }
        .search-card { margin-bottom: 24px; }
        .search-price { font-size: 28px; font-weight: bold; margin: 8px 0; }
        .markets, .grid { display: grid; gap: 16px; }
        .markets { grid-template-columns: repeat(4, 1fr); margin-bottom: 24px; }
        .grid { grid-template-columns: 1.2fr 1fr; }
        .card { background: #151c31; border: 1px solid #27314f; border-radius: 12px; padding: 18px; }
        .label { color: #9aa8c7; font-size: 13px; margin-bottom: 10px; }
        .value { font-size: 24px; font-weight: bold; }
        .gain { color: #4ade80; } .loss { color: #fb7185; }
        h2 { margin: 0 0 16px; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; }
        td, th { padding: 12px 4px; text-align: left; border-bottom: 1px solid #27314f; }
        th { color: #9aa8c7; font-size: 12px; }
        .symbol { font-weight: bold; } .company { color: #9aa8c7; font-size: 13px; }
        .earning { padding: 12px 0; border-bottom: 1px solid #27314f; }
        .earning:last-child, tr:last-child td { border-bottom: 0; }
        @media (max-width: 760px) {
          header { align-items: flex-start; flex-direction: column; }
          .search, input { width: 100%; }
          .markets { grid-template-columns: 1fr 1fr; }
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main className="app">
        <header>
          <h1>INVESTING TERMINAL</h1>

          <form className="search" onSubmit={handleSearch}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Enter a ticker, e.g. MSFT"
            />
            <button type="submit">{isSearching ? "Searching…" : "Search"}</button>
          </form>
        </header>

        <div className="status">{dataStatus}</div>

        {searchStatus && <div className="status loss">{searchStatus}</div>}

        {searchResult && (
          <section className="card search-card">
            <div className="label">SEARCH RESULT · {searchResult.symbol}</div>
            <div className="search-price">{formatPrice(searchResult.quote.c)}</div>
            <div className={searchResult.quote.dp >= 0 ? "gain" : "loss"}>
              {formatChange(searchResult.quote.dp)} today
            </div>
          </section>
        )}

        <section className="markets">
          {markets.map((market) => (
            <div className="card" key={market.name}>
              <div className="label">{market.name}</div>
              <div className="value">{market.value}</div>
              <div className={market.positive ? "gain" : "loss"}>
                {market.change} today
              </div>
            </div>
          ))}
        </section>

        <section className="grid">
          <div className="card">
            <h2>BIGGEST MOVERS</h2>
            <table>
              <thead>
                <tr><th>STOCK</th><th>PRICE</th><th>CHANGE</th></tr>
              </thead>
              <tbody>
                {movers.map((stock) => (
                  <tr key={stock.symbol}>
                    <td>
                      <div className="symbol">{stock.symbol}</div>
                      <div className="company">{stock.company}</div>
                    </td>
                    <td>{stock.price}</td>
                    <td className={stock.positive ? "gain" : "loss"}>
                      {stock.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2>UPCOMING EARNINGS</h2>
            {upcomingEarnings.map(([company, symbol, date]) => (
              <div className="earning" key={symbol}>
                <div className="symbol">
                  {company} <span className="company">({symbol})</span>
                </div>
                <div className="company">{date}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

