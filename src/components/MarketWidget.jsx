import { useState, useEffect } from 'react'

const REITS = ['VNQ', 'SPG', 'PLD', 'O', 'WELL', 'DLR', 'AMT', 'AVB', 'EQR', 'IRM']

const REIT_NAMES = {
  VNQ: 'Vanguard RE ETF',
  SPG: 'Simon Property',
  PLD: 'Prologis',
  O: 'Realty Income',
  WELL: 'Welltower',
  DLR: 'Digital Realty',
  AMT: 'American Tower',
  AVB: 'AvalonBay',
  EQR: 'Equity Residential',
  IRM: 'Iron Mountain',
}

function StockCard({ symbol, name, price, change, changePct }) {
  const up = change >= 0
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-shrink-0 w-40">
      <div className="flex items-start justify-between gap-1">
        <span className="text-xs font-bold text-gray-900">{symbol}</span>
        <span className={`text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
          {up ? '+' : ''}{changePct?.toFixed(2)}%
        </span>
      </div>
      <p className="text-[11px] text-gray-400 mt-0.5 leading-tight truncate">{name}</p>
      <p className="text-base font-semibold text-gray-900 mt-1">${price?.toFixed(2)}</p>
      <p className={`text-[11px] ${up ? 'text-emerald-600' : 'text-red-500'}`}>
        {up ? '+' : ''}{change?.toFixed(2)} today
      </p>
    </div>
  )
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor(diff / 60_000)
  if (h >= 24) return `${Math.floor(h / 24)}d ago`
  if (h >= 1) return `${h}h ago`
  return `${m}m ago`
}

export default function MarketWidget() {
  const [stocks, setStocks] = useState([])
  const [news, setNews] = useState([])
  const [stocksLoading, setStocksLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(true)
  const [stocksError, setStocksError] = useState(false)
  const [newsError, setNewsError] = useState(false)

  useEffect(() => {
    const symbols = REITS.join(',')
    const yfUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,shortName`
    fetch(`https://corsproxy.io/?${encodeURIComponent(yfUrl)}`)
      .then((r) => {
        if (!r.ok) throw new Error('bad response')
        return r.json()
      })
      .then((data) => {
        const quotes = data?.quoteResponse?.result || []
        if (!quotes.length) throw new Error('empty')
        setStocks(
          quotes.map((q) => ({
            symbol: q.symbol,
            name: REIT_NAMES[q.symbol] || q.shortName || q.symbol,
            price: q.regularMarketPrice,
            change: q.regularMarketChange,
            changePct: q.regularMarketChangePercent,
          }))
        )
      })
      .catch(() => setStocksError(true))
      .finally(() => setStocksLoading(false))
  }, [])

  useEffect(() => {
    const rssUrl = encodeURIComponent('https://therealdeal.com/feed/')
    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}&count=6`)
      .then((r) => {
        if (!r.ok) throw new Error('bad response')
        return r.json()
      })
      .then((data) => {
        if (data.status !== 'ok') throw new Error('feed error')
        setNews(
          (data.items || []).map((item) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            author: item.author,
          }))
        )
      })
      .catch(() => setNewsError(true))
      .finally(() => setNewsLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-4">
      {/* REIT Stocks */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">REIT Market Today</h3>
            <p className="text-xs text-gray-400 mt-0.5">{today}</p>
          </div>
          <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 rounded px-2 py-0.5">
            via Yahoo Finance
          </span>
        </div>

        <div className="px-5 py-4">
          {stocksLoading && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          )}
          {!stocksLoading && stocksError && (
            <p className="text-sm text-gray-400 text-center py-4">
              Market data unavailable — check back later.
            </p>
          )}
          {!stocksLoading && !stocksError && stocks.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {stocks.map((s) => (
                <StockCard key={s.symbol} {...s} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Real Estate News */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Real Estate News</h3>
            <p className="text-xs text-gray-400 mt-0.5">The Real Deal</p>
          </div>
          <a
            href="https://therealdeal.com"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-blue-500 hover:text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-0.5"
          >
            View all →
          </a>
        </div>

        <div className="divide-y divide-gray-100">
          {newsLoading && (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-3 space-y-1.5">
                <div className="h-3.5 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
              </div>
            ))
          )}
          {!newsLoading && newsError && (
            <p className="text-sm text-gray-400 text-center py-6 px-5">
              News feed unavailable — check back later.
            </p>
          )}
          {!newsLoading && !newsError && news.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 group-hover:text-blue-700 font-medium leading-snug line-clamp-2">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {item.author && (
                    <span className="text-[11px] text-gray-400">{item.author}</span>
                  )}
                  {item.author && item.pubDate && (
                    <span className="text-gray-300 text-[10px]">·</span>
                  )}
                  {item.pubDate && (
                    <span className="text-[11px] text-gray-400">{timeAgo(item.pubDate)}</span>
                  )}
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
