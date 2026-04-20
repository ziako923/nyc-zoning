export default function WalkabilityCard({ walkability, lat, lng, address }) {
  const wsLink = `https://www.walkscore.com/score/raw.php?lat=${lat}&lon=${lng}&address=${encodeURIComponent(address)}`
  const wsPage = `https://www.walkscore.com/NY/New_York/${encodeURIComponent(address)}`

  if (!walkability || walkability.status !== 1) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Walkability</p>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-500">
            Walk Score data requires a free API key.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://www.walkscore.com/score/${encodeURIComponent(address)}/lat/${lat}/lng/${lng}/`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              View Walk Score
            </a>
            <a
              href="https://www.walkscore.com/professional/api.php"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Get free API key →
            </a>
          </div>
          <p className="text-xs text-gray-400">
            Add <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">VITE_WALKSCORE_API_KEY</code> to your <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">.env</code> to show scores inline.
          </p>
        </div>
      </div>
    )
  }

  const { walkscore, description, transit, bike, ws_link } = walkability

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Walkability</p>

      <div className="grid grid-cols-3 gap-3">
        <ScoreCircle
          score={walkscore}
          label="Walk Score"
          description={description}
          color={scoreColor(walkscore)}
        />
        {transit && (
          <ScoreCircle
            score={transit.score}
            label="Transit Score"
            description={transit.description}
            color={scoreColor(transit.score)}
          />
        )}
        {bike && (
          <ScoreCircle
            score={bike.score}
            label="Bike Score"
            description={bike.description}
            color={scoreColor(bike.score)}
          />
        )}
      </div>

      {ws_link && (
        <a
          href={ws_link}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Powered by Walk Score
        </a>
      )}
    </div>
  )
}

function scoreColor(score) {
  if (score >= 90) return { ring: 'text-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700' }
  if (score >= 70) return { ring: 'text-green-500', bg: 'bg-green-50', text: 'text-green-700' }
  if (score >= 50) return { ring: 'text-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700' }
  if (score >= 25) return { ring: 'text-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' }
  return { ring: 'text-red-400', bg: 'bg-red-50', text: 'text-red-700' }
}

function ScoreCircle({ score, label, description, color }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={`flex flex-col items-center rounded-lg px-2 py-3 ${color.bg}`}>
      <div className="relative w-16 h-16 mb-2">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 68 68">
          <circle cx="34" cy="34" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="34" cy="34" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${color.ring} transition-all duration-700`}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-lg font-black ${color.ring}`}>
          {score ?? '—'}
        </span>
      </div>
      <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{label}</p>
      {description && (
        <p className={`text-xs mt-0.5 text-center leading-tight ${color.text}`}>{description}</p>
      )}
    </div>
  )
}
