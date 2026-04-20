import { useState, useEffect } from 'react'

const FEEDS = [
  { label: 'The Real Deal', url: 'https://therealdeal.com/feed/', site: 'therealdeal.com' },
  { label: 'Bisnow', url: 'https://www.bisnow.com/rss', site: 'bisnow.com' },
]

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor(diff / 60_000)
  if (h >= 24) return `${Math.floor(h / 24)}d ago`
  if (h >= 1) return `${h}h ago`
  if (m >= 1) return `${m}m ago`
  return 'just now'
}

function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, '').trim() : ''
}

export default function RealEstateNews() {
  const [activeFeed, setActiveFeed] = useState(0)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setArticles([])

    const rssUrl = encodeURIComponent(FEEDS[activeFeed].url)
    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}&count=20`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => {
        if (data.status !== 'ok') throw new Error()
        setArticles(
          (data.items || []).map((item) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            author: item.author,
            thumbnail: item.thumbnail || data.feed?.image || null,
            description: stripHtml(item.description)?.slice(0, 200),
            categories: item.categories || [],
          }))
        )
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [activeFeed])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Real Estate News</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {/* Feed switcher */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {FEEDS.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFeed(i)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeFeed === i
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex gap-4 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-5/6" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="w-20 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">
            Could not load articles. Try again later.
          </div>
        )}

        {/* Articles */}
        {!loading && !error && (
          <div className="divide-y divide-gray-100">
            {articles.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                {/* Text */}
                <div className="flex-1 min-w-0">
                  {/* Category badges */}
                  {item.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {item.categories.slice(0, 2).map((cat, ci) => (
                        <span
                          key={ci}
                          className="text-[10px] font-medium uppercase tracking-wide text-blue-600 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 leading-snug line-clamp-2 transition-colors">
                    {item.title}
                  </p>

                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    {item.author && (
                      <span className="text-[11px] text-gray-400 font-medium">{item.author}</span>
                    )}
                    {item.author && item.pubDate && (
                      <span className="text-gray-300 text-[10px]">·</span>
                    )}
                    {item.pubDate && (
                      <span className="text-[11px] text-gray-400">{timeAgo(item.pubDate)}</span>
                    )}
                    <span className="ml-auto text-[10px] text-gray-300 group-hover:text-blue-400 flex items-center gap-0.5 transition-colors">
                      Read more
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Thumbnail */}
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="w-20 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}
              </a>
            ))}
          </div>
        )}

        {/* Footer */}
        {!loading && !error && articles.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-center">
            <a
              href={FEEDS[activeFeed].url.replace('/feed/', '').replace('/rss', '')}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              View all stories on {FEEDS[activeFeed].site} →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
