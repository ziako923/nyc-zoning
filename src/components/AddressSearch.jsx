import { useState, useRef, useEffect } from 'react'

export default function AddressSearch({ onSearch, loading }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  // Auto-complete via NYC GeoSearch
  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.length < 3) {
      setSuggestions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geosearch.planninglabs.nyc/v2/search?text=${encodeURIComponent(query)}&size=6`
        )
        const data = await res.json()
        const features = data.features || []
        setSuggestions(features)
        setShowSuggestions(features.length > 0)
      } catch {
        setSuggestions([])
      }
    }, 300)
  }, [query])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const submit = (address) => {
    setShowSuggestions(false)
    onSearch(address)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) submit(query.trim())
  }

  const handleSuggestionClick = (feature) => {
    const label = feature.properties.label
    setQuery(label)
    setSuggestions([])
    setShowSuggestions(false)
    onSearch(label)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-700 mb-3">Search by Address</h2>
      <form onSubmit={handleSubmit} className="relative" ref={wrapperRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Enter an NYC address…"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="off"
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2.5">
                <p className="text-xs text-gray-400 mb-1.5">Suggestions</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {suggestions.map((f, i) => (
                    <span key={f.properties.id || f.properties.label}>
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick(f)}
                        className="text-blue-600 hover:underline hover:text-blue-800 focus:outline-none"
                      >
                        {f.properties.label}
                      </button>
                      {i < suggestions.length - 1 && <span className="text-gray-300 mx-1.5">·</span>}
                    </span>
                  ))}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>
    </div>
  )
}
