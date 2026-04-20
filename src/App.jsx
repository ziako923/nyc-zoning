import { useState, useCallback } from 'react'
import AddressSearch from './components/AddressSearch'
import ZoningResult from './components/ZoningResult'
import ZoningGuide from './components/ZoningGuide'
import MarketWidget from './components/MarketWidget'
import RealEstateNews from './components/RealEstateNews'
import './index.css'

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('search')

  const handleSearch = useCallback(async (address) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Step 1: Geocode with NYC GeoSearch
      const geoRes = await fetch(
        `https://geosearch.planninglabs.nyc/v2/search?text=${encodeURIComponent(address)}&size=1`
      )
      if (!geoRes.ok) throw new Error('Geocoding failed')
      const geoData = await geoRes.json()

      if (!geoData.features || geoData.features.length === 0) {
        throw new Error('Address not found. Try a more specific NYC address.')
      }

      const feature = geoData.features[0]
      const [lng, lat] = feature.geometry.coordinates
      const props = feature.properties
      const bbl = props.addendum?.pad?.bbl

      // Step 2: Fetch ZoLa zoning + PLUTO + Walk Score in parallel
      const wsKey = import.meta.env.VITE_WALKSCORE_API_KEY
      const [zoningData, plutoData, walkabilityData] = await Promise.all([
        fetch(`https://zola.planning.nyc.gov/api/feature?lng=${lng}&lat=${lat}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),

        bbl
          ? fetch(
              `https://data.cityofnewyork.us/resource/64uk-42ks.json?bbl=${bbl}&$limit=1`
            )
              .then((r) => (r.ok ? r.json() : null))
              .then((rows) => (Array.isArray(rows) && rows.length > 0 ? rows[0] : null))
              .catch(() => null)
          : Promise.resolve(null),

        wsKey
          ? fetch(
              `https://api.walkscore.com/score?format=json&address=${encodeURIComponent(feature.properties.label)}&lat=${lat}&lon=${lng}&transit=1&bike=1&wsapikey=${wsKey}`
            )
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          : Promise.resolve(null),
      ])

      setResult({ geo: props, lat, lng, zoning: zoningData, pluto: plutoData, walkability: walkabilityData })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">NYC Zoning Lookup</h1>
            <p className="text-sm text-gray-500">Address search · zoning · development potential · parcel data</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1">
            {[['search', 'Address Lookup'], ['news', 'RE News'], ['guide', 'Zoning Guide']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'search' ? (
          <div className="space-y-6">
            <AddressSearch onSearch={handleSearch} loading={loading} />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Fetching zoning, PLUTO, walkability, and assessment data…</span>
                </div>
              </div>
            )}

            {result && <ZoningResult result={result} />}

            {!result && !loading && !error && (
              <MarketWidget />
            )}
          </div>
        ) : activeTab === 'news' ? (
          <RealEstateNews />
        ) : (
          <ZoningGuide />
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 pb-6 text-center text-xs text-gray-400">
        Zoning &amp; parcel data from{' '}
        <a href="https://zola.planning.nyc.gov" target="_blank" rel="noreferrer" className="underline hover:text-gray-600">
          NYC DCP
        </a>
        {' '}and{' '}
        <a href="https://data.cityofnewyork.us/City-Government/Primary-Land-Use-Tax-Lot-Output-Map-PLUTO-/64uk-42ks" target="_blank" rel="noreferrer" className="underline hover:text-gray-600">
          MapPLUTO
        </a>
        {' '}· For official decisions consult{' '}
        <a href="https://zola.planning.nyc.gov" target="_blank" rel="noreferrer" className="underline hover:text-gray-600">ZoLa</a>
      </footer>
    </div>
  )
}
